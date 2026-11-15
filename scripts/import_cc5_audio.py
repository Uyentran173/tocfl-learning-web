"""Stage Volume 5 MP3s and publish only tracks with verified PDF activity codes.

The supplied ZIPs remain separate by source. A filename identifies a candidate
lesson, not the activity; unmapped files stay in .private until reviewed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {"textbook": 86, "workbook": 11}
REFERENCE_MAP = json.loads((ROOT / "data/academy/cc5-printed-audio-references.json").read_text())
TEXTBOOK_LABELS = {1: "Chuẩn bị bài đọc", 2: "Bài đọc 1: 擁有言論自由才是真民主",
                   3: "Từ vựng bài đọc 1", 4: "Ngữ pháp bài đọc 1",
                   5: "Luyện dùng từ và thành ngữ", 6: "Bài đọc 2: 濫用自由並非真自由",
                   7: "Từ vựng bài đọc 2", 8: "Ngữ pháp bài đọc 2"}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def import_audio(args: argparse.Namespace) -> None:
    sources = {source: {"pdf": Path(getattr(args, source + "_pdf")),
                        "zip": Path(getattr(args, source + "_zip"))} for source in EXPECTED}
    for source, paths in sources.items():
        actual_hash = sha256(paths["pdf"].read_bytes())
        if actual_hash != REFERENCE_MAP["pdfSha256"][source]:
            raise ValueError(f"{source} PDF changed; printed audio references must be reviewed again")
    tracks: list[dict] = []
    payloads: list[tuple[dict, bytes]] = []
    for source, expected in EXPECTED.items():
        with zipfile.ZipFile(sources[source]["zip"]) as archive:
            members = [entry for entry in archive.infolist() if not entry.is_dir() and entry.filename.lower().endswith(".mp3")]
            if len(members) != expected:
                raise ValueError(f"{source}: expected {expected} MP3 files, found {len(members)}")
            names: set[str] = set()
            for entry in members:
                name = Path(entry.filename).name
                if name in names:
                    raise ValueError(f"Duplicate {source} track: {name}")
                names.add(name)
                if name == "00.mp3":
                    lesson = number = None
                    track_id = f"cc5-{source}-unassigned-00"
                elif source == "textbook":
                    match = re.fullmatch(r"(0[1-9]|10)-(\d{2})\.mp3", name, re.I)
                    if not match:
                        raise ValueError(f"Unexpected textbook MP3: {name}")
                    lesson, number = int(match[1]), int(match[2])
                    track_id = f"cc5-textbook-l{lesson:02d}-t{number:02d}"
                else:
                    match = re.fullmatch(r"(0[1-9]|10)\.mp3", name, re.I)
                    if not match:
                        raise ValueError(f"Unexpected workbook MP3: {name}")
                    lesson, number = int(match[1]), 1
                    track_id = f"cc5-workbook-l{lesson:02d}-t01"
                data = archive.read(entry)
                if len(data) < 128 or not (data.startswith(b"ID3") or data[0] == 0xff):
                    raise ValueError(f"Invalid MP3 payload: {source}/{name}")
                # The page map contains only unique codes found inside the
                # matching bookmarked lesson. Unmatched tracks remain private.
                code = f"{lesson:02d}-{number:02d}" if source == "textbook" and lesson else f"{lesson:02d}-1" if lesson else None
                page = REFERENCE_MAP[source].get(code if source == "textbook" else f"{lesson:02d}") if code else None
                verified = page is not None
                label = None
                if verified and source == "workbook":
                    label = "Nghe ý kiến về ẩn danh và dùng tên thật" if lesson == 1 else f"Bài nghe sách bài tập {lesson:02d}"
                elif verified and source == "textbook":
                    label = TEXTBOOK_LABELS.get(number) if lesson == 1 else f"Âm thanh kèm trang {page - 26}"
                record = {"id": track_id, "courseId": "cc5", "volume": 5,
                          "lesson": lesson, "source": source, "number": number,
                          "originalName": name, "privatePath": f"{source}/{name}",
                          "bytes": len(data), "sha256": sha256(data),
                          "pdfPages": [page] if page else [],
                          "mappingStatus": "verified" if verified else "pending",
                          "activity": {"pdfPage": page, "bookPage": page - 26 if source == "textbook" else page - 2,
                                       "labelVi": label, "referenceCode": code} if verified else None}
                tracks.append(record)
                payloads.append((record, data))
    if len({row["id"] for row in tracks}) != len(tracks):
        raise ValueError("Duplicate normalized track ID")
    tracks.sort(key=lambda row: (row["lesson"] or 0, row["source"], row["number"] or 0))
    report = {"courseId": "cc5", "volume": 5, "total": len(tracks),
              "verified": sum(row["mappingStatus"] == "verified" for row in tracks),
              "pending": [row["id"] for row in tracks if row["mappingStatus"] == "pending"],
              "byLesson": [{"lesson": lesson, **{source: sum(row["lesson"] == lesson and row["source"] == source for row in tracks) for source in EXPECTED}} for lesson in range(1, 11)]}
    if args.dry_run:
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return
    staging = Path(args.staging_dir)
    for row, data in payloads:
        private = staging / row["privatePath"]
        private.parent.mkdir(parents=True, exist_ok=True)
        if not private.exists() or sha256(private.read_bytes()) != row["sha256"]:
            private.write_bytes(data)
        if row["mappingStatus"] == "verified":
            published = ROOT / "public/academy/cc5/audio" / f"{row['id']}.mp3"
            published.parent.mkdir(parents=True, exist_ok=True)
            if not published.exists() or sha256(published.read_bytes()) != row["sha256"]:
                published.write_bytes(data)
    manifest = {"schemaVersion": 1, "courseId": "cc5", "volume": 5,
                "title": "A Course in Contemporary Chinese — Volume 5",
                "pdfSha256": {source: sha256(paths["pdf"].read_bytes()) for source, paths in sources.items()},
                "sourceZipSha256": {source: sha256(paths["zip"].read_bytes()) for source, paths in sources.items()},
                "tracks": tracks}
    for name, data in [("cc5-audio-manifest.json", manifest), ("cc5-mapping-report.json", report)]:
        (ROOT / "data/academy" / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(f"Staged {len(tracks)} tracks; published {report['verified']}; pending {len(report['pending'])}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for source in EXPECTED:
        parser.add_argument(f"--{source}-pdf", required=True)
        parser.add_argument(f"--{source}-zip", required=True)
    parser.add_argument("--staging-dir", default=str(ROOT / ".private/academy/cc5"))
    parser.add_argument("--dry-run", action="store_true")
    import_audio(parser.parse_args())

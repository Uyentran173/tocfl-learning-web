"""Stage Contemporary Chinese Volume 4 audio and verify printed PDF track codes.

The 00 tracks and tracks without a unique printed reference stay private. This
script never assigns an activity from a filename alone.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from collections import defaultdict
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
CODE = re.compile(r"(?<!\d)(0[1-9]|1[0-2])\s*[-–]\s*(\d{1,2})(?!\d)")
NAME = re.compile(r"(0[1-9]|1[0-2])-(\d{1,2})\.mp3", re.I)
EXPECTED = {"textbook": 145, "workbook": 25}
LABEL = {1: "Hội thoại", 2: "Từ vựng hội thoại", 3: "Bài đọc", 4: "Từ vựng bài đọc"}
LESSON01_GRAMMAR = {
    5: "Ngữ pháp: 與其…不如…", 6: "Ngữ pháp: 就 (ngoại lệ)",
    7: "Ngữ pháp: các cách dùng 就", 8: "Ngữ pháp: 別說…就是…也…",
    9: "Ngữ pháp: 簡直", 10: "Ngữ pháp: 不至於",
    11: "Ngữ pháp: 往往", 12: "Ngữ pháp: V著玩",
}


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def source_references(path: Path) -> tuple[dict[tuple[int, int], list[int]], list[int]]:
    document = fitz.open(path)
    starts = [page for _, title, page in document.get_toc() if re.match(r"^\d+: ", title)]
    if len(starts) != 12:
        raise ValueError(f"Expected 12 lesson bookmarks in {path}, found {len(starts)}")
    references: dict[tuple[int, int], list[int]] = defaultdict(list)
    appendix = next((page for _, title, page in document.get_toc() if title.startswith("課文英譯")), len(document) + 1)
    for lesson, start in enumerate(starts, 1):
        end = starts[lesson] if lesson < 12 else appendix
        for page in range(start, end):
            for match in CODE.finditer(document[page - 1].get_text()):
                if int(match[1]) == lesson and page not in references[(lesson, int(match[2]))]:
                    references[(lesson, int(match[2]))].append(page)
    return dict(references), starts


def import_audio(args: argparse.Namespace) -> None:
    sources = {
        name: {"pdf": Path(getattr(args, f"{name}_pdf")), "zip": Path(getattr(args, f"{name}_zip"))}
        for name in EXPECTED
    }
    references = {name: source_references(paths["pdf"]) for name, paths in sources.items()}
    tracks = []
    payloads = []
    for source, expected in EXPECTED.items():
        with zipfile.ZipFile(sources[source]["zip"]) as archive:
            members = [entry for entry in archive.infolist() if not entry.is_dir() and entry.filename.lower().endswith(".mp3")]
            if len(members) != expected:
                raise ValueError(f"{source}: expected {expected} MP3s, found {len(members)}")
            names = set()
            refs, starts = references[source]
            for entry in members:
                name = Path(entry.filename).name
                if name in names:
                    raise ValueError(f"Duplicate {source} track {name}")
                names.add(name)
                if name == "00.mp3":
                    lesson = number = None
                    track_id = f"cc4-{source}-unassigned-00"
                else:
                    match = NAME.fullmatch(name)
                    if not match:
                        raise ValueError(f"Unrecognized {source} track {name}")
                    lesson, number = int(match[1]), int(match[2])
                    track_id = f"cc4-{source}-l{lesson:02d}-t{number:02d}"
                data = archive.read(entry)
                if len(data) < 128 or not (data.startswith(b"ID3") or data[0] == 0xff):
                    raise ValueError(f"Invalid MP3: {source}/{name}")
                pages = refs.get((lesson, number), []) if lesson else []
                # A printed track code is evidence only within its bookmarked lesson.
                verified = len(pages) == 1
                page = pages[0] if verified else None
                track = {
                    "id": track_id, "courseId": "cc4", "volume": 4,
                    "lesson": lesson, "source": source, "number": number,
                    "originalName": name, "privatePath": f"{source}/{name}",
                    "bytes": len(data), "sha256": digest(data), "pdfPages": pages,
                    "mappingStatus": "verified" if verified else "pending",
                    "activity": ({"pdfPage": page, "bookPage": page - starts[0] + 1,
                                  "labelVi": (LESSON01_GRAMMAR.get(number) if lesson == 1 and number in LESSON01_GRAMMAR else LABEL.get(number, f"Âm thanh bài {lesson:02d}, mục {number:02d}")) if source == "textbook" else ("Nghe hội thoại, chọn đáp án" if lesson == 1 and number == 1 else "Nghe câu chuyện, chọn đáp án" if lesson == 1 and number == 2 else f"Bài nghe sách bài tập {lesson:02d}-{number}"),
                                  "referenceCode": name[:-4], "itemCount": (5 if number == 1 else 3) if source == "workbook" and lesson == 1 else None} if verified else None),
                }
                tracks.append(track)
                payloads.append((track, data))
    ids = [track["id"] for track in tracks]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate normalized track IDs")
    tracks.sort(key=lambda row: (row["lesson"] or 0, row["source"], row["number"] or 0))
    report = {"courseId": "cc4", "volume": 4, "total": len(tracks),
              "verified": sum(row["mappingStatus"] == "verified" for row in tracks),
              "pending": [row["id"] for row in tracks if row["mappingStatus"] != "verified"],
              "byLesson": [{"lesson": lesson, **{source: sum(row["lesson"] == lesson and row["source"] == source for row in tracks) for source in EXPECTED}} for lesson in range(1, 13)]}
    if args.dry_run:
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return
    staged = Path(args.staging_dir)
    for row, data in payloads:
        private_path = staged / row["privatePath"]
        private_path.parent.mkdir(parents=True, exist_ok=True)
        if not private_path.exists() or digest(private_path.read_bytes()) != row["sha256"]:
            private_path.write_bytes(data)
        if row["mappingStatus"] == "verified":
            published = ROOT / "public/academy/cc4/audio" / f"{row['id']}.mp3"
            published.parent.mkdir(parents=True, exist_ok=True)
            if not published.exists() or digest(published.read_bytes()) != row["sha256"]:
                published.write_bytes(data)
    manifest = {"schemaVersion": 1, "courseId": "cc4", "volume": 4,
                "title": "A Course in Contemporary Chinese — Volume 4",
                "pdfSha256": {source: digest(paths["pdf"].read_bytes()) for source, paths in sources.items()},
                "sourceZipSha256": {source: digest(paths["zip"].read_bytes()) for source, paths in sources.items()},
                "tracks": tracks}
    for path, content in [(ROOT / "data/academy/cc4-audio-manifest.json", manifest),
                          (ROOT / "data/academy/cc4-mapping-report.json", report)]:
        path.write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n")
    print(f"Staged {len(tracks)} tracks; verified {report['verified']}; pending {len(report['pending'])}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for name in EXPECTED:
        parser.add_argument(f"--{name}-pdf", required=True)
        parser.add_argument(f"--{name}-zip", required=True)
    parser.add_argument("--staging-dir", default=str(ROOT / ".private/academy/cc4"))
    parser.add_argument("--dry-run", action="store_true")
    import_audio(parser.parse_args())

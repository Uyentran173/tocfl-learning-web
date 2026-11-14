"""Stage Volume 3 audio, keeping unreviewed tracks private.

Only Lesson 01 mappings below have been checked against the printed PDF pages.
The two 00 tracks and all later lessons remain pending until separately reviewed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from collections import Counter
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
STARTS = {"textbook": (28, 50, 74, 102, 126, 154, 180, 206, 232, 256, 284, 308),
          "workbook": (3, 11, 19, 27, 35, 43, 51, 59, 67, 75, 83, 91)}
EXPECTED = {"textbook": 135, "workbook": 25}
NAME = re.compile(r"(0[1-9]|1[0-2])-(\d{1,2})\.mp3", re.I)
CODE = re.compile(r"(?<!\d)(0[1-9]|1[0-2])\s*[-–]\s*(0?\d{1,2})(?!\d)")
VERIFIED_01 = {
    "textbook": {
        1: (29, "dialogue"), 2: (32, "dialogue-vocabulary"),
        3: (34, "reading"), 4: (36, "reading-vocabulary"),
        5: (37, "grammar-if"), 6: (38, "grammar-less-than"),
        7: (39, "grammar-almost"), 8: (40, "grammar-probably"),
        9: (41, "grammar-finally"), 10: (41, "grammar-suddenly"),
        11: (42, "grammar-regardless"),
    },
    "workbook": {1: (3, "listening-response-a"), 2: (3, "listening-response-b")},
}
LABELS = {
    "dialogue": "Hội thoại", "dialogue-vocabulary": "Từ vựng hội thoại",
    "reading": "Bài đọc", "reading-vocabulary": "Từ vựng bài đọc",
    "grammar-if": "Ngữ pháp: …的話", "grammar-less-than": "Ngữ pháp: 不到",
    "grammar-almost": "Ngữ pháp: 差一點", "grammar-probably": "Ngữ pháp: 恐怕",
    "grammar-finally": "Ngữ pháp: 好不容易", "grammar-suddenly": "Ngữ pháp: 說…就…",
    "grammar-regardless": "Ngữ pháp: 不管…都…",
    "listening-response-a": "Bài tập nghe A", "listening-response-b": "Bài tập nghe B",
}


def sha256_file(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def pdf_references(path: Path, source: str) -> dict[tuple[int, int], list[int]]:
    doc = fitz.open(path)
    starts = STARTS[source]
    result: dict[tuple[int, int], list[int]] = {}
    for lesson, start in enumerate(starts, 1):
        stop = starts[lesson] if lesson < 12 else len(doc) + 1
        for page_number in range(start, stop):
            for match in CODE.finditer(doc[page_number - 1].get_text(sort=True)):
                if int(match[1]) == lesson:
                    pages = result.setdefault((lesson, int(match[2])), [])
                    if page_number not in pages:
                        pages.append(page_number)
    return result


def import_audio(args: argparse.Namespace) -> None:
    paths = {source: {kind: Path(getattr(args, f"{source}_{kind}")) for kind in ("pdf", "zip")}
             for source in EXPECTED}
    references = {source: pdf_references(paths[source]["pdf"], source) for source in EXPECTED}
    tracks = []
    payloads = []
    for source, expected in EXPECTED.items():
        with zipfile.ZipFile(paths[source]["zip"]) as archive:
            members = [item for item in archive.infolist() if not item.is_dir() and item.filename.lower().endswith(".mp3")]
            if len(members) != expected:
                raise ValueError(f"{source}: expected {expected} MP3 files, found {len(members)}")
            names = set()
            for item in members:
                name = Path(item.filename).name
                if name in names:
                    raise ValueError(f"Duplicate {source} filename: {name}")
                names.add(name)
                if name == "00.mp3":
                    lesson = number = None
                    track_id = f"cc3-{source}-unassigned-00"
                else:
                    match = NAME.fullmatch(name)
                    if not match:
                        raise ValueError(f"Unknown {source} filename: {name}")
                    lesson, number = int(match[1]), int(match[2])
                    track_id = f"cc3-{source}-l{lesson:02d}-t{number:02d}"
                data = archive.read(item)
                if len(data) < 128 or not (data.startswith(b"ID3") or data[0] == 0xff):
                    raise ValueError(f"Invalid or empty MP3: {source}/{name}")
                verified = VERIFIED_01[source].get(number) if lesson == 1 else None
                pages = references[source].get((lesson, number), []) if lesson else []
                if verified and verified[0] not in pages:
                    # OCR can miss printed codes. The page number was checked visually.
                    pages = sorted(set(pages + [verified[0]]))
                track = {
                    "id": track_id, "courseId": "cc3", "volume": 3,
                    "lesson": lesson, "source": source, "number": number,
                    "originalName": name, "privatePath": f"{source}/{name}",
                    "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
                    "pdfPages": pages, "mappingStatus": "verified" if verified else "pending",
                    "activity": ({"pdfPage": verified[0], "bookPage": verified[0] - (27 if source == "textbook" else 2),
                                  "labelVi": LABELS[verified[1]], "referenceCode": name.removesuffix(".mp3"),
                                  "itemCount": None} if verified else None),
                }
                tracks.append(track)
                payloads.append((track, data))
        for lesson in range(1, 13):
            if not any(track["lesson"] == lesson and track["source"] == source for track in tracks):
                raise ValueError(f"No Lesson {lesson:02d} tracks in {source}")
    ids = [track["id"] for track in tracks]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate normalized IDs")
    tracks.sort(key=lambda track: (track["lesson"] or 0, track["source"], track["number"] or 0))
    report = {
        "courseId": "cc3", "volume": 3,
        "found": {source: sum(track["source"] == source for track in tracks) for source in EXPECTED},
        "lessonCounts": [{"lesson": lesson, **{source: sum(track["lesson"] == lesson and track["source"] == source for track in tracks) for source in EXPECTED}} for lesson in range(1, 13)],
        "verifiedLesson01": sum(track["lesson"] == 1 and track["mappingStatus"] == "verified" for track in tracks),
        "pending": [track["id"] for track in tracks if track["mappingStatus"] == "pending"],
        "missingPrintedReferences": [track["id"] for track in tracks if track["lesson"] and not track["pdfPages"]],
        "warnings": ["OCR-detected PDF codes require visual review before publication.", "Both 00.mp3 tracks remain unassigned.", "Textbook archive omits 12-09.mp3; 12-10.mp3 is preserved with its original number."],
    }
    manifest = {
        "schemaVersion": 1, "courseId": "cc3", "volume": 3,
        "title": "A Course in Contemporary Chinese — Volume 3",
        "pdfSha256": {source: sha256_file(paths[source]["pdf"]) for source in EXPECTED},
        "sourceZipSha256": {source: sha256_file(paths[source]["zip"]) for source in EXPECTED},
        "tracks": tracks,
    }
    if args.dry_run:
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return
    staging = Path(args.staging_dir)
    for track, data in payloads:
        destination = staging / track["privatePath"]
        destination.parent.mkdir(parents=True, exist_ok=True)
        if destination.is_file() and sha256_file(destination) == track["sha256"]:
            continue
        destination.write_bytes(data)
        if sha256_file(destination) != track["sha256"]:
            raise ValueError(f"Staging checksum failed: {track['id']}")
    for path, value in ((Path(args.manifest_out), manifest), (Path(args.report_out), report)):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    print(f"Staged {len(tracks)} tracks; {report['verifiedLesson01']} Lesson 01 mappings verified; later lessons remain private.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    for source in EXPECTED:
        parser.add_argument(f"--{source}-pdf", required=True)
        parser.add_argument(f"--{source}-zip", required=True)
    parser.add_argument("--staging-dir", default=str(ROOT / ".private/academy/cc3"))
    parser.add_argument("--manifest-out", default=str(ROOT / "data/academy/cc3-audio-manifest.json"))
    parser.add_argument("--report-out", default=str(ROOT / "data/academy/cc3-mapping-report.json"))
    parser.add_argument("--dry-run", action="store_true")
    import_audio(parser.parse_args())

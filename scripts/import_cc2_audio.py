"""Stage Contemporary Chinese Volume 2 MP3s and audit printed PDF references.

This script never publishes audio. A printed reference proves a page relationship,
but does not by itself prove the activity type or that the recording matches it.
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
EXPECTED_COUNTS = {"textbook": 150, "workbook": 61}
TEXTBOOK_STARTS = (28, 50, 78, 106, 132, 158, 184, 210, 238, 266, 292, 324, 348, 384, 410)
WORKBOOK_STARTS = (1, 9, 19, 27, 35, 43, 51, 59, 67, 75, 83, 91, 101, 109, 119)
CODE = re.compile(r"(?<!\d)(0[1-9]|1[0-5])\s*[-–]\s*(0?\d{1,2})(?!\d)")
NAME = re.compile(r"(0[1-9]|1[0-5])-(\d{1,2})\.mp3", re.IGNORECASE)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def printed_references(pdf: Path, starts: tuple[int, ...], final_page: int) -> dict[tuple[int, int], list[int]]:
    if not pdf.is_file():
        raise ValueError(f"Missing or invalid PDF: {pdf}")
    with pdf.open("rb") as stream:
        if stream.read(5) != b"%PDF-":
            raise ValueError(f"Missing or invalid PDF: {pdf}")
    pages = fitz.open(pdf)
    if len(pages) < final_page:
        raise ValueError(f"PDF has only {len(pages)} pages, expected at least {final_page}: {pdf}")
    found: dict[tuple[int, int], list[int]] = {}
    for lesson, first in enumerate(starts, 1):
        last = starts[lesson] - 1 if lesson < 15 else final_page
        for page_number in range(first, last + 1):
            text = pages[page_number - 1].get_text(sort=True)
            for match in CODE.finditer(text):
                if int(match[1]) != lesson:
                    continue
                key = (lesson, int(match[2]))
                locations = found.setdefault(key, [])
                if page_number not in locations:
                    locations.append(page_number)
    return found


def inspect_zip(source: str, archive_path: Path, references: dict[tuple[int, int], list[int]]):
    if not archive_path.is_file():
        raise ValueError(f"Missing {source} archive: {archive_path}")
    entries = []
    names = set()
    with zipfile.ZipFile(archive_path) as archive:
        for member in archive.infolist():
            if member.is_dir() or not member.filename.lower().endswith(".mp3"):
                continue
            original = Path(member.filename).name
            if original in names:
                raise ValueError(f"Duplicate {source} filename: {original}")
            names.add(original)
            if original == "00.mp3":
                lesson = number = None
                track_id = f"cc2-{source}-unassigned-00"
            else:
                match = NAME.fullmatch(original)
                if not match:
                    raise ValueError(f"Unrecognized {source} audio filename: {original}")
                lesson, number = int(match[1]), int(match[2])
                if number < 1:
                    raise ValueError(f"Invalid track number: {original}")
                track_id = f"cc2-{source}-l{lesson:02d}-t{number:02d}"
            payload = archive.read(member)
            if len(payload) < 128 or not (payload.startswith(b"ID3") or payload[0] == 0xff):
                raise ValueError(f"Invalid MP3: {source}/{original}")
            pages = references.get((lesson, number), []) if lesson is not None else []
            entries.append(({
                "id": track_id,
                "courseId": "cc2",
                "volume": 2,
                "lesson": lesson,
                "source": source,
                "number": number,
                "originalName": original,
                "privatePath": f"{source}/{original}",
                "bytes": len(payload),
                "sha256": digest(payload),
                "printedReference": f"{lesson:02d}-{number:02d}" if lesson is not None else None,
                "pdfPages": pages,
                "mappingStatus": "pending",
                "activity": None,
            }, payload))
    if len(entries) != EXPECTED_COUNTS[source]:
        raise ValueError(f"{source}: expected {EXPECTED_COUNTS[source]} MP3s, found {len(entries)}")
    ids = [track["id"] for track, _ in entries]
    if len(ids) != len(set(ids)):
        raise ValueError(f"Duplicate normalized {source} ID")
    for lesson in range(1, 16):
        numbers = sorted(track["number"] for track, _ in entries if track["lesson"] == lesson)
        if not numbers or numbers != list(range(1, max(numbers) + 1)):
            raise ValueError(f"{source} lesson {lesson:02d}: missing or duplicate track: {numbers}")
    return entries


def run(args: argparse.Namespace) -> None:
    pdfs = {source: Path(getattr(args, f"{source}_pdf")) for source in EXPECTED_COUNTS}
    archives = {source: Path(getattr(args, f"{source}_zip")) for source in EXPECTED_COUNTS}
    references = {
        source: printed_references(
            pdfs[source],
            TEXTBOOK_STARTS if source == "textbook" else WORKBOOK_STARTS,
            436 if source == "textbook" else 128,
        )
        for source in EXPECTED_COUNTS
    }
    inspected = {source: inspect_zip(source, archives[source], references[source]) for source in EXPECTED_COUNTS}
    tracks = sorted((item for entries in inspected.values() for item, _ in entries), key=lambda track: (track["lesson"] or 0, track["source"], track["number"] or 0))
    report = {
        "courseId": "cc2",
        "volume": 2,
        "found": {source: len(entries) for source, entries in inspected.items()},
        "lessonCounts": [{"lesson": lesson, **{source: Counter(item["lesson"] for item, _ in inspected[source])[lesson] for source in EXPECTED_COUNTS}} for lesson in range(1, 16)],
        "printedReferenceCount": {source: sum(bool(item["pdfPages"]) for item, _ in entries) for source, entries in inspected.items()},
        "printedReferenceMissingIds": [item["id"] for item in tracks if item["lesson"] is not None and not item["pdfPages"]],
        "unassignedIds": [item["id"] for item in tracks if item["lesson"] is None],
        "pendingActivityMappings": len(tracks),
        "warnings": ["PDF code detection is an audit aid; activity types require separate verification before publication.", "The two 00.mp3 files remain unassigned."],
    }
    manifest = {
        "schemaVersion": 1,
        "courseId": "cc2",
        "volume": 2,
        "title": "A Course in Contemporary Chinese — Volume 2",
        "pdfSha256": {source: file_digest(path) for source, path in pdfs.items()},
        "sourceZipSha256": {source: file_digest(path) for source, path in archives.items()},
        "tracks": tracks,
    }
    if args.dry_run:
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return
    staging = Path(args.staging_dir).resolve()
    for source, entries in inspected.items():
        directory = staging / source
        directory.mkdir(parents=True, exist_ok=True)
        for item, payload in entries:
            destination = directory / item["originalName"]
            if destination.exists() and file_digest(destination) == item["sha256"]:
                continue
            temporary = destination.with_suffix(".tmp")
            temporary.write_bytes(payload)
            temporary.replace(destination)
            if file_digest(destination) != item["sha256"]:
                raise ValueError(f"Staged MP3 mismatch: {item['id']}")
    manifest_path = Path(args.manifest_out)
    report_path = Path(args.report_out)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Staged {len(tracks)} MP3s privately; {sum(report['printedReferenceCount'].values())} printed references detected; no tracks published.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    for source in EXPECTED_COUNTS:
        parser.add_argument(f"--{source}-pdf", required=True)
        parser.add_argument(f"--{source}-zip", required=True)
    parser.add_argument("--staging-dir", default=str(ROOT / ".private/academy/cc2"))
    parser.add_argument("--manifest-out", default=str(ROOT / "data/academy/cc2-audio-manifest.json"))
    parser.add_argument("--report-out", default=str(ROOT / "data/academy/cc2-mapping-report.json"))
    parser.add_argument("--dry-run", action="store_true")
    run(parser.parse_args())


if __name__ == "__main__":
    main()

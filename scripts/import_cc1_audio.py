"""Stage CC1 audio privately and publish only a metadata/mapping manifest.

The curated Lesson 01 mapping is tied to the exact PDF editions inspected here.
Unknown tracks remain unmapped; this tool never infers an activity from a name.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import zipfile
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PDF_SHA256 = {
    "textbook": "db6224d6fc53ce57c210e2bf66a0c07d922873573cf8bb3f08e3bfe0d6449abb",
    "workbook": "23a243bde70bf76b4cd2dae9c56a03766753f9b86b27750ae9cbed92019f82e2",
}
EXPECTED_COUNTS = {"textbook": 141, "workbook": 81}
# The codes and page numbers below were checked visually against these PDF editions.
LESSON_01_REFERENCES = {
    "textbook": {
        1: (29, "Đối thoại 1", "01-1", 2, None),
        2: (30, "Từ vựng 1", "01-2", 3, None),
        3: (31, "Đối thoại 2", "01-3", 4, None),
        4: (33, "Từ vựng 2", "01-4", 6, None),
    },
    "workbook": {
        1: (3, "Phân biệt thanh điệu", "01-1", 1, 10),
        2: (3, "Nghe và trả lời · phần A", "01-2", 1, 3),
        3: (4, "Nghe và trả lời · phần B", "01-3", 2, 4),
        4: (4, "Nghe và trả lời · phần C", "01-4", 2, 4),
        5: (8, "Viết câu bằng chữ Hán", "01-5", 6, 5),
    },
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def check_pdf(source: str, path: Path) -> str:
    if not path.is_file() or path.open("rb").read(5) != b"%PDF-":
        raise ValueError(f"Invalid or missing {source} PDF: {path}")
    digest = file_sha256(path)
    if digest != PDF_SHA256[source]:
        raise ValueError(f"{source} PDF edition differs from the verified Lesson 01 mapping ({digest}). Review codes/pages before import.")
    return digest


def inspect_archive(source: str, path: Path) -> list[tuple[dict, bytes]]:
    if not path.is_file():
        raise ValueError(f"Missing {source} ZIP: {path}")
    tracks: list[tuple[dict, bytes]] = []
    names: set[str] = set()
    with zipfile.ZipFile(path) as archive:
        for entry in archive.infolist():
            if entry.is_dir() or not entry.filename.lower().endswith(".mp3"):
                continue
            original = Path(entry.filename).name
            if original in names:
                raise ValueError(f"Duplicate {source} audio filename: {original}")
            names.add(original)
            if original == "00.mp3":
                lesson, number, track_id = None, None, f"cc1-{source}-unassigned-00"
            else:
                match = re.fullmatch(r"(0[1-9]|1[0-5])-(\d{1,2})\.mp3", original)
                if not match:
                    raise ValueError(f"Unrecognized {source} audio filename: {original}")
                lesson, number = int(match[1]), int(match[2])
                if number < 1:
                    raise ValueError(f"Invalid {source} track number: {original}")
                track_id = f"cc1-{source}-l{lesson:02d}-t{number:02d}"
            payload = archive.read(entry)
            if len(payload) < 128 or not (payload.startswith(b"ID3") or payload[0] == 0xff):
                raise ValueError(f"Empty or invalid MP3: {source}/{original}")
            reference = LESSON_01_REFERENCES[source].get(number) if lesson == 1 else None
            track = {
                "id": track_id,
                "courseId": "cc1",
                "volume": 1,
                "lesson": lesson,
                "source": source,
                "number": number,
                "originalName": original,
                "privatePath": f"{source}/{original}",
                "bytes": len(payload),
                "sha256": sha256(payload),
                "mappingStatus": "verified" if reference else "pending",
                "activity": ({"pdfPage": reference[0], "bookPage": reference[3], "labelVi": reference[1], "referenceCode": reference[2], "itemCount": reference[4]} if reference else None),
            }
            tracks.append((track, payload))
    if len(tracks) != EXPECTED_COUNTS[source]:
        raise ValueError(f"{source}: expected {EXPECTED_COUNTS[source]} MP3s, found {len(tracks)}")
    if {track["lesson"] for track, _ in tracks if track["lesson"] is not None} != set(range(1, 16)):
        raise ValueError(f"{source}: audio does not cover all 15 lessons")
    for lesson in range(1, 16):
        numbers = sorted(track["number"] for track, _ in tracks if track["lesson"] == lesson)
        if numbers != list(range(1, max(numbers) + 1)):
            raise ValueError(f"{source} Lesson {lesson:02d}: missing or duplicate track number in {numbers}")
    ids = [track["id"] for track, _ in tracks]
    if len(ids) != len(set(ids)):
        raise ValueError(f"Duplicate normalized {source} track ID")
    for number in LESSON_01_REFERENCES[source]:
        if f"cc1-{source}-l01-t{number:02d}" not in ids:
            raise ValueError(f"Missing verified Lesson 01 reference {source} 01-{number}")
    return tracks


def import_audio(args: argparse.Namespace) -> dict:
    pdf_hashes = {source: check_pdf(source, Path(getattr(args, f"{source}_pdf"))) for source in EXPECTED_COUNTS}
    archives = {source: inspect_archive(source, Path(getattr(args, f"{source}_zip"))) for source in EXPECTED_COUNTS}
    all_tracks = sorted((track for entries in archives.values() for track, _ in entries), key=lambda item: (item["lesson"] or 0, item["source"], item["number"] or 0))
    counts = {source: Counter(track["lesson"] for track, _ in entries) for source, entries in archives.items()}
    report = {
        "courseId": "cc1", "volume": 1,
        "expected": EXPECTED_COUNTS,
        "found": {source: len(entries) for source, entries in archives.items()},
        "verifiedLesson01": {source: sum(track["mappingStatus"] == "verified" for track, _ in entries) for source, entries in archives.items()},
        "pendingIds": [track["id"] for track in all_tracks if track["mappingStatus"] == "pending"],
        "lessonCounts": [{"lesson": lesson, **{source: counts[source][lesson] for source in EXPECTED_COUNTS}} for lesson in range(1, 16)],
        "warnings": ["Tracks without a verified PDF activity stay in private staging and are not shown as lesson activities.", "Both 00.mp3 files are kept separate until their purpose is verified."],
    }
    manifest = {
        "schemaVersion": 1, "courseId": "cc1", "volume": 1,
        "title": "A Course in Contemporary Chinese — Volume 1",
        "pdfSha256": pdf_hashes,
        "sourceZipSha256": {source: file_sha256(Path(getattr(args, f"{source}_zip"))) for source in EXPECTED_COUNTS},
        "tracks": all_tracks,
    }
    if args.dry_run:
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return report
    staging = Path(args.staging_dir).resolve()
    staging.mkdir(parents=True, exist_ok=True)
    # Never follow archive paths; write only validated basenames below the private staging root.
    for source, entries in archives.items():
        directory = staging / source
        directory.mkdir(exist_ok=True)
        for track, payload in entries:
            destination = directory / track["originalName"]
            if destination.exists() and file_sha256(destination) == track["sha256"]:
                continue
            temporary = destination.with_suffix(".tmp")
            temporary.write_bytes(payload)
            temporary.replace(destination)
            if file_sha256(destination) != track["sha256"]:
                raise ValueError(f"Staged audio hash mismatch: {track['id']}")
    probe = shutil.which("afinfo") or shutil.which("ffprobe")
    if probe:
        for track in all_tracks:
            audio = staging / track["privatePath"]
            command = [probe, str(audio)] if Path(probe).name == "afinfo" else [probe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1", str(audio)]
            try:
                result = subprocess.run(command, capture_output=True, text=True, check=False, timeout=20)
            except subprocess.TimeoutExpired as error:
                raise ValueError(f"Audio metadata probe timed out: {track['id']}") from error
            if result.returncode or "duration" not in result.stdout.lower():
                raise ValueError(f"Audio metadata cannot be decoded: {track['id']}")
        report["audioMetadataValidated"] = len(all_tracks)
        report["audioProbe"] = Path(probe).name
    else:
        report["audioMetadataValidated"] = 0
        report["warnings"].append("afinfo/ffprobe unavailable: MP3 headers, ZIP CRC and SHA-256 were checked, but decoder metadata was not tested.")
    manifest_out = Path(args.manifest_out)
    report_out = Path(args.report_out)
    manifest_out.parent.mkdir(parents=True, exist_ok=True)
    report_out.parent.mkdir(parents=True, exist_ok=True)
    manifest_out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    report_out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Staged {len(all_tracks)} MP3s privately; verified Lesson 01 activities: {sum(report['verifiedLesson01'].values())}; pending mappings: {len(report['pendingIds'])}.")
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    for source in EXPECTED_COUNTS:
        parser.add_argument(f"--{source}-pdf", required=True)
        parser.add_argument(f"--{source}-zip", required=True)
    parser.add_argument("--staging-dir", default=str(ROOT / ".private/academy/cc1"))
    parser.add_argument("--manifest-out", default=str(ROOT / "data/academy/cc1-audio-manifest.json"))
    parser.add_argument("--report-out", default=str(ROOT / "data/academy/cc1-mapping-report.json"))
    parser.add_argument("--dry-run", action="store_true")
    import_audio(parser.parse_args())


if __name__ == "__main__":
    main()

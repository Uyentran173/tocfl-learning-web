"""Publish only Volume 2 Lesson 01 tracks matched to visible PDF activity codes."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/academy/cc2-audio-manifest.json"
REPORT = ROOT / "data/academy/cc2-mapping-report.json"
PRIVATE = ROOT / ".private/academy/cc2"
PUBLIC = ROOT / "public/academy/cc2/audio"

# Page numbers are PDF page numbers. All labels were checked against the
# textbook/workbook pages, including codes lost by PDF text extraction.
ACTIVITIES = {
    ("textbook", 1): (29, "Đối thoại", None),
    ("textbook", 2): (31, "Từ vựng hội thoại", None),
    ("textbook", 3): (33, "Bài đọc", None),
    ("textbook", 4): (34, "Từ vựng bài đọc", None),
    ("textbook", 5): (35, "Ngữ pháp: 從…往…", None),
    ("textbook", 6): (37, "Ngữ pháp: động từ + 起來", None),
    ("textbook", 7): (38, "Ngữ pháp: động từ + 著", None),
    ("textbook", 8): (39, "Ngữ pháp: 一邊…一邊…", None),
    ("textbook", 9): (40, "Ngữ pháp: 離", None),
    ("workbook", 1): (3, "Nghe và chép chính tả", 5),
    ("workbook", 2): (3, "Nghe hội thoại ngắn, chọn đáp án", 5),
    ("workbook", 3): (4, "Nghe hội thoại, xác định đúng sai", 5),
    ("workbook", 4): (4, "Nghe câu chuyện ngắn, chọn đáp án", None),
}


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    tracks = [item for item in manifest["tracks"] if item["lesson"] == 1]
    if len(tracks) != len(ACTIVITIES):
        raise ValueError(f"Expected {len(ACTIVITIES)} Lesson 01 tracks, found {len(tracks)}")
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for track in tracks:
        key = (track["source"], track["number"])
        if key not in ACTIVITIES:
            raise ValueError(f"Unmapped Lesson 01 track: {track['id']}")
        page, label, count = ACTIVITIES[key]
        source = PRIVATE / track["privatePath"]
        data = source.read_bytes()
        if len(data) != track["bytes"] or hashlib.sha256(data).hexdigest() != track["sha256"]:
            raise ValueError(f"Source checksum mismatch: {track['id']}")
        track["mappingStatus"] = "verified"
        track["activity"] = {
            "pdfPage": page,
            "bookPage": page - (27 if track["source"] == "textbook" else 2),
            "labelVi": label,
            "referenceCode": f"01-{track['number']:02d}" if track["source"] == "textbook" else f"01-{track['number']}",
            "itemCount": count,
        }
        target = PUBLIC / f"{track['id']}.mp3"
        if not target.is_file() or target.read_bytes() != data:
            target.write_bytes(data)
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    report = json.loads(REPORT.read_text())
    report["verifiedActivityMappings"] = sum(track["mappingStatus"] == "verified" for track in manifest["tracks"])
    report["pendingActivityMappings"] = sum(track["mappingStatus"] != "verified" for track in manifest["tracks"])
    report["manuallyVerifiedPrintedReferences"] = [track["id"] for track in tracks if not track["pdfPages"]]
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Published {len(tracks)} verified Lesson 01 tracks; {len(manifest['tracks']) - len(tracks)} remain private")


if __name__ == "__main__":
    main()

"""Publish only Volume 2 Lesson 02 audio after checking printed PDF codes."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/academy/cc2-audio-manifest.json"
REPORT = ROOT / "data/academy/cc2-mapping-report.json"
PRIVATE = ROOT / ".private/academy/cc2"
PUBLIC = ROOT / "public/academy/cc2/audio"

# PDF page, activity, and item count where the printed code was verified.
ACTIVITIES = {
    ("textbook", 1): (51, "Đối thoại", None),
    ("textbook", 2): (53, "Từ vựng hội thoại", None),
    ("textbook", 3): (55, "Bài đọc", None),
    ("textbook", 4): (56, "Từ vựng bài đọc", None),
    ("textbook", 5): (57, "Ngữ pháp: 一點也不 / 沒", None),
    ("textbook", 6): (59, "Ngữ pháp: 還是…吧", None),
    ("textbook", 7): (60, "Ngữ pháp: 一點", None),
    ("textbook", 8): (61, "Ngữ pháp: tính từ lặp AABB", None),
    ("textbook", 9): (63, "Ngữ pháp: 不太", None),
    ("textbook", 10): (65, "Ngữ pháp: 部 / 邊", None),
    ("workbook", 1): (11, "Nghe và chép chính tả", 5),
    ("workbook", 2): (11, "Nghe hội thoại ngắn, chọn đáp án", 5),
    ("workbook", 3): (12, "Nghe hội thoại, xác định đúng sai", 5),
    ("workbook", 4): (12, "Nghe câu chuyện ngắn, chọn đáp án", 5),
}


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    tracks = [item for item in manifest["tracks"] if item["lesson"] == 2]
    if len(tracks) != len(ACTIVITIES):
        raise ValueError(f"Expected {len(ACTIVITIES)} Lesson 02 tracks, found {len(tracks)}")
    if {(track["source"], track["number"]) for track in tracks} != set(ACTIVITIES):
        raise ValueError("Lesson 02 track IDs do not match the verified textbook/workbook codes")

    # Check every source before changing the manifest or publishing anything.
    payloads = {}
    for track in tracks:
        source = PRIVATE / track["privatePath"]
        data = source.read_bytes()
        if not data or len(data) != track["bytes"] or hashlib.sha256(data).hexdigest() != track["sha256"]:
            raise ValueError(f"Source checksum mismatch: {track['id']}")
        payloads[track["id"]] = data

    PUBLIC.mkdir(parents=True, exist_ok=True)
    for track in tracks:
        page, label, count = ACTIVITIES[(track["source"], track["number"])]
        track["mappingStatus"] = "verified"
        track["activity"] = {
            "pdfPage": page,
            "bookPage": page - (27 if track["source"] == "textbook" else 2),
            "labelVi": label,
            "referenceCode": f"02-{track['number']:02d}" if track["source"] == "textbook" else f"02-{track['number']}",
            "itemCount": count,
        }
        target = PUBLIC / f"{track['id']}.mp3"
        if not target.is_file() or target.read_bytes() != payloads[track["id"]]:
            target.write_bytes(payloads[track["id"]])
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    report = json.loads(REPORT.read_text())
    report["verifiedActivityMappings"] = sum(track["mappingStatus"] == "verified" for track in manifest["tracks"])
    report["pendingActivityMappings"] = sum(track["mappingStatus"] != "verified" for track in manifest["tracks"])
    report["manuallyVerifiedPrintedReferences"] = [
        track["id"] for track in manifest["tracks"]
        if track["mappingStatus"] == "verified" and not track["pdfPages"]
    ]
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Published {len(tracks)} verified Lesson 02 tracks; {report['pendingActivityMappings']} remain private")


if __name__ == "__main__":
    main()

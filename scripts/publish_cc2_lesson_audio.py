"""Publish a Volume 2 lesson's PDF-verified tracks from private staging."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data/academy/cc2-audio-manifest.json"
REPORT = ROOT / "data/academy/cc2-mapping-report.json"
PRIVATE = ROOT / ".private/academy/cc2"
PUBLIC = ROOT / "public/academy/cc2/audio"

# Exact visible PDF page, activity heading, and workbook response count.
VERIFIED = {
    3: {
        ("textbook", 1): (79, "Đối thoại", None),
        ("textbook", 2): (82, "Từ vựng hội thoại", None),
        ("textbook", 3): (83, "Bài đọc", None),
        ("textbook", 4): (84, "Từ vựng bài đọc", None),
        ("textbook", 5): (85, "Ngữ pháp: 差不多", None),
        ("textbook", 6): (87, "Ngữ pháp: 過", None),
        ("textbook", 7): (88, "Ngữ pháp: 才", None),
        ("textbook", 8): (90, "Ngữ pháp: 想起來", None),
        ("textbook", 9): (92, "Ngữ pháp: 才 chỉ thời gian", None),
        ("textbook", 10): (93, "Ngữ pháp: lặp động từ ABAB", None),
        ("workbook", 1): (21, "Nghe và chép chính tả", 5),
        ("workbook", 2): (21, "Nghe hội thoại ngắn, chọn đáp án", 5),
        ("workbook", 3): (22, "Nghe câu chuyện, xác định đúng sai", 5),
        ("workbook", 4): (22, "Nghe câu chuyện, ghi thông tin", 8),
    },
}


def publish(lesson: int) -> None:
    verified = VERIFIED[lesson]
    manifest = json.loads(MANIFEST.read_text())
    tracks = [track for track in manifest["tracks"] if track["lesson"] == lesson]
    if {(track["source"], track["number"]) for track in tracks} != set(verified):
        raise ValueError(f"Lesson {lesson:02d} track list differs from reviewed PDF codes")
    payloads = {}
    for track in tracks:
        data = (PRIVATE / track["privatePath"]).read_bytes()
        if not data or len(data) != track["bytes"] or hashlib.sha256(data).hexdigest() != track["sha256"]:
            raise ValueError(f"Source checksum mismatch: {track['id']}")
        payloads[track["id"]] = data
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for track in tracks:
        page, label, count = verified[(track["source"], track["number"])]
        track["mappingStatus"] = "verified"
        track["activity"] = {
            "pdfPage": page,
            "bookPage": page - (27 if track["source"] == "textbook" else 2),
            "labelVi": label,
            "referenceCode": f"{lesson:02d}-{track['number']:02d}" if track["source"] == "textbook" else f"{lesson:02d}-{track['number']}",
            "itemCount": count,
        }
        target = PUBLIC / f"{track['id']}.mp3"
        if not target.is_file() or target.read_bytes() != payloads[track["id"]]:
            target.write_bytes(payloads[track["id"]])
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    report = json.loads(REPORT.read_text())
    report["verifiedActivityMappings"] = sum(track["mappingStatus"] == "verified" for track in manifest["tracks"])
    report["pendingActivityMappings"] = sum(track["mappingStatus"] != "verified" for track in manifest["tracks"])
    report["manuallyVerifiedPrintedReferences"] = [track["id"] for track in manifest["tracks"] if track["mappingStatus"] == "verified" and not track["pdfPages"]]
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Published {len(tracks)} Lesson {lesson:02d} tracks; {report['pendingActivityMappings']} remain private")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lesson", type=int, required=True, choices=VERIFIED)
    publish(parser.parse_args().lesson)

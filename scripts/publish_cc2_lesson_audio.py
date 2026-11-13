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
    4: {
        ("textbook", 1): (107, "Đối thoại", None),
        ("textbook", 2): (110, "Từ vựng hội thoại", None),
        ("textbook", 3): (111, "Bài đọc", None),
        ("textbook", 4): (113, "Từ vựng bài đọc", None),
        ("textbook", 5): (114, "Ngữ pháp: 除了…還…", None),
        ("textbook", 6): (115, "Ngữ pháp: 按照", None),
        ("textbook", 7): (117, "Ngữ pháp: 跟", None),
        ("textbook", 8): (119, "Ngữ pháp: 給", None),
        ("textbook", 9): (120, "Ngữ pháp: 對", None),
        ("workbook", 1): (29, "Nghe và chép chính tả", 5),
        ("workbook", 2): (29, "Nghe hội thoại ngắn, chọn đáp án", 5),
        ("workbook", 3): (30, "Nghe câu chuyện, xác định đúng sai", 5),
        ("workbook", 4): (30, "Nghe câu chuyện, ghi thông tin", 8),
    },
    5: {
        ("textbook", 1): (133, "Đối thoại", None),
        ("textbook", 2): (136, "Từ vựng hội thoại", None),
        ("textbook", 3): (137, "Bài đọc", None),
        ("textbook", 4): (138, "Từ vựng bài đọc", None),
        ("textbook", 5): (140, "Ngữ pháp: 還", None),
        ("textbook", 6): (142, "Ngữ pháp: V 著", None),
        ("textbook", 7): (144, "Ngữ pháp: nhiều cụm động từ", None),
        ("textbook", 8): (145, "Ngữ pháp: 等…就…", None),
        ("textbook", 9): (147, "Ngữ pháp: V 著 V 著，就…了", None),
        ("workbook", 1): (37, "Nghe và chép chính tả", 5),
        ("workbook", 2): (37, "Nghe hội thoại ngắn, chọn đáp án", 5),
        ("workbook", 3): (38, "Nghe hội thoại, xác định đúng sai", 5),
        ("workbook", 4): (38, "Nghe câu chuyện, chọn đáp án", 5),
    },
    6: {
        ("textbook", 1): (159, "Đối thoại", None),
        ("textbook", 2): (162, "Từ vựng hội thoại", None),
        ("textbook", 3): (163, "Bài đọc", None),
        ("textbook", 4): (165, "Từ vựng bài đọc", None),
        ("textbook", 5): (166, "Ngữ pháp: 到", None),
        ("textbook", 6): (168, "Ngữ pháp: 給", None),
        ("textbook", 7): (171, "Ngữ pháp: V 在", None),
        ("textbook", 8): (172, "Ngữ pháp: 把", None),
        ("textbook", 9): (174, "Ngữ pháp: 而且", None),
        ("workbook", 1): (45, "Nghe và chép chính tả", 5),
        ("workbook", 2): (45, "Nghe hội thoại ngắn, chọn đáp án", 5),
        ("workbook", 3): (46, "Nghe hội thoại, xác định đúng sai", 5),
        ("workbook", 4): (46, "Nghe câu chuyện, chọn đáp án", 5),
    },
    7: {
        ("textbook", 1): (185, "Đối thoại", None),
        ("textbook", 2): (188, "Từ vựng hội thoại", None),
        ("textbook", 3): (189, "Bài đọc", None),
        ("textbook", 4): (190, "Từ vựng bài đọc", None),
        ("textbook", 5): (192, "Ngữ pháp: bổ ngữ chỉ hướng", None),
        ("textbook", 6): (194, "Ngữ pháp: 把 với bổ ngữ chỉ hướng", None),
        ("textbook", 7): (196, "Ngữ pháp: câu hỏi phủ định với 嗎", None),
        ("textbook", 8): (197, "Ngữ pháp: câu tồn tại với động từ tư thế", None),
        ("textbook", 9): (199, "Ngữ pháp: 為了", None),
        ("workbook", 1): (53, "Nghe và chép chính tả", 5),
        ("workbook", 2): (53, "Nghe hội thoại ngắn, chọn đáp án", 5),
        ("workbook", 3): (54, "Nghe câu chuyện, xác định đúng sai", 5),
        ("workbook", 4): (54, "Nghe câu và ghép với hình", None),
    },
    8: {
        ("textbook", 1): (211, "Đối thoại", None),
        ("textbook", 2): (214, "Từ vựng hội thoại", None),
        ("textbook", 3): (215, "Bài đọc", None),
        ("textbook", 4): (217, "Từ vựng bài đọc", None),
        ("textbook", 5): (218, "Ngữ pháp: 見", None),
        ("textbook", 6): (219, "Ngữ pháp: 懂", None),
        ("textbook", 7): (220, "Ngữ pháp: 會", None),
        ("textbook", 8): (221, "Ngữ pháp: bổ ngữ khả năng", None),
        ("textbook", 9): (223, "Ngữ pháp: 了 chỉ khả năng", None),
        ("textbook", 10): (224, "Ngữ pháp: tính từ + 得", None),
        ("textbook", 11): (226, "Ngữ pháp: 下去", None),
        ("textbook", 12): (227, "Ngữ pháp: 完", None),
        ("workbook", 1): (61, "Nghe và chép chính tả", 5),
        ("workbook", 2): (61, "Nghe hội thoại ngắn, chọn đáp án", 5),
        ("workbook", 3): (62, "Nghe hội thoại, xác định đúng sai", 5),
        ("workbook", 4): (62, "Nghe câu chuyện, chọn đáp án", 5),
    },
    9: {
        ("textbook", 1): (239, "Đối thoại", None),
        ("textbook", 2): (242, "Từ vựng hội thoại", None),
        ("textbook", 3): (243, "Bài đọc", None),
        ("textbook", 4): (245, "Từ vựng bài đọc", None),
        ("textbook", 5): (246, "Ngữ pháp: 好", None),
        ("textbook", 6): (247, "Ngữ pháp: 到", None),
        ("textbook", 7): (249, "Ngữ pháp: 比起來", None),
        ("textbook", 8): (250, "Ngữ pháp: 像…一樣", None),
        ("textbook", 9): (252, "Ngữ pháp: 極了 / 得很", None),
        ("textbook", 10): (254, "Ngữ pháp: 得起", None),
        ("workbook", 1): (69, "Nghe và chép chính tả", 5),
        ("workbook", 2): (69, "Nghe hội thoại ngắn, chọn đáp án", 5),
        ("workbook", 3): (70, "Nghe câu chuyện, xác định đúng sai", 5),
        ("workbook", 4): (70, "Nghe câu và điền bảng", None),
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

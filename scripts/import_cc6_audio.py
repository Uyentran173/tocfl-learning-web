"""Stage Volume 6 textbook audio and publish source-verified Lesson 1–10 tracks.

Usage: python3 scripts/import_cc6_audio.py TEXTBOOK_PDF WORKBOOK_PDF AUDIO_ZIP
The archive's original directory names are ignored; only numbered MP3 basenames are used.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / ".private/academy/cc6/textbook"
PUBLIC = ROOT / "public/academy/cc6/audio"
MANIFEST = ROOT / "data/academy/cc6-audio-manifest.json"
REPORT = ROOT / "data/academy/cc6-mapping-report.json"

# These references were checked visually against the textbook pages, not inferred
# from the MP3 basename. Unreviewed lessons remain staged and unpublished.
VERIFIED = {
    "01-01": (24, "Tóm tắt và mở đầu Bài 01"),
    "01-02": (25, "Bài đọc 1: 瑞士職校畢業生最有競爭力 (I)"),
    "01-03": (26, "Từ mới bài đọc 1"),
    "01-04": (33, "Phân biệt từ dễ nhầm bài đọc 1"),
    "01-05": (36, "Bài đọc 2: 瑞士職校畢業生最有競爭力 (II)"),
    "01-06": (37, "Từ mới bài đọc 2"),
    "01-07": (42, "Phân biệt từ dễ nhầm bài đọc 2"),
    "01-08": (44, "Bài đọc bổ sung: 教部技職教育代言人"),
    "01-09": (44, "Từ mới bài đọc bổ sung"),
    "02-01": (52, "Tóm tắt và mở đầu Bài 02"),
    "02-02": (53, "Bài đọc 1: 簡單科技改變人類生活 (I)"),
    "02-03": (54, "Từ vựng tóm tắt và bài đọc 1"),
    "02-04": (60, "Phân biệt từ dễ nhầm bài đọc 1"),
    "02-05": (63, "Bài đọc 2: 簡單科技改變人類生活 (II)"),
    "02-06": (64, "Từ vựng bài đọc 2"),
    "02-07": (69, "Phân biệt từ dễ nhầm bài đọc 2"),
    "03-01": (72, "Tóm tắt và mở đầu Bài 03"),
    "03-02": (73, "Bài đọc 1: 舞蹈家許芳宜「生身不息」的演出（I）"),
    "03-03": (74, "Từ vựng tóm tắt và bài đọc 1"),
    "03-04": (82, "Phân biệt từ dễ nhầm bài đọc 1"),
    "03-05": (85, "Bài đọc 2: 舞蹈家許芳宜「生身不息」的演出（II）"),
    "03-06": (86, "Từ vựng bài đọc 2"),
    "03-07": (93, "Phân biệt từ dễ nhầm bài đọc 2"),
    "04-01": (96, "Tóm tắt và mở đầu Bài 04"),
    "04-02": (97, "Bài đọc 1: 黑幼龍傳授4大獨門做人心法 (I)"),
    "04-03": (98, "Từ vựng tóm tắt và bài đọc 1"),
    "04-04": (106, "Phân biệt từ dễ nhầm bài đọc 1"),
    "04-05": (109, "Bài đọc 2: 黑幼龍傳授4大獨門做人心法 (II)"),
    "04-06": (110, "Từ vựng bài đọc 2"),
    "04-07": (117, "Phân biệt từ dễ nhầm bài đọc 2"),
    "04-08": (119, "Bài đọc bổ sung: 好態度帶來好機緣"),
    "04-09": (120, "Từ vựng bài đọc bổ sung"),
    "04-10": (120, "Phân biệt từ dễ nhầm bài đọc bổ sung"),
    "05-01": (124, "Tóm tắt và mở đầu Bài 05"),
    "05-02": (125, "Bài đọc 1: 在歐洲，英文不等於「國際共通語言」（I）"),
    "05-03": (126, "Từ vựng tóm tắt và bài đọc 1"),
    "05-04": (133, "Phân biệt từ dễ nhầm bài đọc 1"),
    "05-05": (135, "Bài đọc 2: 在歐洲，英文不等於「國際共通語言」（II）"),
    "05-06": (136, "Từ vựng bài đọc 2"),
    "05-07": (143, "Phân biệt từ dễ nhầm bài đọc 2"),
    "06-01": (146, "Tóm tắt và mở đầu Bài 06"),
    "06-02": (147, "Bài đọc 1: 貓熊出訪角色 · 由政轉商 (I)"),
    "06-03": (148, "Từ vựng tóm tắt và bài đọc 1"),
    "06-04": (158, "Phân biệt từ dễ nhầm bài đọc 1"),
    "06-05": (159, "Bài đọc 2: 貓熊出訪角色 · 由政轉商 (II)"),
    "06-06": (161, "Từ vựng bài đọc 2"),
    "06-07": (165, "Phân biệt từ dễ nhầm bài đọc 2"),
    "07-01": (170, "Tóm tắt và mở đầu Bài 07"),
    "07-02": (171, "Bài đọc 1: 感情世界最大的情敵是「自我」（I）"),
    "07-03": (172, "Từ vựng tóm tắt và bài đọc 1"),
    "07-04": (179, "Phân biệt từ dễ nhầm bài đọc 1"),
    "07-05": (181, "Bài đọc 2: 感情世界最大的情敵是「自我」（II）"),
    "07-06": (182, "Từ vựng bài đọc 2"),
    "07-07": (190, "Phân biệt từ dễ nhầm bài đọc 2"),
    "08-01": (194, "Tóm tắt và mở đầu Bài 08"),
    "08-02": (195, "Bài đọc 1: 主辦奧運是經濟的強心針還是國債的大黑洞（I）"),
    "08-03": (196, "Từ vựng tóm tắt và bài đọc 1"),
    "08-04": (206, "Phân biệt từ dễ nhầm bài đọc 1"),
    "08-05": (209, "Bài đọc 2: 主辦奧運是經濟的強心針還是國債的大黑洞（II）"),
    "08-06": (210, "Từ vựng bài đọc 2"),
    "08-07": (219, "Phân biệt từ dễ nhầm bài đọc 2"),
    "09-01": (224, "Tóm tắt và mở đầu Bài 09"),
    "09-02": (225, "Bài đọc 1: 鄉關何處（I）"),
    "09-03": (226, "Từ vựng tóm tắt và bài đọc 1"),
    "09-04": (231, "Phân biệt từ dễ nhầm bài đọc 1"),
    "09-05": (233, "Bài đọc 2: 鄉關何處（II）"),
    "09-06": (234, "Từ vựng bài đọc 2"),
    "09-07": (238, "Phân biệt từ dễ nhầm bài đọc 2"),
    "10-01": (244, "Tóm tắt và mở đầu Bài 10"),
    "10-02": (245, "Bài đọc 1: 當街頭智慧遇上讀書智慧"),
    "10-03": (246, "Từ vựng tóm tắt và bài đọc 1"),
    "10-04": (249, "Phân biệt từ dễ nhầm bài đọc 1"),
    "10-05": (253, "Tóm tắt bài đọc 2"),
    "10-06": (253, "Bài đọc 2: 讀書能力≠做事能力"),
    "10-07": (255, "Từ vựng tóm tắt và bài đọc 2"),
    "10-08": (270, "Phân biệt từ dễ nhầm bài đọc 2"),
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha256(path: Path) -> str:
    with path.open("rb") as stream:
        digest = hashlib.sha256()
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    textbook, workbook, archive = map(Path, sys.argv[1:])
    for path in (textbook, workbook, archive):
        if not path.is_file():
            raise SystemExit(f"Missing source: {path}")
    PRIVATE.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    tracks = []
    seen: set[str] = set()
    with zipfile.ZipFile(archive) as source:
        entries = sorted((entry for entry in source.infolist() if entry.filename.lower().endswith(".mp3")), key=lambda entry: Path(entry.filename).name)
        for entry in entries:
            name = Path(entry.filename).name
            if name in seen:
                raise SystemExit(f"Duplicate MP3 basename: {name}")
            seen.add(name)
            match = re.fullmatch(r"(\d{2})-(\d{2})\.mp3", name, re.I)
            if not match and name != "00.mp3":
                raise SystemExit(f"Unrecognized MP3 basename: {name}")
            if match and not 1 <= int(match[1]) <= 10:
                raise SystemExit(f"Invalid lesson number: {name}")
            data = source.read(entry)
            if not data or data[:3] != b"ID3" and data[:2] != b"\xff\xfb" and data[:2] != b"\xff\xf3" and data[:2] != b"\xff\xf2":
                raise SystemExit(f"Empty or invalid MP3: {name}")
            (PRIVATE / name).write_bytes(data)
            code = name[:-4]
            verified = VERIFIED.get(code)
            lesson = int(match[1]) if match else None
            track_id = f"cc6-textbook-l{match[1]}-t{match[2]}" if match else "cc6-textbook-unassigned-00"
            if verified:
                (PUBLIC / f"{track_id}.mp3").write_bytes(data)
            tracks.append({
                "id": track_id, "courseId": "cc6", "volume": 6,
                "lesson": lesson, "source": "textbook",
                "number": int(match[2]) if match else None,
                "originalName": name, "privatePath": f"textbook/{name}",
                "bytes": len(data), "sha256": sha256(data),
                "pdfPages": [verified[0]] if verified else [],
                "mappingStatus": "verified" if verified else "pending",
                "activity": {"pdfPage": verified[0], "bookPage": verified[0] - 23, "labelVi": verified[1], "referenceCode": code} if verified else None,
            })
    if len(tracks) != 77 or len([track for track in tracks if track["mappingStatus"] == "verified"]) != len(VERIFIED):
        raise SystemExit(f"Unexpected track count or verified set: {len(tracks)}")
    manifest = {
        "schemaVersion": 1, "courseId": "cc6", "volume": 6,
        "title": "A Course in Contemporary Chinese — Volume 6",
        "pdfSha256": {"textbook": file_sha256(textbook), "workbook": file_sha256(workbook)},
        "sourceZipSha256": {"textbook": file_sha256(archive)},
        "tracks": tracks,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    report = {
        "courseId": "cc6", "volume": 6, "sourceTrackCount": len(tracks),
        "verifiedTrackCount": len(VERIFIED), "pendingTrackCount": len(tracks) - len(VERIFIED),
        "publishedLessonIds": [f"cc6-v6-l{n:02d}" for n in range(1, 11)],
        "pendingLessonIds": [],
        "unassignedTrackIds": [track["id"] for track in tracks if track["lesson"] is None],
        "reason": "Lessons 01–10 printed audio reference codes and lesson content were checked against the source PDF. Unassigned 00.mp3 remains private pending source verification.",
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Staged {len(tracks)} MP3s; published {len(VERIFIED)} verified Lesson 01–10 tracks; {len(tracks)-len(VERIFIED)} pending mapping.")


if __name__ == "__main__":
    main()

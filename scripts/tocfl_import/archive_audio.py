"""Safely inspect official legacy audio archives with explicit track numbering."""
from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
import hashlib
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import tempfile
import time
import zipfile

import requests

from .discovery import ImportErrorWithContext, official_url

MAX_ARCHIVE_BYTES = 500 * 1024 * 1024
MAX_EXTRACTED_BYTES = 500 * 1024 * 1024
MAX_MEMBERS = 250


def _os_metadata(path: PurePosixPath) -> bool:
    """Only discard known folder metadata, never an arbitrary non-audio file."""
    name = path.name.casefold()
    return name in {"desktop.ini", "thumbs.db", ".ds_store"} or name.startswith("._")


def download_audio_archive(session: requests.Session, url: str) -> bytes:
    """Resume interrupted official downloads without accepting changed bytes."""
    body = bytearray()
    total: int | None = None
    for attempt in range(8):
        offset = len(body)
        headers = {"Accept-Encoding": "identity"}
        if offset:
            headers["Range"] = f"bytes={offset}-"
        try:
            with session.get(url, stream=True, timeout=60, headers=headers) as response:
                response.raise_for_status()
                official_url(url, response.url)
                if offset:
                    if response.status_code != 206:
                        raise ImportErrorWithContext("Official archive server did not honor the resume range")
                    match = re.fullmatch(r"bytes (\d+)-(\d+)/(\d+)", response.headers.get("Content-Range", ""))
                    if not match or int(match[1]) != offset or int(match[2]) + 1 != int(match[3]):
                        raise ImportErrorWithContext("Official archive returned an inconsistent resume range")
                    if total is not None and total != int(match[3]):
                        raise ImportErrorWithContext("Official archive changed size during download")
                    total = int(match[3])
                elif response.status_code != 200:
                    raise ImportErrorWithContext(f"Official archive returned unexpected HTTP {response.status_code}")
                else:
                    length = response.headers.get("Content-Length")
                    total = int(length) if length and length.isdigit() else None
                if total is not None and total > MAX_ARCHIVE_BYTES:
                    raise ImportErrorWithContext("Audio archive exceeds the compressed-size safety limit")
                for chunk in response.iter_content(1024 * 1024):
                    body.extend(chunk)
                    if len(body) > MAX_ARCHIVE_BYTES or total is not None and len(body) > total:
                        raise ImportErrorWithContext("Audio archive exceeds its declared or safety size")
                if total is None or len(body) == total:
                    return bytes(body)
        except requests.RequestException:
            if attempt == 7:
                raise
        if attempt < 7:
            time.sleep(min(attempt + 1, 5))
    raise ImportErrorWithContext(f"Official archive download ended at {len(body)}/{total or '?'} bytes")


@dataclass
class ArchiveAudio:
    tracks: list[dict[str, str]]
    files: dict[str, bytes]
    members: list[dict[str, str | int]]
    format: str


def _safe_name(name: str, *, directory: bool = False) -> PurePosixPath:
    if not name or "\\" in name or any(ord(character) < 32 for character in name):
        raise ImportErrorWithContext(f"Unsafe archive member name: {name!r}")
    # A directory entry may end in one slash; it is not an empty path component.
    # Keep all other empty/dot components invalid, including a slash on a file.
    normalized = name[:-1] if directory and name.endswith("/") else name
    path = PurePosixPath(normalized)
    if (not normalized or (name.endswith("/") and not directory)
            or path.is_absolute() or re.match(r"^[A-Za-z]:", normalized)
            or any(part in {"", ".", ".."} for part in normalized.split("/"))):
        raise ImportErrorWithContext(f"Unsafe archive member path: {name!r}")
    return path


def _read_zip(body: bytes) -> list[tuple[str, bytes]]:
    files = []
    # The older official ZIPs omit the UTF-8 flag and encode Chinese names as
    # CP950/Big5. ASCII names decode identically in both encodings.
    with zipfile.ZipFile(BytesIO(body), metadata_encoding="cp950") as archive:
        infos = archive.infolist()
        if len(infos) > MAX_MEMBERS:
            raise ImportErrorWithContext(f"Audio archive has too many members: {len(infos)}")
        total = 0
        actual_total = 0
        for info in infos:
            _safe_name(info.filename, directory=info.is_dir())
            mode = info.external_attr >> 16
            kind = stat.S_IFMT(mode)
            if (kind not in {0, stat.S_IFREG, stat.S_IFDIR}
                    or (kind != 0 and (kind == stat.S_IFDIR) != info.is_dir())
                    or info.flag_bits & 1):
                raise ImportErrorWithContext(f"Archive symlink/encrypted member is unsupported: {info.filename}")
            if info.is_dir():
                continue
            total += info.file_size
            if total > MAX_EXTRACTED_BYTES:
                raise ImportErrorWithContext("Audio archive expands beyond the safety limit")
            if _os_metadata(PurePosixPath(info.filename)):
                continue
            elif info.filename.lower().endswith(".mp3"):
                audio = bytearray()
                with archive.open(info) as source:
                    for chunk in iter(lambda: source.read(1024 * 1024), b""):
                        audio.extend(chunk)
                        actual_total += len(chunk)
                        if actual_total > MAX_EXTRACTED_BYTES:
                            raise ImportErrorWithContext("Audio archive expands beyond the safety limit")
                if len(audio) != info.file_size:
                    raise ImportErrorWithContext(f"Archive member size changed while reading: {info.filename}")
                files.append((info.filename, bytes(audio)))
            else:
                raise ImportErrorWithContext(f"Unexpected non-audio archive member: {info.filename}")
    return files


def _run_bsdtar(args: list[str]) -> str:
    try:
        completed = subprocess.run(["bsdtar", *args], capture_output=True, text=True, timeout=180)
    except FileNotFoundError as error:
        raise ImportErrorWithContext("RAR extraction requires bsdtar (libarchive-tools on Ubuntu)") from error
    except subprocess.TimeoutExpired as error:
        raise ImportErrorWithContext("RAR extraction timed out") from error
    if completed.returncode:
        raise ImportErrorWithContext(f"RAR extraction failed: {completed.stderr.strip()[:300]}")
    return completed.stdout


def _read_rar(body: bytes) -> list[tuple[str, bytes]]:
    with tempfile.TemporaryDirectory(prefix="tocfl-rar-") as temporary:
        root = Path(temporary)
        source = root / "source.rar"
        target = root / "extracted"
        source.write_bytes(body)
        target.mkdir()
        names = _run_bsdtar(["-tf", str(source)]).splitlines()
        details = _run_bsdtar(["-tvf", str(source)]).splitlines()
        if len(names) != len(details) or len(names) > MAX_MEMBERS:
            raise ImportErrorWithContext("RAR member listing is inconsistent or too large")
        total = 0
        for name, detail in zip(names, details):
            if not detail or detail[0] not in {"-", "d"}:
                raise ImportErrorWithContext(f"RAR link/special member is unsupported: {name}")
            _safe_name(name, directory=detail[0] == "d")
            fields = detail.split(maxsplit=5)
            if len(fields) < 6 or not fields[4].isdigit():
                raise ImportErrorWithContext(f"Cannot verify RAR member size: {name}")
            total += int(fields[4])
            if total > MAX_EXTRACTED_BYTES:
                raise ImportErrorWithContext("Audio archive expands beyond the safety limit")
        _run_bsdtar(["-xf", str(source), "-C", str(target), "--no-same-owner", "--no-same-permissions"])
        files = []
        actual_total = 0
        for name, detail in zip(names, details):
            path = target.joinpath(*_safe_name(name, directory=detail[0] == "d").parts)
            if detail[0] == "d":
                if not path.is_dir() or path.is_symlink() or not path.resolve().is_relative_to(target.resolve()):
                    raise ImportErrorWithContext(f"Invalid extracted directory: {name}")
                continue
            if (not path.is_file() or path.is_symlink() or path.stat().st_nlink != 1
                    or not path.resolve().is_relative_to(target.resolve())):
                raise ImportErrorWithContext(f"Invalid extracted audio file: {name}")
            if _os_metadata(PurePosixPath(name)):
                continue
            if path.suffix.lower() != ".mp3":
                raise ImportErrorWithContext(f"Unexpected non-audio archive member: {name}")
            actual_total += path.stat().st_size
            if actual_total > MAX_EXTRACTED_BYTES:
                raise ImportErrorWithContext("Audio archive expands beyond the safety limit")
            files.append((name, path.read_bytes()))
        return files


def _sequential_names(source_files: list[tuple[str, bytes]], expected_questions: int, transcript_pdf: bytes | None) -> dict[str, str]:
    """Resolve sequential tracks only against an exact printed group plan."""
    numbered = [(name, int(match[1]), int(match[2])) for name, _ in source_files
                if (match := re.fullmatch(r"([1-9]\d*)-(\d{1,2})\.mp3", PurePosixPath(name).name, re.I))]
    if not numbered or max(number for _, _, number in numbered) <= expected_questions:
        return {}
    if transcript_pdf is None:
        raise ImportErrorWithContext("Sequential archive tracks require the official transcript to verify shared audio boundaries")
    from .pdf import extract_transcript_layout
    layout = extract_transcript_layout(transcript_pdf, expected_questions)
    numerals = {"一": 1, "二": 2, "兩": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10}
    starts: dict[int, int] = {}
    for first, source in [(1, layout.preface), *[(n + 1, text) for n, text in layout.questions.items() if n < expected_questions]]:
        compact = re.sub(r"\s+", "", source)
        declarations = re.findall(r"回答(?:下面|以下|上述|以上)?(?:的)?([一二三四五六七八九十兩\d]+)個問題", compact)
        if len(declarations) > 1:
            raise ImportErrorWithContext(f"Transcript has ambiguous audio group declarations before Q{first}")
        if declarations:
            word = declarations[0]
            count = int(word) if word.isdigit() else numerals.get(word)
            if count is None:
                raise ImportErrorWithContext(f"Unknown transcript group size before Q{first}: {word}")
            if count > 1:
                starts[first] = count
    for first, count in starts.items():
        if first + count - 1 > expected_questions or any(first < other <= first + count - 1 for other in starts):
            raise ImportErrorWithContext(f"Transcript audio groups overlap near Q{first}")
    if len(numbered) != expected_questions + len(starts):
        raise ImportErrorWithContext(f"Sequential archive has {len(numbered)} numbered tracks; transcript requires {expected_questions} questions plus {len(starts)} shared passages")
    if [number for _, _, number in numbered] != list(range(1, len(numbered) + 1)):
        raise ImportErrorWithContext("Sequential archive track numbers are missing, repeated, or out of order")
    mapped = {}
    question = 1
    shared_pending = False
    part_questions: dict[int, list[int]] = {}
    for name, part, _ in numbered:
        if question in starts and not shared_pending:
            mapped[name] = f"{part}-{question:02d}-0.mp3"
            shared_pending = True
            continue
        mapped[name] = f"{part}-{question:02d}{'-1' if shared_pending else ''}.mp3"
        part_questions.setdefault(part, []).append(question)
        question += 1
        shared_pending = False
    if question != expected_questions + 1 or shared_pending:
        raise ImportErrorWithContext("Sequential archive cannot be aligned with transcript questions")
    for part, questions in part_questions.items():
        if questions != list(range(questions[0], questions[-1] + 1)):
            raise ImportErrorWithContext(f"Sequential archive part {part} has discontinuous question mapping")
    return mapped


def inspect_audio_archive(body: bytes, archive_url: str, expected_questions: int, *, transcript_pdf: bytes | None = None) -> ArchiveAudio:
    if not body or len(body) > MAX_ARCHIVE_BYTES:
        raise ImportErrorWithContext("Audio archive is empty or exceeds the safety limit")
    if body.startswith(b"PK\x03\x04"):
        format_name, source_files = "zip", _read_zip(body)
    elif body.startswith((b"Rar!\x1a\x07\x00", b"Rar!\x1a\x07\x01\x00")):
        format_name, source_files = "rar", _read_rar(body)
    else:
        raise ImportErrorWithContext("Audio archive is neither ZIP nor RAR, regardless of its extension")
    if not source_files:
        raise ImportErrorWithContext("Audio archive contains no MP3 tracks")
    sequential_names = _sequential_names(source_files, expected_questions, transcript_pdf)

    tracks: list[dict[str, str]] = []
    files: dict[str, bytes] = {}
    members: list[dict[str, str | int]] = []
    numbered: list[int] = []
    part_of_question: dict[int, int] = {}
    intros: list[int] = []
    groups: list[int] = []
    pending_group: int | None = None
    ending_seen = False
    preamble_seen = False
    names_seen: set[str] = set()
    for index, (member, audio) in enumerate(source_files):
        path = _safe_name(member)
        if member.casefold() in names_seen:
            raise ImportErrorWithContext(f"Duplicate archive member: {member}")
        names_seen.add(member.casefold())
        base = sequential_names.get(member, path.name)
        if len(audio) < 100 or not (audio.startswith(b"ID3") or audio[0] == 0xff):
            raise ImportErrorWithContext(f"Missing or invalid MP3 data: {member}")
        label = ""
        local_name = ""
        if base == "0-1.mp3" or base == "1-00-1.mp3":
            if index != 0 or preamble_seen:
                raise ImportErrorWithContext(f"Preamble track is out of order: {member}")
            preamble_seen = True
            local_name = "preamble.mp3"
        elif base == "1-00-2.mp3" or re.fullmatch(r"\d+-0{2,}.*\.mp3", base, re.I):
            part = 1 if base == "1-00-2.mp3" else int(base.split("-", 1)[0])
            if part == len(intros) + 1 and numbered == list(range(1, expected_questions + 1)) and index == len(source_files) - 1:
                ending_seen = True
                local_name = "ending.mp3"
            elif part == len(intros) + 1 and not ending_seen:
                if pending_group is not None:
                    raise ImportErrorWithContext(f"Shared audio Q{pending_group} has no complete question group")
                intros.append(part)
                label = f"第{'一二三四五六七八九'[part - 1]}部分說明" if part <= 9 else f"第{part}部分說明"
                local_name = f"part-{part}-intro.mp3"
            else:
                raise ImportErrorWithContext(f"Intro/ending track has ambiguous position: {member}")
        else:
            match = re.fullmatch(r"(?:(\d+)-(\d{1,2})(?:-([01]))?|q(\d{1,2}))\.mp3", base, re.I)
            if not match:
                raise ImportErrorWithContext(f"Cannot map archive MP3 {member!r} to a question or intro; long recordings need official cue/timestamps")
            part = int(match[1]) if match[1] else len(intros)
            question = int(match[2] or match[4])
            suffix = match[3]
            if part != len(intros) or part < 1 or ending_seen or question < 1 or question > expected_questions:
                raise ImportErrorWithContext(f"Question track is outside its numbered part: {member}")
            if suffix == "0":
                if pending_group is not None or question != len(numbered) + 1:
                    raise ImportErrorWithContext(f"Shared audio has ambiguous question boundary: {member}")
                pending_group = question
                groups.append(question)
                label = "題幹"
                local_name = f"q{question:02d}-shared.mp3"
            else:
                if question != len(numbered) + 1:
                    raise ImportErrorWithContext(f"Missing/duplicate/out-of-order question MP3: {member}")
                if suffix == "1" and pending_group != question:
                    raise ImportErrorWithContext(f"Question suffix -1 has no matching shared track: {member}")
                if pending_group == question and suffix != "1":
                    raise ImportErrorWithContext(f"Shared track Q{question} needs its -1 question track: {member}")
                if pending_group is not None and question > pending_group:
                    if question == pending_group + 1:
                        pending_group = None
                    else:
                        raise ImportErrorWithContext(f"Shared audio Q{pending_group} skips a question")
                numbered.append(question)
                part_of_question[question] = part
                label = str(question)
                local_name = f"q{question:02d}.mp3"
        if local_name in files:
            raise ImportErrorWithContext(f"Two archive tracks normalize to {local_name}")
        files[local_name] = audio
        tracks.append({"label": label, "url": archive_url, "localName": local_name})
        members.append({"sourcePath": member, "assetName": local_name, "bytes": len(audio), "sha256": hashlib.sha256(audio).hexdigest()})

    if numbered != list(range(1, expected_questions + 1)) or pending_group is not None:
        raise ImportErrorWithContext(f"Archive has {len(numbered)}/{expected_questions} mapped question tracks; cannot safely split long or missing audio")
    if not intros or intros[0] != 1 or sorted(set(part_of_question.values())) != intros:
        raise ImportErrorWithContext("Archive part intros do not align with numbered questions")
    for part in intros:
        questions = [number for number, owner in part_of_question.items() if owner == part]
        if questions != list(range(questions[0], questions[-1] + 1)):
            raise ImportErrorWithContext(f"Archive part {part} question numbering has gaps")
    for first in groups:
        if part_of_question.get(first) != part_of_question.get(first + 1):
            raise ImportErrorWithContext(f"Shared audio Q{first} crosses a part boundary")
    return ArchiveAudio(tracks, files, members, format_name)

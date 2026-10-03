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
import zipfile

import requests

from .discovery import ImportErrorWithContext, official_url

MAX_ARCHIVE_BYTES = 500 * 1024 * 1024
MAX_EXTRACTED_BYTES = 500 * 1024 * 1024
MAX_MEMBERS = 250


def download_audio_archive(session: requests.Session, url: str) -> bytes:
    """Stream only from the official host and cap the compressed download."""
    with session.get(url, stream=True, timeout=60) as response:
        response.raise_for_status()
        official_url(url, response.url)
        body = bytearray()
        for chunk in response.iter_content(1024 * 1024):
            body.extend(chunk)
            if len(body) > MAX_ARCHIVE_BYTES:
                raise ImportErrorWithContext("Audio archive exceeds the compressed-size safety limit")
    return bytes(body)


@dataclass
class ArchiveAudio:
    tracks: list[dict[str, str]]
    files: dict[str, bytes]
    members: list[dict[str, str | int]]
    format: str


def _safe_name(name: str) -> PurePosixPath:
    if not name or "\\" in name or any(ord(character) < 32 for character in name):
        raise ImportErrorWithContext(f"Unsafe archive member name: {name!r}")
    path = PurePosixPath(name)
    if path.is_absolute() or any(part in {"", ".", ".."} for part in name.split("/")):
        raise ImportErrorWithContext(f"Unsafe archive member path: {name!r}")
    return path


def _read_zip(body: bytes) -> list[tuple[str, bytes]]:
    files = []
    with zipfile.ZipFile(BytesIO(body)) as archive:
        infos = archive.infolist()
        if len(infos) > MAX_MEMBERS:
            raise ImportErrorWithContext(f"Audio archive has too many members: {len(infos)}")
        total = 0
        for info in infos:
            _safe_name(info.filename)
            mode = info.external_attr >> 16
            if stat.S_ISLNK(mode) or info.flag_bits & 1:
                raise ImportErrorWithContext(f"Archive symlink/encrypted member is unsupported: {info.filename}")
            if info.is_dir():
                continue
            total += info.file_size
            if total > MAX_EXTRACTED_BYTES:
                raise ImportErrorWithContext("Audio archive expands beyond the safety limit")
            if info.filename.lower().endswith(".mp3"):
                files.append((info.filename, archive.read(info)))
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
            _safe_name(name)
            if not detail or detail[0] not in {"-", "d"}:
                raise ImportErrorWithContext(f"RAR link/special member is unsupported: {name}")
            fields = detail.split(maxsplit=5)
            if len(fields) < 6 or not fields[4].isdigit():
                raise ImportErrorWithContext(f"Cannot verify RAR member size: {name}")
            total += int(fields[4])
            if total > MAX_EXTRACTED_BYTES:
                raise ImportErrorWithContext("Audio archive expands beyond the safety limit")
        _run_bsdtar(["-xf", str(source), "-C", str(target), "--no-same-owner", "--no-same-permissions"])
        files = []
        for name, detail in zip(names, details):
            path = target.joinpath(*PurePosixPath(name).parts)
            if detail[0] == "d":
                if not path.is_dir() or path.is_symlink():
                    raise ImportErrorWithContext(f"Invalid extracted directory: {name}")
                continue
            if not path.is_file() or path.is_symlink() or not path.resolve().is_relative_to(target.resolve()):
                raise ImportErrorWithContext(f"Invalid extracted audio file: {name}")
            if path.suffix.lower() != ".mp3":
                raise ImportErrorWithContext(f"Unexpected non-audio archive member: {name}")
            files.append((name, path.read_bytes()))
        return files


def inspect_audio_archive(body: bytes, archive_url: str, expected_questions: int) -> ArchiveAudio:
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
        base = path.name
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
            match = re.fullmatch(r"(\d+)-(\d{1,2})(?:-([01]))?\.mp3", base, re.I)
            if not match:
                raise ImportErrorWithContext(f"Cannot map archive MP3 {member!r} to a question or intro; long recordings need official cue/timestamps")
            part, question = int(match[1]), int(match[2])
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

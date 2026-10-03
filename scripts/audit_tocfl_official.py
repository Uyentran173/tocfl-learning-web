"""Audit every official TOCFL mock test without publishing generated packages."""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from io import BytesIO

import requests

from tocfl_import.archive_audio import _run_bsdtar, download_audio_archive, inspect_audio_archive
from tocfl_import.build import build_package
from tocfl_import.discovery import OFFICIAL_PAGE, available_tests, discover, discover_audio_tracks, fetch
from tocfl_import.validate import validate_package

ROOT = Path(__file__).resolve().parents[1]


def _cached_bytes(session: requests.Session, url: str, cache_dir: Path | None, *, archive: bool = False) -> bytes:
    name = hashlib.sha256(url.encode()).hexdigest() + (".archive" if archive else ".pdf")
    path = cache_dir / name if cache_dir else None
    if path and path.is_file():
        body = path.read_bytes()
    else:
        body = download_audio_archive(session, url) if archive else fetch(session, url).content
        if path:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(body)
    if not archive and not body.startswith(b"%PDF-"):
        raise ValueError(f"Official PDF has invalid bytes: {url}")
    return body


def _archive_inventory(body: bytes) -> dict:
    if body.startswith(b"PK\x03\x04"):
        with zipfile.ZipFile(BytesIO(body), metadata_encoding="cp950") as archive:
            entries = archive.infolist()
            names = [entry.filename for entry in entries]
            directory_names = {entry.filename for entry in entries if entry.is_dir()}
            encoded = any(any(ord(character) > 127 for character in name) for name in names)
            encoding = "UTF-8" if any(entry.flag_bits & 0x800 for entry in entries) else "CP950/Big5" if encoded else "ASCII"
        format_name = "ZIP (.rar URL)"
    elif body.startswith(b"Rar!\x1a\x07"):
        format_name = "RAR"
        encoding = "RAR headers"
        with tempfile.TemporaryDirectory(prefix="tocfl-audit-rar-") as temporary:
            source = Path(temporary) / "audio.rar"
            source.write_bytes(body)
            names = _run_bsdtar(["-tf", str(source)]).splitlines()
            details = _run_bsdtar(["-tvf", str(source)]).splitlines()
            if len(names) != len(details):
                raise ValueError("RAR member listing is inconsistent")
            directory_names = {name for name, detail in zip(names, details) if detail.startswith("d")}
    else:
        return {"format": "unknown", "encoding": "unknown", "memberCount": 0}
    numbered = [int(match[1]) for name in names if (match := re.fullmatch(r"\d+-(\d{1,2})\.mp3", name.rsplit("/", 1)[-1], re.I))]
    files = [name for name in names if name not in directory_names]
    parents = {name.rsplit("/", 1)[0] if "/" in name else "" for name in files}
    path_layout = "flat" if parents == {""} else "one wrapper" if len(parents) == 1 and next(iter(parents)) else "nested/mixed"
    return {"format": format_name, "encoding": encoding, "memberCount": len(names) or None,
            "directories": sorted(directory_names),
            "pathLayout": path_layout,
            "nonAudio": [name for name in names if name not in directory_names and not name.lower().endswith(".mp3")],
            "numberedTracks": len(numbered), "sequential": bool(numbered and max(numbered) > 50)}


def _download_online(item: tuple[str, str], test_id: str, assets: Path) -> None:
    local_path, url = item
    target = assets / local_path.split(f"/tests/{test_id}/", 1)[1]
    with requests.Session() as session:
        body = fetch(session, url).content
    if len(body) < 100 or not (body.startswith(b"ID3") or body[0] == 0xff):
        raise ValueError(f"Official audio is missing or invalid: {url}")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(body)


def _node_binary() -> str:
    direct = os.environ.get("NODE_BINARY") or shutil.which("node")
    if direct:
        return direct
    pnpm = shutil.which("pnpm")
    # Codex's bundled pnpm wrapper can invoke its bundled Node even when Node
    # itself is absent from PATH. Ordinary Node installations use the direct path.
    if pnpm:
        bundled = Path(pnpm).resolve().parents[2] / "node/bin/node"
        if bundled.is_file():
            return str(bundled)
    raise RuntimeError("Node.js is required for website-load validation; set NODE_BINARY to its executable")


def audit_one(session: requests.Session, band: str, series: int, cache_dir: Path | None, verify_online: bool) -> dict:
    result = {"band": band, "series": series, "status": "UNSUPPORTED", "archiveFormat": "—", "audioLayout": "—", "transcriptFormat": "—"}
    try:
        sources = discover(session, series, band, "all")
        files = {skill: {key: _cached_bytes(session, url, cache_dir) for key, url in links.items() if key.endswith("_pdf")}
                 for skill, links in sources.components.items()}
        listening = sources.components["listening"]
        transcript = files["listening"]["transcript_pdf"]
        from tocfl_import.pdf import QUESTION
        import fitz
        text = "\n".join(page.get_text() for page in fitz.open(stream=transcript, filetype="pdf"))
        numbers = [int(match[1]) for match in QUESTION.finditer(text)]
        repeated = len(numbers) != len(set(numbers))
        result["transcriptFormat"] = ("shared + " if band == "C" else "numbered + ") + ("repeated lists" if repeated else "single list")
        archive = None
        archive_url = listening.get("audio_archive")
        if archive_url:
            body = _cached_bytes(session, archive_url, cache_dir, archive=True)
            result.update(_archive_inventory(body))
            result["archiveFormat"] = result.pop("format")
            try:
                archive = inspect_audio_archive(body, archive_url, 25 if band == "Novice" else 50, transcript_pdf=transcript)
            except Exception as error:
                result["archiveNote"] = str(error)
                if not listening.get("online_audio"):
                    raise
        if listening.get("online_audio"):
            tracks = discover_audio_tracks(session, listening["online_audio"])
            result["audioLayout"] = "official labeled online tracks"
        else:
            if archive is None:
                raise ValueError("No mappable official audio source")
            tracks = archive.tracks
            result["audioLayout"] = "sequential + transcript groups" if result.get("sequential") else "explicit question/group numbers"
        with tempfile.TemporaryDirectory(prefix="tocfl-audit-") as temporary:
            stage = Path(temporary)
            assets = stage / "assets"
            assets.mkdir()
            test_id = f"audit-{band.lower()}-{series}"
            package, supplement, downloads = build_package(files, tracks, test_id, band, series, {**sources.components, "page_url": OFFICIAL_PAGE}, assets)
            if not listening.get("online_audio"):
                if {path.rsplit("/", 1)[-1] for path in downloads} != set(archive.files):
                    raise ValueError("Normalized archive MP3s differ from the playback plan")
                for path in downloads:
                    target = assets / path.split(f"/tests/{test_id}/", 1)[1]
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(archive.files[path.rsplit("/", 1)[-1]])
            elif verify_online:
                with ThreadPoolExecutor(max_workers=6) as pool:
                    futures = [pool.submit(_download_online, item, test_id, assets) for item in downloads.items()]
                    for future in as_completed(futures):
                        future.result()
            validate_package(package, supplement, assets, check_audio_files=not listening.get("online_audio") or verify_online)
            package_path = stage / "package.json"
            package_path.write_text(json.dumps(package, ensure_ascii=False))
            subprocess.run([_node_binary(), "scripts/validate_tocfl_audit.mjs", str(package_path), str(assets),
                            "full" if not listening.get("online_audio") or verify_online else "mapped"],
                           cwd=ROOT, check=True, capture_output=True, text=True)
            result.update(status="PASS", reason="", listening=len(package["components"]["listening"]["questions"]),
                          reading=len(package["components"]["reading"]["questions"]), answers=package["exam"]["totalQuestions"],
                          audioTracks=len(downloads), audioGroups=len(package["components"]["listening"]["audio"]["groups"]),
                          transcriptGroups=len(supplement.get("sharedGroups", [])), images=len(list(assets.rglob("*.png"))),
                          audioBytesVerified=not listening.get("online_audio") or verify_online)
    except subprocess.CalledProcessError as error:
        result["reason"] = f"Website loader: {(error.stderr or error.stdout or str(error)).strip()[-800:]}"
    except Exception as error:
        result["reason"] = f"{type(error).__name__}: {error}"
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache-dir", type=Path, help="Reuse manually cached official PDF/archive bytes; omit for a fresh scan")
    parser.add_argument("--skip-online-bytes", action="store_true", help="Check online track labels and mapping without downloading MP3 bytes")
    parser.add_argument("--json", type=Path, help="Also write the complete machine-readable matrix here")
    args = parser.parse_args()
    session = requests.Session()
    session.headers["User-Agent"] = "TOCFL-learning-web compatibility audit/1.0"
    try:
        combinations = available_tests(session)
    except Exception as error:
        print(f"Cannot enumerate official tests: {error}", file=sys.stderr)
        return 1
    results = []
    for band, series in combinations:
        print(f"Inspecting {band} Series {series}...", flush=True)
        results.append(audit_one(session, band, series, args.cache_dir, not args.skip_online_bytes))
    print("\nBand | Series | Archive | Paths | Audio layout | Transcript | Status | Reason")
    print("--- | ---: | --- | --- | --- | --- | --- | ---")
    for item in results:
        print(f"{item['band']} | {item['series']} | {item['archiveFormat']} | {item.get('pathLayout', '—')} | {item['audioLayout']} | {item['transcriptFormat']} | {item['status']} | {item.get('reason') or '—'}")
        if item.get("archiveNote"):
            print(f"  Archive note: {item['archiveNote']}")
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps({"source": OFFICIAL_PAGE, "results": results}, ensure_ascii=False, indent=2) + "\n")
    passed = sum(item["status"] == "PASS" for item in results)
    print(f"\n{passed}/{len(results)} PASS; {len(results) - passed} UNSUPPORTED. No test was published.")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())

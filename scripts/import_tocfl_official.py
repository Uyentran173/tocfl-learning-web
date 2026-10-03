#!/usr/bin/env python3
"""Discover, import and validate one official TOCFL paper mock test."""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import requests

sys.dont_write_bytecode = True

from tocfl_import.build import build_package, existing_source_id, matching_legacy_test, next_test_id
from tocfl_import.archive_audio import download_audio_archive, inspect_audio_archive
from tocfl_import.discovery import ImportErrorWithContext, discover, discover_audio_tracks, fetch
from tocfl_import.validate import validate_package

ROOT = Path(__file__).resolve().parents[1]


def _report(args, package: dict, downloads: dict, assets: Path, build: str, archive_verified: bool = False) -> None:
    components = package["components"]
    audio = components["listening"]["audio"]
    print(f"\nTOCFL Series {args.series} Band {args.band} — {package['exam']['id']}")
    for skill in ("listening", "reading"):
        item = components[skill]
        print(f"{skill.title()}: {len(item['questions'])}/{item['totalQuestions']}")
    print("Traditional: OK | Simplified: OK")
    answered = sum(bool(q.get("correctAnswer")) for item in components.values() for q in item["questions"])
    print(f"Answers: {answered}/{package['exam']['totalQuestions']}")
    print(f"Audio tracks: {len(downloads)} | Audio groups: {len(audio['groups'])}")
    print(f"Images: {len(list(assets.rglob('*.png')))}")
    if build == "PASS":
        print("Missing assets: 0 | Unresolved mappings: 0")
    elif archive_verified:
        print("Missing image assets: 0 | Unresolved mappings: 0 | Archive MP3s: verified in dry run")
    else:
        print("Missing image assets: 0 | Unresolved mappings: 0 | Online MP3 bytes: not downloaded in dry run")
    for warning in audio.get("sourceLabelWarnings", []):
        print(f"Official audio label warning: {warning}")
    for warning in package["exam"].get("sourceWarnings", []):
        print(f"Official PDF warning ({warning.get('script', warning.get('skill', 'source'))}): {warning['message']}")
    print(f"Build: {build}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Import an official TOCFL mock test")
    parser.add_argument("--series", type=int, required=True)
    parser.add_argument("--band", choices=["Novice", "A", "B", "C"], required=True)
    parser.add_argument("--type", choices=["listening", "reading", "all"], default="all")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--update", action="store_true", help="Re-import an already imported official Series into its stable test ID")
    args = parser.parse_args()
    session = requests.Session()
    session.headers["User-Agent"] = "TOCFL-learning-web official mock-test importer/1.0"
    try:
        data_dir = ROOT / "data/structured-tests"
        previous_id = existing_source_id(data_dir, args.band, args.series)
        if previous_id and not (data_dir / f"{previous_id}.json").is_file() and not args.update:
            raise ImportErrorWithContext(f"Official source maps to {previous_id}, but its structured test is missing. Use --update to restore that same ID.")
        if previous_id and not args.update and not args.dry_run:
            print(f"Official TOCFL Series {args.series} Band {args.band} already exists as {previous_id}; no files changed. Use --update to re-import.")
            return 0
        test_id = previous_id or next_test_id(data_dir, args.band)
        sources = discover(session, args.series, args.band, args.type)
        print(f"Official TOCFL series {args.series}, Band {args.band}, component {args.type}")
        print(f"Logical test ID: {test_id}" + (" (existing source mapping)" if previous_id else " (candidate; legacy matching follows)"))
        print(f"Source page: {sources.page_url}")
        for skill, links in sources.components.items():
            print(f"{skill}:")
            for key, url in links.items():
                print(f"  {key}: {url}")
        archive = None
        archive_url = sources.components.get("listening", {}).get("audio_archive")
        if "listening" not in sources.components:
            tracks = []
        elif sources.components["listening"].get("online_audio"):
            tracks = discover_audio_tracks(session, sources.components["listening"]["online_audio"])
        elif archive_url:
            archive_body = download_audio_archive(session, archive_url)
            archive_hash = hashlib.sha256(archive_body).hexdigest()
            archive = inspect_audio_archive(archive_body, archive_url, 25 if args.band == "Novice" else 50)
            tracks = archive.tracks
            print(f"Official audio archive: {archive.format.upper()} content, {len(tracks)} verified MP3 tracks")
        else:
            raise ImportErrorWithContext("Listening has no usable official audio source")
        if tracks:
            print(f"Official individual audio tracks ({len(tracks)}):")
            for track in tracks:
                print(f"  {track['label'] or '(unlabeled)'}: {track.get('localName') or track['url']}")
        if args.type != "all" and args.dry_run:
            print("Source discovery complete; repository unchanged. Full validation requires --type all.")
            return 0
        if args.type != "all":
            raise ImportErrorWithContext("The current website schema publishes one complete Listening + Reading logical test. Use --type all to publish; individual components are available for --dry-run inspection.")
        with tempfile.TemporaryDirectory(prefix="tocfl-import-") as temporary:
            stage = Path(temporary)
            assets = stage / "assets"
            assets.mkdir()
            files = {}
            hashes = {}
            if archive:
                hashes[archive_url] = archive_hash
            for skill, links in sources.components.items():
                files[skill] = {}
                for key, url in links.items():
                    if key.endswith("_pdf"):
                        body = fetch(session, url).content
                        if not body.startswith(b"%PDF-"):
                            raise ImportErrorWithContext(f"Official file is not a PDF: {url}")
                        files[skill][key] = body
                        hashes[url] = hashlib.sha256(body).hexdigest()
            if not previous_id:
                legacy_id = matching_legacy_test(data_dir, args.band, files, args.series)
                if legacy_id:
                    print(f"Official paper matches all answers and score entries of legacy test {legacy_id}.")
                    if not args.update and not args.dry_run:
                        print(f"No files changed. Use --update to re-import this source into {legacy_id}.")
                        return 0
                    previous_id = legacy_id
                    test_id = legacy_id
            data_path = data_dir / f"{test_id}.json"
            asset_path = ROOT / "public/tests" / test_id
            supplement_path = ROOT / "data/test-supplements" / test_id
            manifest_path = ROOT / "data/import-manifests" / f"{test_id}.json"
            if not previous_id and (data_path.exists() or asset_path.exists() or supplement_path.exists() or manifest_path.exists()):
                raise ImportErrorWithContext(f"Refusing to overwrite existing test {test_id}")
            existing_title = json.loads(data_path.read_text())["exam"]["title"] if previous_id and data_path.is_file() else None
            package, supplement, downloads = build_package(files, tracks, test_id, args.band, args.series, {**sources.components, "page_url": sources.page_url}, assets, title=existing_title)
            if args.dry_run:
                validate_package(package, supplement, assets, check_audio_files=False)
                _report(args, package, downloads, assets, build="NOT RUN (dry run)", archive_verified=bool(archive))
                print("Dry run complete; repository unchanged. Archive MP3s were inspected." if archive else "Dry run complete; repository unchanged. Online MP3 files were discovered but not downloaded.")
                return 0
            def download_track(item: tuple[str, str]) -> str:
                url, remote = item
                target = assets / url.split(f"/tests/{test_id}/", 1)[1]
                target.parent.mkdir(parents=True, exist_ok=True)
                with requests.Session() as audio_session:
                    response = fetch(audio_session, remote)
                body = response.content
                if len(body) < 100 or not (body.startswith(b"ID3") or body[0] == 0xff):
                    raise ImportErrorWithContext(f"Official audio is missing or invalid: {remote}")
                target.write_bytes(body)
                hashes[remote] = hashlib.sha256(body).hexdigest()
                return url
            if archive:
                if set(downloads.values()) != {archive_url} or {url.rsplit("/", 1)[-1] for url in downloads} != set(archive.files):
                    raise ImportErrorWithContext("Archive audio tracks do not match the generated playback plan")
                for url in downloads:
                    target = assets / url.split(f"/tests/{test_id}/", 1)[1]
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(archive.files[url.rsplit("/", 1)[-1]])
            else:
                with ThreadPoolExecutor(max_workers=6) as pool:
                    futures = [pool.submit(download_track, item) for item in downloads.items()]
                    for future in as_completed(futures):
                        future.result()
            validate_package(package, supplement, assets)
            manifest = {"schemaVersion": "1.0", "testId": test_id, "sourceIdentity": f"official-tocfl:{args.band.lower()}:{args.series}", "sourcePage": sources.page_url, "series": args.series, "band": args.band, "importedAt": datetime.now(timezone.utc).isoformat(), "components": sources.components, "traditionalPdfUrls": {skill: item["traditional_pdf"] for skill, item in sources.components.items()}, "simplifiedPdfUrls": {skill: item["simplified_pdf"] for skill, item in sources.components.items()}, "answerKeyUrls": {skill: item["answer_pdf"] for skill, item in sources.components.items()}, "transcriptUrl": sources.components["listening"]["transcript_pdf"], "scoreTableUrls": {skill: item["score_pdf"] for skill, item in sources.components.items()}, "onlineAudioPage": sources.components["listening"].get("online_audio"), "audioSourceUrls": [archive_url] if archive else list(downloads.values()), "sha256ByUrl": hashes, "sourceWarnings": package["exam"].get("sourceWarnings", [])}
            if archive:
                manifest["audioArchive"] = {"url": archive_url, "format": archive.format, "sha256": archive_hash, "members": archive.members}
            (stage / "test.json").write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n")
            (stage / "transcripts.json").write_text(json.dumps(supplement, ensure_ascii=False, indent=2) + "\n")
            (stage / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
            backups = stage / "backups"
            destinations = ((data_path, "test.json"), (asset_path, "assets"), (supplement_path, "supplement"), (manifest_path, "manifest.json"))
            installed: list[Path] = []
            try:
                if previous_id:
                    backups.mkdir()
                    for original, name in destinations:
                        if original.exists():
                            shutil.move(str(original), backups / name)
                for original, _ in destinations:
                    original.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(assets), asset_path)
                installed.append(asset_path)
                supplement_path.mkdir()
                installed.append(supplement_path)
                shutil.move(str(stage / "transcripts.json"), supplement_path / "listening-transcripts.json")
                shutil.move(str(stage / "test.json"), data_path)
                installed.append(data_path)
                shutil.move(str(stage / "manifest.json"), manifest_path)
                installed.append(manifest_path)
                for command in (["pnpm", "lint"], ["pnpm", "typecheck"], ["pnpm", "test:import"], ["pnpm", "test:logical"], ["pnpm", "test:timing"], ["pnpm", "test:transcripts"], ["pnpm", "build"]):
                    print(f"Running {' '.join(command)}", flush=True)
                    subprocess.run(command, cwd=ROOT, check=True)
            except Exception:
                for path in reversed(installed):
                    if path.is_dir():
                        shutil.rmtree(path)
                    else:
                        path.unlink(missing_ok=True)
                if previous_id:
                    for original, name in destinations:
                        if (backups / name).exists():
                            shutil.move(str(backups / name), original)
                raise
        _report(args, package, downloads, asset_path, build="PASS")
        print(f"{'Updated' if previous_id else 'Imported'} and validated {test_id}.")
        return 0
    except (ImportErrorWithContext, requests.RequestException, subprocess.CalledProcessError, OSError) as error:
        print(f"Import failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

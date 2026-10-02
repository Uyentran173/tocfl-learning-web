#!/usr/bin/env python3
"""Discover, import and validate one official TOCFL paper mock test."""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import requests

sys.dont_write_bytecode = True

from tocfl_import.build import build_package, ensure_new_source, next_test_id
from tocfl_import.discovery import ImportErrorWithContext, discover, discover_audio_tracks, fetch
from tocfl_import.validate import validate_package

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser(description="Import an official TOCFL mock test")
    parser.add_argument("--series", type=int, required=True)
    parser.add_argument("--band", choices=["Novice", "A", "B", "C"], required=True)
    parser.add_argument("--type", choices=["listening", "reading", "all"], default="all")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    session = requests.Session()
    session.headers["User-Agent"] = "TOCFL-learning-web official mock-test importer/1.0"
    try:
        sources = discover(session, args.series, args.band, args.type)
        test_id = next_test_id(ROOT / "data/structured-tests", args.band)
        print(f"Official TOCFL series {args.series}, Band {args.band}, component {args.type}")
        print(f"Next unused logical test ID: {test_id}")
        print(f"Source page: {sources.page_url}")
        for skill, links in sources.components.items():
            print(f"{skill}:")
            for key, url in links.items():
                print(f"  {key}: {url}")
        tracks = discover_audio_tracks(session, sources.components["listening"]["online_audio"]) if "listening" in sources.components else []
        if tracks:
            print(f"Official individual audio tracks ({len(tracks)}):")
            for track in tracks:
                print(f"  {track['label'] or '(unlabeled)'}: {track['url']}")
        if args.dry_run:
            print("Dry run complete; repository unchanged.")
            return 0
        if args.type != "all":
            raise ImportErrorWithContext("The current website schema publishes one complete Listening + Reading logical test. Use --type all to publish; individual components are available for --dry-run inspection.")
        ensure_new_source(ROOT / "data/structured-tests", args.band, args.series)
        data_path = ROOT / "data/structured-tests" / f"{test_id}.json"
        asset_path = ROOT / "public/tests" / test_id
        supplement_path = ROOT / "data/test-supplements" / test_id
        if data_path.exists() or asset_path.exists() or supplement_path.exists():
            raise ImportErrorWithContext(f"Refusing to overwrite existing test {test_id}")
        with tempfile.TemporaryDirectory(prefix="tocfl-import-") as temporary:
            stage = Path(temporary)
            assets = stage / "assets"
            assets.mkdir()
            files = {}
            for skill, links in sources.components.items():
                files[skill] = {}
                for key, url in links.items():
                    if key.endswith("_pdf"):
                        body = fetch(session, url).content
                        if not body.startswith(b"%PDF-"):
                            raise ImportErrorWithContext(f"Official file is not a PDF: {url}")
                        files[skill][key] = body
            package, supplement, downloads = build_package(files, tracks, test_id, args.band, args.series, {**sources.components, "page_url": sources.page_url}, assets)
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
                return url
            with ThreadPoolExecutor(max_workers=6) as pool:
                futures = [pool.submit(download_track, item) for item in downloads.items()]
                for future in as_completed(futures):
                    future.result()
            validate_package(package, supplement, assets)
            (stage / "test.json").write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n")
            (stage / "transcripts.json").write_text(json.dumps(supplement, ensure_ascii=False, indent=2) + "\n")
            asset_path.parent.mkdir(parents=True, exist_ok=True)
            supplement_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(assets), asset_path)
            supplement_path.mkdir()
            shutil.move(str(stage / "transcripts.json"), supplement_path / "listening-transcripts.json")
            shutil.move(str(stage / "test.json"), data_path)
            try:
                for command in (["pnpm", "lint"], ["pnpm", "typecheck"], ["pnpm", "test:import"], ["pnpm", "test:logical"], ["pnpm", "test:timing"], ["pnpm", "test:transcripts"], ["pnpm", "build"]):
                    print(f"Running {' '.join(command)}", flush=True)
                    subprocess.run(command, cwd=ROOT, check=True)
            except (subprocess.CalledProcessError, OSError):
                data_path.unlink(missing_ok=True)
                shutil.rmtree(asset_path, ignore_errors=True)
                shutil.rmtree(supplement_path, ignore_errors=True)
                raise
        print(f"Imported and validated {test_id}. No existing test was changed.")
        return 0
    except (ImportErrorWithContext, requests.RequestException, subprocess.CalledProcessError, OSError) as error:
        print(f"Import failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

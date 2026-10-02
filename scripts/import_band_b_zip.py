"""Validate and import the supplied Band B package as one isolated logical test."""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import tempfile
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
TEST_ID = "band-b-test-01"
SOURCE_ID = "tocfl-band-b-test-1"
SCRIPTS = ("traditional", "simplified")


def fail(message: str) -> None:
    raise ValueError(message)


def source_asset(path: str, names: set[str]) -> str:
    pure = PurePosixPath(path)
    if not path or pure.is_absolute() or ".." in pure.parts or path not in names:
        fail(f"Missing or unsafe asset: {path}")
    return path


def validate(archive: ZipFile) -> tuple[dict, dict, set[str]]:
    names = set(archive.namelist())
    for required in ("exam.json", "manifest.json", "listening/transcripts.json"):
        if required not in names:
            fail(f"Missing package file: {required}")
    manifest = json.loads(archive.read("manifest.json"))
    indexed = {entry["path"] for entry in manifest["files"]}
    if indexed != names - {"manifest.json"}:
        fail("Manifest file list does not match the ZIP contents.")
    for entry in manifest["files"]:
        content = archive.read(entry["path"])
        if len(content) != entry["size"] or hashlib.sha256(content).hexdigest() != entry["sha256"]:
            fail(f"Manifest checksum mismatch: {entry['path']}")

    package = json.loads(archive.read("exam.json"))
    exam = package["exam"]
    if package.get("schemaVersion") != "2.0" or exam.get("id") != SOURCE_ID or exam.get("level") != "Band B":
        fail("This ZIP is not the expected TOCFL Band B Test 01 package.")
    if exam.get("variants") != list(SCRIPTS) or exam.get("componentOrder") != ["listening", "reading"] or exam.get("totalQuestions") != 100:
        fail("Band B test metadata or script variants do not match the expected structure.")
    components = package["components"]
    seen_ids: set[str] = set()
    assets: set[str] = set()
    boundaries = {"listening": [(1, 30), (31, 50)], "reading": [(1, 15), (16, 50)]}
    for skill in ("listening", "reading"):
        component = components[skill]
        questions = component["questions"]
        if component.get("id") != skill or component.get("totalQuestions") != 50 or len(questions) != 50:
            fail(f"Band B {skill} must contain exactly 50 questions.")
        parts = component.get("sections", [])
        if [(part["startQuestion"], part["endQuestion"]) for part in parts] != boundaries[skill]:
            fail(f"Band B {skill} Part boundaries are incorrect.")
        scores = component.get("scoring", {})
        if scores.get("maxScore") != 80 or {int(key) for key in scores.get("scoreByCorrectCount", {})} != set(range(1, 51)) or any(not isinstance(value, (int, float)) for value in scores["scoreByCorrectCount"].values()):
            fail(f"Band B {skill} score conversion table is incomplete.")
        for number, question in enumerate(questions, 1):
            expected_part = parts[0]["id"] if number <= boundaries[skill][0][1] else parts[1]["id"]
            if question.get("id") != f"{skill}-q{number:02d}" or question["id"] in seen_ids or question.get("number") != number or question.get("sectionId") != expected_part:
                fail(f"Wrong {skill} question ID, order, or Part at Q{number}.")
            seen_ids.add(question["id"])
            expected_type = "listening_multiple_choice" if skill == "listening" else "gap_filling" if number <= 15 else "reading_comprehension"
            if question.get("type") != expected_type or question.get("choices") != ["A", "B", "C", "D"] or question.get("correctAnswer") not in question["choices"]:
                fail(f"Wrong type or answer key at {question['id']}.")
            for script in SCRIPTS:
                path = source_asset(question.get("assets", {}).get(script, ""), names)
                if f"/{script}/" not in f"/{path}" or not path.startswith(f"{skill}/assets/"):
                    fail(f"Wrong {script} asset for {question['id']}.")
                assets.add(path)
            if question["assets"]["traditional"] == question["assets"]["simplified"]:
                fail(f"Traditional and Simplified assets are mixed at {question['id']}.")
            if skill == "listening":
                audio = question.get("audio", {})
                track = audio.get("path") if audio.get("mode") == "self_contained" else audio.get("questionTrack") if audio.get("mode") == "shared_group" else None
                assets.add(source_asset(track or "", names))
                review = audio.get("reviewSequence", [])
                if not review or review[-1] != track:
                    fail(f"Invalid review audio sequence at {question['id']}.")
                for path in review:
                    assets.add(source_asset(path, names))
            elif not question.get("stimulusGroupId"):
                fail(f"Missing Reading context mapping at {question['id']}.")

    reading_groups: dict[str, tuple[str, str]] = {}
    for question in components["reading"]["questions"]:
        group_id = question["stimulusGroupId"]
        pair = tuple(question["assets"][script] for script in SCRIPTS)
        if group_id in reading_groups and reading_groups[group_id] != pair:
            fail(f"Reading group {group_id} uses mismatched source images.")
        reading_groups[group_id] = pair

    audio = components["listening"]["audio"]
    plan = audio.get("examPlaybackPlan", [])
    groups = {group["id"]: group for group in audio.get("groups", [])}
    observed: list[str] = []
    observed_groups: set[str] = set()
    for step in plan:
        if step["type"] == "track":
            assets.add(source_asset(step["path"], names))
        elif step["type"] == "question":
            question_id = step["questionId"]
            question = next((item for item in components["listening"]["questions"] if item["id"] == question_id), None)
            if not question or question["audio"].get("mode") != "self_contained" or step["path"] != question["audio"].get("path"):
                fail(f"Playback plan mismatch at {question_id}.")
            assets.add(source_asset(step["path"], names))
            observed.append(question_id)
        elif step["type"] == "question_group":
            group = groups.get(step["id"])
            tracks = step.get("questionTracks", [])
            numbers = [int(track["questionId"].removeprefix("listening-q")) for track in tracks]
            if not group or step["id"] in observed_groups or len(tracks) < 2 or group["questions"] != numbers or group["sharedAudio"] != step["sharedAudio"]:
                fail(f"Playback group {step['id']} does not match its questions.")
            observed_groups.add(step["id"])
            assets.add(source_asset(step["sharedAudio"], names))
            for track in tracks:
                question_id = track["questionId"]
                question = next((item for item in components["listening"]["questions"] if item["id"] == question_id), None)
                if not question or question["audio"].get("mode") != "shared_group" or question["audio"].get("groupId") != step["id"] or question["audio"].get("questionTrack") != track["path"] or group["questionTracks"].get(str(question["number"])) != track["path"]:
                    fail(f"Playback track mismatch at {question_id}.")
                if question["audio"]["reviewSequence"] != [step["sharedAudio"], track["path"]]:
                    fail(f"Review track mismatch at {question_id}.")
                assets.add(source_asset(track["path"], names))
                observed.append(question_id)
        else:
            fail(f"Unknown playback step: {step.get('type')}.")
    if observed != [f"listening-q{number:02d}" for number in range(1, 51)] or observed_groups != set(groups):
        fail("Playback plan skips, repeats, or reorders Listening questions/groups.")
    for key in ("part1Preamble", "part1Intro", "part2Intro", "endingTrack"):
        path = source_asset(audio.get(key, ""), names)
        if path not in [step.get("path") for step in plan if step["type"] == "track"]:
            fail(f"Playback plan omits {key}.")
        assets.add(path)

    transcript_path = source_asset(components["listening"].get("transcriptDataPath", ""), names)
    transcript = json.loads(archive.read(transcript_path))
    if transcript.get("examId") != SOURCE_ID or transcript.get("componentId") != "listening":
        fail("Transcript belongs to another test.")
    transcript_groups = {group["id"]: group for group in transcript.get("groups", [])}
    if len(transcript_groups) != len(transcript.get("groups", [])):
        fail("Duplicate transcript group IDs.")
    transcript_numbers: list[int] = []
    for question in components["listening"]["questions"]:
        group = transcript_groups.get(question.get("transcriptGroupId"))
        if not group or question["number"] not in group.get("questions", []) or any(not group.get(script, "").strip() for script in SCRIPTS):
            fail(f"Missing transcript mapping for {question['id']}.")
    for group in transcript.get("groups", []):
        transcript_numbers.extend(group["questions"])
    if sorted(transcript_numbers) != list(range(1, 51)):
        fail("Transcript does not cover each Listening question exactly once.")
    return package, transcript, assets


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", type=Path)
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args()
    with ZipFile(args.archive) as archive:
        package, transcript, assets = validate(archive)
        print(f"Validated Band B: 50 Listening, 50 Reading, {len(assets)} assets, full playback plan and transcript coverage.")
        if args.validate_only:
            return
        data_path = ROOT / "data" / "structured-tests" / f"{TEST_ID}.json"
        asset_dir = ROOT / "public" / "tests" / TEST_ID
        transcript_dir = ROOT / "data" / "test-supplements" / TEST_ID
        if data_path.exists() or asset_dir.exists() or transcript_dir.exists():
            fail(f"{TEST_ID} already exists; import will not overwrite any test.")

        def public(path: str) -> str:
            return f"/tests/{TEST_ID}/{path}"

        with tempfile.TemporaryDirectory(dir=ROOT / "public" / "tests") as staging_name:
            staging = Path(staging_name)
            for path in sorted(assets):
                target = staging / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(archive.read(path))
            listening = package["components"]["listening"]
            audio = listening["audio"]
            for key in ("part1Preamble", "part1Intro", "part2Intro", "endingTrack"):
                audio[key] = public(audio[key])
            for group in audio["groups"]:
                group["sharedAudio"] = public(group["sharedAudio"])
                group["questionTracks"] = {number: public(path) for number, path in group["questionTracks"].items()}
            for step in audio["examPlaybackPlan"]:
                if step["type"] in ("track", "question"):
                    step["path"] = public(step["path"])
                else:
                    step["sharedAudio"] = public(step["sharedAudio"])
                    for track in step["questionTracks"]:
                        track["path"] = public(track["path"])
            for skill in ("listening", "reading"):
                for question in package["components"][skill]["questions"]:
                    question["assets"] = {script: public(question["assets"][script]) for script in SCRIPTS}
                    if skill == "listening":
                        q_audio = question["audio"]
                        if q_audio["mode"] == "self_contained":
                            q_audio["path"] = public(q_audio["path"])
                        else:
                            q_audio["questionTrack"] = public(q_audio["questionTrack"])
                        q_audio["reviewSequence"] = [public(path) for path in q_audio["reviewSequence"]]
            package["exam"]["id"] = TEST_ID
            package["exam"]["title"] = "TOCFL Band B — Đề 01"
            listening["transcriptDataPath"] = f"data/test-supplements/{TEST_ID}/listening-transcripts.json"
            transcript["examId"] = TEST_ID
            shutil.move(str(staging), asset_dir)
        transcript_dir.mkdir(parents=True)
        (transcript_dir / "listening-transcripts.json").write_text(json.dumps(transcript, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        data_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Imported {TEST_ID} without modifying existing tests.")


if __name__ == "__main__":
    main()

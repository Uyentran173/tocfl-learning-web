"""Validate and import the supplied Band C ZIP as one logical test.

The package contains printed Chinese text in images rather than structured text.
This importer records viewports into those original images; it never alters them
or guesses a transcription.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import tempfile
from collections import OrderedDict
from io import BytesIO
from pathlib import Path, PurePosixPath
from zipfile import ZipFile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TEST_ID = "band-c-test-01"
SOURCE_ID = "tocfl-band-c-test-1"
SCRIPTS = ("traditional", "simplified")


def fail(message: str) -> None:
    raise ValueError(message)


def asset(path: str, names: set[str]) -> str:
    pure = PurePosixPath(path)
    if not path or pure.is_absolute() or ".." in pure.parts or path not in names:
        fail(f"Missing or unsafe asset: {path}")
    return path


def image(archive: ZipFile, path: str) -> Image.Image:
    try:
        return Image.open(BytesIO(archive.read(path))).convert("L")
    except Exception as error:
        fail(f"Cannot read image {path}: {error}")


def ink_bands(source: Image.Image, left: int, right: int, top: int = 0, bottom: int | None = None) -> list[tuple[int, int]]:
    """Find horizontal printed lines using pixels only, without OCR."""
    bottom = source.height if bottom is None else bottom
    pixels = source.load()
    bands: list[tuple[int, int]] = []
    start: int | None = None
    for y in range(top, bottom):
        count = sum(pixels[x, y] < 190 for x in range(left, right))
        if count > 3 and start is None:
            start = y
        elif count <= 3 and start is not None:
            if y - start >= 3:
                bands.append((start, y - 1))
            start = None
    if start is not None and bottom - start >= 3:
        bands.append((start, bottom - 1))
    return bands


def crop(source: Image.Image, x: int, y: int, width: int, height: int, max_width: int) -> dict:
    if width <= 0 or height <= 0 or x < 0 or y < 0 or x + width > source.width or y + height > source.height:
        fail(f"Invalid image viewport: {(x, y, width, height)} in {source.size}")
    return {"x": x, "y": y, "width": width, "height": height,
            "sourceWidth": source.width, "sourceHeight": source.height, "maxWidth": max_width}


def choice_viewports(source: Image.Image, bands: list[tuple[int, int]], left: int, right: int, label: str) -> list[dict]:
    if len(bands) < 4:
        fail(f"Cannot identify four answer choices in {label}; found {len(bands)} printed lines.")
    options = bands[-4:]
    if not all(35 <= options[i + 1][0] - options[i][0] <= 60 for i in range(3)):
        fail(f"Answer-choice rows are not aligned in {label}: {options}")
    return [crop(source, left, max(0, start - 5), right - left,
                 min(source.height, end + 7) - max(0, start - 5),
                 min(970, right - left)) for start, end in options]


def listening_visual(archive: ZipFile, path: str, label: str) -> dict:
    source = image(archive, path)
    bands = ink_bands(source, 0, source.width)
    candidates = [bands[i:i + 4] for i in range(len(bands) - 3)
                  if all(35 <= bands[i + j + 1][0] - bands[i + j][0] <= 60 for j in range(3))]
    if not candidates:
        fail(f"Cannot locate Listening options in {label}.")
    # The printed number may also form a four-line run; the last run is A–D.
    options = candidates[-1]
    return {"choices": choice_viewports(source, options, 0, source.width, label)}


def reading_visuals(archive: ZipFile, questions: list[dict], script: str) -> dict[str, dict]:
    groups: OrderedDict[str, list[dict]] = OrderedDict()
    for question in questions:
        groups.setdefault(question["stimulusGroupId"], []).append(question)
    visuals: dict[str, dict] = {}
    for group_id, members in groups.items():
        path = members[0]["assets"][script]
        source = image(archive, path)
        bands = ink_bands(source, 0, source.width)
        gap_starts = [bands[i + 1][0] for i in range(len(bands) - 1)
                      if bands[i + 1][0] - bands[i][1] >= 55]
        gap_filling = members[0]["number"] <= 15
        rows_needed = 3 if gap_filling else len(members)
        if len(gap_starts) < rows_needed:
            fail(f"Cannot separate the Reading questions in {group_id} ({script}).")
        starts = gap_starts[-rows_needed:]
        context_end = starts[0] - 18
        context = crop(source, 0, 72, source.width, context_end - 72, 1020)
        for offset, question in enumerate(members):
            label = f"Reading Q{question['number']} ({script})"
            if gap_filling:
                row, column = divmod(offset, 2)
                left = source.width // 2 if column else 0
                right = source.width if column else source.width // 2
                top = starts[row]
                bottom = starts[row + 1] - 15 if row < 2 else source.height
                question_bands = ink_bands(source, left, right, top, bottom)
                choices = choice_viewports(source, question_bands, left, right, label)
                visuals[question["id"]] = {"context": context, "choices": choices}
                continue
            top = starts[offset]
            bottom = starts[offset + 1] - 18 if offset + 1 < len(starts) else source.height
            question_bands = ink_bands(source, 0, source.width, top, bottom)
            choices = choice_viewports(source, question_bands, 0, source.width, label)
            prompt_end = choices[0]["y"] - 4
            if prompt_end <= top:
                fail(f"Cannot separate prompt from choices at {label}.")
            prompt = crop(source, 0, top, source.width, prompt_end - top, 1020)
            visuals[question["id"]] = {"context": context, "prompt": prompt, "choices": choices}
    return visuals


def validate(archive: ZipFile) -> tuple[dict, dict, set[str]]:
    names = set(archive.namelist())
    for required in ("exam.json", "manifest.json", "listening/transcripts.json", "listening/audio/audio-map.json"):
        if required not in names:
            fail(f"Missing package file: {required}")
    manifest = json.loads(archive.read("manifest.json"))
    entries = manifest.get("files", [])
    if len(entries) != len(names) - 1 or {entry["path"] for entry in entries} != names - {"manifest.json"}:
        fail("Manifest file list does not match the ZIP contents.")
    for entry in entries:
        content = archive.read(entry["path"])
        if len(content) != entry["size"] or hashlib.sha256(content).hexdigest() != entry["sha256"]:
            fail(f"Manifest checksum mismatch: {entry['path']}")

    package = json.loads(archive.read("exam.json"))
    exam = package.get("exam", {})
    if package.get("schemaVersion") != "2.0" or exam.get("id") != SOURCE_ID or exam.get("level") != "Band C":
        fail("This ZIP is not the expected TOCFL Band C Test 01 package.")
    if exam.get("variants") != list(SCRIPTS) or exam.get("componentOrder") != ["listening", "reading"] or exam.get("totalQuestions") != 100:
        fail("Band C metadata or script variants do not match the expected structure.")
    components = package["components"]
    boundaries = {"listening": [(1, 25), (26, 50)], "reading": [(1, 15), (16, 50)]}
    seen_ids: set[str] = set()
    assets: set[str] = set()
    for skill in ("listening", "reading"):
        component = components[skill]
        questions = component["questions"]
        if component.get("id") != skill or component.get("totalQuestions") != 50 or len(questions) != 50:
            fail(f"Band C {skill} must contain exactly 50 questions.")
        parts = component.get("sections", [])
        if [(part["startQuestion"], part["endQuestion"]) for part in parts] != boundaries[skill]:
            fail(f"Band C {skill} Part boundaries are incorrect.")
        scoring = component.get("scoring", {})
        table = scoring.get("scoreByCorrectCount", {})
        if scoring.get("maxScore") != 80 or {int(key) for key in table} != set(range(1, 51)) or any(not isinstance(value, (int, float)) or value < 0 or value > 80 for value in table.values()):
            fail(f"Band C {skill} score table does not cover exactly 1–50 correct answers.")
        for number, question in enumerate(questions, 1):
            expected_part = parts[0]["id"] if number <= boundaries[skill][0][1] else parts[1]["id"]
            if question.get("id") != f"{skill}-q{number:02d}" or question["id"] in seen_ids or question.get("number") != number or question.get("sectionId") != expected_part:
                fail(f"Wrong {skill} question ID, order, or Part at Q{number}.")
            seen_ids.add(question["id"])
            expected_type = "listening_multiple_choice" if skill == "listening" else "gap_filling" if number <= 15 else "reading_comprehension"
            if question.get("type") != expected_type or question.get("choices") != ["A", "B", "C", "D"] or question.get("correctAnswer") not in question["choices"]:
                fail(f"Wrong type or answer key at {question['id']}.")
            for script in SCRIPTS:
                path = asset(question.get("assets", {}).get(script, ""), names)
                if not path.startswith(f"{skill}/assets/{script}/"):
                    fail(f"Wrong {script} asset for {question['id']}.")
                assets.add(path)
            if question["assets"]["traditional"] == question["assets"]["simplified"]:
                fail(f"Traditional and Simplified assets are mixed at {question['id']}.")
            if skill == "listening":
                audio = question.get("audio", {})
                if audio.get("mode") != "shared_group":
                    fail(f"Missing grouped audio at {question['id']}.")
                track = asset(audio.get("questionTrack", ""), names)
                review = audio.get("reviewSequence", [])
                if len(review) != 2 or review[1] != track:
                    fail(f"Incorrect review audio sequence at {question['id']}.")
                assets.update(asset(path, names) for path in review)
            elif not question.get("stimulusGroupId"):
                fail(f"Missing Reading context for {question['id']}.")

    reading_groups: dict[str, tuple[str, str]] = {}
    for question in components["reading"]["questions"]:
        group_id = question["stimulusGroupId"]
        pair = tuple(question["assets"][script] for script in SCRIPTS)
        if group_id in reading_groups and reading_groups[group_id] != pair:
            fail(f"Reading group {group_id} uses mismatched images.")
        reading_groups[group_id] = pair

    audio = components["listening"]["audio"]
    plan = audio.get("examPlaybackPlan", [])
    groups = {group["id"]: group for group in audio.get("groups", [])}
    if len(groups) != len(audio.get("groups", [])):
        fail("Duplicate audio group IDs.")
    observed: list[str] = []
    observed_groups: set[str] = set()
    for step in plan:
        if step["type"] == "track":
            assets.add(asset(step["path"], names))
        elif step["type"] == "question_group":
            group = groups.get(step["id"])
            tracks = step.get("questionTracks", [])
            numbers = [int(track["questionId"].removeprefix("listening-q")) for track in tracks]
            if not group or step["id"] in observed_groups or len(tracks) < 2 or group["questions"] != numbers or group["sharedAudio"] != step["sharedAudio"]:
                fail(f"Playback group {step['id']} does not match its questions.")
            observed_groups.add(step["id"])
            shared = asset(step["sharedAudio"], names)
            assets.add(shared)
            for track in tracks:
                question_id = track["questionId"]
                question = next((item for item in components["listening"]["questions"] if item["id"] == question_id), None)
                if not question or question["audio"].get("groupId") != step["id"] or question["audio"].get("questionTrack") != track["path"] or group["questionTracks"].get(str(question["number"])) != track["path"]:
                    fail(f"Playback track mismatch at {question_id}.")
                if question["audio"]["reviewSequence"] != [shared, track["path"]]:
                    fail(f"Review track mismatch at {question_id}.")
                assets.add(asset(track["path"], names))
                observed.append(question_id)
        else:
            fail(f"Unknown playback step: {step.get('type')}.")
    if observed != [f"listening-q{number:02d}" for number in range(1, 51)] or observed_groups != set(groups):
        fail("Playback plan skips, repeats, or reorders Listening questions/groups.")
    for key in ("examIntro", "part1Intro", "part2Intro", "endingTrack"):
        path = asset(audio.get(key, ""), names)
        if path not in [step.get("path") for step in plan if step["type"] == "track"]:
            fail(f"Playback plan omits {key}.")
        assets.add(path)
    audio_map = json.loads(archive.read("listening/audio/audio-map.json"))
    mapped_tracks = [entry["path"] for entry in audio_map.get("tracks", [])]
    all_tracks = {name for name in names if name.endswith(".mp3")}
    if len(mapped_tracks) != len(set(mapped_tracks)) or set(mapped_tracks) != all_tracks or not all_tracks.issubset(assets):
        fail("Audio map does not match every referenced MP3 track.")

    transcript_path = asset(components["listening"].get("transcriptDataPath", ""), names)
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
            fail(f"Missing transcript at {question['id']}.")
    for group in transcript.get("groups", []):
        transcript_numbers.extend(group["questions"])
    if sorted(transcript_numbers) != list(range(1, 51)):
        fail("Transcript does not cover each Listening question exactly once.")

    for question in components["listening"]["questions"]:
        question["visual"] = {script: listening_visual(archive, question["assets"][script], f"Listening Q{question['number']} ({script})") for script in SCRIPTS}
    for script in SCRIPTS:
        visuals = reading_visuals(archive, components["reading"]["questions"], script)
        for question in components["reading"]["questions"]:
            question.setdefault("visual", {})[script] = visuals[question["id"]]
    return package, transcript, assets


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", type=Path)
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args()
    with ZipFile(args.archive) as archive:
        package, transcript, assets = validate(archive)
        print(f"Validated Band C: 50 Listening, 50 Reading, {len(assets)} assets, 15 audio groups, both image variants, transcripts and score tables.")
        if args.validate_only:
            return
        data_path = ROOT / "data" / "structured-tests" / f"{TEST_ID}.json"
        asset_dir = ROOT / "public" / "tests" / TEST_ID
        supplement_dir = ROOT / "data" / "test-supplements" / TEST_ID
        if data_path.exists() or asset_dir.exists() or supplement_dir.exists():
            fail(f"{TEST_ID} already exists; import will not overwrite another test.")

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
            for key in ("examIntro", "part1Intro", "part2Intro", "endingTrack"):
                audio[key] = public(audio[key])
            for group in audio["groups"]:
                group["sharedAudio"] = public(group["sharedAudio"])
                group["questionTracks"] = {number: public(path) for number, path in group["questionTracks"].items()}
            for step in audio["examPlaybackPlan"]:
                if step["type"] == "track":
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
                        q_audio["questionTrack"] = public(q_audio["questionTrack"])
                        q_audio["reviewSequence"] = [public(path) for path in q_audio["reviewSequence"]]
            package["exam"]["id"] = TEST_ID
            package["exam"]["title"] = "TOCFL Band C — Đề 01"
            listening["transcriptDataPath"] = f"data/test-supplements/{TEST_ID}/listening-transcripts.json"
            transcript["examId"] = TEST_ID
            shutil.move(str(staging), asset_dir)
        supplement_dir.mkdir(parents=True)
        (supplement_dir / "listening-transcripts.json").write_text(json.dumps(transcript, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (supplement_dir / "audio-map.json").write_bytes(archive.read("listening/audio/audio-map.json"))
        data_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Imported {TEST_ID} without changing any existing test.")


if __name__ == "__main__":
    main()

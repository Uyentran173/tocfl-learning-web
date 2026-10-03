from __future__ import annotations

from pathlib import Path

from .discovery import ImportErrorWithContext


def validate_package(package: dict, supplement: dict, asset_root: Path, check_audio_files: bool = True) -> None:
    exam = package["exam"]
    components = package["components"]
    if exam["variants"] != ["traditional", "simplified"] or exam["componentOrder"] != ["listening", "reading"]:
        raise ImportErrorWithContext("Invalid exam variants or component order")
    all_ids = set()
    total = 0
    for skill in ("listening", "reading"):
        component = components[skill]
        questions = component["questions"]
        total += len(questions)
        if len(questions) != component["totalQuestions"] or not questions:
            raise ImportErrorWithContext(f"{skill} question count mismatch")
        if set(component["scoring"]["scoreByCorrectCount"]) != {str(n) for n in range(1, len(questions) + 1)}:
            raise ImportErrorWithContext(f"{skill} score table does not cover every correct count")
        for number, question in enumerate(questions, 1):
            if question["id"] in all_ids or question["number"] != number:
                raise ImportErrorWithContext(f"Duplicate or out-of-order {skill} Q{number}")
            all_ids.add(question["id"])
            if question["choices"] != list("ABCDEF")[:len(question["choices"])] or question["correctAnswer"] not in question["choices"]:
                raise ImportErrorWithContext(f"Invalid answer for {skill} Q{number}")
            for script in exam["variants"]:
                words = question["choiceText"][script]
                images = question.get("choiceImages", {}).get(script, [])
                if len(words) != len(question["choices"]) or (images and len(images) != len(words)):
                    raise ImportErrorWithContext(f"Answer-choice count mismatch in {skill} Q{number} ({script})")
                if skill == "reading" and any(not text.strip() and not (images and images[i]) and not question.get("visual", {}).get(script, {}).get("prompt") for i, text in enumerate(words)):
                    raise ImportErrorWithContext(f"Missing answer text/image in {skill} Q{number} ({script})")
                for url in images:
                    if f"/{script}/" not in url or not _asset_exists(url, asset_root, exam["id"]):
                        raise ImportErrorWithContext(f"Missing/wrong choice image for {skill} Q{number}: {url}")
            section = next((s for s in component["sections"] if s["id"] == question["sectionId"]), None)
            if not section or not section["startQuestion"] <= number <= section["endQuestion"]:
                raise ImportErrorWithContext(f"Wrong section for {skill} Q{number}")
            for script, url in question.get("assets", {}).items():
                if script not in exam["variants"] or f"/{script}/" not in url or not _asset_exists(url, asset_root, exam["id"]):
                    raise ImportErrorWithContext(f"Missing/wrong {script} image for {skill} Q{number}: {url}")
            if skill == "reading":
                group = question["stimulusGroupId"]
                context = component["displayContexts"].get(group)
                if not context or any(not context.get(script) and script not in question.get("assets", {}) and not question.get("questionText", {}).get(script) for script in exam["variants"]):
                    raise ImportErrorWithContext(f"Reading Q{number} has no matching passage/image in both scripts")
                if question["type"] == "reading_comprehension" and any(not question["questionText"][s] and s not in question.get("assets", {}) for s in exam["variants"]):
                    raise ImportErrorWithContext(f"Missing question text for Reading Q{number}")
    if total != exam["totalQuestions"]:
        raise ImportErrorWithContext("Combined question count mismatch")
    listening = components["listening"]
    plan = listening["audio"]["examPlaybackPlan"]
    ordered = []
    plan_paths = []
    question_audio = {}
    planned_groups = {}
    for step in plan:
        if step["type"] == "question":
            ordered.append(step["questionId"])
            question_audio[step["questionId"]] = (None, step["path"])
        elif step["type"] == "question_group":
            if len(step["questionTracks"]) < 2:
                raise ImportErrorWithContext(f"Shared-audio group {step['id']} has fewer than two questions")
            ordered.extend(track["questionId"] for track in step["questionTracks"])
            planned_groups[step["id"]] = step
            for track in step["questionTracks"]:
                question_audio[track["questionId"]] = (step["id"], track["path"])
        for url in _plan_paths(step):
            plan_paths.append(url)
            if check_audio_files and not _asset_exists(url, asset_root, exam["id"]):
                raise ImportErrorWithContext(f"Missing official audio: {url}")
    if ordered != [q["id"] for q in listening["questions"]]:
        raise ImportErrorWithContext("Listening playback order does not match question order")
    if len(plan_paths) != len(set(plan_paths)):
        raise ImportErrorWithContext("Listening playback plan repeats an audio track")
    groups = listening["audio"].get("groups", [])
    if set(planned_groups) != {group["id"] for group in groups} or len(groups) != len(planned_groups):
        raise ImportErrorWithContext("Listening shared-audio groups do not match playback plan")
    for group in groups:
        step = planned_groups[group["id"]]
        if group["sharedAudio"] != step["sharedAudio"] or group["questions"] != [int(track["questionId"].split("-q")[-1]) for track in step["questionTracks"]]:
            raise ImportErrorWithContext(f"Listening group {group['id']} has incorrect question/audio order")
        if group["questionTracks"] != {str(int(track["questionId"].split("-q")[-1])): track["path"] for track in step["questionTracks"]}:
            raise ImportErrorWithContext(f"Listening group {group['id']} has mismatched question tracks")
    for question in listening["questions"]:
        group_id, path = question_audio[question["id"]]
        audio = question.get("audio", {})
        if group_id:
            if audio.get("mode") != "shared_group" or audio.get("groupId") != group_id or audio.get("questionTrack") != path or audio.get("reviewSequence") != [planned_groups[group_id]["sharedAudio"], path]:
                raise ImportErrorWithContext(f"Listening {question['id']} has incorrect shared audio mapping")
        elif audio.get("mode") != "self_contained" or audio.get("path") != path or audio.get("reviewSequence") != [path]:
            raise ImportErrorWithContext(f"Listening {question['id']} has incorrect audio mapping")
    if {entry["questionId"] for entry in supplement["questions"]} != {q["id"] for q in listening["questions"]}:
        raise ImportErrorWithContext("Transcript mapping does not cover every Listening question")
    if len(supplement["questions"]) != len(listening["questions"]):
        raise ImportErrorWithContext("Duplicate transcript question IDs")


def _asset_exists(url: str, root: Path, test_id: str) -> bool:
    prefix = f"/tests/{test_id}/"
    if not url.startswith(prefix):
        return False
    relative = Path(url[len(prefix):])
    if ".." in relative.parts or relative.is_absolute():
        return False
    path = root / relative
    return path.is_file() and path.stat().st_size > 0


def _plan_paths(step: dict) -> list[str]:
    if step["type"] in {"track", "question"}:
        return [step["path"]]
    return [step["sharedAudio"], *(track["path"] for track in step["questionTracks"])]

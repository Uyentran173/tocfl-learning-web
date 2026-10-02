from __future__ import annotations

from pathlib import Path

from .discovery import ImportErrorWithContext


def validate_package(package: dict, supplement: dict, asset_root: Path) -> None:
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
            if question["choices"] != list("ABCD") or question["correctAnswer"] not in question["choices"]:
                raise ImportErrorWithContext(f"Invalid answer for {skill} Q{number}")
            if any(len(question["choiceText"][s]) != 4 or any(not x.strip() for x in question["choiceText"][s]) for s in exam["variants"]):
                raise ImportErrorWithContext(f"Missing answer text in {skill} Q{number}")
            section = next((s for s in component["sections"] if s["id"] == question["sectionId"]), None)
            if not section or not section["startQuestion"] <= number <= section["endQuestion"]:
                raise ImportErrorWithContext(f"Wrong section for {skill} Q{number}")
            for script, url in question.get("assets", {}).items():
                if script not in exam["variants"] or f"/{script}/" not in url or not _asset_exists(url, asset_root, exam["id"]):
                    raise ImportErrorWithContext(f"Missing/wrong {script} image for {skill} Q{number}: {url}")
            if skill == "reading":
                group = question["stimulusGroupId"]
                context = component["displayContexts"].get(group)
                if not context or any(not context.get(script) and script not in question.get("assets", {}) for script in exam["variants"]):
                    raise ImportErrorWithContext(f"Reading Q{number} has no matching passage/image in both scripts")
                if question["type"] == "reading_comprehension" and any(not question["questionText"][s] for s in exam["variants"]):
                    raise ImportErrorWithContext(f"Missing question text for Reading Q{number}")
    if total != exam["totalQuestions"]:
        raise ImportErrorWithContext("Combined question count mismatch")
    listening = components["listening"]
    plan = listening["audio"]["examPlaybackPlan"]
    ordered = []
    for step in plan:
        if step["type"] == "question":
            ordered.append(step["questionId"])
        elif step["type"] == "question_group":
            if len(step["questionTracks"]) < 2:
                raise ImportErrorWithContext(f"Shared-audio group {step['id']} has fewer than two questions")
            ordered.extend(track["questionId"] for track in step["questionTracks"])
        for url in _plan_paths(step):
            if not _asset_exists(url, asset_root, exam["id"]):
                raise ImportErrorWithContext(f"Missing official audio: {url}")
    if ordered != [q["id"] for q in listening["questions"]]:
        raise ImportErrorWithContext("Listening playback order does not match question order")
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

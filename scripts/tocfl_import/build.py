from __future__ import annotations

import json
import re
from pathlib import Path

from .discovery import ImportErrorWithContext
from .pdf import extract_answers, extract_listening_choices, extract_reading, extract_scores, extract_transcripts


def next_test_id(data_dir: Path, band: str) -> str:
    prefix = "novice" if band == "Novice" else f"band-{band.lower()}"
    pattern = re.compile(rf"^{re.escape(prefix)}-test-(\d+)$")
    numbers = []
    for file in data_dir.glob("*.json"):
        try:
            test_id = json.loads(file.read_text())["exam"]["id"]
        except (KeyError, ValueError):
            continue
        match = pattern.fullmatch(test_id)
        if match:
            numbers.append(int(match.group(1)))
    for folder in (data_dir.parent.parent / "public/tests", data_dir.parent / "test-supplements"):
        if folder.exists():
            numbers.extend(int(match.group(1)) for item in folder.iterdir() if (match := pattern.fullmatch(item.name)))
    return f"{prefix}-test-{max(numbers, default=0) + 1:02d}"


def ensure_new_source(data_dir: Path, band: str, series: int) -> None:
    expected_level = f"Band {band}"
    for file in data_dir.glob("*.json"):
        try:
            exam = json.loads(file.read_text())["exam"]
        except (KeyError, ValueError):
            continue
        source = exam.get("source")
        if exam.get("level") == expected_level and isinstance(source, dict) and source.get("series") == series:
            raise ImportErrorWithContext(f"Official Band {band} series {series} is already imported as {exam['id']}; refusing a duplicate")


def audio_plan(tracks: list[dict[str, str]], test_id: str) -> tuple[dict, dict[int, dict], list[dict], dict[str, str]]:
    """Map official labeled tracks to existing track/question/question_group steps."""
    def path(track: dict) -> str:
        return f"/tests/{test_id}/listening/audio/{track['url'].rsplit('/', 1)[-1]}"

    audio = {"provided": True, "groups": []}
    question_audio: dict[int, dict] = {}
    playback: list[dict] = []
    downloads: dict[str, str] = {}
    pending = None
    pending_questions: list[tuple[int, dict]] = []

    def flush():
        nonlocal pending, pending_questions
        if not pending:
            return
        if not pending_questions:
            raise ImportErrorWithContext(f"Shared track {pending['url']} has no questions")
        numbers = [n for n, _ in pending_questions]
        group_id = f"ag-q{numbers[0]:02d}-q{numbers[-1]:02d}"
        group = {"id": group_id, "questions": numbers, "sharedAudio": path(pending), "questionTracks": {str(n): path(track) for n, track in pending_questions}}
        audio["groups"].append(group)
        playback.append({"type": "question_group", "id": group_id, "sharedAudio": path(pending), "questionTracks": [{"questionId": f"listening-q{n:02d}", "path": path(track)} for n, track in pending_questions]})
        for n, track in pending_questions:
            question_audio[n] = {"mode": "shared_group", "groupId": group_id, "questionTrack": path(track), "reviewSequence": [path(pending), path(track)]}
        pending = None
        pending_questions = []

    for i, track in enumerate(tracks):
        label = track["label"].strip()
        downloads[path(track)] = track["url"]
        if re.fullmatch(r"\d{1,2}", label):
            n = int(label)
            if n in question_audio or any(n == old for old, _ in pending_questions):
                raise ImportErrorWithContext(f"Duplicate official audio Q{n}")
            if pending:
                pending_questions.append((n, track))
            else:
                question_audio[n] = {"mode": "self_contained", "path": path(track), "reviewSequence": [path(track)]}
                playback.append({"type": "question", "questionId": f"listening-q{n:02d}", "path": path(track)})
            continue
        if label == "題幹" or re.fullmatch(r"\d{1,2}\s*[-–]\s*\d{1,2}", label):
            flush()
            pending = track
            continue
        flush()
        if "第一部分" in label:
            role = "part_1_instructions"
            audio["part1Intro"] = path(track)
        elif "第二部分" in label:
            role = "part_2_instructions"
            audio["part2Intro"] = path(track)
        elif not label and not question_audio:
            role = "part_1_preamble"
            audio["part1Preamble"] = path(track)
        elif not label and i == len(tracks) - 1:
            role = "ending"
            audio["endingTrack"] = path(track)
        else:
            raise ImportErrorWithContext(f"Unrecognized official audio label {label!r} at {track['url']}")
        playback.append({"type": "track", "role": role, "path": path(track)})
    flush()
    numbers = sorted(question_audio)
    if numbers != list(range(1, len(numbers) + 1)):
        raise ImportErrorWithContext(f"Official audio question tracks are not consecutive: {numbers}")
    audio["examPlaybackPlan"] = playback
    return audio, question_audio, playback, downloads


def _sections(skill: str, count: int, playback: list[dict] | None = None) -> list[dict]:
    if skill == "listening":
        part2 = next((i for i, step in enumerate(playback or []) if step.get("role") == "part_2_instructions"), None)
        if part2 is None:
            raise ImportErrorWithContext("Listening audio has no Part 2 boundary")
        after = next((step for step in (playback or [])[part2 + 1:] if step["type"] in {"question", "question_group"}), None)
        if not after:
            raise ImportErrorWithContext("Listening Part 2 has no question")
        first = int((after.get("questionId") or after["questionTracks"][0]["questionId"]).split("q")[-1])
        return [{"id": "listening-part-1", "title": "Part 1 Dialogue", "startQuestion": 1, "endQuestion": first - 1}, {"id": "listening-part-2", "title": "Part 2 Monologue", "startQuestion": first, "endQuestion": count}]
    raise ValueError(skill)


def _transcript_entries(raw: dict[int, str], groups: list[dict]) -> list[dict]:
    """Move a printed group preamble out of the preceding question's transcript."""
    shared_by_question = {}
    for group in groups:
        first = group["questions"][0]
        previous = raw.get(first - 1, "")
        split = previous.rfind("請聽")
        if split < 0:
            raise ImportErrorWithContext(f"Transcript has no shared passage before Q{first}")
        shared = previous[split:].strip()
        if not shared:
            raise ImportErrorWithContext(f"Empty shared transcript for Q{first}")
        raw[first - 1] = previous[:split].strip()
        for number in group["questions"]:
            shared_by_question[number] = shared
    entries = []
    for number, text in sorted(raw.items()):
        text = (shared_by_question.get(number, "") + "\n" + text).strip()
        if not text:
            raise ImportErrorWithContext(f"Empty transcript for Q{number}")
        entries.append({"questionId": f"listening-q{number:02d}", "number": number, "traditional": text})
    return entries


def build_package(source_files: dict[str, dict[str, bytes]], tracks: list[dict[str, str]], test_id: str, band: str, series: int, source_urls: dict, asset_dir: Path):
    if set(source_files) != {"listening", "reading"}:
        raise ImportErrorWithContext("Publication requires both Listening and Reading; use --type all")
    listening = source_files["listening"]
    reading = source_files["reading"]
    l_answers = extract_answers(listening["answer_pdf"])
    r_answers = extract_answers(reading["answer_pdf"])
    l_choice = {script: extract_listening_choices(listening[f"{script}_pdf"]) for script in ("traditional", "simplified")}
    r_data = {script: extract_reading(reading[f"{script}_pdf"], script) for script in ("traditional", "simplified")}
    l_count, r_count = len(l_answers), len(r_answers)
    expected = 25 if band == "Novice" else 50
    if (l_count, r_count) != (expected, expected):
        raise ImportErrorWithContext(f"Band {band} requires {expected} Listening and {expected} Reading questions; official keys contain {l_count} and {r_count}")
    for script in ("traditional", "simplified"):
        if set(l_choice[script]) != set(l_answers) or set(r_data[script].questions) != set(r_answers):
            raise ImportErrorWithContext(f"{script} PDF question numbers do not match answer key")
    audio, question_audio, playback, downloads = audio_plan(tracks, test_id)
    if set(question_audio) != set(l_answers):
        raise ImportErrorWithContext("Official audio track numbers do not match Listening questions")
    transcript = extract_transcripts(listening["transcript_pdf"], l_count)
    transcript_path = Path("data/test-supplements") / test_id / "listening-transcripts.json"
    sections_l = _sections("listening", l_count, playback)
    gap_numbers = [n for n, q in r_data["traditional"].questions.items() if q["type"] == "gap_filling"]
    if gap_numbers != list(range(1, len(gap_numbers) + 1)):
        raise ImportErrorWithContext("Reading gap-filling questions are not a consecutive first part")
    sections_r = [{"id": "reading-part-1", "title": "Part 1 Gap Filling", "startQuestion": 1, "endQuestion": len(gap_numbers)}, {"id": "reading-part-2", "title": "Part 2 Reading Comprehension", "startQuestion": len(gap_numbers) + 1, "endQuestion": r_count}]
    for script in ("traditional", "simplified"):
        if {n: q["type"] for n, q in r_data[script].questions.items()} != {n: q["type"] for n, q in r_data["traditional"].questions.items()}:
            raise ImportErrorWithContext("Traditional/Simplified Reading types differ")
        if {n: q["stimulusGroupId"] for n, q in r_data[script].questions.items()} != {n: q["stimulusGroupId"] for n, q in r_data["traditional"].questions.items()}:
            raise ImportErrorWithContext("Traditional/Simplified Reading passage groups differ")
    l_questions = []
    for n in range(1, l_count + 1):
        l_questions.append({"id": f"listening-q{n:02d}", "number": n, "sectionId": sections_l[0]["id"] if n <= sections_l[0]["endQuestion"] else sections_l[1]["id"], "type": "listening_multiple_choice", "choices": list("ABCD"), "correctAnswer": l_answers[n], "choiceText": {script: l_choice[script][n] for script in l_choice}, "audio": question_audio[n], "transcriptGroupId": f"tg-q{n:02d}"})
    r_questions = []
    display_contexts = {}
    for group in r_data["traditional"].contexts:
        if group not in r_data["simplified"].contexts:
            raise ImportErrorWithContext(f"Missing Simplified Reading group {group}")
        display_contexts[group] = {script: r_data[script].contexts[group] for script in r_data}
    for n in range(1, r_count + 1):
        original = r_data["traditional"].questions[n]
        other = r_data["simplified"].questions[n]
        q = {"id": f"reading-q{n:02d}", "number": n, "sectionId": sections_r[0]["id"] if n <= len(gap_numbers) else sections_r[1]["id"], "type": original["type"], "choices": list("ABCD"), "correctAnswer": r_answers[n], "stimulusGroupId": original["stimulusGroupId"], "choiceText": {"traditional": original["choiceText"], "simplified": other["choiceText"]}}
        if original["type"] == "reading_comprehension":
            q["questionText"] = {"traditional": original["questionText"], "simplified": other["questionText"]}
        image_paths = {}
        for script in r_data:
            image = r_data[script].images.get(original["stimulusGroupId"])
            if image:
                relative = Path("reading/assets") / script / "groups" / f"{original['stimulusGroupId']}.png"
                target = asset_dir / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(image)
                image_paths[script] = f"/tests/{test_id}/{relative.as_posix()}"
        if image_paths:
            if set(image_paths) != {"traditional", "simplified"}:
                raise ImportErrorWithContext(f"Document image missing in one script for Q{n}")
            q["assets"] = image_paths
        r_questions.append(q)
    supplement = {"schemaVersion": "1.0", "examId": test_id, "componentId": "listening", "source": source_urls["listening"]["transcript_pdf"], "display": {"defaultHidden": True, "recommendedUse": "review_or_explanation", "variantAware": True}, "questions": _transcript_entries(transcript, audio["groups"])}
    score_l, score_r = extract_scores(listening["score_pdf"], l_count), extract_scores(reading["score_pdf"], r_count)
    package = {"schemaVersion": "1.0", "exam": {"id": test_id, "title": f"TOCFL Band {band} — Đề {test_id.rsplit('-', 1)[-1]}", "level": f"Band {band}", "variants": ["traditional", "simplified"], "defaultVariant": "traditional", "componentOrder": ["listening", "reading"], "questionNumbering": "restart_per_component", "totalQuestions": l_count + r_count, "componentScoresSeparate": True, "publishReady": True, "source": {"officialUrl": source_urls["page_url"], "series": series, "files": source_urls}}, "flow": {"order": ["listening", "reading"], "mustCompleteInOrder": True, "preserveSelectedVariantBetweenComponents": True}, "components": {"listening": {"id": "listening", "title": "Nghe", "order": 1, "durationSeconds": 3600, "totalQuestions": l_count, "choiceLabels": list("ABCD"), "sections": sections_l, "audio": audio, "transcriptDataPath": transcript_path.as_posix(), "scoring": {"type": "lookup_table", "maxScore": max(score_l.values()), "scoreByCorrectCount": score_l}, "questions": l_questions}, "reading": {"id": "reading", "title": "Đọc", "order": 2, "durationSeconds": 3600, "totalQuestions": r_count, "choiceLabels": list("ABCD"), "sections": sections_r, "scoring": {"type": "lookup_table", "maxScore": max(score_r.values()), "scoreByCorrectCount": score_r}, "questions": r_questions, "displayContexts": display_contexts}}}
    return package, supplement, downloads

from __future__ import annotations

import json
import re
from pathlib import Path

from .discovery import ImportErrorWithContext
from .pdf import TranscriptExtract, extract_answers, extract_listening_choices, extract_reading, extract_scores, extract_transcript_layout, extract_transcripts
from .visual_pdf import extract_image_paper


def matching_legacy_test(data_dir: Path, band: str, source_files: dict, series: int | None = None) -> str | None:
    """Detect an earlier manually imported copy using both full keys and score tables."""
    answers = {skill: extract_answers(source_files[skill]["answer_pdf"], skill, band=band, series=series) for skill in ("listening", "reading")}
    scores = {skill: extract_scores(source_files[skill]["score_pdf"], len(answers[skill]), skill) for skill in ("listening", "reading")}
    matches = []
    for file in data_dir.glob("*.json"):
        try:
            data = json.loads(file.read_text())
            exam = data["exam"]
            if exam.get("level") not in {f"Band {band}", band} or exam.get("source"):
                continue
            if all(len(data["components"][skill]["questions"]) == len(answers[skill]) and
                   all(question["correctAnswer"] == answers[skill][question["number"]] for question in data["components"][skill]["questions"]) and
                   data["components"][skill]["scoring"]["scoreByCorrectCount"] == scores[skill]
                   for skill in ("listening", "reading")):
                matches.append(exam["id"])
        except (KeyError, TypeError, ValueError):
            continue
    if len(matches) > 1:
        raise ImportErrorWithContext(f"Official Band {band} paper matches multiple legacy tests: {matches}")
    return matches[0] if matches else None


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


def existing_source_id(data_dir: Path, band: str, series: int) -> str | None:
    expected_level = f"Band {band}"
    matches = set()
    for file in data_dir.glob("*.json"):
        try:
            exam = json.loads(file.read_text())["exam"]
        except (KeyError, ValueError):
            continue
        source = exam.get("source")
        if exam.get("level") == expected_level and isinstance(source, dict) and source.get("series") == series:
            matches.add(exam["id"])
    for file in (data_dir.parent / "import-manifests").glob("*.json"):
        try:
            manifest = json.loads(file.read_text())
        except ValueError:
            continue
        if manifest.get("sourceIdentity") == f"official-tocfl:{band.lower()}:{series}":
            matches.add(manifest["testId"])
    if len(matches) > 1:
        raise ImportErrorWithContext(f"Official Band {band} series {series} is mapped to conflicting test IDs: {sorted(matches)}")
    return next(iter(matches), None)


def ensure_new_source(data_dir: Path, band: str, series: int) -> None:
    existing = existing_source_id(data_dir, band, series)
    if existing:
        raise ImportErrorWithContext(f"Official Band {band} series {series} is already imported as {existing}; refusing a duplicate")


def audio_plan(tracks: list[dict[str, str]], test_id: str) -> tuple[dict, dict[int, dict], list[dict], dict[str, str]]:
    """Map official labeled tracks to existing track/question/question_group steps."""
    def path(track: dict) -> str:
        return f"/tests/{test_id}/listening/audio/{track.get('localName') or track['url'].rsplit('/', 1)[-1]}"

    audio = {"provided": True, "groups": []}
    question_audio: dict[int, dict] = {}
    playback: list[dict] = []
    downloads: dict[str, str] = {}
    pending = None
    pending_questions: list[tuple[int, dict]] = []
    instruction_count = 0

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
        if path(track) in downloads and downloads[path(track)] != track["url"]:
            raise ImportErrorWithContext(f"Two official audio URLs map to the same local file {path(track)}")
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
        if "部分說明" in label:
            instruction_count += 1
            role = f"part_{instruction_count}_instructions"
            audio[f"part{instruction_count}Intro"] = path(track)
            expected_label = "一二三四五"[instruction_count - 1] if instruction_count <= 5 else None
            if expected_label and expected_label not in label:
                audio.setdefault("sourceLabelWarnings", []).append(f"{role}: official label {label!r}")
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
        boundaries = []
        steps = playback or []
        for index, step in enumerate(steps):
            if step.get("type") != "track" or not re.fullmatch(r"part_\d+_instructions", step.get("role", "")):
                continue
            after = next((item for item in steps[index + 1:] if item["type"] in {"question", "question_group"}), None)
            if not after:
                raise ImportErrorWithContext(f"Listening instruction {step['role']} has no following question")
            first = int((after.get("questionId") or after["questionTracks"][0]["questionId"]).split("q")[-1])
            boundaries.append(first)
        if not boundaries or boundaries[0] != 1 or boundaries != sorted(set(boundaries)):
            raise ImportErrorWithContext(f"Listening instruction boundaries are ambiguous: {boundaries}")
        return [{"id": f"listening-part-{index + 1}", "title": f"Part {index + 1}", "startQuestion": start, "endQuestion": (boundaries[index + 1] - 1 if index + 1 < len(boundaries) else count)} for index, start in enumerate(boundaries)]
    raise ValueError(skill)


def _transcript_entries(raw: dict[int, str], groups: list[dict]) -> list[dict]:
    """Move a printed group preamble out of the preceding question's transcript."""
    shared_by_question = {}
    for group in groups:
        first = group["questions"][0]
        previous = raw.get(first - 1, "")
        boundary = re.search(r"[？?][^\n]*\n(?:[ \t]*\n)+", previous)
        split = boundary.end() if boundary else previous.rfind("請聽")
        if split < 0 or not previous[:split].strip():
            raise ImportErrorWithContext(f"Transcript has no separable shared passage before Q{first}")
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


def _band_c_transcript_entries(layout: TranscriptExtract, groups: list[dict]) -> tuple[list[dict], list[dict]]:
    """Match printed passage-before-questions blocks to numbered shared audio."""
    question_text: dict[int, str] = {}
    following: dict[int, str] = {}
    for number, segment in layout.questions.items():
        lines = [line.strip() for line in segment.splitlines() if line.strip()]
        end = next((index for index, line in enumerate(lines) if line.endswith(("？", "?"))), None)
        if end is None:
            raise ImportErrorWithContext(f"Band C transcript Q{number} has no identifiable question ending")
        question_text[number] = "\n".join(lines[:end + 1])
        following[number] = "\n".join(lines[end + 1:]).strip()

    def passage(source: str) -> str:
        lines = [line.strip() for line in source.splitlines() if line.strip()]
        while lines and ("模擬試題聽力測驗腳本" in lines[0] or lines[0] == "Script of Listening Test" or re.fullmatch(r"第[一二三四五六七八九十]+部分\s*.*", lines[0])):
            lines.pop(0)
        return "\n".join(lines).strip()

    count_words = {"一": 1, "二": 2, "兩": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10}
    shared_by_question: dict[int, tuple[str, str]] = {}
    shared_groups = []
    starts = set()
    for group in groups:
        numbers = group["questions"]
        first = numbers[0]
        if numbers != list(range(first, numbers[-1] + 1)) or any(number in shared_by_question for number in numbers):
            raise ImportErrorWithContext(f"Band C shared audio group {group['id']} has overlapping or nonconsecutive questions")
        source = layout.preface if first == 1 else following.get(first - 1, "")
        shared = passage(source)
        compact = re.sub(r"\s+", "", shared)
        declarations = list(re.finditer(r"回答(?:下面|以下)?(?:的)?([一二三四五六七八九十兩\d]+)個問題", compact))
        if len(declarations) != 1:
            raise ImportErrorWithContext(f"Band C transcript has no confidently separable shared passage before Q{first} ({group['id']})")
        declaration = declarations[0]
        body = compact[declaration.end():]
        if re.search(r"(?:男|女)：|現在請聽", compact[:declaration.start()]) or len(re.findall(r"[\u4e00-\u9fff]", body)) < 30:
            raise ImportErrorWithContext(f"Band C transcript Q{first}–Q{numbers[-1]} does not print a complete shared passage before the questions; the question-first layout needs a separate verified mapping")
        declared = declaration.group(1)
        count = int(declared) if declared.isdigit() else count_words.get(declared)
        if count != len(numbers):
            raise ImportErrorWithContext(f"Band C transcript before Q{first} declares {declared} questions, but shared audio {group['id']} has {len(numbers)}")
        starts.add(first)
        shared_groups.append({"id": group["id"], "questions": numbers, "traditional": shared})
        for number in numbers:
            shared_by_question[number] = (group["id"], shared)

    if layout.preface and 1 not in starts and passage(layout.preface):
        raise ImportErrorWithContext("Band C transcript has an unassigned passage before Q1")
    for number, tail in following.items():
        if tail and number + 1 not in starts:
            raise ImportErrorWithContext(f"Band C transcript has unmapped passage after Q{number}")

    entries = []
    for number in sorted(question_text):
        group = shared_by_question.get(number)
        text = question_text[number]
        entry = {"questionId": f"listening-q{number:02d}", "number": number, "traditional": f"{group[1]}\n{text}" if group else text, "questionTraditional": text}
        if group:
            entry["sharedTranscriptGroupId"] = group[0]
        entries.append(entry)
    return entries, shared_groups


def _attach_images(question: dict, extracts: dict, number: int, skill: str, test_id: str, asset_dir: Path) -> None:
    image_paths = {}
    choice_paths = {}
    visual = {}
    for script, extracted in extracts.items():
        source = extracted.questions[number]
        if source.get("visual"):
            visual[script] = source["visual"]
        if source.get("imageKey"):
            key = source["imageKey"]
            relative = Path(skill) / "assets" / script / f"{key}.png"
            target = asset_dir / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists():
                target.write_bytes(extracted.images[key])
            image_paths[script] = f"/tests/{test_id}/{relative.as_posix()}"
        if source.get("choiceImageKeys"):
            paths = []
            for key in source["choiceImageKeys"]:
                relative = Path(skill) / "assets" / script / f"{key}.png"
                target = asset_dir / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(extracted.images[key])
                paths.append(f"/tests/{test_id}/{relative.as_posix()}")
            choice_paths[script] = paths
    if image_paths:
        if set(image_paths) != {"traditional", "simplified"}:
            raise ImportErrorWithContext(f"{skill} Q{number} image missing in one script")
        question["assets"] = image_paths
    if choice_paths:
        if set(choice_paths) != {"traditional", "simplified"} or len(choice_paths["traditional"]) != len(question["choices"]) or len(choice_paths["simplified"]) != len(question["choices"]):
            raise ImportErrorWithContext(f"{skill} Q{number} image choices differ between scripts")
        question["choiceImages"] = choice_paths
    if visual:
        if set(visual) != {"traditional", "simplified"}:
            raise ImportErrorWithContext(f"{skill} Q{number} page crop missing in one script")
        question["visual"] = visual


def build_package(source_files: dict[str, dict[str, bytes]], tracks: list[dict[str, str]], test_id: str, band: str, series: int, source_urls: dict, asset_dir: Path, title: str | None = None):
    if set(source_files) != {"listening", "reading"}:
        raise ImportErrorWithContext("Publication requires both Listening and Reading; use --type all")
    listening = source_files["listening"]
    reading = source_files["reading"]
    answer_warnings: list[str] = []
    l_answers = extract_answers(listening["answer_pdf"], "listening", band=band, series=series, warnings=answer_warnings)
    r_answers = extract_answers(reading["answer_pdf"], "reading", band=band, series=series, warnings=answer_warnings)
    image_paper = band in {"Novice", "A"}
    l_visual = {script: extract_image_paper(listening[f"{script}_pdf"], "listening", band, len(l_answers)) for script in ("traditional", "simplified")} if image_paper else None
    l_choice = {script: {n: q["choiceText"] for n, q in l_visual[script].questions.items()} for script in l_visual} if l_visual else {script: extract_listening_choices(listening[f"{script}_pdf"]) for script in ("traditional", "simplified")}
    r_data = {script: extract_image_paper(reading[f"{script}_pdf"], "reading", band, len(r_answers)) if image_paper else extract_reading(reading[f"{script}_pdf"], script) for script in ("traditional", "simplified")}
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
    if band == "C":
        transcript_entries, shared_transcript_groups = _band_c_transcript_entries(
            extract_transcript_layout(listening["transcript_pdf"], l_count), audio["groups"]
        )
    else:
        transcript_entries = _transcript_entries(extract_transcripts(listening["transcript_pdf"], l_count), audio["groups"])
        shared_transcript_groups = []
    transcript_path = Path("data/test-supplements") / test_id / "listening-transcripts.json"
    sections_l = _sections("listening", l_count, playback)
    gap_numbers = [n for n, q in r_data["traditional"].questions.items() if q["type"] == "gap_filling"]
    if not image_paper and gap_numbers != list(range(1, len(gap_numbers) + 1)):
        raise ImportErrorWithContext("Reading gap-filling questions are not a consecutive first part")
    if band == "A":
        boundaries = [1, 16, 31, 36, 41, 46, 51] if series == 3 else [1, 16, 31, 41, 46, 51]
    elif band == "Novice":
        boundaries = [1, 16, 26]
    else:
        boundaries = [1, len(gap_numbers) + 1, r_count + 1]
    sections_r = [{"id": f"reading-part-{i + 1}", "title": f"Part {i + 1}", "startQuestion": start, "endQuestion": boundaries[i + 1] - 1} for i, start in enumerate(boundaries[:-1])]
    if band == "A":
        for section in (sections_r[3:5] if series == 3 else sections_r[3:4]):
            section["sharedChoicePool"] = list("ABCDEF")
            section["uniqueChoiceUsageWithinSection"] = True
    for script in ("traditional", "simplified"):
        if {n: q["type"] for n, q in r_data[script].questions.items()} != {n: q["type"] for n, q in r_data["traditional"].questions.items()}:
            raise ImportErrorWithContext("Traditional/Simplified Reading types differ")
        if {n: q["stimulusGroupId"] for n, q in r_data[script].questions.items()} != {n: q["stimulusGroupId"] for n, q in r_data["traditional"].questions.items()}:
            raise ImportErrorWithContext("Traditional/Simplified Reading passage groups differ")
    l_questions = []
    for n in range(1, l_count + 1):
        labels = l_visual["traditional"].questions[n]["choices"] if l_visual else list("ABCD")
        q = {"id": f"listening-q{n:02d}", "number": n, "sectionId": next(section["id"] for section in sections_l if section["startQuestion"] <= n <= section["endQuestion"]), "type": "listening_multiple_choice", "choices": labels, "correctAnswer": l_answers[n], "choiceText": {script: l_choice[script][n] for script in l_choice}, "audio": question_audio[n], "transcriptGroupId": f"tg-q{n:02d}"}
        if l_visual:
            _attach_images(q, l_visual, n, "listening", test_id, asset_dir)
        l_questions.append(q)
    r_questions = []
    display_contexts = {}
    for group in r_data["traditional"].contexts:
        if group not in r_data["simplified"].contexts:
            raise ImportErrorWithContext(f"Missing Simplified Reading group {group}")
        display_contexts[group] = {script: r_data[script].contexts[group] for script in r_data}
    for n in range(1, r_count + 1):
        original = r_data["traditional"].questions[n]
        other = r_data["simplified"].questions[n]
        q = {"id": f"reading-q{n:02d}", "number": n, "sectionId": next(section["id"] for section in sections_r if section["startQuestion"] <= n <= section["endQuestion"]), "type": original["type"], "choices": original.get("choices", list("ABCD")), "correctAnswer": r_answers[n], "stimulusGroupId": original["stimulusGroupId"], "choiceText": {"traditional": original["choiceText"], "simplified": other["choiceText"]}}
        if original["type"] == "reading_comprehension" or image_paper:
            q["questionText"] = {"traditional": original["questionText"], "simplified": other["questionText"]}
        if image_paper:
            _attach_images(q, r_data, n, "reading", test_id, asset_dir)
        image_paths = {}
        for script in (() if image_paper else r_data):
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
    supplement = {"schemaVersion": "1.0", "examId": test_id, "componentId": "listening", "source": source_urls["listening"]["transcript_pdf"], "display": {"defaultHidden": True, "recommendedUse": "review_or_explanation", "variantAware": True}, "questions": transcript_entries}
    if band == "C":
        supplement["sharedGroups"] = shared_transcript_groups
    score_l, score_r = extract_scores(listening["score_pdf"], l_count, "listening"), extract_scores(reading["score_pdf"], r_count, "reading")
    package = {"schemaVersion": "1.0", "exam": {"id": test_id, "title": title or f"TOCFL Band {band} — Đề {test_id.rsplit('-', 1)[-1]}", "level": f"Band {band}", "variants": ["traditional", "simplified"], "defaultVariant": "traditional", "componentOrder": ["listening", "reading"], "questionNumbering": "restart_per_component", "totalQuestions": l_count + r_count, "componentScoresSeparate": True, "publishReady": True, "source": {"officialUrl": source_urls["page_url"], "series": series, "files": source_urls}, "sourceWarnings": [{"script": script, "message": warning} for script in r_data for warning in getattr(r_data[script], "warnings", [])]}, "flow": {"order": ["listening", "reading"], "mustCompleteInOrder": True, "preserveSelectedVariantBetweenComponents": True}, "components": {"listening": {"id": "listening", "title": "Nghe", "order": 1, "durationSeconds": 3600, "totalQuestions": l_count, "choiceLabels": list("ABCD"), "sections": sections_l, "audio": audio, "transcriptDataPath": transcript_path.as_posix(), "scoring": {"type": "lookup_table", "maxScore": max(score_l.values()), "scoreByCorrectCount": score_l}, "questions": l_questions}, "reading": {"id": "reading", "title": "Đọc", "order": 2, "durationSeconds": 3600, "totalQuestions": r_count, "choiceLabels": list("ABCD"), "sections": sections_r, "scoring": {"type": "lookup_table", "maxScore": max(score_r.values()), "scoreByCorrectCount": score_r}, "questions": r_questions, "displayContexts": display_contexts}}}
    package["exam"]["sourceWarnings"].extend({"skill": "listening", "message": warning} for warning in answer_warnings)
    return package, supplement, downloads

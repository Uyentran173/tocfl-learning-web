from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import fitz

from .discovery import ImportErrorWithContext
from .embedded_image import embedded_png

QUESTION = re.compile(r"(?m)^\s*(\d{1,2})\s*[.．、]\s*")
OPTION = re.compile(r"(?m)^\s*[（(]([A-D])[）)]\s*")
HEADING = re.compile(r"(?m)^\s*（[一二三四五六七八九十百]+）\s*$")


def clean(value: str) -> str:
    return re.sub(r"[ \t]+", " ", value).strip()


def extract_answers(data: bytes, skill: str | None = None, *, band: str | None = None, series: int | None = None, warnings: list[str] | None = None) -> dict[int, str]:
    text = "\n".join(page.get_text() for page in fitz.open(stream=data, filetype="pdf"))
    if "TOCFL-Novice Listening" in text and "TOCFL-Novice Reading" in text:
        if skill not in {"listening", "reading"}:
            raise ImportErrorWithContext("Combined Novice answer key needs a skill")
        start = text.index(f"TOCFL-Novice {skill.title()}")
        stop = text.find("TOCFL-Novice Reading", start + 1) if skill == "listening" else -1
        text = text[start:stop if stop >= 0 else None]
    pairs = re.findall(r"(?m)^\s*(\d{1,2})\s*\n\s*([A-F])\s*$", text)
    # Some official Band A keys misprint row 34 as 44 (Series 1–3) or
    # 4 (Series 4). Correct only when every other row is exactly in order.
    if band == "A" and skill == "listening" and len(pairs) == 50:
        numbers = [int(number) for number, _ in pairs]
        if numbers[33] in {4, 44} and all(number == index for index, number in enumerate(numbers, 1) if index != 34):
            printed = numbers[33]
            pairs[33] = ("34", pairs[33][1])
            if warnings is not None:
                warnings.append(f"Official Listening answer key prints Q{printed} between Q33 and Q35; its answer is mapped by verified row position to Q34")
    answers = {int(number): answer for number, answer in pairs}
    if len(answers) != len(pairs) or sorted(answers) != list(range(1, len(answers) + 1)):
        raise ImportErrorWithContext("Answer key contains missing or duplicate question numbers")
    return answers


def extract_scores(data: bytes, count: int, skill: str | None = None) -> dict[str, int]:
    text = "\n".join(page.get_text() for page in fitz.open(stream=data, filetype="pdf"))
    numbers = [int(x) for x in re.findall(r"(?m)^\s*(\d{1,3})\s*$", text)]
    if count == 25 and "Band Novice" in text and skill in {"listening", "reading"}:
        # The official Novice sheet interleaves Listening and Reading columns.
        if len(numbers) < 100:
            raise ImportErrorWithContext("Combined Novice score table has fewer than 100 numeric cells")
        offset = 0 if skill == "listening" else 2
        numbers = [value for i in range(0, 100, 4) for value in numbers[i + offset:i + offset + 2]]
    # Official tables are two columns; text extraction lists each column top-to-bottom.
    pairs = [(numbers[i], numbers[i + 1]) for i in range(0, len(numbers) - 1, 2)]
    scores = {str(n): score for n, score in pairs if 1 <= n <= count and 0 <= score <= 80}
    if len(scores) != count:
        raise ImportErrorWithContext(f"Score table has {len(scores)}/{count} entries")
    return scores


def _options(segment: str) -> tuple[str, list[str]]:
    matches = list(OPTION.finditer(segment))
    if [m.group(1) for m in matches] != ["A", "B", "C", "D"]:
        raise ImportErrorWithContext(f"Cannot extract exactly A/B/C/D from: {segment[:100]!r}")
    prompt = clean(segment[:matches[0].start()])
    choices = [clean(segment[m.end():matches[i + 1].start() if i + 1 < 4 else len(segment)]) for i, m in enumerate(matches)]
    if any(not choice for choice in choices):
        raise ImportErrorWithContext("Empty PDF answer choice")
    return prompt, choices


def normalize_printed_choice_labels(segment: str, number: int, page_number: int) -> tuple[str, str | None]:
    matches = list(OPTION.finditer(segment))
    if [match.group(1) for match in matches] != ["A", "B", "C", "C"]:
        return segment, None
    fourth = matches[-1]
    corrected = segment[:fourth.start(1)] + "D" + segment[fourth.end(1):]
    warning = f"Reading Q{number}, PDF page {page_number}: printed fourth option is labeled C; mapped by fourth position to D"
    return corrected, warning


def extract_listening_choices(data: bytes) -> dict[int, list[str]]:
    result: dict[int, list[str]] = {}
    for page in fitz.open(stream=data, filetype="pdf"):
        text = page.get_text()
        matches = list(QUESTION.finditer(text))
        for i, match in enumerate(matches):
            number = int(match.group(1))
            segment = text[match.end():matches[i + 1].start() if i + 1 < len(matches) else len(text)]
            try:
                _, choices = _options(segment)
            except ImportErrorWithContext:
                # Instruction pages sometimes contain a numbered sample question.
                # The final consecutive-number check still rejects a missing real question.
                continue
            if number in result:
                raise ImportErrorWithContext(f"Duplicate Listening Q{number}")
            result[number] = choices
    if sorted(result) != list(range(1, len(result) + 1)):
        raise ImportErrorWithContext("Listening PDF has missing question numbers")
    return result


def _page_lines(page):
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            text = clean("".join(span["text"] for span in line["spans"]))
            if text:
                lines.append((line["bbox"][0], line["bbox"][1], text))
    return lines


def _gap_page(page) -> tuple[str, dict[int, list[str]]]:
    lines = _page_lines(page)
    anchors = [(x, y, int(t[:-1])) for x, y, t in lines if re.fullmatch(r"\d{1,2}[.．]", t)]
    if not anchors:
        raise ImportErrorWithContext("Gap-filling page has no numbered choice columns")
    min_y = min(y for _, y, _ in anchors)
    passage = "".join(t for x, y, t in lines if y < min_y and not HEADING.fullmatch(t))
    if not passage:
        raise ImportErrorWithContext("Gap-filling passage is empty")
    choices: dict[int, list[str]] = {}
    ordered = sorted(anchors, key=lambda a: (a[1], a[0]))
    for x, y, number in ordered:
        same_column_next = [ny for nx, ny, _ in ordered if ny > y + 1 and abs(nx - x) < 50]
        end_y = min(same_column_next) if same_column_next else page.rect.height
        option_lines = [t for ox, oy, t in lines if y < oy < end_y and abs(ox - (x + 24)) < 60 and OPTION.match(t)]
        _, texts = _options("\n".join(option_lines))
        if number in choices:
            raise ImportErrorWithContext(f"Duplicate gap Q{number}")
        choices[number] = texts
    for number in sorted(choices, reverse=True):
        passage = re.sub(rf"(?<!\d)\s+{number}\s+(?!\d)", f"【{number}】", passage)
    return passage, choices


@dataclass
class ReadingExtract:
    questions: dict[int, dict]
    contexts: dict[str, str]
    images: dict[str, bytes]
    warnings: list[str]


def _semantic_image(page) -> bytes | None:
    found = []
    for image in page.get_images(full=True):
        rects = page.get_image_rects(image[0])
        if rects and max(r.get_area() for r in rects) > page.rect.get_area() * .025:
            found.append(image[0])
    found = list(dict.fromkeys(found))
    if len(found) > 1:
        raise ImportErrorWithContext("Multiple document images on one Reading page need explicit mapping")
    if not found:
        return None
    return embedded_png(page.parent, found[0])


def _vector_document_image(page, before_y: float | None = None) -> bytes | None:
    """Preserve a boxed document drawn as PDF vectors, including its text layout."""
    drawings = page.get_drawings()
    if not drawings:
        return None
    bounds = fitz.Rect()
    for drawing in drawings:
        bounds |= drawing["rect"]
    if bounds.width < 250 or bounds.height < 200 or bounds.get_area() < page.rect.get_area() * .15:
        return None
    clip = (bounds + (-3, -3, 3, 3)) & page.rect
    if before_y is not None and clip.y1 >= before_y - 4:
        return None
    return page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=clip, alpha=False).tobytes("png")


def extract_reading(data: bytes, variant: str) -> ReadingExtract:
    doc = fitz.open(stream=data, filetype="pdf")
    questions: dict[int, dict] = {}
    contexts: dict[str, str] = {}
    images: dict[str, bytes] = {}
    warnings: list[str] = []
    in_comprehension = False
    group_index = 0
    current_group = ""
    current_context = ""
    for page in doc:
        text = page.get_text()
        if "二、閱讀理解" in text:
            in_comprehension = True
            continue
        if not in_comprehension:
            if "一、選詞填空" in text or not HEADING.search(text):
                continue
            passage, rows = _gap_page(page)
            group_id = f"reading-g-q{min(rows):02d}-q{max(rows):02d}"
            contexts[group_id] = passage
            for number, choice_text in rows.items():
                if number in questions:
                    raise ImportErrorWithContext(f"Duplicate Reading Q{number}")
                questions[number] = {"type": "gap_filling", "stimulusGroupId": group_id, "choiceText": choice_text}
            continue
        first_comprehension = max(questions, default=0) + 1
        tokens = sorted([(m.start(), m.end(), "heading", None) for m in HEADING.finditer(text)] + [(m.start(), m.end(), "question", int(m.group(1))) for m in QUESTION.finditer(text) if int(m.group(1)) >= first_comprehension])
        semantic = _semantic_image(page)
        vector_document = False
        if not semantic:
            first_question_y = min((y for _, y, value in _page_lines(page) if (match := QUESTION.match(value)) and int(match.group(1)) >= first_comprehension), default=None)
            semantic = _vector_document_image(page, before_y=first_question_y)
            vector_document = semantic is not None
        if not tokens:
            if vector_document:
                current_context = ""
            if semantic:
                if not current_group:
                    group_index += 1
                    current_group = f"reading-g-{group_index:02d}"
                images[current_group] = semantic
            if clean(text):
                current_context += clean(text) + "\n"
            continue
        for i, (start, end, kind, number) in enumerate(tokens):
            segment = text[end:tokens[i + 1][0] if i + 1 < len(tokens) else len(text)]
            if kind == "heading":
                group_index += 1
                current_group = f"reading-g-{group_index:02d}"
                current_context = ""
                if semantic:
                    images[current_group] = semantic
                if not vector_document:
                    current_context += clean(segment) + "\n"
                continue
            if not current_group:
                group_index += 1
                current_group = f"reading-g-{group_index:02d}"
            if i == 0 and clean(text[:start]):
                current_context += clean(text[:start]) + "\n"
            if semantic and current_group not in images:
                images[current_group] = semantic
            segment, warning = normalize_printed_choice_labels(segment, number, page.number + 1)
            if warning:
                warnings.append(warning)
            try:
                prompt, choice_text = _options(segment)
            except ImportErrorWithContext as error:
                raise ImportErrorWithContext(f"Reading Q{number}, PDF page {page.number + 1}: {error}") from error
            if number in questions:
                raise ImportErrorWithContext(f"Duplicate Reading Q{number}")
            questions[number] = {"type": "reading_comprehension", "stimulusGroupId": current_group, "questionText": prompt, "choiceText": choice_text}
            contexts[current_group] = current_context.strip()
    if sorted(questions) != list(range(1, len(questions) + 1)):
        raise ImportErrorWithContext("Reading PDF has missing question numbers")
    for question in questions.values():
        group = question["stimulusGroupId"]
        if not contexts.get(group) and group not in images:
            raise ImportErrorWithContext(f"Reading group {group} has no passage or document image")
    return ReadingExtract(questions, contexts, images, warnings)


@dataclass
class TranscriptExtract:
    preface: str
    questions: dict[int, str]


def extract_transcript_layout(data: bytes, expected_count: int) -> TranscriptExtract:
    text = "\n".join(p.get_text() for p in fitz.open(stream=data, filetype="pdf"))
    matches = list(QUESTION.finditer(text))
    if not matches:
        matches = list(re.finditer(r"(?m)^\s*(\d{1,2})\s*$", text))
    if not matches:
        raise ImportErrorWithContext("Transcript has no numbered questions")
    # Some official scripts print the question list, then the dialogue, then
    # the same question list again. Keep the dialogue before the second list,
    # but only after checking that both printed lists are identical.
    while True:
        numbers = [int(match.group(1)) for match in matches]
        repeated = next((number for number in numbers if numbers.count(number) > 1), None)
        if repeated is None:
            break
        starts = [index for index, number in enumerate(numbers) if number == repeated]
        if len(starts) != 2:
            raise ImportErrorWithContext(f"Duplicate transcript Q{repeated}")
        first, second = starts
        width = 1
        while (first + width < second and second + width < len(numbers)
               and numbers[first + width] == repeated + width
               and numbers[second + width] == repeated + width):
            width += 1
        if any(numbers[first + offset] != numbers[second + offset] for offset in range(width)):
            raise ImportErrorWithContext(f"Duplicate transcript Q{repeated}")
        def segment(index: int) -> str:
            return text[matches[index].end():matches[index + 1].start() if index + 1 < len(matches) else len(text)]
        for offset in range(width):
            before = segment(first + offset)
            after = segment(second + offset)
            prompt_before = re.search(r"^[\s\S]*?[？?]", before)
            prompt_after = re.search(r"^[\s\S]*?[？?]", after)
            if not prompt_before or not prompt_after or clean(prompt_before.group()) != clean(prompt_after.group()):
                raise ImportErrorWithContext(f"Repeated transcript Q{repeated + offset} differs between question lists")
        last_first = segment(first + width - 1)
        prompt = re.search(r"^[\s\S]*?[？?]", last_first)
        passage = last_first[prompt.end():].strip()
        if not passage or second != first + width + 0:
            raise ImportErrorWithContext(f"Repeated transcript Q{repeated} has no separable dialogue")
        text = text[:matches[first].start()] + "\n" + passage + "\n" + text[matches[second].start():]
        matches = list(QUESTION.finditer(text))
    result = {}
    for i, match in enumerate(matches):
        n = int(match.group(1))
        if 1 <= n <= expected_count:
            if n in result:
                raise ImportErrorWithContext(f"Duplicate transcript Q{n}")
            result[n] = clean(text[match.end():matches[i + 1].start() if i + 1 < len(matches) else len(text)])
    if set(result) != set(range(1, expected_count + 1)):
        raise ImportErrorWithContext(f"Transcript maps {len(result)}/{expected_count} questions")
    return TranscriptExtract(clean(text[:matches[0].start()]), result)


def extract_transcripts(data: bytes, expected_count: int) -> dict[int, str]:
    return extract_transcript_layout(data, expected_count).questions

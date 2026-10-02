from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import fitz

from .discovery import ImportErrorWithContext

QUESTION = re.compile(r"(?m)^\s*(\d{1,2})\s*[.．、]\s*")
OPTION = re.compile(r"(?m)^\s*[（(]([A-D])[）)]\s*")
HEADING = re.compile(r"(?m)^\s*（[一二三四五六七八九十百]+）\s*$")


def clean(value: str) -> str:
    return re.sub(r"[ \t]+", " ", value).strip()


def extract_answers(data: bytes) -> dict[int, str]:
    text = "\n".join(page.get_text() for page in fitz.open(stream=data, filetype="pdf"))
    pairs = re.findall(r"(?m)^\s*(\d{1,2})\s*\n\s*([A-D])\s*$", text)
    answers = {int(number): answer for number, answer in pairs}
    if len(answers) != len(pairs) or sorted(answers) != list(range(1, len(answers) + 1)):
        raise ImportErrorWithContext("Answer key contains missing or duplicate question numbers")
    return answers


def extract_scores(data: bytes, count: int) -> dict[str, int]:
    text = "\n".join(page.get_text() for page in fitz.open(stream=data, filetype="pdf"))
    numbers = [int(x) for x in re.findall(r"(?m)^\s*(\d{1,3})\s*$", text)]
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
    pix = fitz.Pixmap(page.parent, found[0])
    if pix.colorspace not in (fitz.csRGB, fitz.csGRAY) or pix.alpha:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    return pix.tobytes("png")


def extract_reading(data: bytes, variant: str) -> ReadingExtract:
    doc = fitz.open(stream=data, filetype="pdf")
    questions: dict[int, dict] = {}
    contexts: dict[str, str] = {}
    images: dict[str, bytes] = {}
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
        if not tokens:
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
                current_context += clean(segment) + "\n" if not (i + 1 < len(tokens) and tokens[i + 1][2] == "question") else clean(segment) + "\n"
                continue
            if not current_group:
                group_index += 1
                current_group = f"reading-g-{group_index:02d}"
            if i == 0 and clean(text[:start]):
                current_context += clean(text[:start]) + "\n"
            if semantic and current_group not in images:
                images[current_group] = semantic
            prompt, choice_text = _options(segment)
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
    return ReadingExtract(questions, contexts, images)


def extract_transcripts(data: bytes, expected_count: int) -> dict[int, str]:
    text = "\n".join(p.get_text() for p in fitz.open(stream=data, filetype="pdf"))
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
    return result

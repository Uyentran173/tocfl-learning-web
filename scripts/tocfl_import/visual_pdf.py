"""Position-aware extraction of official image questions without OCR."""
from __future__ import annotations

import re
from dataclasses import dataclass

import fitz

from .discovery import ImportErrorWithContext

NUMBER = re.compile(r"^\s*(\d{1,2})\s*[.．、]")
CHOICE = re.compile(r"[（(]([A-F])[）)]\s*")


@dataclass
class VisualExtract:
    questions: dict[int, dict]
    contexts: dict[str, str]
    images: dict[str, bytes]


def _png(doc: fitz.Document, xref: int) -> bytes:
    pix = fitz.Pixmap(doc, xref)
    if pix.colorspace not in (fitz.csRGB, fitz.csGRAY) or pix.alpha:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    return pix.tobytes("png")


def _lines(page):
    result = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            value = "".join(span["text"] for span in line["spans"]).strip()
            if value:
                result.append((line["bbox"][0], line["bbox"][1], value))
    return sorted(result, key=lambda item: (item[1], item[0]))


def _images(page):
    found = []
    for xref in dict.fromkeys(image[0] for image in page.get_images(full=True)):
        for rect in page.get_image_rects(xref):
            if rect.width > 35 and rect.height > 35 and rect.get_area() < page.rect.get_area() * .8:
                found.append((rect, xref))
    return sorted(found, key=lambda item: (item[0].y0, item[0].x0))


def _choice_text(segment: str, labels: list[str]) -> tuple[str, list[str]]:
    matches = list(CHOICE.finditer(segment))
    if [match.group(1) for match in matches] != labels:
        raise ImportErrorWithContext(f"Choice labels {labels} not extractable from {segment[:80]!r}")
    prompt = segment[:matches[0].start()].strip()
    values = [segment[match.end():matches[index + 1].start() if index + 1 < len(matches) else len(segment)].strip() for index, match in enumerate(matches)]
    return prompt, values


def _novice_print_line(value: str) -> str:
    """The Novice PDFs print an annotated duplicate under the source sentence."""
    lines = [line.strip() for line in value.splitlines() if re.search(r"[\u3400-\u9fff]", line)]
    return lines[-1] if lines else value.strip()


def _shared_gap_pool(text: str, first: int) -> tuple[str, list[str]]:
    matches = list(CHOICE.finditer(text))
    if [match.group(1) for match in matches] != list("ABCDEF"):
        raise ImportErrorWithContext(f"Reading Q{first}–{first + 4} shared six-choice pool is ambiguous")
    passage = text[:matches[0].start()].strip()
    markers = [int(value) for value in re.findall(r"[（(]\s*(\d{1,2})\s*[）)]", passage)]
    if markers != list(range(first, first + 5)):
        raise ImportErrorWithContext(f"Reading Q{first}–{first + 4} passage gaps are ambiguous")
    choices = [text[match.end():matches[i + 1].start() if i + 1 < len(matches) else len(text)].strip() for i, match in enumerate(matches)]
    if any(not choice for choice in choices):
        raise ImportErrorWithContext(f"Reading Q{first}–{first + 4} choice pool is incomplete")
    return passage, choices


def extract_image_paper(data: bytes, skill: str, band: str, expected_count: int) -> VisualExtract:
    """Map numbered questions to embedded images using their PDF page coordinates.

    Printed instruction examples are skipped by consecutive-number validation.
    Any mapping that cannot be established from the page geometry fails closed.
    """
    doc = fitz.open(stream=data, filetype="pdf")
    questions: dict[int, dict] = {}
    contexts: dict[str, str] = {}
    images: dict[str, bytes] = {}
    expected = 1
    for page in doc:
        page_text = page.get_text()
        if any(marker in page_text for marker in ("說明：", "說明:", "说明：", "说明:")):
            continue
        if skill == "reading" and band == "A" and expected == 36 and all(f"（{n}）" in page_text for n in range(36, 46)):
            second = list(re.finditer(r"(?m)^.*（41）.*$", page_text))
            if len(second) != 1:
                raise ImportErrorWithContext("Reading Q36–45 passage boundary is ambiguous")
            for first, text in ((36, page_text[:second[0].start()]), (41, page_text[second[0].start():])):
                passage, choices = _shared_gap_pool(text, first)
                group = f"reading-q{first}-q{first + 4}"
                contexts[group] = passage
                for number in range(first, first + 5):
                    questions[number] = {"number": number, "type": "gap_filling", "choices": list("ABCDEF"), "questionText": "", "choiceText": choices, "stimulusGroupId": group}
            expected = 46
            continue
        if skill == "reading" and band == "A" and expected == 41 and all(f"（{n}）" in page_text for n in range(41, 46)):
            passage, choices = _shared_gap_pool(page_text, 41)
            group = "reading-q41-q45"
            contexts[group] = passage
            for number in range(41, 46):
                questions[number] = {"number": number, "type": "gap_filling", "choices": list("ABCDEF"), "questionText": "", "choiceText": choices, "stimulusGroupId": group}
            expected = 46
            continue
        if skill == "reading" and band == "A" and expected >= 46:
            pieces = re.split(r"(?m)^\s*[（(][一二三四五][）)]\s*$", page_text)
            for piece in pieces:
                match = re.search(r"(?m)^\s*(4[6-9]|50)\s*[.．、]", piece)
                if not match:
                    continue
                number = int(match.group(1))
                if number != expected:
                    raise ImportErrorWithContext(f"Reading passage order expected Q{expected}, found Q{number}")
                passage = piece[:match.start()].strip()
                prompt, choices = _choice_text(piece[match.end():], list("ABCD"))
                if not passage or not prompt or any(not value for value in choices):
                    raise ImportErrorWithContext(f"Reading Q{number} passage/question/options are incomplete")
                group = f"reading-q{number:02d}"
                contexts[group] = passage
                questions[number] = {"number": number, "type": "reading_comprehension", "choices": list("ABCD"), "questionText": prompt, "choiceText": choices, "stimulusGroupId": group}
                expected += 1
            if expected > expected_count:
                break
            continue
        lines = _lines(page)
        raw_anchors = list(re.finditer(r"(?m)^\s*(\d{1,2})\s*[.．、]", page_text))
        anchors = [(x, y, int(match.group(1))) for x, y, text in lines if (match := NUMBER.match(text)) and int(match.group(1)) <= expected_count]
        fresh = sorted({n for _, _, n in anchors if n >= expected})
        if not fresh or fresh[0] != expected or fresh != list(range(expected, fresh[-1] + 1)):
            continue
        numbers = fresh
        positions = {n: min(y for _, y, m in anchors if m == n) for n in numbers}
        ordered = sorted(numbers, key=lambda n: positions[n])
        page_images = _images(page)
        full_page_image = any(rect.get_area() >= page.rect.get_area() * .8 for image in page.get_images(full=True) for rect in page.get_image_rects(image[0]))
        if full_page_image and page_images:
            raise ImportErrorWithContext(f"{skill} PDF page {page.number + 1} mixes a page-sized raster and smaller images; image mapping is ambiguous")
        full_page_key = f"shared-page-p{page.number + 1}"
        if full_page_image and not page_images:
            images[full_page_key] = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False).tobytes("png")
        shared = len(page_images) == 1 and len(numbers) > 1
        shared_key = f"shared-p{page.number + 1}-q{min(numbers):02d}-q{max(numbers):02d}"
        if shared:
            images[shared_key] = _png(doc, page_images[0][1])
        for index, number in enumerate(ordered):
            start = positions[number]
            end = positions[ordered[index + 1]] if index + 1 < len(ordered) else page.rect.height - 25
            segment = "\n".join(text for _, y, text in lines if start - 1 <= y < end)
            segment = NUMBER.sub("", segment, count=1).strip()
            raw_match = next((i for i, match in enumerate(raw_anchors) if int(match.group(1)) == number), None)
            if raw_match is not None:
                match = raw_anchors[raw_match]
                raw_segment = page_text[match.end():raw_anchors[raw_match + 1].start() if raw_match + 1 < len(raw_anchors) else len(page_text)].strip()
                if [choice.group(1) for choice in CHOICE.finditer(raw_segment)] in (list("ABC"), list("ABCD")):
                    segment = raw_segment
            relevant = sorted([(rect, xref) for rect, xref in page_images if start - 1 <= (rect.y0 + rect.y1) / 2 < end], key=lambda pair: (pair[0].y0, pair[0].x0))
            if shared:
                relevant = []
            printed_labels = [choice.group(1) for choice in CHOICE.finditer(segment)]
            labels = printed_labels if printed_labels in (list("ABC"), list("ABCD")) else (list("ABCD") if band == "A" and ((skill == "listening" and number >= 41) or (skill == "reading" and number >= 46)) else list("ABC"))
            if skill == "listening" and (band == "Novice" or number <= 10 or (len(relevant) == 1 and not CHOICE.search(segment))):
                prompt, choices = "", [""] * len(labels)
            else:
                try:
                    prompt, choices = _choice_text(segment, labels)
                except ImportErrorWithContext:
                    if len(relevant) == len(labels) or full_page_image and not page_images:
                        prompt, choices = segment.split("(A)")[0].strip(), [""] * len(labels)
                    else:
                        raise ImportErrorWithContext(f"{skill} Q{number} page {page.number + 1}: cannot map printed choices")
            if band == "Novice" and skill == "reading":
                prompt = _novice_print_line(prompt)
                choices = [_novice_print_line(value) if value else value for value in choices]
            record = {"number": number, "type": "reading_comprehension" if skill == "reading" else "listening_multiple_choice", "choices": labels, "questionText": prompt if skill == "reading" else "", "choiceText": choices}
            if shared:
                record["imageKey"] = shared_key
            elif full_page_image and not page_images:
                record["imageKey"] = full_page_key
                record["visual"] = {"prompt": {"x": 0, "y": max(0, int(start * 2 - 8)), "width": int(page.rect.width * 2), "height": int((end - start) * 2), "sourceWidth": int(page.rect.width * 2), "sourceHeight": int(page.rect.height * 2), "maxWidth": 1100}, "choices": []}
                record["questionText"] = ""
                record["choiceText"] = [""] * len(labels)
            elif len(relevant) == len(labels) and all(not value for value in choices):
                keys = []
                for choice_index, (_, xref) in enumerate(sorted(relevant, key=lambda item: item[0].x0)):
                    key = f"q{number:02d}-choice-{labels[choice_index]}"
                    images[key] = _png(doc, xref)
                    keys.append(key)
                record["choiceImageKeys"] = keys
            elif len(relevant) == 1:
                key = f"q{number:02d}-image"
                images[key] = _png(doc, relevant[0][1])
                record["imageKey"] = key
            elif relevant:
                raise ImportErrorWithContext(f"{skill} Q{number} page {page.number + 1}: {len(relevant)} images cannot map to {len(labels)} choices")
            if skill == "reading":
                group = record.get("imageKey", f"reading-q{number:02d}")
                record["stimulusGroupId"] = group
                contexts[group] = ""
            questions[number] = record
        expected = fresh[-1] + 1
        if expected > expected_count:
            break
    if set(questions) != set(range(1, expected_count + 1)):
        missing = sorted(set(range(1, expected_count + 1)) - set(questions))
        raise ImportErrorWithContext(f"{skill} {band} PDF has unmapped question numbers: {missing}")
    return VisualExtract(questions, contexts, images)

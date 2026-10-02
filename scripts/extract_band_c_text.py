"""Draft text fields from the supplied Band C image assets for human review.

The draft is never published by this script. OCR must be checked against the
original images before it is copied into the structured test package.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "data/structured-tests/band-c-test-01.json"


def source_rows(ocr, asset, crop):
    rows = ocr.get(str(ROOT / "public" / asset.lstrip("/"))) or ocr.get("public" + asset)
    if rows is None:
        raise KeyError(asset)
    width, height = crop["sourceWidth"], crop["sourceHeight"]
    x0, y0 = crop["x"] / width, crop["y"] / height
    x1, y1 = (crop["x"] + crop["width"]) / width, (crop["y"] + crop["height"]) / height
    return [row for row in rows if x0 <= row["x"] + row["width"] / 2 <= x1 and y0 <= row["y"] + row["height"] / 2 <= y1]


def combine(rows, paragraph=True):
    lines = []
    for row in sorted(rows, key=lambda value: (value["y"], value["x"])):
        if lines and abs(row["y"] - lines[-1][0]) < 0.008:
            lines[-1][1].append(row)
        else:
            lines.append([row["y"], [row]])
    output = []
    intervals = [lines[index][0] - lines[index - 1][0] for index in range(1, len(lines))]
    typical = sorted(intervals)[len(intervals) // 2] if intervals else 1
    for index, (y, pieces) in enumerate(lines):
        if index and paragraph and y - lines[index - 1][0] > typical * 1.65:
            output.append("\n\n")
        elif index and paragraph:
            output.append("")
        output.append("".join(piece["text"] for piece in sorted(pieces, key=lambda value: value["x"])))
    return "".join(output).strip()


def choice_text(rows):
    text = combine(rows, paragraph=False)
    return re.sub(r"^[（(]?\s*[A-DＡ-Ｄ]\s*[）).]?\s*", "", text).strip(" ·•")


def main():
    ocr = json.load(open(sys.argv[1], encoding="utf-8"))
    package = json.load(open(PACKAGE, encoding="utf-8"))
    results = {"reading": {}, "listening": {}}
    for skill in results:
        for question in package["components"][skill]["questions"]:
            entry = {}
            for script in ("traditional", "simplified"):
                asset = question["assets"][script]
                visual = question["visual"][script]
                context = combine(source_rows(ocr, asset, visual["context"])) if visual.get("context") else ""
                prompt = combine(source_rows(ocr, asset, visual["prompt"]), paragraph=False) if visual.get("prompt") else ""
                prompt = re.sub(r"^\s*\d{1,2}\s*[.．]\s*", "", prompt)
                choices = [choice_text(source_rows(ocr, asset, crop)) for crop in visual["choices"]]
                entry[script] = {"context": context, "prompt": prompt, "choices": choices}
            results[skill][question["id"]] = entry
    json.dump(results, sys.stdout, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()

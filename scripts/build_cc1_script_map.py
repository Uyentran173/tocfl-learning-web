"""Build a small, checked script map for Academy teaching copy.

Imported TOCFL tests keep their own explicit variants. Academy dialogue and
vocabulary also keep their reviewed variants; this map covers authored prompts,
grammar notes, and feedback that mix Vietnamese with Chinese characters.
"""

import json
from pathlib import Path

from opencc import OpenCC


ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "academy"
convert = OpenCC("tw2s")


def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)


sources = [
    load("cc1-source-content.json"),
    load("cc1-dialogues.json"),
    load("cc1-vocabulary.json"),
    load("cc1-grammar.json"),
    load("cc1-lessons.json"),
]
characters = {ch for source in sources for value in strings(source) for ch in value if "\u3400" <= ch <= "\u9fff"}
character_map = {ch: convert.convert(ch) for ch in sorted(characters) if convert.convert(ch) != ch}

# Contextual OpenCC conversions cannot always be represented by single letters.
phrase_map = {}
paired = []
for lesson in load("cc1-dialogues.json")["lessons"]:
    for dialogue in lesson["dialogues"]:
        paired.extend((turn["traditional"], turn["simplified"]) for turn in dialogue["turns"])
for lesson in load("cc1-vocabulary.json")["lessons"]:
    paired.extend((word["traditional"], word["simplified"]) for word in lesson["records"])
for traditional, simplified in paired:
    by_character = "".join(character_map.get(ch, ch) for ch in traditional)
    if by_character == simplified:
        continue
    if convert.convert(traditional) != simplified:
        raise ValueError(f"Reviewed variant differs from OpenCC: {traditional} → {simplified}")
    if len(traditional) <= 8:
        phrase_map[traditional] = simplified
    elif "計畫" in traditional and "计划" in simplified:
        phrase_map["計畫"] = "计划"
    else:
        raise ValueError(f"Contextual script mapping needs review: {traditional}")

output = {"characters": character_map, "phrases": dict(sorted(phrase_map.items(), key=lambda item: -len(item[0])))}
(DATA / "cc1-script-map.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Mapped {len(character_map)} characters and {len(phrase_map)} contextual phrases.")

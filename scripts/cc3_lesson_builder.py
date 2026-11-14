"""Shared writer for reviewed Contemporary Chinese Volume 3 lesson content."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from opencc import OpenCC
from pypinyin import Style, lazy_pinyin

ROOT = Path(__file__).resolve().parents[1]
CONVERT = OpenCC("tw2s")


def simplified(value: str) -> str:
    return CONVERT.convert(value).replace("穿著", "穿着").replace("拿著", "拿着").replace("站著", "站着").replace("推著", "推着")


def sentence(chinese: str, meaning: str) -> dict:
    return {"chinese": chinese, "simplified": simplified(chinese),
            "pinyin": " ".join(lazy_pinyin(chinese, style=Style.TONE, errors=lambda value: list(value))),
            "meaningVi": meaning}


def make_question(prefix: str, group: str, number: int, data: tuple, **extra) -> dict:
    prompt, correct, wrong, feedback, skill = data
    choices = [correct, *wrong]
    offset = int(hashlib.sha256(f"{prefix}-{group}-{number}".encode()).hexdigest()[:8], 16) % len(choices)
    choices = choices[offset:] + choices[:offset]
    return {"id": f"{prefix}-{group}-{number:02d}", "prompt": prompt,
            "options": [{"id": "abcd"[i], "text": text} for i, text in enumerate(choices)],
            "correctOptionId": "abcd"[choices.index(correct)], "feedback": feedback, "skill": skill, **extra}


def all_strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from all_strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from all_strings(item)


def write_spec(spec: dict) -> None:
    number = spec["number"]
    key = f"{number:02d}"
    prefix = f"cc3-v3-l{key}"
    vocab = json.loads((ROOT / f"data/academy/cc3-lesson{key}-vocabulary.json").read_text())
    grammar = []
    for i, (title, explanation, structure, first, second, mistake, blank, correct, wrong) in enumerate(spec["grammar"], 1):
        grammar.append({"id": f"{prefix}-grammar-{i:02d}", "title": title,
                        "audioTrackId": f"cc3-textbook-l{key}-t{i + 4:02d}",
                        "explanation": explanation, "structure": structure,
                        "examples": [sentence(*first), sentence(*second)], "commonMistake": mistake,
                        "check": make_question(prefix, "grammar-check", i, (f"Điền: {blank}", correct, wrong, explanation.split(".")[0] + ".", "Ngữ pháp"))})
    lesson = {
        "contentVersion": 2, "id": prefix, "title": spec["title"], "titleVi": spec["titleVi"],
        "description": spec["description"], "objectives": spec["objectives"], "estimatedMinutes": None,
        "lecture": {
            "introduction": spec["introduction"],
            "sections": [{"id": f"{prefix}-section-{i:02d}", "title": title, "body": body, **sentence(chinese, vi)}
                         for i, (title, body, chinese, vi) in enumerate(spec["sections"], 1)],
            "dialogues": [
                {"id": f"{prefix}-dialogue", "title": spec["dialogueTitle"], "context": spec["dialogueContext"],
                 "audioTrackId": f"cc3-textbook-l{key}-t01",
                 "turns": [{"speaker": who, **sentence(chinese, vi)} for who, chinese, vi in spec["dialogue"]]},
                {"id": f"{prefix}-reading", "title": spec["readingTitle"], "context": spec["readingContext"],
                 "audioTrackId": f"cc3-textbook-l{key}-t03",
                 "turns": [{"speaker": "Bài đọc", **sentence(chinese, vi)} for chinese, vi in spec["reading"]]},
            ],
            "checks": [make_question(prefix, "check", i, row) for i, row in enumerate(spec["checks"], 1)],
            "pronunciation": [], "culture": [],
        },
        "vocabulary": {
            "introduction": "Chạm vào từ để xem phiên âm, nghĩa và ví dụ.",
            "wordIds": [row["id"] for row in vocab["records"]],
            "audioTracks": [{"id": f"cc3-textbook-l{key}-t02", "label": "Từ vựng hội thoại"},
                            {"id": f"cc3-textbook-l{key}-t04", "label": "Từ vựng bài đọc"}],
        },
        "grammar": grammar,
        "listening": [make_question(prefix, "listening", i, row[:5], audioTrackId=f"cc3-textbook-l{key}-t{row[5]:02d}")
                      for i, row in enumerate(spec["listening"], 1)],
        "practice": [make_question(prefix, "practice", i, row) for i, row in enumerate(spec["practice"], 1)],
        "assessment": [make_question(prefix, "assessment", i, row) for i, row in enumerate(spec["assessment"], 1)],
        "writingTask": {"id": f"{prefix}-writing", "title": spec["writingTitle"], "prompt": spec["writingPrompt"],
                        "sampleTraditional": spec["writingSample"],
                        "sampleSimplified": simplified(spec["writingSample"])},
    }
    if len(spec["practice"]) < 8 or len(spec["assessment"]) < 10 or len(spec["listening"]) < 4:
        raise ValueError("Lesson exercises are incomplete")
    (ROOT / f"data/academy/cc3-lesson{key}.json").write_text(json.dumps(lesson, ensure_ascii=False, indent=2) + "\n")
    reviewed_path = ROOT / "data/academy/cc3-reviewed-content.json"
    reviewed = json.loads(reviewed_path.read_text())
    reviewed.update({
        f"cc3-textbook-l{key}-t01": {
            "transcriptTraditional": "\n".join(f"{who}：{chinese}" for who, chinese, _ in spec["dialogue"]),
            "transcriptSimplified": "\n".join(f"{simplified(who)}：{simplified(chinese)}" for who, chinese, _ in spec["dialogue"]),
            "translationVi": "\n".join(f"{who}：{vi}" for who, _, vi in spec["dialogue"]),
        },
        f"cc3-textbook-l{key}-t03": {
            "transcriptTraditional": "\n\n".join(chinese for chinese, _ in spec["reading"]),
            "transcriptSimplified": "\n\n".join(simplified(chinese) for chinese, _ in spec["reading"]),
            "translationVi": "\n\n".join(vi for _, vi in spec["reading"]),
        },
    })
    reviewed_path.write_text(json.dumps(reviewed, ensure_ascii=False, indent=2) + "\n")
    script_path = ROOT / "data/academy/cc3-script-map.json"
    script_map = json.loads(script_path.read_text())
    script_map.update({c: CONVERT.convert(c) for c in set("".join(all_strings(lesson)) + "".join(all_strings(vocab)))
                       if CONVERT.convert(c) != c})
    script_path.write_text(json.dumps(script_map, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {prefix}: {len(spec['dialogue'])} turns, {len(spec['reading'])} reading paragraphs, "
          f"{len(vocab['records'])} words, {len(grammar)} grammar points")

"""Build reviewed Volume 2 lesson vocabulary records from the edited TSV."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

from opencc import OpenCC


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_COUNTS = {1: 44, 2: 46, 3: 41, 4: 45, 5: 44, 6: 48, 7: 42, 8: 36, 9: 42, 10: 45}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lesson", type=int, choices=EXPECTED_COUNTS, default=1)
    lesson = parser.parse_args().lesson
    source = ROOT / f"data/academy/cc2-lesson{lesson:02d}-vocabulary.tsv"
    target = ROOT / f"data/academy/cc2-lesson{lesson:02d}-vocabulary.json"
    convert = OpenCC("tw2s")
    def simplified(value: str) -> str:
        # OpenCC keeps 穿著 in a few longer noun phrases although the simplified verb is 穿着.
        return convert.convert(value).replace("穿著", "穿着")
    with source.open(newline="") as stream:
        rows = list(csv.DictReader(stream, delimiter="\t"))
    if len(rows) != EXPECTED_COUNTS[lesson] or len({row["traditional"] for row in rows}) != len(rows):
        raise ValueError(f"Lesson {lesson:02d} must contain {EXPECTED_COUNTS[lesson]} distinct source vocabulary entries")
    result = []
    for number, row in enumerate(rows, 1):
        if not all(row.values()):
            raise ValueError(f"Missing vocabulary field at row {number}")
        result.append({
            "id": f"cc2-v2-l{lesson:02d}-v{number:03d}",
            "traditional": row["traditional"],
            "simplified": simplified(row["traditional"]),
            "pinyin": row["pinyin"],
            "wordClass": row["wordClass"],
            "meaningVi": row["meaningVi"],
            "exampleTraditional": row["exampleTraditional"],
            "exampleSimplified": simplified(row["exampleTraditional"]),
            "exampleVi": row["exampleVi"],
        })
    target.write_text(json.dumps({"lessonId": f"cc2-v2-l{lesson:02d}", "records": result}, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {len(result)} vocabulary records")


if __name__ == "__main__":
    main()

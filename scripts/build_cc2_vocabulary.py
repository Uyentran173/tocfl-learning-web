"""Build reviewed Volume 2 Lesson 01 vocabulary records from the edited TSV."""

from __future__ import annotations

import csv
import json
from pathlib import Path

from opencc import OpenCC


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/academy/cc2-lesson01-vocabulary.tsv"
TARGET = ROOT / "data/academy/cc2-lesson01-vocabulary.json"


def main() -> None:
    convert = OpenCC("tw2s")
    with SOURCE.open(newline="") as stream:
        rows = list(csv.DictReader(stream, delimiter="\t"))
    if len(rows) != 44 or len({row["traditional"] for row in rows}) != len(rows):
        raise ValueError("Lesson 01 must contain 44 distinct source vocabulary entries")
    result = []
    for number, row in enumerate(rows, 1):
        if not all(row.values()):
            raise ValueError(f"Missing vocabulary field at row {number}")
        result.append({
            "id": f"cc2-v2-l01-v{number:03d}",
            "traditional": row["traditional"],
            "simplified": convert.convert(row["traditional"]),
            "pinyin": row["pinyin"],
            "wordClass": row["wordClass"],
            "meaningVi": row["meaningVi"],
            "exampleTraditional": row["exampleTraditional"],
            "exampleSimplified": convert.convert(row["exampleTraditional"]),
            "exampleVi": row["exampleVi"],
        })
    TARGET.write_text(json.dumps({"lessonId": "cc2-v2-l01", "records": result}, ensure_ascii=False, indent=2) + "\n")
    print(f"Built {len(result)} vocabulary records")


if __name__ == "__main__":
    main()

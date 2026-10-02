"""Translate validated TOCFL examples to Vietnamese and publish a separate data file.

The original TOCFL import is never modified. Run only after the candidate set is
complete; --allow-partial is for a temporary preview, never for publishing.
"""

import argparse
import json
import re
import subprocess
import sys
import time
from pathlib import Path

from opencc import OpenCC

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/vocabulary/tocfl-imported.json"
DEFAULT_CANDIDATES = Path("/tmp/tocfl-enrichment-candidates.json")
DEFAULT_OUTPUT = ROOT / "data/vocabulary/tocfl-enrichment.json"
DEFAULT_OVERRIDES = ROOT / "data/vocabulary/tocfl-enrichment-overrides.json"
CONVERT = OpenCC("tw2s")
HANZI = re.compile(r"[\u3400-\u9fff]")


def translate(lines, source_language):
    if not lines:
        return []
    command = [
        "curl", "-sS", "--fail", "--retry", "3", "--max-time", "45", "-G",
        "https://translate.googleapis.com/translate_a/single",
        "--data-urlencode", "client=gtx", "--data-urlencode", f"sl={source_language}",
        "--data-urlencode", "tl=vi", "--data-urlencode", "dt=t",
        "--data-urlencode", f"q={'\n'.join(lines)}",
    ]
    for attempt in range(4):
        process = subprocess.run(command, text=True, capture_output=True, check=False)
        if process.returncode == 0:
            try:
                payload = json.loads(process.stdout)
                translated = "".join(part[0] for part in payload[0]).splitlines()
                if len(translated) == len(lines) and all(item.strip() for item in translated):
                    return [item.strip() for item in translated]
            except (ValueError, TypeError, IndexError):
                pass
        time.sleep(1.5 * (attempt + 1))
    if len(lines) == 1:
        raise RuntimeError(f"Could not translate one {source_language} line: {lines[0][:80]}")
    midpoint = len(lines) // 2
    return translate(lines[:midpoint], source_language) + translate(lines[midpoint:], source_language)


def clean_meaning(text):
    text = text.strip().rstrip(".。; ")
    text = re.sub(r"(?i)(^|[;,]\s*)để\s+", r"\1", text)
    text = re.sub(r"\s+", " ", text)
    return text


def clean_sentence(text, original):
    text = text.strip().replace("。", ".").replace("？", "?").replace("！", "!")
    text = re.sub(r"\s+", " ", text)
    if text and text[-1] not in ".?!":
        text += "?" if original.endswith("？") else "!" if original.endswith("！") else "."
    if text:
        text = text[0].upper() + text[1:]
    return text


def publish(path, dataset_id, entries):
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps({"datasetId": dataset_id, "entries": entries}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    temporary.replace(path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidates", type=Path, default=DEFAULT_CANDIDATES)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--overrides", type=Path, default=DEFAULT_OVERRIDES)
    parser.add_argument("--base-enrichment", type=Path, help="Preserve already published or translated entries by stable ID")
    parser.add_argument("--reviewed-file", type=Path)
    parser.add_argument("--allow-partial", action="store_true")
    parser.add_argument("--batch-size", type=int, default=35)
    args = parser.parse_args()
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    candidates = json.loads(args.candidates.read_text(encoding="utf-8"))
    dataset_id = source["datasets"][0]["datasetId"]
    if candidates["datasetId"] != dataset_id:
        raise ValueError("candidate dataset ID does not match official source")
    overrides = json.loads(args.overrides.read_text(encoding="utf-8")) if args.overrides.exists() else {"datasetId": dataset_id, "entries": {}}
    if overrides["datasetId"] != dataset_id:
        raise ValueError("override dataset ID does not match official source")
    reviewed_ids = None
    if args.reviewed_file:
        reviewed = json.loads(args.reviewed_file.read_text(encoding="utf-8"))
        if reviewed["datasetId"] != dataset_id:
            raise ValueError("reviewed dataset ID does not match official source")
        reviewed_ids = set(reviewed["ids"])
        if reviewed_ids - {record["id"] for record in source["records"]}:
            raise ValueError("reviewed list contains unknown IDs")
        if reviewed_ids - candidates["entries"].keys():
            raise ValueError("reviewed list contains IDs without candidates")
    records = [record for record in source["records"] if record["id"] in (reviewed_ids if reviewed_ids is not None else candidates["entries"])]
    if reviewed_ids is None and len(records) != len(source["records"]) and not args.allow_partial:
        raise ValueError(f"Refusing to publish: {len(records)} / {len(source['records'])} candidate records")
    if args.allow_partial and args.output == DEFAULT_OUTPUT:
        raise ValueError("Partial preview requires a different --output path")
    base = json.loads(args.base_enrichment.read_text(encoding="utf-8")) if args.base_enrichment else {"datasetId": dataset_id, "entries": {}}
    if base["datasetId"] != dataset_id:
        raise ValueError("base enrichment dataset ID does not match official source")
    entries = {record["id"]: base["entries"][record["id"]] for record in records if record["id"] in base["entries"]}
    pending = [record for record in records if record["id"] not in entries]
    print(f"Translating {len(pending)} records; preserving {len(entries)}", flush=True)
    errors = []
    for offset in range(0, len(pending), args.batch_size):
        batch = pending[offset : offset + args.batch_size]
        raw = [candidates["entries"][record["id"]] for record in batch]
        meanings = translate([item["meaningEn"] for item in raw], "en")
        examples = translate([item["exampleTraditional"] for item in raw], "zh-TW")
        for record, candidate, meaning, example in zip(batch, raw, meanings, examples):
            traditional = candidate["exampleTraditional"].strip()
            simplified = CONVERT.convert(traditional)
            entry = {
                "meaningVi": clean_meaning(meaning),
                "exampleTraditional": traditional,
                "exampleSimplified": simplified,
                "exampleVi": clean_sentence(example, traditional),
            }
            if candidate.get("exampleSource"):
                entry["exampleSource"] = candidate["exampleSource"]
            entry.update(overrides["entries"].get(record["id"], {}))
            entry["exampleSimplified"] = CONVERT.convert(entry["exampleTraditional"])
            for key in ("meaningVi", "exampleTraditional", "exampleSimplified", "exampleVi"):
                if not entry[key] or (key.endswith("Vi") and HANZI.search(entry[key])):
                    errors.append(f"{record['id']}: invalid {key}")
            entries[record["id"]] = entry
        if args.output != DEFAULT_OUTPUT:
            publish(args.output, dataset_id, entries)
        print(f"{min(offset + len(batch), len(pending))}/{len(pending)} translated", flush=True)
    if errors:
        for error in errors[:100]:
            print("ERROR:", error, file=sys.stderr)
        sys.exit(1)
    publish(args.output, dataset_id, entries)
    print(f"Published {len(entries)} records to {args.output}", flush=True)


if __name__ == "__main__":
    main()

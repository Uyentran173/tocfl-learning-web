"""Translate TOCFL enrichment drafts locally with M2M100 and preserve Novice.

Requires torch, transformers 4.x, sentencepiece and an offline M2M100 model.
Writes a resumable preview file; copy into the app only after validation.
"""

import argparse
import json
import re
from pathlib import Path

import torch
from opencc import OpenCC
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/vocabulary/tocfl-imported.json"
OVERRIDES = ROOT / "data/vocabulary/tocfl-enrichment-overrides.json"
HANZI = re.compile(r"[\u3400-\u9fff]")
CONVERT = OpenCC("tw2s")


def save(path, dataset_id, entries):
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps({"datasetId": dataset_id, "entries": entries}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    temporary.replace(path)


def translate(model, tokenizer, lines, source_language, device):
    tokenizer.src_lang = source_language
    encoded = tokenizer(lines, padding=True, truncation=True, max_length=160, return_tensors="pt").to(device)
    with torch.inference_mode():
        output = model.generate(**encoded, forced_bos_token_id=tokenizer.get_lang_id("vi"), max_new_tokens=100, num_beams=2)
    return [text.strip() for text in tokenizer.batch_decode(output, skip_special_tokens=True)]


def clean_meaning(value):
    value = value.strip().rstrip(".; ")
    value = re.sub(r"(?i)^để\s+", "", value)
    return value[:1].lower() + value[1:] if value else value


def clean_example(value, original):
    value = re.sub(r"\s+", " ", value.strip()).replace("。", ".").replace("？", "?").replace("！", "!")
    if value and value[-1] not in ".?!":
        value += "?" if original.endswith("？") else "!" if original.endswith("！") else "."
    return value[:1].upper() + value[1:] if value else value


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--candidates", type=Path, required=True)
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--batch-size", type=int, default=16)
    args = parser.parse_args()
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    candidates = json.loads(args.candidates.read_text(encoding="utf-8"))
    base = json.loads(args.base.read_text(encoding="utf-8"))
    overrides = json.loads(OVERRIDES.read_text(encoding="utf-8"))["entries"]
    dataset_id = source["datasets"][0]["datasetId"]
    if candidates["datasetId"] != dataset_id or base["datasetId"] != dataset_id:
        raise ValueError("Mismatched dataset ID")
    entries = dict(base["entries"])
    pending = [record for record in source["records"] if record["id"] in candidates["entries"] and record["id"] not in entries]
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"Loading translation model on {device}; {len(pending)} records pending", flush=True)
    tokenizer = M2M100Tokenizer.from_pretrained(args.model, local_files_only=True)
    model = M2M100ForConditionalGeneration.from_pretrained(args.model, local_files_only=True).to(device).eval()
    for offset in range(0, len(pending), args.batch_size):
        batch = pending[offset : offset + args.batch_size]
        drafts = [candidates["entries"][record["id"]] for record in batch]
        meanings = translate(model, tokenizer, [draft["meaningEn"] for draft in drafts], "en", device)
        examples = translate(model, tokenizer, [CONVERT.convert(draft["exampleTraditional"]) for draft in drafts], "zh", device)
        for record, draft, meaning, example in zip(batch, drafts, meanings, examples):
            traditional = draft["exampleTraditional"]
            entry = {
                "meaningVi": clean_meaning(meaning),
                "exampleTraditional": traditional,
                "exampleSimplified": CONVERT.convert(traditional),
                "exampleVi": clean_example(example, traditional),
            }
            if draft.get("exampleSource"):
                entry["exampleSource"] = draft["exampleSource"]
            entry.update(overrides.get(record["id"], {}))
            entry["exampleSimplified"] = CONVERT.convert(entry["exampleTraditional"])
            if any(not entry.get(key) for key in ("meaningVi", "exampleTraditional", "exampleSimplified", "exampleVi")):
                raise ValueError(f"{record['id']}: empty translated field")
            if HANZI.search(entry["meaningVi"]) or HANZI.search(entry["exampleVi"]):
                raise ValueError(f"{record['id']}: Chinese leaked into Vietnamese field")
            entries[record["id"]] = entry
        save(args.output, dataset_id, entries)
        print(f"{min(offset + len(batch), len(pending))}/{len(pending)} translated", flush=True)
    print(f"Saved {len(entries)} entries to {args.output}")


if __name__ == "__main__":
    main()

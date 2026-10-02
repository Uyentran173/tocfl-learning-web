"""Generate resumable TOCFL vocabulary candidates without editing the official import.

Requires mlx-lm and a CC-CEDICT text file. The dictionary is a sense reference;
the generated English gloss and example are saved to a separate temporary file.
"""

import argparse
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

from mlx_lm import batch_generate, generate, load
from mlx_lm.sample_utils import make_sampler

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/vocabulary/tocfl-imported.json"
DEFAULT_CANDIDATES = Path("/tmp/tocfl-enrichment-candidates.json")
HANZI = re.compile(r"[\u3400-\u9fff]")
FINISH = re.compile(r"[。！？]")
LEVEL_LIMITS = {"novice_1": 18, "novice_2": 22, "level_1": 30, "level_2": 36, "level_3": 46, "level_4": 54, "level_5": 65}
LEVEL_GUIDANCE = {
    "novice_1": "Very easy everyday words, a short sentence. Example style: 我等了十分鐘。",
    "novice_2": "Easy everyday words and a short natural sentence.",
    "level_1": "Basic sentence structure and familiar situations.",
    "level_2": "Basic-to-intermediate sentence with clear everyday context.",
    "level_3": "Natural intermediate sentence with useful context.",
    "level_4": "Natural upper-intermediate sentence showing the correct nuance.",
    "level_5": "Natural advanced sentence showing the correct nuance, still concise.",
}
POS_HINTS = {
    "M": "measure word or counter (including clock time where appropriate)",
    "N": "noun",
    "V": "verb",
    "Vst": "stative verb",
    "Vi": "intransitive verb",
    "Vs-pred": "predicate verb or adjective",
    "Adv": "adverb",
    "Ptc": "particle",
    "Prep": "preposition",
    "Conj": "conjunction",
}


def target_forms(term):
    forms = []
    for part in re.split(r"[/／]", term):
        bare = re.sub(r"[（(][^）)]*[）)]", "", part).strip()
        parenthetical = re.sub(r"[（(]([^）)]*)[）)]", lambda match: "".join(HANZI.findall(match.group(1))), part).strip()
        for form in (parenthetical, bare):
            if form and form not in forms:
                forms.append(form)
    return forms


def pinyin_key(pinyin):
    return "".join(char for char in unicodedata.normalize("NFD", pinyin.lower()) if char.isascii() and char.isalpha()).replace("u:", "v")


def read_dictionary(path):
    dictionary = defaultdict(list)
    pattern = re.compile(r"^(\S+) (\S+) \[([^]]+)\] /(.+)/$")
    with path.open(encoding="utf-8") as file:
        for line in file:
            match = pattern.match(line)
            if match:
                dictionary[match.group(1)].append((match.group(3), match.group(4)))
    return dictionary


def dictionary_hints(record, dictionary):
    candidates = []
    for form in target_forms(record["traditional"]):
        candidates.extend(dictionary.get(form, []))
        if candidates:
            break
    if not candidates:
        return []
    key = pinyin_key((record.get("pinyin") or "").split("/")[0])
    matching = [(pinyin, meaning) for pinyin, meaning in candidates if pinyin_key(re.sub(r"\d", "", pinyin)) == key]
    chosen = matching or candidates
    chosen.sort(key=lambda item: item[0][0].isupper())
    return [meaning[:230] for _, meaning in chosen[:3]]


def prompt(record, dictionary, retry_reason=""):
    word = target_forms(record["traditional"])[0]
    hints = dictionary_hints(record, dictionary)
    source = f"Dictionary senses for this word: {json.dumps(hints, ensure_ascii=False)}. " if hints else ""
    retry = f"The previous output was invalid: {retry_reason}. Fix this exactly. " if retry_reason else ""
    part_of_speech = record["partOfSpeech"].get("raw") or "unknown"
    pos_meaning = POS_HINTS.get(part_of_speech, part_of_speech)
    return (
        "You are a careful Taiwan Mandarin teacher. Return only a compact JSON object with string fields "
        "meaningEn, exampleTraditional, exampleEn. "
        f"Target word: {word}; pinyin: {record.get('pinyin') or 'unknown'}; "
        f"part of speech: {pos_meaning}; "
        f"TOCFL level: {record['levelId']}. {source}"
        "meaningEn: concise most common English meaning first, at most two short senses; "
        "use the dictionary senses and the part of speech to avoid confusing similarly written words. "
        f"exampleTraditional: EXACTLY ONE complete, grammatical Traditional Chinese sentence naturally using {word} "
        "in the stated sense. The target must be the word itself, not merely characters inside a longer expression with another meaning. "
        "Avoid implausible facts, redundant clauses, personal names, and invented details. "
        f"Difficulty: {LEVEL_GUIDANCE[record['levelId']]} "
        "exampleEn: faithful English translation of this one sentence without adding details. "
        "No markdown, comments, or extra fields. " + retry
    )


def parse_response(text):
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        raise ValueError("no JSON object")
    response = json.loads(text[start : end + 1])
    if not isinstance(response, dict):
        raise ValueError("not a JSON object")
    return response


def validate(record, response):
    for key in ("meaningEn", "exampleTraditional", "exampleEn"):
        if not isinstance(response.get(key), str) or not response[key].strip():
            raise ValueError(f"missing {key}")
    meaning = response["meaningEn"].strip()
    chinese = response["exampleTraditional"].strip()
    english = response["exampleEn"].strip()
    if HANZI.search(meaning) or HANZI.search(english):
        raise ValueError("English field contains Chinese")
    if len(meaning) > 100 or len(english) > 240:
        raise ValueError("English field too long")
    if not any(form in chinese for form in target_forms(record["traditional"])):
        raise ValueError(f"example must contain the exact word {record['traditional']}")
    if len(FINISH.findall(chinese)) != 1 or chinese[-1] not in "。！？":
        raise ValueError("example must be exactly one complete sentence")
    if len(HANZI.findall(chinese)) > LEVEL_LIMITS[record["levelId"]]:
        raise ValueError("example exceeds the length limit for its level")
    return {"meaningEn": meaning, "exampleTraditional": chinese, "exampleEn": english}


def save(path, dataset_id, entries):
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps({"datasetId": dataset_id, "entries": entries}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    temporary.replace(path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--dictionary", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=DEFAULT_CANDIDATES)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--level")
    args = parser.parse_args()

    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    dataset_id = source["datasets"][0]["datasetId"]
    if args.output.exists():
        existing = json.loads(args.output.read_text(encoding="utf-8"))
        if existing["datasetId"] != dataset_id:
            raise ValueError("candidate dataset ID does not match official source")
        entries = existing["entries"]
    else:
        entries = {}
    pending = [record for record in source["records"] if record["id"] not in entries and (not args.level or record["levelId"] == args.level)]
    if args.limit:
        pending = pending[:args.limit]
    dictionary = read_dictionary(args.dictionary)
    print(f"Pending {len(pending)} of {len(source['records'])}; existing {len(entries)}; dictionary {len(dictionary)}", flush=True)
    model, tokenizer = load(args.model)
    sampler = make_sampler(temp=0.1, top_p=0.9)
    failed = []

    def tokens(record, retry_reason=""):
        messages = [
            {"role": "system", "content": "Output valid JSON only. One natural Taiwan Mandarin sentence for the given vocabulary term."},
            {"role": "user", "content": prompt(record, dictionary, retry_reason)},
        ]
        return tokenizer.apply_chat_template(messages, add_generation_prompt=True)

    for offset in range(0, len(pending), args.batch_size):
        batch = pending[offset : offset + args.batch_size]
        result = batch_generate(model, tokenizer, [tokens(record) for record in batch], max_tokens=155, sampler=sampler, verbose=False)
        for record, generated in zip(batch, result.texts):
            try:
                entries[record["id"]] = validate(record, parse_response(generated))
                continue
            except Exception as error:
                reason = str(error)
            for _ in range(2):
                revised = generate(model, tokenizer, prompt=tokens(record, reason), max_tokens=170, sampler=sampler, verbose=False)
                try:
                    entries[record["id"]] = validate(record, parse_response(revised))
                    break
                except Exception as error:
                    reason = str(error)
            else:
                failed.append((record["id"], reason, generated[:160]))
        save(args.output, dataset_id, entries)
        print(f"{min(offset + len(batch), len(pending))}/{len(pending)} processed; {len(entries)} valid; {len(failed)} failed", flush=True)

    if failed:
        for item in failed[:100]:
            print("FAILED", *item, sep=" | ", file=sys.stderr)
        sys.exit(1)
    print(f"Candidate generation complete: {len(entries)} records", flush=True)


if __name__ == "__main__":
    main()

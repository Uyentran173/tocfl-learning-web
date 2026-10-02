"""Choose one level-appropriate, attributed Tatoeba example per TOCFL word.

This only creates draft candidates. The official TOCFL import and the published
enrichment are never written. Uncovered words can be generated separately.
"""

import argparse
import bz2
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

import ahocorasick
import jieba
from opencc import OpenCC

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/vocabulary/tocfl-imported.json"
LEVEL_MAX = {"level_1": 24, "level_2": 30, "level_3": 46, "level_4": 54, "level_5": 65}
LEVEL_ID = {"level_1": 1, "level_2": 2, "level_3": 3, "level_4": 4, "level_5": 5}
TARGET_LENGTH = {"level_1": 13, "level_2": 17, "level_3": 21, "level_4": 25, "level_5": 29}
HANZI = re.compile(r"[\u3400-\u9fff]")
PAREN = re.compile(r"[（(][^）)]*[）)]")
S2TW = OpenCC("s2t")
TW2S = OpenCC("tw2s")


def forms(term):
    result = []
    for part in re.split(r"[/／]", term):
        bare = PAREN.sub("", part).strip()
        expanded = re.sub(r"[（(]([^）)]*)[）)]", lambda m: "".join(HANZI.findall(m.group(1))), part).strip()
        for value in (expanded, bare):
            if value and value not in result:
                result.append(value)
    return result


def pinyin_key(value):
    value = unicodedata.normalize("NFD", value.lower())
    return "".join(c for c in value if c.isascii() and c.isalpha())


def dictionary_glosses(path):
    result = defaultdict(list)
    pattern = re.compile(r"^(\S+) (\S+) \[([^]]+)\] /(.+)/$")
    for line in path.open(encoding="utf-8"):
        match = pattern.match(line)
        if match:
            result[match.group(1)].append((pinyin_key(match.group(3)), match.group(4).split("/")))
    return result


def concise_gloss(record, dictionary):
    entries = next((dictionary.get(form) for form in forms(record["traditional"]) if dictionary.get(form)), [])
    if not entries:
        return ""
    key = pinyin_key((record.get("pinyin") or "").split("/")[0])
    matched = [senses for reading, senses in entries if reading == key]
    senses = [sense for group in (matched or [entries[0][1]]) for sense in group]
    clean = []
    for sense in senses:
        sense = re.sub(r"\bCL:.*", "", sense).strip()
        if not sense or sense.startswith(("see ", "variant of ", "surname ", "abbr. for ")):
            continue
        if sense[:1].isupper() and not sense.startswith(("I;", "I ")):
            continue
        sense = re.sub(r"^\([^)]*\)\s*", "", sense).strip()
        if sense and len(sense) <= 65 and sense not in clean:
            clean.append(sense)
        if len(clean) == 2:
            break
    return "; ".join(clean) or next((s for s in senses if s), "")[:90]


def load_reviews(path, valid_ids):
    positives = defaultdict(int)
    negatives = set()
    if not path:
        return positives, negatives
    with path.open(encoding="utf-8") as file:
        for line in file:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 3 or parts[1] not in valid_ids:
                continue
            if parts[2] == "1":
                positives[parts[1]] += 1
            elif parts[2] == "-1":
                negatives.add(parts[1])
    return positives, negatives


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sentences", type=Path, required=True, help="Tatoeba cmn_sentences_detailed.tsv.bz2")
    parser.add_argument("--reviews", type=Path, help="Tatoeba users_sentences.csv")
    parser.add_argument("--dictionary", type=Path, required=True, help="CC-CEDICT cedict_ts.u8")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    records = [record for record in source["records"] if record["band"] != "novice"]
    dictionary = dictionary_glosses(args.dictionary)
    form_records = defaultdict(list)
    known_by_level = {level: set() for level in LEVEL_ID}
    for record in source["records"]:
        for form in forms(record["traditional"]):
            simple = TW2S.convert(form)
            if record["band"] != "novice":
                form_records[form].append(record)
            for level, number in LEVEL_ID.items():
                if record["band"] == "novice" or (record["levelId"] in LEVEL_ID and LEVEL_ID[record["levelId"]] <= number):
                    known_by_level[level].add(simple)
            if len(simple) > 1:
                jieba.add_word(simple, freq=1000)
    matcher = ahocorasick.Automaton()
    for form in form_records:
        matcher.add_word(form, form)
    matcher.make_automaton()

    sentences = []
    with bz2.open(args.sentences, "rt", encoding="utf-8") as file:
        for line in file:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 4:
                continue
            sentence_id, _, raw, author = parts[:4]
            traditional = S2TW.convert(raw.strip())
            length = len(HANZI.findall(traditional))
            if not (6 <= length <= 65) or not traditional.endswith(("。", "！", "？")):
                continue
            if (sum(traditional.count(mark) for mark in "。！？") != 1
                    or re.search(r"[A-Za-z{}<>]|\.\.\.|…|湯姆|瑪麗|翻譯|做鴨|色情|脫了衣服|胸部|乳房|吸毒|性交易|強姦|自殺", traditional)
                    or traditional.endswith(("的。", "的！"))):
                continue
            sentences.append((sentence_id, traditional, author, length))
    positives, negatives = load_reviews(args.reviews, {item[0] for item in sentences})
    candidates = defaultdict(list)
    for sentence_id, sentence, author, length in sentences:
        if sentence_id in negatives:
            continue
        matches = {form for _, form in matcher.iter(sentence)}
        if not matches:
            continue
        tokens = list(jieba.cut(TW2S.convert(sentence)))
        token_set = set(tokens)
        for form in matches:
            if TW2S.convert(form) not in token_set:
                continue
            for record in form_records[form]:
                level = record["levelId"]
                if length > LEVEL_MAX[level]:
                    continue
                if record["partOfSpeech"]["raw"] == "M" and not re.search(rf"[一二兩三四五六七八九十百千幾多零0-9]{re.escape(form)}", sentence):
                    continue
                unfamiliar = sum(len(token) for token in tokens if len(token) > 1 and HANZI.search(token) and token not in known_by_level[level])
                score = (min(positives[sentence_id], 3) * 50 - unfamiliar * (7 if level in ("level_1", "level_2") else 4)
                         - abs(length - TARGET_LENGTH[level]) * 2
                         - (15 if sentence.count("，") > 2 and level in ("level_1", "level_2") else 0))
                candidates[record["id"]].append((score, sentence_id, sentence, author))

    chosen = {}
    used_sentences = set()
    # Scarce terms get their best sentence first; common terms have more choices.
    for record in sorted(records, key=lambda item: len(candidates[item["id"]])):
        options = sorted(candidates[record["id"]], reverse=True)
        if not options:
            continue
        option = next((item for item in options if item[1] not in used_sentences), options[0])
        _, sentence_id, sentence, author = option
        used_sentences.add(sentence_id)
        meaning = concise_gloss(record, dictionary)
        if not meaning:
            continue
        chosen[record["id"]] = {
            "meaningEn": meaning,
            "exampleTraditional": sentence,
            "exampleSource": {"kind": "tatoeba", "id": sentence_id, "author": author},
        }
    payload = {"datasetId": source["datasets"][0]["datasetId"], "entries": chosen}
    args.output.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    for band in ("band_a", "band_b", "band_c"):
        selection = [record for record in records if record["band"] == band]
        print(f"{band}: {sum(record['id'] in chosen for record in selection)} / {len(selection)} corpus examples")
    print(f"Wrote {len(chosen)} candidates to {args.output}")


if __name__ == "__main__":
    main()

"""Check coverage and structural integrity of published TOCFL enrichment data."""

import argparse
import json
import re
import sys
from pathlib import Path

from opencc import OpenCC

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/vocabulary/tocfl-imported.json"
ENRICHMENT = ROOT / "data/vocabulary/tocfl-enrichment.json"
HANZI = re.compile(r"[\u3400-\u9fff]")
CONVERT = OpenCC("tw2s")
LEVEL_MAX = {"level_1": 30, "level_2": 36, "level_3": 30, "level_4": 36, "level_5": 65}
TRADITIONAL_FORM_EXCEPTIONS = {"tocfl-20240923-level-4-2213": "隻"}  # The TOCFL source lists 只 for this classifier in both scripts.
SIMPLIFIED_FORM_EXCEPTIONS = {
    "tocfl-20240923-level-3-0438": "姐妹",  # 姊妹 is commonly written 姐妹 in Simplified Chinese.
    "tocfl-20240923-level-4-0454": "反复",  # Source incorrectly retains Traditional 覆.
    "tocfl-20240923-level-4-0968": "俱乐部",  # Source omits 亻 in 俱.
}


def simplified_example(sentence, band):
    if band == "band_b":
        return CONVERT.convert(sentence).replace("擡", "抬").replace("姊妹", "姐妹").replace("砲", "炮")
    return CONVERT.convert(sentence)


def forms(term):
    result = []
    for part in re.split(r"[/／]", term):
        bare = re.sub(r"[（(][^）)]*[）)]", "", part).strip()
        joined = re.sub(r"[（(]([^）)]*)[）)]", lambda match: "".join(HANZI.findall(match.group(1))), part).strip()
        for form in (joined, bare):
            if form and form not in result:
                result.append(form)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reviewed-file", type=Path)
    parser.add_argument("--enrichment", type=Path, default=ENRICHMENT)
    args = parser.parse_args()
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    enrichment = json.loads(args.enrichment.read_text(encoding="utf-8"))
    records = source["records"]
    entries = enrichment["entries"]
    errors = []
    dataset_id = source["datasets"][0]["datasetId"]
    if enrichment["datasetId"] != dataset_id:
        errors.append("Dataset ID does not match TOCFL source")
    expected_ids = {record["id"] for record in records}
    if args.reviewed_file:
        reviewed = json.loads(args.reviewed_file.read_text(encoding="utf-8"))
        if reviewed["datasetId"] != dataset_id:
            errors.append("Reviewed dataset ID does not match TOCFL source")
        expected_ids = set(reviewed["ids"])
    if expected_ids - entries.keys():
        errors.append(f"{len(expected_ids - entries.keys())} expected records have no enrichment")
    if entries.keys() - expected_ids:
        errors.append(f"{len(entries.keys() - expected_ids)} unpublished records appear in enrichment")

    for record in records:
        entry = entries.get(record["id"])
        if entry is None:
            continue
        for key in ("meaningVi", "exampleTraditional", "exampleSimplified", "exampleVi"):
            if not isinstance(entry.get(key), str) or not entry[key].strip():
                errors.append(f"{record['id']}: missing {key}")
        if not all(isinstance(entry.get(key), str) and entry[key].strip() for key in ("exampleTraditional", "exampleSimplified")):
            continue
        for key in ("exampleTraditional", "exampleSimplified"):
            sentence = entry[key].strip()
            if len(re.findall("[。！？]", sentence)) != 1 or sentence[-1] not in "。！？":
                errors.append(f"{record['id']}: {key} must be exactly one complete sentence")
            if key == "exampleTraditional" and record["levelId"] in LEVEL_MAX and len(HANZI.findall(sentence)) > LEVEL_MAX[record["levelId"]]:
                errors.append(f"{record['id']}: example exceeds the length limit for {record['levelId']}")
        accepted_forms = forms(record["traditional"]) + ([TRADITIONAL_FORM_EXCEPTIONS[record["id"]]] if record["id"] in TRADITIONAL_FORM_EXCEPTIONS else [])
        if not any(form in entry["exampleTraditional"] for form in accepted_forms):
            errors.append(f"{record['id']}: Traditional example does not contain target word")
        if record["band"] == "band_b" and record["partOfSpeech"]["raw"] == "M":
            numeral = r"[一二兩三四五六七八九十百千幾多零這那每0-9]+"
            is_grade = record["id"] == "tocfl-20240923-level-4-0795" and re.search(numeral + r"年級", entry["exampleTraditional"])
            if not is_grade and not any(re.search(numeral + re.escape(form), entry["exampleTraditional"]) for form in accepted_forms):
                errors.append(f"{record['id']}: Band B measure-word example must use a number or determiner")
        simplified_forms = forms(record["simplified"]) if record.get("simplified") else []
        if record["id"] in SIMPLIFIED_FORM_EXCEPTIONS:
            simplified_forms.append(SIMPLIFIED_FORM_EXCEPTIONS[record["id"]])
        if simplified_forms and not any(form in entry["exampleSimplified"] for form in simplified_forms):
            errors.append(f"{record['id']}: Simplified example does not contain target word")
        if simplified_example(entry["exampleTraditional"], record["band"]) != entry["exampleSimplified"]:
            errors.append(f"{record['id']}: Simplified example does not match Traditional example")
        if HANZI.search(entry.get("meaningVi", "")) or HANZI.search(entry.get("exampleVi", "")):
            errors.append(f"{record['id']}: Vietnamese fields contain Chinese")
        if any(key in entry for key in ("band", "levelId", "pinyin", "traditional", "simplified")):
            errors.append(f"{record['id']}: original TOCFL fields copied into enrichment")
        example_source = entry.get("exampleSource")
        if example_source is not None and (not isinstance(example_source, dict) or example_source.get("kind") != "tatoeba" or not str(example_source.get("id", "")).isdigit() or not example_source.get("author")):
            errors.append(f"{record['id']}: invalid example attribution")

    print(f"TOCFL source: {len(records)} records; published: {len(entries)} records")
    if errors:
        for error in errors[:100]:
            print("ERROR:", error, file=sys.stderr)
        if len(errors) > 100:
            print(f"...and {len(errors) - 100} more errors", file=sys.stderr)
        sys.exit(1)
    print("Published coverage and structure valid")


if __name__ == "__main__":
    main()

"""Create resumable Vietnamese TOCFL enrichment from curated drafts, offline.

This leaves the imported source untouched and writes only to a preview file. The
preview must pass validate_tocfl_enrichment.py before it is published.
"""

import argparse
import json
import re
from pathlib import Path

from mlx_lm import batch_generate, load
from mlx_lm.sample_utils import make_sampler
from opencc import OpenCC

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/vocabulary/tocfl-imported.json'
OVERRIDES = ROOT / 'data/vocabulary/tocfl-enrichment-overrides.json'
DEFAULT_MODEL = Path('/Users/macbookpro/.cache/huggingface/hub/models--mlx-community--Qwen3-8B-4bit/snapshots/545dc4251c05440727734bcd94334791f6ab0192')
CONVERT = OpenCC('tw2s')
HANZI = re.compile(r'[\u3400-\u9fff]')


def save(path, dataset_id, entries):
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps({'datasetId': dataset_id, 'entries': entries}, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    temporary.replace(path)


def clean(value, *, sentence=False):
    value = re.sub(r'\s+', ' ', value.strip())
    value = re.sub(r'^(?:Nghĩa(?: tiếng Việt)?|Dịch(?: câu)?|Bản dịch)\s*:\s*', '', value, flags=re.I)
    value = value.strip('“”"‘’` ')
    value = re.sub(r'\s*\([^)]*tiếng Anh[^)]*\)', '', value, flags=re.I)
    if sentence:
        value = value.replace('。', '.').replace('？', '?').replace('！', '!')
        if value and value[-1] not in '.?!':
            value += '.'
        if value:
            value = value[0].upper() + value[1:]
    else:
        value = value.rstrip('.; ')
        if value:
            value = value[0].lower() + value[1:]
    return value


def prompts(tokenizer, batch, drafts, *, sentence=False):
    result = []
    for record, draft in zip(batch, drafts):
        if sentence:
            system = 'Translate Traditional Chinese to natural, faithful Vietnamese. Keep numbers and names exact. Output only the translation.'
            user = draft['exampleTraditional']
        else:
            pos = record.get('partOfSpeech', {}).get('raw', '')
            system = ('Cho nghĩa tiếng Việt ngắn gọn của từ tiếng Trung được hỏi trong câu. '
                      'Chỉ ghi nghĩa của từ, không giải thích câu, không ghi chữ Hán.')
            if pos == 'M':
                system = ('Từ được hỏi là một lượng từ tiếng Trung. Hãy ghi nghĩa tiếng Việt ngắn gọn '
                          'theo mẫu "lượng từ chỉ ...". Chỉ ghi nghĩa, không giải thích.')
            user = (f"Từ: {record['traditional']}\nTừ loại: {pos}\n"
                    f"Câu: {draft['exampleTraditional']}")
        result.append(tokenizer.apply_chat_template([
            {'role': 'system', 'content': system},
            {'role': 'user', 'content': user},
        ], add_generation_prompt=True, enable_thinking=False))
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', type=Path, default=DEFAULT_MODEL)
    parser.add_argument('--candidates', type=Path, required=True)
    parser.add_argument('--base', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--batch-size', type=int, default=16)
    parser.add_argument('--limit', type=int)
    args = parser.parse_args()
    source = json.loads(SOURCE.read_text(encoding='utf-8'))
    candidates = json.loads(args.candidates.read_text(encoding='utf-8'))
    base = json.loads(args.base.read_text(encoding='utf-8'))
    overrides = json.loads(OVERRIDES.read_text(encoding='utf-8'))['entries']
    dataset_id = source['datasets'][0]['datasetId']
    if candidates['datasetId'] != dataset_id or base['datasetId'] != dataset_id:
        raise ValueError('Mismatched dataset ID')
    if args.output.exists():
        existing = json.loads(args.output.read_text(encoding='utf-8'))
        if existing['datasetId'] != dataset_id:
            raise ValueError('Mismatched preview dataset ID')
        entries = existing['entries']
    else:
        entries = dict(base['entries'])
    pending = [r for r in source['records'] if r['id'] in candidates['entries'] and r['id'] not in entries]
    if args.limit is not None:
        pending = pending[:args.limit]
    print(f'Loading local model; {len(pending)} records pending', flush=True)
    if not pending:
        return
    model, tokenizer = load(str(args.model))
    sampler = make_sampler(temp=0)
    for offset in range(0, len(pending), args.batch_size):
        batch = pending[offset:offset + args.batch_size]
        drafts = [candidates['entries'][r['id']] for r in batch]
        raw_meanings = batch_generate(model, tokenizer, prompts(tokenizer, batch, drafts),
                                      max_tokens=85, sampler=sampler, verbose=False).texts
        raw_examples = batch_generate(model, tokenizer, prompts(tokenizer, batch, drafts, sentence=True),
                                      max_tokens=120, sampler=sampler, verbose=False).texts
        for record, draft, meaning, example in zip(batch, drafts, raw_meanings, raw_examples):
            traditional = draft['exampleTraditional']
            entry = {
                'meaningVi': clean(meaning),
                'exampleTraditional': traditional,
                'exampleSimplified': CONVERT.convert(traditional),
                'exampleVi': clean(example, sentence=True),
            }
            if draft.get('exampleSource'):
                entry['exampleSource'] = draft['exampleSource']
            entry.update(overrides.get(record['id'], {}))
            entry['exampleSimplified'] = CONVERT.convert(entry['exampleTraditional'])
            if any(not entry.get(k) for k in ('meaningVi', 'exampleTraditional', 'exampleSimplified', 'exampleVi')):
                raise ValueError(f"{record['id']}: empty translated field")
            if HANZI.search(entry['meaningVi']) or HANZI.search(entry['exampleVi']):
                print(f"REVIEW Hanzi in Vietnamese: {record['id']}: {entry['meaningVi']} / {entry['exampleVi']}", flush=True)
            entries[record['id']] = entry
        save(args.output, dataset_id, entries)
        print(f'{min(offset + len(batch), len(pending))}/{len(pending)} translated; {len(entries)} total', flush=True)
    print(f'Saved {len(entries)} records to {args.output}', flush=True)


if __name__ == '__main__':
    main()

"""Assemble one Band from corpus drafts plus editorial overrides.

This does not change the TOCFL source or the published enrichment file.
"""

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/vocabulary/tocfl-imported.json'
OVERRIDES = ROOT / 'data/vocabulary/tocfl-candidate-overrides.json'

def forms(term):
    result = []
    for part in re.split(r'[/／]', term):
        bare = re.sub(r'[（(][^）)]*[）)]', '', part).strip()
        expanded = re.sub(r'[（(]([^）)]*)[）)]', lambda match: ''.join(re.findall(r'[\u3400-\u9fff]', match.group(1))), part).strip()
        result.extend(form for form in (expanded, bare) if form and form not in result)
    return result

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--band', choices=['band_a', 'band_b', 'band_c'], required=True)
    parser.add_argument('--corpus', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    source = json.loads(SOURCE.read_text(encoding='utf-8'))
    corpus = json.loads(args.corpus.read_text(encoding='utf-8'))
    overrides = json.loads(OVERRIDES.read_text(encoding='utf-8'))
    dataset_id = source['datasets'][0]['datasetId']
    if corpus['datasetId'] != dataset_id:
        raise ValueError('Corpus dataset ID mismatch')
    entries = {}
    for record in source['records']:
        if record['band'] != args.band:
            continue
        entry = dict(corpus['entries'].get(record['id'], {}))
        if record['id'] in overrides:
            entry.update(overrides[record['id']])
            entry.pop('exampleSource', None)
        if not entry.get('meaningEn') or not entry.get('exampleTraditional'):
            raise ValueError(f"Missing draft for {record['id']}: {record['traditional']}")
        if not any(form in entry['exampleTraditional'] for form in forms(record['traditional'])):
            raise ValueError(f"Example lacks target for {record['id']}: {entry['exampleTraditional']}")
        entries[record['id']] = entry
    args.output.write_text(json.dumps({'datasetId': dataset_id, 'entries': entries}, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'Assembled {len(entries)} {args.band} candidates')

if __name__ == '__main__':
    main()

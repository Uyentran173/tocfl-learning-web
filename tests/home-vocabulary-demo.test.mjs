import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = fs.readFileSync('lib/home-vocabulary-demo.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { homeDemoWords, shuffledDemoChoices } = await import(`data:text/javascript,${encodeURIComponent(compiled)}`);
const vocabulary = new Map(JSON.parse(fs.readFileSync('data/vocabulary/tocfl-imported.json', 'utf8')).records.map((entry) => [entry.id, entry]));
const enrichment = JSON.parse(fs.readFileSync('data/vocabulary/tocfl-enrichment.json', 'utf8')).entries;

test('homepage demo is a small, faithful Band A extract of the published vocabulary', () => {
  assert.equal(homeDemoWords.length, 3);
  assert.equal(new Set(homeDemoWords.map((entry) => entry.id)).size, 3);
  for (const entry of homeDemoWords) {
    const original = vocabulary.get(entry.id);
    assert.ok(original, `Missing canonical word ${entry.id}`);
    assert.equal(original.band, 'band_a');
    for (const key of ['traditional', 'simplified', 'pinyin']) assert.equal(entry[key], original[key]);
    for (const key of ['meaningVi', 'exampleTraditional', 'exampleSimplified', 'exampleVi']) assert.equal(entry[key], enrichment[entry.id][key]);
  }
});

test('quiz choices always contain each real word and can place the right answer differently', () => {
  const correct = homeDemoWords[0].id;
  const first = shuffledDemoChoices(correct, () => 0);
  const second = shuffledDemoChoices(correct, () => .999);
  assert.deepEqual(new Set(first), new Set(homeDemoWords.map((word) => word.id)));
  assert.deepEqual(new Set(second), new Set(homeDemoWords.map((word) => word.id)));
  assert.notEqual(first.indexOf(correct), second.indexOf(correct));
});

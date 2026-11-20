import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import lesson from '../data/academy/cc6-lesson01.json' with { type: 'json' };
import vocabulary from '../data/academy/cc6-lesson01-vocabulary.json' with { type: 'json' };
import lesson02 from '../data/academy/cc6-lesson02.json' with { type: 'json' };
import vocabulary02 from '../data/academy/cc6-lesson02-vocabulary.json' with { type: 'json' };
import lesson03 from '../data/academy/cc6-lesson03.json' with { type: 'json' };
import vocabulary03 from '../data/academy/cc6-lesson03-vocabulary.json' with { type: 'json' };
import manifest from '../data/academy/cc6-audio-manifest.json' with { type: 'json' };
import report from '../data/academy/cc6-mapping-report.json' with { type: 'json' };
import reviewed from '../data/academy/cc6-reviewed-content.json' with { type: 'json' };
import { academyVolume6Lesson01, academyVolume6Lesson02, academyVolume6Lesson03, academyVocabularyByIds, validateAcademyLessonContent } from '../lib/academy-catalog.ts';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test('Volume 6 Lesson 01 contains complete, distinct learning activities', () => {
  assert.ok(validateAcademyLessonContent(academyVolume6Lesson01));
  assert.equal(academyVocabularyByIds(academyVolume6Lesson01.vocabulary.wordIds).length, 55);
  assert.equal(lesson.id, 'cc6-v6-l01');
  assert.equal(lesson.lecture.dialogues.length, 2);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 6);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 4);
  assert.ok(lesson.lecture.dialogues.every((item) => item.turns.every((turn) => turn.chinese && turn.simplified && turn.meaningVi)));
  assert.equal(lesson.vocabulary.wordIds.length, 55);
  assert.equal(vocabulary.records.length, 55);
  assert.equal(new Set(vocabulary.records.map((item) => item.id)).size, 55);
  assert.ok(vocabulary.records.every((item) => item.traditional && item.simplified && item.pinyin && item.meaningVi && item.exampleTraditional && item.exampleSimplified && item.exampleVi));
  assert.equal(lesson.grammar.length, 9);
  assert.equal(lesson.listening.length, 4);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  for (const item of [...lesson.lecture.checks, ...lesson.listening, ...lesson.practice, ...lesson.assessment, ...lesson.grammar.map((point) => point.check)]) {
    assert.ok(item.options.some((option) => option.id === item.correctOptionId), item.id);
  }
});

test('Volume 6 Lesson 02 contains the reviewed two readings, vocabulary and learning activities', () => {
  assert.ok(validateAcademyLessonContent(academyVolume6Lesson02));
  assert.equal(lesson02.id, 'cc6-v6-l02');
  assert.equal(lesson02.lecture.dialogues.length, 2);
  assert.deepEqual(lesson02.lecture.dialogues.map((item) => item.turns.length), [5, 5]);
  assert.equal(vocabulary02.records.length, 79);
  assert.equal(academyVocabularyByIds(academyVolume6Lesson02.vocabulary.wordIds).length, 79);
  assert.ok(vocabulary02.records.every((item) => item.exampleTraditional.includes(item.traditional)));
  assert.equal(lesson02.grammar.length, 7);
  assert.equal(lesson02.listening.length, 4);
  assert.equal(lesson02.practice.length, 8);
  assert.equal(lesson02.assessment.length, 10);
});

test('Volume 6 Lesson 03 contains reviewed readings, vocabulary, grammar and assessments', () => {
  assert.ok(validateAcademyLessonContent(academyVolume6Lesson03));
  assert.equal(lesson03.id, 'cc6-v6-l03');
  assert.deepEqual(lesson03.lecture.dialogues.map((item) => item.turns.length), [5, 4]);
  assert.equal(vocabulary03.records.length, 89);
  assert.equal(academyVocabularyByIds(academyVolume6Lesson03.vocabulary.wordIds).length, 89);
  assert.ok(vocabulary03.records.every((item) => item.exampleTraditional.includes(item.traditional)));
  assert.equal(lesson03.grammar.length, 11);
  assert.equal(lesson03.listening.length, 4);
  assert.equal(lesson03.practice.length, 8);
  assert.equal(lesson03.assessment.length, 10);
});

test('all 77 MP3s are accounted for; only the 23 source-verified Lesson 01–03 tracks are published', () => {
  assert.equal(manifest.tracks.length, 77);
  assert.equal(new Set(manifest.tracks.map((item) => item.originalName)).size, 77);
  assert.equal(manifest.tracks.filter((item) => item.mappingStatus === 'verified').length, 23);
  assert.equal(manifest.tracks.filter((item) => item.mappingStatus === 'pending').length, 54);
  assert.equal(report.sourceTrackCount, manifest.tracks.length);
  assert.equal(report.pendingTrackCount, 54);
  assert.deepEqual(report.publishedLessonIds, ['cc6-v6-l01', 'cc6-v6-l02', 'cc6-v6-l03']);
  assert.equal(manifest.tracks.find((item) => item.originalName === '00.mp3').mappingStatus, 'pending');
  for (const track of manifest.tracks.filter((item) => item.mappingStatus === 'verified')) {
    assert.ok([1, 2, 3].includes(track.lesson));
    assert.equal(track.pdfPages.length, 1);
    assert.equal(track.activity.referenceCode, track.originalName.slice(0, -4));
    const file = path.join(root, 'public/academy/cc6/audio', `${track.id}.mp3`);
    assert.ok(statSync(file).size > 1000, track.id);
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), track.sha256, track.id);
  }
  for (const dialogue of [...lesson.lecture.dialogues, ...lesson02.lecture.dialogues, ...lesson03.lecture.dialogues]) {
    assert.ok(manifest.tracks.some((item) => item.id === dialogue.audioTrackId && item.mappingStatus === 'verified'));
    assert.ok(reviewed[dialogue.audioTrackId].transcriptTraditional.includes(dialogue.turns[0].chinese));
    assert.ok(reviewed[dialogue.audioTrackId].translationVi.includes(dialogue.turns[0].meaningVi));
  }
});

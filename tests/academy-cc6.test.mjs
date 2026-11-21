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
import lesson04 from '../data/academy/cc6-lesson04.json' with { type: 'json' };
import vocabulary04 from '../data/academy/cc6-lesson04-vocabulary.json' with { type: 'json' };
import lesson05 from '../data/academy/cc6-lesson05.json' with { type: 'json' };
import vocabulary05 from '../data/academy/cc6-lesson05-vocabulary.json' with { type: 'json' };
import lesson06 from '../data/academy/cc6-lesson06.json' with { type: 'json' };
import vocabulary06 from '../data/academy/cc6-lesson06-vocabulary.json' with { type: 'json' };
import lesson07 from '../data/academy/cc6-lesson07.json' with { type: 'json' };
import vocabulary07 from '../data/academy/cc6-lesson07-vocabulary.json' with { type: 'json' };
import lesson08 from '../data/academy/cc6-lesson08.json' with { type: 'json' };
import vocabulary08 from '../data/academy/cc6-lesson08-vocabulary.json' with { type: 'json' };
import lesson09 from '../data/academy/cc6-lesson09.json' with { type: 'json' };
import vocabulary09 from '../data/academy/cc6-lesson09-vocabulary.json' with { type: 'json' };
import lesson10 from '../data/academy/cc6-lesson10.json' with { type: 'json' };
import vocabulary10 from '../data/academy/cc6-lesson10-vocabulary.json' with { type: 'json' };
import manifest from '../data/academy/cc6-audio-manifest.json' with { type: 'json' };
import report from '../data/academy/cc6-mapping-report.json' with { type: 'json' };
import reviewed from '../data/academy/cc6-reviewed-content.json' with { type: 'json' };
import { academyVolume6Lesson01, academyVolume6Lesson02, academyVolume6Lesson03, academyVolume6Lesson04, academyVolume6Lesson05, academyVolume6Lesson06, academyVolume6Lesson07, academyVolume6Lesson08, academyVolume6Lesson09, academyVolume6Lesson10, academyVolume6Lessons, academyVocabularyByIds, validateAcademyLessonContent } from '../lib/academy-catalog.ts';
import { academyScriptText } from '../lib/academy-script.ts';

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

test('Volume 6 Lesson 04 contains the two readings, supplementary text and reviewed learning activities', () => {
  assert.ok(validateAcademyLessonContent(academyVolume6Lesson04));
  assert.equal(lesson04.id, 'cc6-v6-l04');
  assert.deepEqual(lesson04.lecture.dialogues.map((item) => item.turns.length), [5, 5, 2]);
  assert.equal(vocabulary04.records.length, 85);
  assert.equal(academyVocabularyByIds(academyVolume6Lesson04.vocabulary.wordIds).length, 85);
  assert.ok(vocabulary04.records.every((item) => item.exampleTraditional.includes(item.traditional)));
  assert.equal(lesson04.grammar.length, 11);
  assert.equal(lesson04.listening.length, 4);
  assert.equal(lesson04.practice.length, 8);
  assert.equal(lesson04.assessment.length, 10);
});

test('Volume 6 Lesson 05 contains source-reviewed passages, vocabulary, grammar and assessments', () => {
  assert.ok(validateAcademyLessonContent(academyVolume6Lesson05));
  assert.equal(lesson05.id, 'cc6-v6-l05');
  assert.deepEqual(lesson05.lecture.dialogues.map((item) => item.turns.length), [6, 8]);
  assert.equal(vocabulary05.records.length, 82);
  assert.equal(academyVocabularyByIds(academyVolume6Lesson05.vocabulary.wordIds).length, 82);
  assert.ok(vocabulary05.records.every((item) => item.exampleTraditional.includes(item.traditional)));
  assert.equal(lesson05.grammar.length, 11);
  assert.equal(lesson05.listening.length, 4);
  assert.equal(lesson05.practice.length, 8);
  assert.equal(lesson05.assessment.length, 10);
});

test('Volume 6 Lesson 06 contains source-reviewed readings, vocabulary, grammar and assessments', () => {
  assert.ok(validateAcademyLessonContent(academyVolume6Lesson06));
  assert.equal(lesson06.id, 'cc6-v6-l06');
  assert.deepEqual(lesson06.lecture.dialogues.map((item) => item.turns.length), [5, 7]);
  assert.equal(vocabulary06.records.length, 83);
  assert.equal(academyVocabularyByIds(academyVolume6Lesson06.vocabulary.wordIds).length, 83);
  assert.ok(vocabulary06.records.every((item) => item.exampleTraditional.includes(item.traditional)));
  assert.equal(lesson06.grammar.length, 12);
  assert.equal(lesson06.listening.length, 4);
  assert.equal(lesson06.practice.length, 8);
  assert.equal(lesson06.assessment.length, 10);
});

test('Volume 6 Lesson 07 contains source-reviewed readings, vocabulary, grammar and assessments', () => {
  assert.ok(validateAcademyLessonContent(academyVolume6Lesson07));
  assert.equal(lesson07.id, 'cc6-v6-l07');
  assert.deepEqual(lesson07.lecture.dialogues.map((item) => item.turns.length), [8, 7]);
  assert.equal(vocabulary07.records.length, 93);
  assert.equal(academyVocabularyByIds(academyVolume6Lesson07.vocabulary.wordIds).length, 93);
  assert.ok(vocabulary07.records.every((item) => item.exampleTraditional.includes(item.traditional)));
  assert.equal(lesson07.grammar.length, 11);
  assert.equal(lesson07.listening.length, 4);
  assert.equal(lesson07.practice.length, 8);
  assert.equal(lesson07.assessment.length, 10);
});

test('Volume 6 Lesson 08 contains source-reviewed Olympic readings and learning activities', () => {
  assert.ok(validateAcademyLessonContent(academyVolume6Lesson08));
  assert.equal(lesson08.id, 'cc6-v6-l08');
  assert.deepEqual(lesson08.lecture.dialogues.map((item) => item.turns.length), [5, 5]);
  assert.equal(vocabulary08.records.length, 84);
  assert.equal(academyVocabularyByIds(academyVolume6Lesson08.vocabulary.wordIds).length, 84);
  assert.ok(vocabulary08.records.every((item) => item.exampleTraditional.includes(item.traditional)));
  assert.equal(lesson08.grammar.length, 15);
  assert.equal(academyScriptText(lesson08.title, 'simplified'), '奥运黑洞');
  assert.equal(academyScriptText(lesson08.grammar[0].title, 'simplified'), '在历经X之后');
  assert.equal(academyScriptText(lesson08.grammar.at(-1).title, 'simplified'), '不可不X');
  assert.equal(lesson08.listening.length, 4);
  assert.equal(lesson08.practice.length, 8);
  assert.equal(lesson08.assessment.length, 10);
});

test('Volume 6 Lesson 09 contains source-reviewed home and belonging readings', () => {
  assert.ok(validateAcademyLessonContent(academyVolume6Lesson09));
  assert.equal(lesson09.id, 'cc6-v6-l09');
  assert.deepEqual(lesson09.lecture.dialogues.map((item) => item.turns.length), [4, 4]);
  assert.equal(vocabulary09.records.length, 103);
  assert.equal(academyVocabularyByIds(academyVolume6Lesson09.vocabulary.wordIds).length, 103);
  assert.ok(academyVocabularyByIds(academyVolume6Lesson09.vocabulary.wordIds).every((word) => word.exampleSimplified));
  assert.ok(vocabulary09.records.every((item) => item.exampleTraditional.includes(item.traditional)));
  assert.equal(lesson09.grammar.length, 4);
  assert.equal(academyScriptText(lesson09.title, 'simplified'), '乡关何处');
  assert.equal(academyScriptText(lesson09.grammar[1].title, 'simplified'), '在不知不觉中');
  assert.equal(lesson09.listening.length, 4);
  assert.equal(lesson09.practice.length, 8);
  assert.equal(lesson09.assessment.length, 10);
});

test('Volume 6 Lesson 10 completes the course with source-reviewed reading and ability content', () => {
  assert.equal(academyVolume6Lessons.length, 10);
  assert.ok(validateAcademyLessonContent(academyVolume6Lesson10));
  assert.equal(lesson10.id, 'cc6-v6-l10');
  assert.deepEqual(lesson10.lecture.dialogues.map((item) => item.turns.length), [5, 8]);
  assert.equal(vocabulary10.records.length, 107);
  assert.equal(academyVocabularyByIds(academyVolume6Lesson10.vocabulary.wordIds).length, 107);
  assert.ok(academyVocabularyByIds(academyVolume6Lesson10.vocabulary.wordIds).every((word) => word.exampleSimplified));
  assert.ok(vocabulary10.records.every((item) => item.exampleTraditional.includes(item.traditional)));
  assert.equal(lesson10.grammar.length, 14);
  assert.equal(academyScriptText(lesson10.title, 'simplified'), '智慧与能力');
  assert.equal(academyScriptText(lesson10.grammar[1].title, 'simplified'), '把X和Y混为一谈');
  assert.equal(lesson10.listening.length, 4);
  assert.equal(lesson10.practice.length, 8);
  assert.equal(lesson10.assessment.length, 10);
  assert.equal(manifest.tracks.find((item) => item.originalName === '10-06.mp3')?.activity.pdfPage, 253);
});

test('all 77 MP3s are accounted for; only the 76 source-verified Lesson 01–10 tracks are published', () => {
  assert.equal(manifest.tracks.length, 77);
  assert.equal(new Set(manifest.tracks.map((item) => item.originalName)).size, 77);
  assert.equal(manifest.tracks.filter((item) => item.mappingStatus === 'verified').length, 76);
  assert.equal(manifest.tracks.filter((item) => item.mappingStatus === 'pending').length, 1);
  assert.equal(report.sourceTrackCount, manifest.tracks.length);
  assert.equal(report.pendingTrackCount, 1);
  assert.deepEqual(report.publishedLessonIds, ['cc6-v6-l01', 'cc6-v6-l02', 'cc6-v6-l03', 'cc6-v6-l04', 'cc6-v6-l05', 'cc6-v6-l06', 'cc6-v6-l07', 'cc6-v6-l08', 'cc6-v6-l09', 'cc6-v6-l10']);
  assert.equal(manifest.tracks.find((item) => item.originalName === '00.mp3').mappingStatus, 'pending');
  for (const track of manifest.tracks.filter((item) => item.mappingStatus === 'verified')) {
    assert.ok(track.lesson >= 1 && track.lesson <= 10);
    assert.equal(track.pdfPages.length, 1);
    assert.equal(track.activity.referenceCode, track.originalName.slice(0, -4));
    const file = path.join(root, 'public/academy/cc6/audio', `${track.id}.mp3`);
    assert.ok(statSync(file).size > 1000, track.id);
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), track.sha256, track.id);
  }
  for (const dialogue of [...lesson.lecture.dialogues, ...lesson02.lecture.dialogues, ...lesson03.lecture.dialogues, ...lesson04.lecture.dialogues, ...lesson05.lecture.dialogues, ...lesson06.lecture.dialogues, ...lesson07.lecture.dialogues, ...lesson08.lecture.dialogues, ...lesson09.lecture.dialogues, ...lesson10.lecture.dialogues]) {
    assert.ok(manifest.tracks.some((item) => item.id === dialogue.audioTrackId && item.mappingStatus === 'verified'));
    assert.ok(reviewed[dialogue.audioTrackId].transcriptTraditional.includes(dialogue.turns[0].chinese));
    assert.ok(reviewed[dialogue.audioTrackId].translationVi.includes(dialogue.turns[0].meaningVi));
  }
});

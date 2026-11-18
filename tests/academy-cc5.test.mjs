import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { academyVolume5, academyVolume5Lessons, academyVocabularyByIds, validateAcademyLessonContent } from '../lib/academy-catalog.ts';
import { academyScriptText } from '../lib/academy-script.ts';
import manifest from '../data/academy/cc5-audio-manifest.json' with { type: 'json' };
import report from '../data/academy/cc5-mapping-report.json' with { type: 'json' };
import references from '../data/academy/cc5-printed-audio-references.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');

test('Volume 5 exposes only complete lessons and keeps their learning content isolated', () => {
  assert.equal(academyVolume5.lessonIds.length, 10);
  assert.equal(academyVolume5Lessons.length, 6);
  const lesson = academyVolume5Lessons[0];
  assert.equal(lesson.id, 'cc5-v5-l01');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues.length, 2);
  assert.deepEqual(lesson.lecture.dialogues.map((reading) => reading.turns.length), [6, 4]);
  assert.equal(lesson.vocabulary.wordIds.length, 102);
  assert.equal(new Set(lesson.vocabulary.wordIds).size, 102);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 102);
  assert.equal(lesson.grammar.length, 12);
  assert.equal(lesson.listening.length, 4);
  assert.equal(lesson.practice.length, 10);
  assert.equal(lesson.assessment.length, 12);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '言论自由的界线');
  for (const reading of lesson.lecture.dialogues) {
    assert.ok(reading.turns.every((turn) => turn.chinese && turn.simplified && turn.meaningVi));
    assert.ok(reading.audioTrackId && manifest.tracks.some((track) => track.id === reading.audioTrackId && track.mappingStatus === 'verified'));
  }
  const questions = [...lesson.lecture.checks, ...lesson.listening, ...lesson.practice, ...lesson.assessment, ...lesson.grammar.map((point) => point.check)];
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  for (const question of questions) {
    assert.ok(question.options.some((option) => option.id === question.correctOptionId), question.id);
    assert.equal(new Set(question.options.map((option) => option.text)).size, question.options.length, question.id);
  }
  const lesson02 = academyVolume5Lessons[1];
  assert.equal(lesson02.id, 'cc5-v5-l02');
  assert.equal(validateAcademyLessonContent(lesson02), true);
  assert.deepEqual(lesson02.lecture.dialogues.map((reading) => reading.turns.length), [4, 5]);
  assert.equal(lesson02.vocabulary.wordIds.length, 100);
  assert.equal(new Set(lesson02.vocabulary.wordIds).size, 100);
  assert.equal(academyVocabularyByIds(lesson02.vocabulary.wordIds).length, 100);
  assert.equal(lesson02.grammar.length, 9);
  assert.equal(lesson02.listening.length, 4);
  assert.equal(lesson02.practice.length, 10);
  assert.equal(lesson02.assessment.length, 12);
  assert.equal(academyScriptText(lesson02.title, 'simplified'), '关于基改食品，我有话要说');
  for (const reading of lesson02.lecture.dialogues) {
    assert.ok(reading.turns.every((turn) => turn.chinese && turn.simplified && turn.meaningVi));
    assert.ok(reading.audioTrackId && manifest.tracks.some((track) => track.id === reading.audioTrackId && track.mappingStatus === 'verified'));
  }
  const lesson03 = academyVolume5Lessons[2];
  assert.equal(lesson03.id, 'cc5-v5-l03');
  assert.equal(validateAcademyLessonContent(lesson03), true);
  assert.deepEqual(lesson03.lecture.dialogues.map((reading) => reading.turns.length), [2, 2]);
  assert.equal(lesson03.vocabulary.wordIds.length, 98);
  assert.equal(new Set(lesson03.vocabulary.wordIds).size, 98);
  assert.equal(academyVocabularyByIds(lesson03.vocabulary.wordIds).length, 98);
  assert.equal(lesson03.grammar.length, 11);
  assert.equal(lesson03.listening.length, 4);
  assert.equal(lesson03.practice.length, 11);
  assert.equal(lesson03.assessment.length, 12);
  assert.equal(academyScriptText(lesson03.title, 'simplified'), '整型好不好');
  const lesson04 = academyVolume5Lessons[3];
  assert.equal(lesson04.id, 'cc5-v5-l04');
  assert.equal(validateAcademyLessonContent(lesson04), true);
  assert.deepEqual(lesson04.lecture.dialogues.map((reading) => reading.turns.length), [2, 2]);
  assert.equal(lesson04.vocabulary.wordIds.length, 93);
  assert.equal(new Set(lesson04.vocabulary.wordIds).size, 93);
  assert.equal(academyVocabularyByIds(lesson04.vocabulary.wordIds).length, 93);
  assert.equal(lesson04.grammar.length, 9);
  assert.equal(lesson04.listening.length, 4);
  assert.equal(lesson04.practice.length, 9);
  assert.equal(lesson04.assessment.length, 10);
  assert.equal(academyScriptText(lesson04.title, 'simplified'), '传统与现代');
  for (const reading of lesson04.lecture.dialogues) {
    assert.ok(reading.turns.every((turn) => turn.chinese && turn.simplified && turn.meaningVi));
    assert.ok(reading.audioTrackId && manifest.tracks.some((track) => track.id === reading.audioTrackId && track.mappingStatus === 'verified'));
  }
  const lesson05 = academyVolume5Lessons[4];
  assert.equal(lesson05.id, 'cc5-v5-l05');
  assert.equal(validateAcademyLessonContent(lesson05), true);
  assert.deepEqual(lesson05.lecture.dialogues.map((reading) => reading.turns.length), [2, 2]);
  assert.equal(lesson05.vocabulary.wordIds.length, 75);
  assert.equal(new Set(lesson05.vocabulary.wordIds).size, 75);
  assert.equal(academyVocabularyByIds(lesson05.vocabulary.wordIds).length, 75);
  assert.equal(lesson05.grammar.length, 8);
  assert.equal(lesson05.listening.length, 4);
  assert.equal(lesson05.practice.length, 8);
  assert.equal(lesson05.assessment.length, 10);
  assert.equal(academyScriptText(lesson05.title, 'simplified'), '代理孕母，带来幸福？');
  for (const reading of lesson05.lecture.dialogues) {
    assert.ok(reading.turns.every((turn) => turn.chinese && turn.simplified && turn.meaningVi));
    assert.ok(reading.audioTrackId && manifest.tracks.some((track) => track.id === reading.audioTrackId && track.mappingStatus === 'verified'));
  }
  const lesson06 = academyVolume5Lessons[5];
  assert.equal(lesson06.id, 'cc5-v5-l06');
  assert.equal(validateAcademyLessonContent(lesson06), true);
  assert.deepEqual(lesson06.lecture.dialogues.map((reading) => reading.turns.length), [2, 2]);
  assert.equal(lesson06.vocabulary.wordIds.length, 100);
  assert.equal(new Set(lesson06.vocabulary.wordIds).size, 100);
  assert.equal(academyVocabularyByIds(lesson06.vocabulary.wordIds).length, 100);
  assert.equal(lesson06.grammar.length, 9);
  assert.equal(lesson06.listening.length, 4);
  assert.equal(lesson06.practice.length, 9);
  assert.equal(lesson06.assessment.length, 10);
  assert.equal(academyScriptText(lesson06.title, 'simplified'), '死刑的存废');
  for (const reading of lesson06.lecture.dialogues) {
    assert.ok(reading.turns.every((turn) => turn.chinese && turn.simplified && turn.meaningVi));
    assert.ok(reading.audioTrackId && manifest.tracks.some((track) => track.id === reading.audioTrackId && track.mappingStatus === 'verified'));
  }
});

test('Volume 5 keeps textbook/workbook tracks separate and only publishes verified references', () => {
  assert.equal(manifest.tracks.length, 97);
  assert.equal(manifest.tracks.filter((track) => track.source === 'textbook').length, 86);
  assert.equal(manifest.tracks.filter((track) => track.source === 'workbook').length, 11);
  assert.equal(new Set(manifest.tracks.map((track) => track.id)).size, 97);
  assert.equal(manifest.tracks.filter((track) => track.mappingStatus === 'verified').length, report.verified);
  assert.equal(report.verified, 82);
  assert.equal(report.pending.length, 15);
  assert.equal(manifest.tracks.find((track) => track.id === 'cc5-textbook-unassigned-00').mappingStatus, 'pending');
  assert.equal(manifest.tracks.find((track) => track.id === 'cc5-workbook-unassigned-00').mappingStatus, 'pending');
  assert.equal(manifest.tracks.filter((track) => track.lesson === 1 && track.mappingStatus === 'verified').length, 9);
  for (const track of manifest.tracks) {
    const published = path.join(root, 'public/academy/cc5/audio', `${track.id}.mp3`);
    assert.equal(existsSync(published), track.mappingStatus === 'verified', track.id);
    if (track.mappingStatus !== 'verified') continue;
    assert.ok(track.activity?.pdfPage > 0, track.id);
    assert.equal(track.activity.referenceCode, track.source === 'workbook' ? `${track.originalName.slice(0, -4)}-1` : track.originalName.slice(0, -4));
    const sourcePages = track.source === 'textbook' ? references.textbook : references.workbook;
    const printedCode = track.source === 'workbook' ? String(track.lesson).padStart(2, '0') : track.activity.referenceCode;
    assert.equal(sourcePages[printedCode], track.activity.pdfPage, track.id);
    const bytes = readFileSync(published);
    assert.equal(bytes.length, track.bytes, track.id);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), track.sha256, track.id);
  }
});

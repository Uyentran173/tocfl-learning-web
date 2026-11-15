import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { academyVolume4, academyVolume4Lessons, academyVocabularyByIds, validateAcademyLessonContent } from '../lib/academy-catalog.ts';
import { academyScriptText } from '../lib/academy-script.ts';
import manifest from '../data/academy/cc4-audio-manifest.json' with { type: 'json' };
import reviewed from '../data/academy/cc4-reviewed-content.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');

test('Volume 4 releases only the reviewed first lesson with isolated IDs and complete activities', () => {
  assert.equal(academyVolume4.lessonIds.length, 12);
  assert.equal(academyVolume4Lessons.length, 1);
  const lesson = academyVolume4Lessons[0];
  assert.equal(lesson.id, 'cc4-v4-l01');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 24);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 5);
  assert.equal(lesson.vocabulary.wordIds.length, 70);
  assert.equal(new Set(lesson.vocabulary.wordIds).size, 70);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 70);
  assert.equal(lesson.grammar.length, 8);
  assert.equal(lesson.listening.length, 4);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '十七岁还是二十五岁？');
  const questions = [...lesson.lecture.checks, ...lesson.practice, ...lesson.assessment, ...lesson.listening, ...lesson.grammar.map((point) => point.check)];
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  for (const question of questions) {
    assert.ok(question.options.some((option) => option.id === question.correctOptionId), question.id);
    assert.equal(new Set(question.options.map((option) => option.text)).size, question.options.length, question.id);
  }
});

test('Volume 4 audio keeps 170 source tracks distinct and only publishes page-verified mappings', () => {
  assert.equal(manifest.tracks.length, 170);
  assert.equal(manifest.tracks.filter((track) => track.source === 'textbook').length, 145);
  assert.equal(manifest.tracks.filter((track) => track.source === 'workbook').length, 25);
  assert.equal(new Set(manifest.tracks.map((track) => track.id)).size, 170);
  assert.equal(manifest.tracks.find((track) => track.id === 'cc4-textbook-unassigned-00').mappingStatus, 'pending');
  assert.equal(manifest.tracks.find((track) => track.id === 'cc4-workbook-unassigned-00').mappingStatus, 'pending');
  for (const source of ['textbook', 'workbook']) {
    assert.deepEqual(new Set(manifest.tracks.filter((track) => track.source === source && track.lesson).map((track) => track.lesson)), new Set(Array.from({ length: 12 }, (_, i) => i + 1)));
  }
  for (const track of manifest.tracks) {
    const published = path.join(root, 'public/academy/cc4/audio', `${track.id}.mp3`);
    assert.equal(existsSync(published), track.mappingStatus === 'verified', track.id);
    if (track.mappingStatus === 'verified') {
      assert.ok(track.activity?.pdfPage > 0, track.id);
      assert.equal(track.activity.referenceCode, track.originalName.slice(0, -4));
      const bytes = readFileSync(published);
      assert.equal(bytes.length, track.bytes, track.id);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), track.sha256, track.id);
    }
  }
  assert.ok(reviewed['cc4-textbook-l01-t01'].transcriptTraditional.includes('與其回到冷清的家'));
  assert.ok(reviewed['cc4-textbook-l01-t03'].transcriptTraditional.includes('十七歲的小玲'));
});

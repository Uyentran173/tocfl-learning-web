import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { academyVolume3, academyVolume3Lessons, academyVocabularyByIds, validateAcademyLessonContent } from '../lib/academy-catalog.ts';
import { academyScriptText } from '../lib/academy-script.ts';
import manifest from '../data/academy/cc3-audio-manifest.json' with { type: 'json' };
import reviewed from '../data/academy/cc3-reviewed-content.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');

test('Volume 3 opens all twelve complete lessons with isolated progress IDs', () => {
  assert.equal(academyVolume3.lessonIds.length, 12);
  assert.equal(academyVolume3Lessons.length, 12);
  const academyVolume3Lesson01 = academyVolume3Lessons[0];
  assert.equal(academyVolume3Lesson01.id, 'cc3-v3-l01');
  assert.equal(validateAcademyLessonContent(academyVolume3Lesson01), true);
  assert.equal(academyVolume3Lesson01.lecture.dialogues[0].turns.length, 16);
  assert.equal(academyVolume3Lesson01.lecture.dialogues[1].turns.length, 3);
  assert.equal(academyVolume3Lesson01.vocabulary.wordIds.length, 56);
  assert.equal(new Set(academyVolume3Lesson01.vocabulary.wordIds).size, 56);
  assert.equal(academyVocabularyByIds(academyVolume3Lesson01.vocabulary.wordIds).length, 56);
  assert.equal(academyVolume3Lesson01.grammar.length, 7);
  assert.equal(academyVolume3Lesson01.listening.length, 4);
  assert.equal(academyVolume3Lesson01.practice.length, 8);
  assert.equal(academyVolume3Lesson01.assessment.length, 10);
  assert.equal(academyScriptText(academyVolume3Lesson01.title, 'simplified'), '开学了');
  assert.equal(academyVolume3Lesson01.lecture.dialogues[0].turns[0].simplified.includes('下课'), true);
  for (const [index, lesson] of academyVolume3Lessons.entries()) {
    assert.equal(lesson.id, academyVolume3.lessonIds[index]);
    assert.equal(validateAcademyLessonContent(lesson), true, lesson.id);
    assert.equal(lesson.lecture.dialogues.length, 2);
    assert.equal(lesson.lecture.dialogues[0].audioTrackId, `cc3-textbook-l${String(index + 1).padStart(2, '0')}-t01`);
    assert.equal(lesson.lecture.dialogues[1].audioTrackId, `cc3-textbook-l${String(index + 1).padStart(2, '0')}-t03`);
    assert.equal(new Set(lesson.vocabulary.wordIds).size, lesson.vocabulary.wordIds.length, lesson.id);
    assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, lesson.vocabulary.wordIds.length);
    assert.ok(lesson.lecture.dialogues.every((section) => section.turns.every((turn) => turn.chinese && turn.simplified && turn.meaningVi)));
    const questions = [...lesson.lecture.checks, ...lesson.practice, ...lesson.assessment, ...lesson.listening, ...lesson.grammar.map((point) => point.check)];
    assert.equal(new Set(questions.map((question) => question.id)).size, questions.length, `${lesson.id}: duplicate activity`);
    for (const question of questions) {
      assert.ok(question.options.some((option) => option.id === question.correctOptionId), `${question.id}: missing correct choice`);
      assert.equal(new Set(question.options.map((option) => option.text)).size, question.options.length, `${question.id}: duplicate choices`);
      assert.ok(question.options.every((option) => !option.text.endsWith('…') || option.text.length < 70), `${question.id}: truncated choice`);
    }
  }
  assert.equal(academyVolume3Lessons[11].grammar[5].audioTrackId, undefined, 'The archive omits printed track 12-09');
});

test('Volume 3 audio is mapped to source pages, checked by hash, and uncertain tracks stay private', () => {
  assert.equal(manifest.tracks.length, 160);
  assert.equal(manifest.tracks.filter((item) => item.source === 'textbook').length, 135);
  assert.equal(manifest.tracks.filter((item) => item.source === 'workbook').length, 25);
  assert.equal(new Set(manifest.tracks.map((item) => item.id)).size, 160);
  for (const source of ['textbook', 'workbook']) {
    assert.deepEqual(new Set(manifest.tracks.filter((item) => item.source === source && item.lesson).map((item) => item.lesson)), new Set(Array.from({ length: 12 }, (_, index) => index + 1)));
    assert.equal(manifest.tracks.find((item) => item.id === `cc3-${source}-unassigned-00`).mappingStatus, 'pending');
  }
  const verified = manifest.tracks.filter((item) => item.mappingStatus === 'verified');
  assert.equal(verified.length, 157);
  assert.equal(verified.filter((item) => item.source === 'textbook').length, 133);
  assert.equal(verified.filter((item) => item.source === 'workbook').length, 24);
  for (const track of manifest.tracks) {
    const published = path.join(root, 'public/academy/cc3/audio', `${track.id}.mp3`);
    assert.equal(existsSync(published), track.mappingStatus === 'verified', track.id);
    if (track.mappingStatus === 'verified') {
      assert.ok(track.activity?.pdfPage > 0);
      assert.ok(track.activity?.referenceCode);
      const bytes = readFileSync(published);
      assert.equal(bytes.length, track.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), track.sha256);
    }
  }
  assert.ok(reviewed['cc3-textbook-l01-t01'].transcriptTraditional.includes('羅珊蒂'));
  assert.ok(reviewed['cc3-textbook-l01-t03'].transcriptTraditional.includes('何雅婷'));
  for (let lesson = 2; lesson <= 12; lesson += 1) {
    const code = String(lesson).padStart(2, '0');
    assert.ok(reviewed[`cc3-textbook-l${code}-t01`].transcriptTraditional.length > 500);
    assert.ok(reviewed[`cc3-textbook-l${code}-t03`].transcriptTraditional.length > 200);
  }
  assert.equal(manifest.tracks.find((item) => item.id === 'cc3-textbook-l12-t10').mappingStatus, 'pending');
});

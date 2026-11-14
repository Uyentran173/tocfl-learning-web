import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { academyVolume3, academyVolume3Lesson01, academyVocabularyByIds, validateAcademyLessonContent } from '../lib/academy-catalog.ts';
import { academyScriptText } from '../lib/academy-script.ts';
import manifest from '../data/academy/cc3-audio-manifest.json' with { type: 'json' };
import reviewed from '../data/academy/cc3-reviewed-content.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');

test('Volume 3 opens one complete lesson and keeps eleven future lessons unpublished', () => {
  assert.equal(academyVolume3.lessonIds.length, 12);
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
});

test('Volume 3 audio is isolated by source and only checked Lesson 01 tracks are public', () => {
  assert.equal(manifest.tracks.length, 160);
  assert.equal(manifest.tracks.filter((item) => item.source === 'textbook').length, 135);
  assert.equal(manifest.tracks.filter((item) => item.source === 'workbook').length, 25);
  assert.equal(new Set(manifest.tracks.map((item) => item.id)).size, 160);
  for (const source of ['textbook', 'workbook']) {
    assert.deepEqual(new Set(manifest.tracks.filter((item) => item.source === source && item.lesson).map((item) => item.lesson)), new Set(Array.from({ length: 12 }, (_, index) => index + 1)));
    assert.equal(manifest.tracks.find((item) => item.id === `cc3-${source}-unassigned-00`).mappingStatus, 'pending');
  }
  const verified = manifest.tracks.filter((item) => item.mappingStatus === 'verified');
  assert.equal(verified.length, 13);
  assert.equal(verified.filter((item) => item.source === 'textbook').length, 11);
  assert.equal(verified.filter((item) => item.source === 'workbook').length, 2);
  for (const track of manifest.tracks) {
    const published = path.join(root, 'public/academy/cc3/audio', `${track.id}.mp3`);
    assert.equal(existsSync(published), track.mappingStatus === 'verified', track.id);
    if (track.mappingStatus === 'verified') {
      assert.equal(track.lesson, 1);
      assert.ok(track.activity?.pdfPage > 0);
      const bytes = readFileSync(published);
      assert.equal(bytes.length, track.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), track.sha256);
    }
  }
  assert.ok(reviewed['cc3-textbook-l01-t01'].transcriptTraditional.includes('羅珊蒂'));
  assert.ok(reviewed['cc3-textbook-l01-t03'].transcriptTraditional.includes('何雅婷'));
});

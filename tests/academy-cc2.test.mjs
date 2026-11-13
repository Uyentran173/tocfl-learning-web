import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { academyVolume2, academyVolume2Lesson01, validateAcademyLessonContent, academyVocabularyByIds } from '../lib/academy-catalog.ts';
import { academyScriptText } from '../lib/academy-script.ts';
import audioManifest from '../data/academy/cc2-audio-manifest.json' with { type: 'json' };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Volume 2 publishes one complete, separately identified lesson', () => {
  assert.equal(academyVolume2.lessonIds.length, 15);
  assert.equal(academyVolume2Lesson01.id, 'cc2-v2-l01');
  assert.equal(validateAcademyLessonContent(academyVolume2Lesson01), true);
  assert.equal(academyVolume2Lesson01.lecture.dialogues[0].turns.length, 15);
  assert.equal(academyVolume2Lesson01.lecture.dialogues[1].turns.length, 3);
  assert.equal(academyVolume2Lesson01.vocabulary.wordIds.length, 44);
  assert.equal(academyVocabularyByIds(academyVolume2Lesson01.vocabulary.wordIds).length, 44);
  assert.equal(academyVolume2Lesson01.grammar.length, 5);
  assert.equal(academyVolume2Lesson01.listening.length, 4);
  assert.equal(academyVolume2Lesson01.practice.length, 8);
  assert.equal(academyVolume2Lesson01.assessment.length, 10);
});

test('Volume 2 source text keeps separate Traditional and Simplified spellings', () => {
  const dialogue = academyVolume2Lesson01.lecture.dialogues[0].turns;
  assert.equal(dialogue[3].chinese, '請問，到師大怎麼走？');
  assert.equal(dialogue[3].simplified, '请问，到师大怎么走？');
  assert.equal(academyScriptText('看著地圖，過了第二個紅綠燈。', 'simplified'), '看着地图，过了第二个红绿灯。');
  assert.equal(academyScriptText('看著地圖，過了第二個紅綠燈。', 'traditional'), '看著地圖，過了第二個紅綠燈。');
});

test('only the thirteen PDF-verified Lesson 01 tracks are published', () => {
  const tracks = audioManifest.tracks.filter((track) => track.lesson === 1 && track.mappingStatus === 'verified');
  assert.equal(tracks.length, 13);
  assert.equal(tracks.filter((track) => track.source === 'textbook').length, 9);
  assert.equal(tracks.filter((track) => track.source === 'workbook').length, 4);
  const ids = new Set(tracks.map((track) => track.id));
  assert.equal(ids.size, tracks.length);
  const publicDir = path.join(root, 'public/academy/cc2/audio');
  assert.deepEqual(readdirSync(publicDir).sort(), tracks.map((track) => `${track.id}.mp3`).sort());
  for (const track of tracks) {
    assert.ok(track.activity?.pdfPage && track.activity?.referenceCode, track.id);
    const bytes = readFileSync(path.join(publicDir, `${track.id}.mp3`));
    assert.equal(bytes.length, track.bytes, track.id);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), track.sha256, track.id);
  }
  for (const question of academyVolume2Lesson01.listening) {
    assert.ok(ids.has(question.audioTrackId), question.id);
  }
  for (const dialogue of academyVolume2Lesson01.lecture.dialogues) {
    assert.ok(ids.has(dialogue.audioTrackId), dialogue.id);
  }
  for (const audio of academyVolume2Lesson01.vocabulary.audioTracks) {
    assert.ok(ids.has(audio.id), audio.id);
  }
  for (const point of academyVolume2Lesson01.grammar) {
    assert.ok(ids.has(point.audioTrackId), point.id);
  }
});

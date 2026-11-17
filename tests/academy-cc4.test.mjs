import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { academyVolume4, academyVolume4Lessons, academyVocabularyByIds, validateAcademyLessonContent } from '../lib/academy-catalog.ts';
import { academyScriptText } from '../lib/academy-script.ts';
import manifest from '../data/academy/cc4-audio-manifest.json' with { type: 'json' };
import reviewed from '../data/academy/cc4-reviewed-content.json' with { type: 'json' };
import lesson02Words from '../data/academy/cc4-lesson02-vocabulary.json' with { type: 'json' };
import lesson03Words from '../data/academy/cc4-lesson03-vocabulary.json' with { type: 'json' };
import lesson04Words from '../data/academy/cc4-lesson04-vocabulary.json' with { type: 'json' };
import lesson05Words from '../data/academy/cc4-lesson05-vocabulary.json' with { type: 'json' };
import lesson06Words from '../data/academy/cc4-lesson06-vocabulary.json' with { type: 'json' };
import lesson07Words from '../data/academy/cc4-lesson07-vocabulary.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');

test('Volume 4 releases reviewed lessons with isolated IDs and complete activities', () => {
  assert.equal(academyVolume4.lessonIds.length, 12);
  assert.equal(academyVolume4Lessons.length, 7);
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

test('Volume 4 Lesson 07 preserves the complete college dialogue, vocabulary and reading audio', () => {
  const lesson = academyVolume4Lessons[6];
  assert.equal(lesson.id, 'cc4-v4-l07');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 17);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 4);
  assert.deepEqual(new Set(lesson.lecture.dialogues[0].turns.map((turn) => turn.speaker)), new Set(['博文', '玉珍']));
  assert.ok(lesson.lecture.dialogues[0].turns.at(-1).chinese.includes('寒暑假爭取到企業實習'));
  assert.ok(lesson.lecture.dialogues[1].turns[0].chinese.includes('何清源是學校的風雲人物'));
  assert.equal(lesson07Words.records.length, 78);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 78);
  assert.equal(lesson.grammar.length, 8);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '大学生的事');
  for (const trackId of ['cc4-textbook-l07-t01', 'cc4-textbook-l07-t02', 'cc4-textbook-l07-t03', 'cc4-textbook-l07-t04', 'cc4-textbook-l07-t08']) {
    assert.equal(manifest.tracks.find((track) => track.id === trackId)?.mappingStatus, 'verified');
    assert.ok(existsSync(path.join(root, 'public/academy/cc4/audio', `${trackId}.mp3`)));
  }
  assert.ok(reviewed['cc4-textbook-l07-t01'].transcriptTraditional.includes('現在開始還來得及'));
  assert.ok(reviewed['cc4-textbook-l07-t03'].transcriptTraditional.includes('一見鍾情'));
});

test('Volume 4 Lesson 06 includes the complete earthquake dialogue, reading and verified tracks', () => {
  const lesson = academyVolume4Lessons[5];
  assert.equal(lesson.id, 'cc4-v4-l06');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 20);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 4);
  assert.deepEqual(new Set(lesson.lecture.dialogues[0].turns.map((turn) => turn.speaker)), new Set(['高來恩', '李文麗']));
  assert.equal(lesson.vocabulary.wordIds.length, 89);
  assert.equal(new Set(lesson.vocabulary.wordIds).size, 89);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 89);
  assert.equal(lesson06Words.records.length, 89);
  for (const word of lesson06Words.records) {
    assert.ok(word.exampleTraditional.includes(word.traditional), word.id);
    assert.ok(word.exampleSimplified.includes(word.simplified), word.id);
    assert.ok(word.meaningVi && word.exampleVi && word.pinyin && word.wordClass, word.id);
  }
  assert.equal(lesson.grammar.length, 8);
  assert.equal(lesson.listening.length, 4);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '天摇地动');
  for (const trackId of ['cc4-textbook-l06-t01', 'cc4-textbook-l06-t02', 'cc4-textbook-l06-t03', 'cc4-textbook-l06-t04']) {
    const track = manifest.tracks.find((item) => item.id === trackId);
    assert.equal(track?.mappingStatus, 'verified', trackId);
    assert.ok(existsSync(path.join(root, 'public/academy/cc4/audio', `${trackId}.mp3`)), trackId);
  }
  for (const point of lesson.grammar) {
    if (!point.audioTrackId) continue;
    const track = manifest.tracks.find((item) => item.id === point.audioTrackId);
    assert.equal(track?.mappingStatus, 'verified', point.audioTrackId);
  }
  assert.equal(lesson.grammar[4].audioTrackId, undefined, 'unverified grammar track remains unpublished');
  assert.ok(reviewed['cc4-textbook-l06-t01'].transcriptTraditional.includes('有備無患'));
  assert.ok(reviewed['cc4-textbook-l06-t03'].transcriptTraditional.includes('首先我們在家裡要準備一個救生包'));
});

test('Volume 4 Lesson 05 preserves source passages, vocabulary and verified audio', () => {
  const lesson = academyVolume4Lessons[4];
  assert.equal(lesson.id, 'cc4-v4-l05');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 20);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 3);
  assert.deepEqual(new Set(lesson.lecture.dialogues[0].turns.map((turn) => turn.speaker)), new Set(['馬安同', '李雲真']));
  assert.ok(lesson.lecture.dialogues[1].turns[0].chinese.includes('什麼都漲了，就是薪水沒漲'));
  assert.equal(lesson.vocabulary.wordIds.length, 81);
  assert.equal(new Set(lesson.vocabulary.wordIds).size, 81);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 81);
  assert.equal(lesson05Words.records.length, 81);
  for (const word of lesson05Words.records) {
    assert.ok(word.exampleTraditional.includes(word.traditional), word.id);
    assert.ok(word.exampleSimplified.includes(word.simplified), word.id);
    assert.ok(word.meaningVi && word.exampleVi && word.pinyin && word.wordClass, word.id);
  }
  assert.equal(lesson.grammar.length, 8);
  assert.equal(lesson.listening.length, 4);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '有梦最美');
  for (const trackId of ['cc4-textbook-l05-t01', 'cc4-textbook-l05-t02', 'cc4-textbook-l05-t03', 'cc4-textbook-l05-t04']) {
    const track = manifest.tracks.find((item) => item.id === trackId);
    assert.equal(track?.mappingStatus, 'verified', trackId);
    assert.ok(existsSync(path.join(root, 'public/academy/cc4/audio', `${trackId}.mp3`)), trackId);
  }
  for (const point of lesson.grammar) {
    if (!point.audioTrackId) continue;
    const track = manifest.tracks.find((item) => item.id === point.audioTrackId);
    assert.equal(track?.mappingStatus, 'verified', point.audioTrackId);
    assert.ok(existsSync(path.join(root, 'public/academy/cc4/audio', `${point.audioTrackId}.mp3`)), point.audioTrackId);
  }
  assert.ok(reviewed['cc4-textbook-l05-t01'].transcriptTraditional.includes('賣雞排並不丟臉'));
  assert.ok(reviewed['cc4-textbook-l05-t03'].transcriptTraditional.includes('機會是留給準備好的人'));
});

test('Volume 4 Lesson 04 includes source passages, named vocabulary and verified audio', () => {
  const lesson = academyVolume4Lessons[3];
  assert.equal(lesson.id, 'cc4-v4-l04');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 20);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 3);
  assert.deepEqual(new Set(lesson.lecture.dialogues[0].turns.map((turn) => turn.speaker)), new Set(['林先生', '林太太']));
  assert.equal(lesson.vocabulary.wordIds.length, 77);
  assert.equal(new Set(lesson.vocabulary.wordIds).size, 77);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 77);
  assert.equal(lesson04Words.records.length, 77);
  for (const word of lesson04Words.records) {
    assert.ok(word.exampleTraditional.includes(word.traditional), word.id);
    assert.ok(word.exampleSimplified.includes(word.simplified), word.id);
    assert.ok(word.meaningVi && word.exampleVi && word.pinyin, word.id);
  }
  assert.equal(lesson.grammar.length, 8);
  assert.equal(lesson.listening.length, 4);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '床该摆哪里？');
  for (const trackId of ['cc4-textbook-l04-t01', 'cc4-textbook-l04-t02', 'cc4-textbook-l04-t03', 'cc4-textbook-l04-t04']) {
    const track = manifest.tracks.find((item) => item.id === trackId);
    assert.equal(track?.mappingStatus, 'verified', trackId);
    assert.ok(existsSync(path.join(root, 'public/academy/cc4/audio', `${trackId}.mp3`)), trackId);
  }
  for (const point of lesson.grammar) {
    if (!point.audioTrackId) continue;
    const track = manifest.tracks.find((item) => item.id === point.audioTrackId);
    assert.equal(track?.mappingStatus, 'verified', point.audioTrackId);
    assert.ok(existsSync(path.join(root, 'public/academy/cc4/audio', `${point.audioTrackId}.mp3`)), point.audioTrackId);
  }
  assert.equal(lesson.grammar[3].audioTrackId, undefined, 'unverified grammar summary audio stays unpublished');
  assert.ok(reviewed['cc4-textbook-l04-t01'].transcriptTraditional.includes('正對門'));
  assert.ok(reviewed['cc4-textbook-l04-t03'].transcriptTraditional.includes('台北101大樓'));
});

test('Volume 4 Lesson 03 keeps the two speakers, source vocabulary and verified listening tracks', () => {
  const lesson = academyVolume4Lessons[2];
  assert.equal(lesson.id, 'cc4-v4-l03');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 18);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 3);
  assert.deepEqual(new Set(lesson.lecture.dialogues[0].turns.map((turn) => turn.speaker)), new Set(['外婆', '李文麗']));
  assert.equal(lesson.vocabulary.wordIds.length, 70);
  assert.equal(new Set(lesson.vocabulary.wordIds).size, 70);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 70);
  assert.equal(lesson03Words.records.length, 70);
  for (const word of lesson03Words.records) {
    assert.ok(word.exampleTraditional.includes(word.traditional), word.id);
    assert.ok(word.exampleSimplified.includes(word.simplified), word.id);
    assert.ok(word.meaningVi && word.exampleVi && word.pinyin, word.id);
  }
  assert.equal(lesson.grammar.length, 8);
  assert.equal(lesson.listening.length, 4);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '云端科技');
  for (const trackId of ['cc4-textbook-l03-t01', 'cc4-textbook-l03-t02', 'cc4-textbook-l03-t03', 'cc4-textbook-l03-t04']) {
    const track = manifest.tracks.find((item) => item.id === trackId);
    assert.equal(track?.mappingStatus, 'verified', trackId);
    assert.ok(existsSync(path.join(root, 'public/academy/cc4/audio', `${trackId}.mp3`)), trackId);
  }
  assert.ok(reviewed['cc4-textbook-l03-t01'].transcriptTraditional.includes('不見得好看'));
  assert.ok(reviewed['cc4-textbook-l03-t03'].transcriptTraditional.includes('總而言之'));
});

test('Volume 4 Lesson 02 has source-aligned text, vocabulary, audio and exercises', () => {
  const lesson = academyVolume4Lessons[1];
  assert.equal(lesson.id, 'cc4-v4-l02');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 20);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 3);
  assert.equal(lesson.vocabulary.wordIds.length, 64);
  assert.equal(new Set(lesson.vocabulary.wordIds).size, 64);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 64);
  assert.equal(lesson02Words.records.length, 64);
  for (const word of lesson02Words.records) {
    assert.ok(word.exampleTraditional.includes(word.traditional), word.id);
    assert.ok(word.exampleSimplified.includes(word.simplified), word.id);
    assert.ok(word.meaningVi && word.exampleVi && word.pinyin, word.id);
  }
  assert.equal(lesson.grammar.length, 8);
  assert.equal(lesson.listening.length, 4);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '眼睛、耳朵的飨宴');
  assert.ok(lesson.lecture.dialogues[0].turns[0].chinese.includes('音樂廳'));
  assert.ok(lesson.lecture.dialogues[1].turns[2].chinese.includes('眼睛和耳朵最豐盛的饗宴'));
  for (const trackId of ['cc4-textbook-l02-t01', 'cc4-textbook-l02-t02', 'cc4-textbook-l02-t03', 'cc4-textbook-l02-t04']) {
    const track = manifest.tracks.find((item) => item.id === trackId);
    assert.equal(track?.mappingStatus, 'verified', trackId);
    assert.ok(existsSync(path.join(root, 'public/academy/cc4/audio', `${trackId}.mp3`)), trackId);
  }
  assert.ok(reviewed['cc4-textbook-l02-t01'].transcriptTraditional.includes('免得遲到'));
  assert.ok(reviewed['cc4-textbook-l02-t03'].transcriptTraditional.includes('雲門舞集'));
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

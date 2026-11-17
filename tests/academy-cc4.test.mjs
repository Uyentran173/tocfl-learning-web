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
import lesson08Words from '../data/academy/cc4-lesson08-vocabulary.json' with { type: 'json' };
import lesson09Words from '../data/academy/cc4-lesson09-vocabulary.json' with { type: 'json' };
import lesson10Words from '../data/academy/cc4-lesson10-vocabulary.json' with { type: 'json' };
import lesson11Words from '../data/academy/cc4-lesson11-vocabulary.json' with { type: 'json' };
import lesson12Words from '../data/academy/cc4-lesson12-vocabulary.json' with { type: 'json' };

const root = path.resolve(import.meta.dirname, '..');

test('Volume 4 releases reviewed lessons with isolated IDs and complete activities', () => {
  assert.equal(academyVolume4.lessonIds.length, 12);
  assert.equal(academyVolume4Lessons.length, 12);
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

test('Volume 4 Lesson 12 completes the volume with source-aligned civics content and verified audio', () => {
  const lesson = academyVolume4Lessons[11];
  assert.equal(lesson.id, 'cc4-v4-l12');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 21);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 3);
  assert.ok(lesson.lecture.dialogues[0].turns[7].chinese.includes('小自一個麵包'));
  assert.ok(lesson.lecture.dialogues[1].turns[0].chinese.includes('發展停滯'));
  assert.equal(lesson12Words.records.length, 83);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 83);
  for (const word of lesson12Words.records) {
    assert.ok(word.meaningVi && word.exampleVi && word.pinyin && word.wordClass, word.id);
    const parts = word.traditional.split('…');
    assert.ok(parts.every((part) => word.exampleTraditional.includes(part)), word.id);
    assert.ok(!/[\u4e00-\u9fff]/u.test(word.exampleVi), word.id);
  }
  assert.equal(lesson.grammar.length, 9);
  assert.equal(lesson.practice.length, 9);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '期待美好的未来');
  for (let number = 1; number <= 13; number++) {
    const trackId = `cc4-textbook-l12-t${String(number).padStart(2, '0')}`;
    const track = manifest.tracks.find((item) => item.id === trackId);
    assert.equal(track?.mappingStatus, 'verified', trackId);
    const file = path.join(root, 'public/academy/cc4/audio', `${trackId}.mp3`);
    assert.ok(existsSync(file), trackId);
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), track.sha256, trackId);
  }
  assert.equal(reviewed['cc4-textbook-l12-t01'].transcriptTraditional.split('\n').length, 21);
  assert.equal(reviewed['cc4-textbook-l12-t03'].transcriptTraditional.split('\n').length, 3);
});

test('Volume 4 Lesson 11 preserves multicultural text, 93 words and verified audio', () => {
  const lesson = academyVolume4Lessons[10];
  assert.equal(lesson.id, 'cc4-v4-l11');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 20);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 4);
  assert.ok(lesson.lecture.dialogues[0].turns[12].chinese.includes('語言溝通的障礙'));
  assert.ok(lesson.lecture.dialogues[1].turns[0].chinese.includes('除了學中文'));
  assert.ok(!lesson.lecture.dialogues[1].turns[0].chinese.includes('Kabngangay'));
  assert.equal(lesson11Words.records.length, 93);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 93);
  for (const word of lesson11Words.records) {
    const pieces = word.traditional.replace(/[（）！]/g, '').split('…');
    assert.ok(pieces.every((piece) => word.exampleTraditional.replaceAll('！', '').includes(piece)), word.id);
    assert.ok(word.meaningVi && word.exampleVi && word.pinyin && word.wordClass, word.id);
  }
  assert.equal(lesson.grammar.length, 7);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '文化、种族的大熔炉');
  for (const trackId of ['cc4-textbook-l11-t01', 'cc4-textbook-l11-t02', 'cc4-textbook-l11-t03', 'cc4-textbook-l11-t04', 'cc4-textbook-l11-t05', 'cc4-textbook-l11-t06', 'cc4-textbook-l11-t07', 'cc4-textbook-l11-t08', 'cc4-textbook-l11-t09', 'cc4-textbook-l11-t10', 'cc4-textbook-l11-t11']) {
    const track = manifest.tracks.find((item) => item.id === trackId);
    assert.equal(track?.mappingStatus, 'verified', trackId);
    const file = path.join(root, 'public/academy/cc4/audio', `${trackId}.mp3`);
    assert.ok(existsSync(file), trackId);
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), track.sha256, trackId);
  }
  assert.equal(reviewed['cc4-textbook-l11-t01'].transcriptTraditional.split('\n').length, 20);
  assert.equal(reviewed['cc4-textbook-l11-t03'].transcriptTraditional.split('\n').length, 4);
});

test('Volume 4 Lesson 10 includes reviewed job-interview material and verified audio', () => {
  const lesson = academyVolume4Lessons[9];
  assert.equal(lesson.id, 'cc4-v4-l10');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 18);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 3);
  assert.ok(lesson.lecture.dialogues[0].turns.at(-1).chinese.includes('謝謝各位給我這個機會'));
  assert.ok(lesson.lecture.dialogues[1].turns[0].chinese.includes('找資金'));
  assert.equal(lesson10Words.records.length, 78);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 78);
  for (const word of lesson10Words.records) {
    const traditionalParts = word.traditional.replace(/[（）]/g, '').split('…');
    const simplifiedParts = word.simplified.replace(/[（）]/g, '').split('…');
    assert.ok(traditionalParts.every((part) => word.exampleTraditional.includes(part)), word.id);
    assert.ok(simplifiedParts.every((part) => word.exampleSimplified.includes(part)), word.id);
    assert.ok(word.meaningVi && word.exampleVi && word.pinyin && word.wordClass, word.id);
  }
  assert.equal(lesson.grammar.length, 7);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '应征');
  for (const trackId of ['cc4-textbook-l10-t01', 'cc4-textbook-l10-t02', 'cc4-textbook-l10-t03', 'cc4-textbook-l10-t04']) {
    const track = manifest.tracks.find((item) => item.id === trackId);
    assert.equal(track?.mappingStatus, 'verified', trackId);
    const file = path.join(root, 'public/academy/cc4/audio', `${trackId}.mp3`);
    assert.ok(existsSync(file), trackId);
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), track.sha256, trackId);
  }
  assert.ok(reviewed['cc4-textbook-l10-t01'].transcriptTraditional.includes('何建明，請你先簡單自我介紹一下'));
  assert.ok(reviewed['cc4-textbook-l10-t03'].transcriptTraditional.includes('青年創業貸款'));
});

test('Volume 4 Lesson 09 includes the final dialogue turns, historical reading and verified tracks', () => {
  const lesson = academyVolume4Lessons[8];
  assert.equal(lesson.id, 'cc4-v4-l09');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 20);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 3);
  assert.ok(lesson.lecture.dialogues[0].turns.at(-1).chinese.includes('萬華沒落了'));
  assert.ok(lesson.lecture.dialogues[1].turns[1].chinese.includes('尚未出世的兒子'));
  assert.equal(lesson09Words.records.length, 91);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 91);
  for (const word of lesson09Words.records) {
    assert.ok(word.exampleTraditional.includes(word.traditional), word.id);
    assert.ok(word.exampleSimplified.includes(word.simplified), word.id);
    assert.ok(word.meaningVi && word.exampleVi && word.pinyin && word.wordClass, word.id);
  }
  assert.equal(lesson.grammar.length, 8);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '再谈台湾故事');
  for (const trackId of ['cc4-textbook-l09-t01', 'cc4-textbook-l09-t02', 'cc4-textbook-l09-t03', 'cc4-textbook-l09-t04']) {
    assert.equal(manifest.tracks.find((track) => track.id === trackId)?.mappingStatus, 'verified');
    assert.ok(existsSync(path.join(root, 'public/academy/cc4/audio', `${trackId}.mp3`)));
  }
  assert.ok(reviewed['cc4-textbook-l09-t01'].transcriptTraditional.includes('萬華沒落了'));
  assert.ok(reviewed['cc4-textbook-l09-t03'].transcriptTraditional.includes('落地生根'));
});

test('Volume 4 Lesson 08 preserves the family-choice texts, complete vocabulary and verified audio', () => {
  const lesson = academyVolume4Lessons[7];
  assert.equal(lesson.id, 'cc4-v4-l08');
  assert.equal(validateAcademyLessonContent(lesson), true);
  assert.equal(lesson.lecture.dialogues[0].turns.length, 20);
  assert.equal(lesson.lecture.dialogues[1].turns.length, 4);
  assert.deepEqual(new Set(lesson.lecture.dialogues[0].turns.map((turn) => turn.speaker)), new Set(['王麗華', '魯亞']));
  assert.ok(lesson.lecture.dialogues[1].turns[0].chinese.includes('合不來就分手'));
  assert.equal(lesson08Words.records.length, 93);
  assert.equal(academyVocabularyByIds(lesson.vocabulary.wordIds).length, 93);
  for (const word of lesson08Words.records) {
    assert.ok(word.exampleTraditional.includes(word.traditional), word.id);
    assert.ok(word.exampleSimplified.includes(word.simplified), word.id);
    assert.ok(word.meaningVi && word.exampleVi && word.pinyin && word.wordClass, word.id);
  }
  assert.equal(lesson.grammar.length, 8);
  assert.equal(lesson.practice.length, 8);
  assert.equal(lesson.assessment.length, 10);
  assert.equal(academyScriptText(lesson.title, 'simplified'), '他们的选择');
  for (const trackId of ['cc4-textbook-l08-t01', 'cc4-textbook-l08-t02', 'cc4-textbook-l08-t03', 'cc4-textbook-l08-t04']) {
    assert.equal(manifest.tracks.find((track) => track.id === trackId)?.mappingStatus, 'verified');
    assert.ok(existsSync(path.join(root, 'public/academy/cc4/audio', `${trackId}.mp3`)));
  }
  assert.ok(reviewed['cc4-textbook-l08-t01'].transcriptTraditional.includes('傳宗接代'));
  assert.ok(reviewed['cc4-textbook-l08-t03'].transcriptTraditional.includes('少子化'));
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

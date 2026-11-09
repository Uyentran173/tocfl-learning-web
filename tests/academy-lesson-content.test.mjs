import assert from 'node:assert/strict';
import test from 'node:test';
import { academyLesson01, academyLessonSummaries, academyVocabularyByIds, validateAcademyLessonContent } from '../lib/academy-catalog.ts';
import { academyScriptText } from '../lib/academy-script.ts';
import { mergeGuestProgressValue } from '../lib/progress-merge.ts';

test('CC1 Lesson 01 uses the full verified vocabulary order and distinct scripts', () => {
  const words = academyVocabularyByIds(academyLesson01.vocabulary.wordIds);
  assert.equal(words.length, 43);
  assert.deepEqual(words.slice(0, 24).map((word) => word.sourceRecordId), Array.from({ length: 24 }, (_, i) => `cc1-v1-l01-v1-${String(i + 1).padStart(2, '0')}`));
  assert.deepEqual(words.slice(24).map((word) => word.sourceRecordId), Array.from({ length: 19 }, (_, i) => `cc1-v1-l01-v2-${String(i + 1).padStart(2, '0')}`));
  assert.equal(new Set(words.map((word) => word.id)).size, 43);
  assert.ok(words.every((word) => word.traditional && word.simplified && word.pinyin && word.meaning && word.wordClass && word.exampleTraditional && word.exampleSimplified && word.translation));
  assert.equal(words.find((word) => word.traditional === '臺灣')?.simplified, '台湾');
  assert.equal(words.find((word) => word.traditional === '烏龍茶')?.simplified, '乌龙茶');
});

test('Lesson 01 content is complete and published content keeps stable assessment IDs', () => {
  assert.equal(academyLesson01.title, '歡迎你來臺灣！');
  assert.equal(academyLesson01.titleVi, 'Chào mừng bạn đến Đài Loan!');
  assert.equal(academyLessonSummaries.length, 15);
  assert.equal(academyLesson01.lecture.dialogues.length, 2);
  assert.equal(academyLesson01.grammar.length, 5);
  assert.equal(academyLesson01.practice.length, 12);
  assert.equal(academyLesson01.assessment.length, 12);
  assert.ok(validateAcademyLessonContent(academyLesson01));
  assert.equal(validateAcademyLessonContent({ ...academyLesson01, vocabulary: { ...academyLesson01.vocabulary, wordIds: academyLesson01.vocabulary.wordIds.slice(1) } }), false);
  assert.equal(validateAcademyLessonContent({ ...academyLesson01, assessment: academyLesson01.assessment.map((item, index) => index === 0 ? { ...item, correctOptionId: 'missing' } : item) }), false);
});

test('Tai Wén-authored Lesson 01 questions retain reviewed Traditional and Simplified forms', () => {
  assert.equal(academyScriptText('歡迎你來臺灣！', 'traditional'), '歡迎你來臺灣！');
  assert.equal(academyScriptText('歡迎你來臺灣！', 'simplified'), '欢迎你来台湾！');
  assert.equal(academyScriptText('請問，你是陳小姐嗎？', 'simplified'), '请问，你是陈小姐吗？');
  assert.equal(academyScriptText('我不喜歡喝烏龍茶。', 'simplified'), '我不喜欢喝乌龙茶。');
});

test('guest merge preserves writing, script, submission and conflicting responses', () => {
  const key = 'taiwen-activity:v1:academy:cc1-v1-l01';
  const account = JSON.stringify({ version: 1, currentActivityId: 'cc1-v1-l01-assessment', completedActivityIds: [], answers: { 'cc1-v1-l01-assessment-01': 'a' }, guestAnswers: {}, writingResponses: { 'self-introduction': '我姓陳。' }, guestWritingResponses: {}, assessmentSubmitted: true, script: 'traditional' });
  const guest = JSON.stringify({ version: 1, currentActivityId: 'cc1-v1-l01-practice', completedActivityIds: [], answers: { 'cc1-v1-l01-assessment-01': 'b' }, guestAnswers: {}, writingResponses: { 'self-introduction': '我姓李。' }, assessmentSubmitted: false, script: 'simplified' });
  const merged = JSON.parse(mergeGuestProgressValue(key, account, guest));
  assert.equal(merged.writingResponses['self-introduction'], '我姓陳。');
  assert.equal(merged.guestWritingResponses['self-introduction'], '我姓李。');
  assert.equal(merged.guestAnswers['cc1-v1-l01-assessment-01'], 'b');
  assert.equal(merged.assessmentSubmitted, true);
  assert.equal(merged.script, 'traditional');
  assert.deepEqual(JSON.parse(mergeGuestProgressValue(key, JSON.stringify(merged), guest)), merged);
});

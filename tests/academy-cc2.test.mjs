import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { academyVolume2, academyVolume2Lesson01, academyVolume2Lesson02, academyVolume2Lesson03, academyVolume2Lesson04, academyVolume2Lesson05, academyVolume2Lesson06, academyVolume2Lesson07, academyVolume2Lesson08, academyVolume2Lesson09, academyVolume2Lesson10, validateAcademyLessonContent, academyVocabularyByIds } from '../lib/academy-catalog.ts';
import { academyScriptText } from '../lib/academy-script.ts';
import audioManifest from '../data/academy/cc2-audio-manifest.json' with { type: 'json' };
import reviewedContent from '../data/academy/cc2-reviewed-content.json' with { type: 'json' };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Volume 2 publishes ten complete, separately identified lessons', () => {
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
  assert.equal(academyVolume2Lesson02.id, 'cc2-v2-l02');
  assert.equal(validateAcademyLessonContent(academyVolume2Lesson02), true);
  assert.equal(academyVolume2Lesson02.lecture.dialogues[0].turns.length, 15);
  assert.equal(academyVolume2Lesson02.lecture.dialogues[1].turns.length, 3);
  assert.equal(academyVolume2Lesson02.vocabulary.wordIds.length, 46);
  assert.equal(academyVocabularyByIds(academyVolume2Lesson02.vocabulary.wordIds).length, 46);
  assert.equal(academyVolume2Lesson02.grammar.length, 6);
  assert.equal(academyVolume2Lesson02.listening.length, 4);
  assert.equal(academyVolume2Lesson02.practice.length, 8);
  assert.equal(academyVolume2Lesson02.assessment.length, 10);
  assert.equal(academyVolume2Lesson03.id, 'cc2-v2-l03');
  assert.equal(validateAcademyLessonContent(academyVolume2Lesson03), true);
  assert.equal(academyVolume2Lesson03.lecture.dialogues[0].turns.length, 17);
  assert.equal(academyVolume2Lesson03.lecture.dialogues[1].turns.length, 3);
  assert.equal(academyVolume2Lesson03.vocabulary.wordIds.length, 41);
  assert.equal(academyVocabularyByIds(academyVolume2Lesson03.vocabulary.wordIds).length, 41);
  assert.equal(academyVolume2Lesson03.grammar.length, 6);
  assert.equal(academyVolume2Lesson03.listening.length, 4);
  assert.equal(academyVolume2Lesson03.practice.length, 8);
  assert.equal(academyVolume2Lesson03.assessment.length, 10);
  assert.equal(academyVolume2Lesson04.id, 'cc2-v2-l04');
  assert.equal(validateAcademyLessonContent(academyVolume2Lesson04), true);
  assert.equal(academyVolume2Lesson04.lecture.dialogues[0].turns.length, 18);
  assert.equal(academyVolume2Lesson04.lecture.dialogues[1].turns.length, 3);
  assert.equal(academyVolume2Lesson04.vocabulary.wordIds.length, 45);
  assert.equal(academyVocabularyByIds(academyVolume2Lesson04.vocabulary.wordIds).length, 45);
  assert.equal(academyVolume2Lesson04.grammar.length, 5);
  assert.equal(academyVolume2Lesson04.listening.length, 4);
  assert.equal(academyVolume2Lesson04.practice.length, 8);
  assert.equal(academyVolume2Lesson04.assessment.length, 10);
  assert.equal(academyVolume2Lesson05.id, 'cc2-v2-l05');
  assert.equal(validateAcademyLessonContent(academyVolume2Lesson05), true);
  assert.equal(academyVolume2Lesson05.lecture.dialogues[0].turns.length, 18);
  assert.equal(academyVolume2Lesson05.lecture.dialogues[1].turns.length, 3);
  assert.equal(academyVolume2Lesson05.vocabulary.wordIds.length, 44);
  assert.equal(academyVocabularyByIds(academyVolume2Lesson05.vocabulary.wordIds).length, 44);
  assert.equal(academyVolume2Lesson05.grammar.length, 5);
  assert.equal(academyVolume2Lesson05.listening.length, 4);
  assert.equal(academyVolume2Lesson05.practice.length, 8);
  assert.equal(academyVolume2Lesson05.assessment.length, 10);
  assert.equal(academyVolume2Lesson06.id, 'cc2-v2-l06');
  assert.equal(validateAcademyLessonContent(academyVolume2Lesson06), true);
  assert.equal(academyVolume2Lesson06.lecture.dialogues[0].turns.length, 17);
  assert.equal(academyVolume2Lesson06.lecture.dialogues[1].turns.length, 3);
  assert.equal(academyVolume2Lesson06.vocabulary.wordIds.length, 48);
  assert.equal(academyVocabularyByIds(academyVolume2Lesson06.vocabulary.wordIds).length, 48);
  assert.equal(academyVolume2Lesson06.grammar.length, 5);
  assert.equal(academyVolume2Lesson06.listening.length, 4);
  assert.equal(academyVolume2Lesson06.practice.length, 8);
  assert.equal(academyVolume2Lesson06.assessment.length, 10);
  assert.equal(academyVolume2Lesson07.id, 'cc2-v2-l07');
  assert.equal(validateAcademyLessonContent(academyVolume2Lesson07), true);
  assert.equal(academyVolume2Lesson07.lecture.dialogues[0].turns.length, 17);
  assert.equal(academyVolume2Lesson07.lecture.dialogues[1].turns.length, 3);
  assert.equal(academyVolume2Lesson07.vocabulary.wordIds.length, 42);
  assert.equal(academyVocabularyByIds(academyVolume2Lesson07.vocabulary.wordIds).length, 42);
  assert.equal(academyVolume2Lesson07.grammar.length, 5);
  assert.equal(academyVolume2Lesson07.listening.length, 4);
  assert.equal(academyVolume2Lesson07.practice.length, 8);
  assert.equal(academyVolume2Lesson07.assessment.length, 10);
  assert.equal(academyVolume2Lesson08.id, 'cc2-v2-l08');
  assert.equal(validateAcademyLessonContent(academyVolume2Lesson08), true);
  assert.equal(academyVolume2Lesson08.lecture.dialogues[0].turns.length, 18);
  assert.equal(academyVolume2Lesson08.lecture.dialogues[1].turns.length, 4);
  assert.equal(academyVolume2Lesson08.vocabulary.wordIds.length, 36);
  assert.equal(academyVocabularyByIds(academyVolume2Lesson08.vocabulary.wordIds).length, 36);
  assert.equal(academyVolume2Lesson08.grammar.length, 8);
  assert.equal(academyVolume2Lesson08.listening.length, 4);
  assert.equal(academyVolume2Lesson08.practice.length, 8);
  assert.equal(academyVolume2Lesson08.assessment.length, 10);
  assert.equal(academyVolume2Lesson09.id, 'cc2-v2-l09');
  assert.equal(validateAcademyLessonContent(academyVolume2Lesson09), true);
  assert.equal(academyVolume2Lesson09.lecture.dialogues[0].turns.length, 19);
  assert.equal(academyVolume2Lesson09.lecture.dialogues[1].turns.length, 4);
  assert.equal(academyVolume2Lesson09.vocabulary.wordIds.length, 42);
  assert.equal(academyVocabularyByIds(academyVolume2Lesson09.vocabulary.wordIds).length, 42);
  assert.equal(academyVolume2Lesson09.grammar.length, 6);
  assert.equal(academyVolume2Lesson09.listening.length, 4);
  assert.equal(academyVolume2Lesson09.practice.length, 8);
  assert.equal(academyVolume2Lesson09.assessment.length, 10);
  assert.equal(academyVolume2Lesson10.id, 'cc2-v2-l10');
  assert.equal(validateAcademyLessonContent(academyVolume2Lesson10), true);
  assert.equal(academyVolume2Lesson10.lecture.dialogues[0].turns.length, 21);
  assert.equal(academyVolume2Lesson10.lecture.dialogues[1].turns.length, 3);
  assert.equal(academyVolume2Lesson10.vocabulary.wordIds.length, 45);
  assert.equal(academyVocabularyByIds(academyVolume2Lesson10.vocabulary.wordIds).length, 45);
  assert.equal(academyVolume2Lesson10.grammar.length, 5);
  assert.equal(academyVolume2Lesson10.listening.length, 4);
  assert.equal(academyVolume2Lesson10.practice.length, 8);
  assert.equal(academyVolume2Lesson10.assessment.length, 10);
});

test('Volume 2 source text keeps separate Traditional and Simplified spellings', () => {
  const dialogue = academyVolume2Lesson01.lecture.dialogues[0].turns;
  assert.equal(dialogue[3].chinese, '請問，到師大怎麼走？');
  assert.equal(dialogue[3].simplified, '请问，到师大怎么走？');
  assert.equal(academyScriptText('看著地圖，過了第二個紅綠燈。', 'simplified'), '看着地图，过了第二个红绿灯。');
  assert.equal(academyScriptText('看著地圖，過了第二個紅綠燈。', 'traditional'), '看著地圖，過了第二個紅綠燈。');
  assert.equal(academyVolume2Lesson02.lecture.dialogues[0].turns[6].chinese, '朋友告訴我公車直接到展覽館，不必換車。');
  assert.equal(academyVolume2Lesson02.lecture.dialogues[0].turns[6].simplified, '朋友告诉我公车直接到展览馆，不必换车。');
  assert.equal(academyScriptText('還是坐捷運吧！', 'simplified'), '还是坐捷运吧！');
  assert.equal(academyScriptText(academyVolume2Lesson02.grammar[0].title, 'simplified'), '一点也不 / 没 — hoàn toàn không');
  assert.equal(academyScriptText(academyVolume2Lesson02.grammar[1].title, 'simplified'), '还是…吧 — gợi ý phương án tốt hơn');
  assert.equal(academyScriptText(academyVolume2Lesson03.title, 'simplified'), '你的中文进步了！');
  assert.equal(academyScriptText(academyVolume2Lesson03.grammar[0].title, 'simplified'), '差不多 — gần như; xấp xỉ');
  assert.equal(academyScriptText(academyVolume2Lesson03.grammar[1].title, 'simplified'), '过 — đã từng trải nghiệm');
  assert.equal(academyScriptText(academyVolume2Lesson04.grammar[0].title, 'simplified'), '除了…还… — ngoài… còn…');
  assert.equal(academyScriptText(academyVolume2Lesson04.grammar[3].title, 'simplified'), '给 — cho; vì ai đó');
  assert.equal(academyScriptText(academyVolume2Lesson05.grammar[1].title, 'simplified'), 'V 着 + hành động — vừa giữ trạng thái, vừa làm');
  assert.equal(academyScriptText(academyVolume2Lesson06.title, 'simplified'), '我打算搬到学校附近');
  assert.equal(academyScriptText(academyVolume2Lesson06.grammar[4].title, 'simplified'), '而且 — hơn nữa; và còn');
  assert.equal(academyScriptText(academyVolume2Lesson07.title, 'simplified'), '垃圾车来了！');
  assert.equal(academyScriptText(academyVolume2Lesson07.grammar[3].title, 'simplified'), 'Nơi chốn + V 着 + người / vật');
  assert.equal(academyScriptText(academyVolume2Lesson08.title, 'simplified'), '学功夫');
  assert.equal(academyScriptText(academyVolume2Lesson08.grammar[2].title, 'simplified'), '学 / 教 + 会 — học hoặc dạy thành thạo');
  assert.equal(academyScriptText(academyVolume2Lesson09.title, 'simplified'), '那个城市好漂亮');
  assert.equal(academyScriptText(academyVolume2Lesson09.grammar[2].title, 'simplified'), '跟…比起来 — so sánh hai bên');
  assert.equal(academyScriptText(academyVolume2Lesson10.title, 'simplified'), '欢迎到我家来包饺子');
  assert.equal(academyScriptText(academyVolume2Lesson10.grammar[0].title, 'simplified'), 'V + 出来 — nhận ra sau khi quan sát');
});

test('all published Academy sentences, vocabulary examples and transcripts follow the selected script', () => {
  for (let lessonNumber = 1; lessonNumber <= 10; lessonNumber++) {
    const number = String(lessonNumber).padStart(2, '0');
    const lesson = JSON.parse(readFileSync(path.join(root, `data/academy/cc2-lesson${number}.json`), 'utf8'));
    const vocabulary = JSON.parse(readFileSync(path.join(root, `data/academy/cc2-lesson${number}-vocabulary.json`), 'utf8'));
    function checkSentences(value) {
      if (Array.isArray(value)) { value.forEach(checkSentences); return; }
      if (!value || typeof value !== 'object') return;
      if (typeof value.chinese === 'string' && typeof value.simplified === 'string') {
        assert.equal(value.simplified, academyScriptText(value.chinese, 'simplified'), `${number}: ${value.chinese}`);
      }
      Object.values(value).forEach(checkSentences);
    }
    checkSentences(lesson);
    for (const word of vocabulary.records) {
      assert.equal(word.simplified, academyScriptText(word.traditional, 'simplified'), word.id);
      assert.equal(word.exampleSimplified, academyScriptText(word.exampleTraditional, 'simplified'), word.id);
    }
    for (const track of [1, 3]) {
      const content = reviewedContent[`cc2-textbook-l${number}-t${String(track).padStart(2, '0')}`];
      if (content) assert.equal(content.transcriptSimplified, academyScriptText(content.transcriptTraditional, 'simplified'), `${number}:${track}`);
    }
  }
});

test('only PDF-verified Lesson 01–10 tracks are published', () => {
  const tracks = audioManifest.tracks.filter((track) => track.mappingStatus === 'verified');
  assert.equal(tracks.length, 136);
  assert.equal(tracks.filter((track) => track.lesson === 1).length, 13);
  assert.equal(tracks.filter((track) => track.lesson === 2).length, 14);
  assert.equal(tracks.filter((track) => track.lesson === 2 && track.source === 'textbook').length, 10);
  assert.equal(tracks.filter((track) => track.lesson === 2 && track.source === 'workbook').length, 4);
  assert.equal(tracks.filter((track) => track.lesson === 3 && track.source === 'textbook').length, 10);
  assert.equal(tracks.filter((track) => track.lesson === 3 && track.source === 'workbook').length, 4);
  assert.equal(tracks.filter((track) => track.lesson === 4 && track.source === 'textbook').length, 9);
  assert.equal(tracks.filter((track) => track.lesson === 4 && track.source === 'workbook').length, 4);
  assert.equal(tracks.filter((track) => track.lesson === 5 && track.source === 'textbook').length, 9);
  assert.equal(tracks.filter((track) => track.lesson === 5 && track.source === 'workbook').length, 4);
  assert.equal(tracks.filter((track) => track.lesson === 6 && track.source === 'textbook').length, 9);
  assert.equal(tracks.filter((track) => track.lesson === 6 && track.source === 'workbook').length, 4);
  assert.equal(tracks.filter((track) => track.lesson === 7 && track.source === 'textbook').length, 9);
  assert.equal(tracks.filter((track) => track.lesson === 7 && track.source === 'workbook').length, 4);
  assert.equal(tracks.filter((track) => track.lesson === 8 && track.source === 'textbook').length, 12);
  assert.equal(tracks.filter((track) => track.lesson === 8 && track.source === 'workbook').length, 4);
  assert.equal(tracks.filter((track) => track.lesson === 9 && track.source === 'textbook').length, 10);
  assert.equal(tracks.filter((track) => track.lesson === 9 && track.source === 'workbook').length, 4);
  assert.equal(tracks.filter((track) => track.lesson === 10 && track.source === 'textbook').length, 9);
  assert.equal(tracks.filter((track) => track.lesson === 10 && track.source === 'workbook').length, 4);
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
  for (const lesson of [academyVolume2Lesson01, academyVolume2Lesson02, academyVolume2Lesson03, academyVolume2Lesson04, academyVolume2Lesson05, academyVolume2Lesson06, academyVolume2Lesson07, academyVolume2Lesson08, academyVolume2Lesson09, academyVolume2Lesson10]) {
    for (const question of lesson.listening) assert.ok(ids.has(question.audioTrackId), question.id);
    for (const dialogue of lesson.lecture.dialogues) assert.ok(ids.has(dialogue.audioTrackId), dialogue.id);
    for (const audio of lesson.vocabulary.audioTracks) assert.ok(ids.has(audio.id), audio.id);
    for (const point of lesson.grammar) assert.ok(ids.has(point.audioTrackId), point.id);
  }
});

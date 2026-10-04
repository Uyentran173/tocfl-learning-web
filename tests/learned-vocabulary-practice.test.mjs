import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { addLearnedWord, emptyLearnedPool, masteryFor, mergeLegacyLearned, parseLearnedPool, recordVocabularyAnswer, removeLearnedWord, reviewPriority, vocabularyIdFor } from "../lib/learned-vocabulary.ts";
import { buildGameQuestions, buildLesson, buildPracticeQuestions } from "../lib/vocabulary-practice.ts";

const input = (traditional, pinyin, meaningVi, source = "tocfl") => ({
  sourceRecordId: `${source}:${traditional}`, source, band: source === "tocfl" ? "band_a" : null,
  level: source === "tocfl" ? "level_1" : null, script: "traditional", traditional,
  simplified: traditional === "買" ? "买" : traditional, pinyin, meaningVi, wordClass: null,
  exampleTraditional: `我想${traditional}。`, exampleSimplified: `我想${traditional === "買" ? "买" : traditional}。`,
  exampleVi: `Tôi muốn ${meaningVi}.`,
});

test("a word retains one identity across paths and scripts, without instant mastery", () => {
  const first = addLearnedWord(emptyLearnedPool(), input("買", "mǎi", "mua", "textbook"), "2026-01-01T00:00:00.000Z");
  const next = addLearnedWord(first, { ...input("買", "mǎi", "mua"), script: "simplified" });
  assert.equal(next.words.length, 1);
  assert.equal(next.words[0].vocabularyId, vocabularyIdFor("買", "mǎi"));
  assert.deepEqual(next.words[0].sources, ["textbook", "tocfl"]);
  assert.equal(next.words[0].learnedAt, "2026-01-01T00:00:00.000Z");
  assert.equal(next.words[0].masteryStatus, "Mới học");
});

test("wrong answers raise review priority and later consistent success raises mastery", () => {
  let pool = addLearnedWord(emptyLearnedPool(), input("買", "mǎi", "mua"));
  const id = pool.words[0].vocabularyId;
  pool = recordVocabularyAnswer(pool, id, false);
  assert.equal(pool.words[0].masteryStatus, "Cần ôn lại");
  assert.ok(reviewPriority(pool.words[0]) > 50);
  for (let i = 0; i < 5; i++) pool = recordVocabularyAnswer(pool, id, true);
  assert.equal(pool.words[0].masteryStatus, "Đã khá chắc");
  assert.equal(pool.words[0].correctCount, 5);
  assert.equal(pool.words[0].wrongCount, 1);
  assert.equal(masteryFor(0, 0, []), "Mới học");
});

test("removed old progress stays removed during migration", () => {
  const word = input("買", "mǎi", "mua");
  const deleted = removeLearnedWord(addLearnedWord(emptyLearnedPool(), word), vocabularyIdFor("買", "mǎi"));
  assert.equal(mergeLegacyLearned(deleted, [word]).words.length, 0);
  assert.equal(mergeLegacyLearned(parseLearnedPool(JSON.parse(JSON.stringify(deleted))), [word]).words.length, 0);
});

test("lesson uses learned vocabulary and exercises only grade its IDs", () => {
  let pool = emptyLearnedPool();
  for (const entry of [input("買", "mǎi", "mua"), input("商店", "shāngdiàn", "cửa hàng"), input("價格", "jiàgé", "giá cả"), input("便宜", "piányi", "rẻ")]) pool = addLearnedWord(pool, entry);
  const lesson = buildLesson(pool.words, "traditional");
  assert.ok(lesson);
  assert.ok(lesson.words.every((word) => lesson.lines.some((line) => line.chinese.includes(word.traditional))));
  const questions = buildPracticeQuestions(lesson, "traditional", pool.words);
  assert.ok(questions.length >= 5);
  assert.ok(questions.every((question) => pool.words.some((word) => word.vocabularyId === question.vocabularyId)));
  assert.ok(buildGameQuestions(lesson, "traditional", pool.words, "quick").length >= 3);
  assert.ok(buildGameQuestions(lesson, "traditional", pool.words, "fill").every((question) => question.type === "blank" && pool.words.some((word) => word.vocabularyId === question.vocabularyId)));
  const simplified = buildLesson(pool.words, "simplified");
  assert.ok(simplified.lines.some((line) => line.chinese.includes("买")));
});

test("a curated reading uses matching learned words and question context from that reading", () => {
  let pool = emptyLearnedPool();
  for (const entry of [input("學生", "xuéshēng", "học sinh"), input("老師", "lǎoshī", "giáo viên"), input("作業", "zuòyè", "bài tập"), input("圖書館", "túshūguǎn", "thư viện")]) pool = addLearnedWord(pool, entry);
  const lesson = buildLesson(pool.words, "traditional");
  assert.equal(lesson.title, "Một ngày đi học");
  assert.equal(lesson.kind, "Đoạn văn");
  assert.ok(lesson.words.every((word) => pool.words.includes(word)));
  const questions = buildPracticeQuestions(lesson, "traditional", pool.words);
  assert.ok(questions.some((question) => question.type === "blank" && lesson.lines.some((line) => line.chinese === question.explanation.replace("Câu gốc: ", ""))));
  assert.ok(questions.every((question) => lesson.words.some((word) => word.vocabularyId === question.vocabularyId)));
});

test("source-example fallback follows a useful topic order and labels common supporting words", () => {
  let pool = emptyLearnedPool();
  const entries = [
    { ...input("早餐", "zǎocān", "bữa sáng", "website"), exampleTraditional: "你吃早餐了嗎？", exampleSimplified: "你吃早餐了吗？", exampleVi: "Bạn đã ăn sáng chưa?" },
    { ...input("菜單", "càidān", "thực đơn", "website"), exampleTraditional: "請給我菜單。", exampleSimplified: "请给我菜单。", exampleVi: "Cho tôi xin thực đơn." },
    { ...input("好吃", "hǎochī", "ngon", "website"), exampleTraditional: "這碗麵很好吃。", exampleSimplified: "这碗面很好吃。", exampleVi: "Bát mì này rất ngon." },
  ];
  for (const entry of entries) pool = addLearnedWord(pool, entry);
  const lesson = buildLesson(pool.words, "traditional");
  assert.deepEqual(lesson.words.map((word) => word.traditional), ["早餐", "菜單", "好吃"]);
  assert.equal(lesson.supporting.find((item) => item.chinese === "麵")?.vietnamese, "mì");
  assert.ok(!lesson.supporting.some((item) => item.chinese === "很" && lesson.supporting.some((other) => other.chinese === "很好")));
});

test("real TOCFL A/B entries form lessons in both scripts without disconnected targets", () => {
  const imported = JSON.parse(readFileSync(new URL("../data/vocabulary/tocfl-imported.json", import.meta.url)));
  const enrichment = JSON.parse(readFileSync(new URL("../data/vocabulary/tocfl-enrichment.json", import.meta.url)));
  for (const band of ["band_a", "band_b"]) {
    let pool = emptyLearnedPool();
    const records = imported.records.filter((record) => record.band === band && enrichment.entries[record.id] && record.pinyin && record.simplified).slice(0, 40);
    for (const record of records) {
      const extra = enrichment.entries[record.id];
      pool = addLearnedWord(pool, { sourceRecordId: record.id, source: "tocfl", band, level: record.levelId,
        script: "traditional", traditional: record.traditional, simplified: record.simplified, pinyin: record.pinyin,
        meaningVi: extra.meaningVi, wordClass: record.partOfSpeech.raw,
        exampleTraditional: extra.exampleTraditional, exampleSimplified: extra.exampleSimplified, exampleVi: extra.exampleVi });
    }
    for (const script of ["traditional", "simplified"]) {
      const lesson = buildLesson(pool.words, script);
      assert.ok(lesson, `${band}/${script} needs a lesson`);
      assert.ok(lesson.words.every((word) => pool.words.includes(word)));
      const questions = buildPracticeQuestions(lesson, script, pool.words);
      assert.ok(questions.every((question) => pool.words.some((word) => word.vocabularyId === question.vocabularyId)));
      assert.ok(lesson.lines.every((line) => line.chinese && line.vietnamese));
    }
  }
});

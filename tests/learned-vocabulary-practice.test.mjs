import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { addLearnedWord, emptyLearnedPool, masteryFor, mergeLegacyLearned, parseLearnedPool, recordVocabularyAnswer, removeLearnedWord, reviewPriority, vocabularyIdFor } from "../lib/learned-vocabulary.ts";
import { buildGameQuestions, buildLesson, buildPracticeQuestions, createPairRound, pairArrangement, questionArrangement, randomizeQuestions, shuffle } from "../lib/vocabulary-practice.ts";

const input = (traditional, pinyin, meaningVi, source = "tocfl") => ({
  sourceRecordId: `${source}:${traditional}`, source, band: source === "tocfl" ? "band_a" : null,
  level: source === "tocfl" ? "level_1" : null, script: "traditional", traditional,
  simplified: traditional === "買" ? "买" : traditional, pinyin, meaningVi, wordClass: null,
  exampleTraditional: `我想${traditional}。`, exampleSimplified: `我想${traditional === "買" ? "买" : traditional}。`,
  exampleVi: `Tôi muốn ${meaningVi}.`,
});

test("a word retains one identity across paths and scripts, without instant mastery", () => {
  const first = addLearnedWord(emptyLearnedPool(), { ...input("買", "mǎi", "mua", "textbook"), studySetId: "book:1" }, "2026-01-01T00:00:00.000Z");
  const next = addLearnedWord(first, { ...input("買", "mǎi", "mua"), script: "simplified", studySetId: "band:novice:novice_1" });
  assert.equal(next.words.length, 1);
  assert.equal(next.words[0].vocabularyId, vocabularyIdFor("買", "mǎi"));
  assert.deepEqual(next.words[0].sources, ["textbook", "tocfl"]);
  assert.deepEqual(parseLearnedPool(JSON.parse(JSON.stringify(next))).words[0].studySetIds, ["book:1", "band:novice:novice_1"]);
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

test("unrelated examples are not stitched into a fake lesson", () => {
  let pool = emptyLearnedPool();
  for (const word of [input("早餐", "zǎocān", "bữa sáng"), input("結婚", "jiéhūn", "kết hôn"), input("電腦", "diànnǎo", "máy tính")]) pool = addLearnedWord(pool, word);
  assert.equal(buildLesson(pool.words, "traditional"), null);
});

test("two related daily-life words open one coherent lesson", () => {
  let pool = emptyLearnedPool();
  for (const word of ["洗澡", "起床"].map((hanzi) => ({ ...input(hanzi, hanzi, hanzi), studySetId: "context:daily" }))) pool = addLearnedWord(pool, word);
  const lesson = buildLesson(pool.words, "traditional", 0, "context:daily");
  assert.equal(lesson.title, "Một ngày thường");
  assert.deepEqual(new Set(lesson.words.map((word) => word.traditional)), new Set(["洗澡", "起床"]));
  assert.ok(lesson.lines[0].chinese.includes("先洗澡，再吃早餐"));
});

test("lesson respects the selected learning path and keeps supporting words in its text", () => {
  let pool = emptyLearnedPool();
  for (const word of [
    { ...input("房租", "fángzū", "tiền thuê", "website"), studySetId: "context:housing::study:intermediate:traditional:20:auto", topicId: "housing", band: "band_a" },
    { ...input("房東", "fángdōng", "chủ nhà", "website"), studySetId: "context:housing::study:intermediate:traditional:20:auto", topicId: "housing", band: "band_a" },
    { ...input("押金", "yājīn", "tiền cọc", "website"), studySetId: "context:housing::study:intermediate:traditional:20:auto", topicId: "housing", band: "band_b" },
    { ...input("搬家", "bānjiā", "chuyển nhà", "website"), studySetId: "context:housing::study:intermediate:traditional:20:auto", topicId: "housing", band: "band_a" },
    { ...input("老師", "lǎoshī", "giáo viên"), studySetId: "school" },
  ]) pool = addLearnedWord(pool, word);
  const focus = "context:housing::study:intermediate:traditional:20:auto";
  const lesson = buildLesson(pool.words, "traditional", 0, focus);
  assert.equal(lesson.title, "Xem phòng trọ ở Đài Bắc");
  assert.equal(lesson.kind, "Hội thoại");
  assert.ok(lesson.words.every((word) => word.studySetIds.includes(focus)));
  assert.ok(lesson.words.every((word) => lesson.lines.some((line) => line.chinese.includes(word.traditional))));
  assert.ok(lesson.supporting.every((item) => lesson.lines.some((line) => line.chinese.includes(item.chinese))));
  assert.ok(lesson.comprehension && lesson.comprehension.choices.includes(lesson.comprehension.answer));
  const simplified = buildLesson(pool.words, "simplified", 0, focus);
  assert.ok(simplified.lines.some((line) => line.chinese.includes("房东")));
  assert.ok(simplified.supporting.every((item) => simplified.lines.some((line) => line.chinese.includes(item.chinese))));
});

test("advanced vocabulary selects an advanced coherent situation", () => {
  let pool = emptyLearnedPool();
  for (const word of ["環境", "垃圾", "回收", "鄰居", "改善", "銀行"].map((hanzi) => ({ ...input(hanzi, hanzi, hanzi), band: "band_c", topicId: "environment", studySetId: "context:environment" }))) pool = addLearnedWord(pool, word);
  const lesson = buildLesson(pool.words, "traditional", 0, "context:environment");
  assert.equal(lesson.title, "Lên kế hoạch giảm rác ở khu phố");
  assert.ok(lesson.lines[0].chinese.includes("公園"));
  assert.ok(lesson.lines.at(-1).chinese.includes("改善"));
  assert.ok(lesson.words.length < pool.words.length);
});

test("Fisher–Yates gives each matching column and memory deck a separate arrangement", () => {
  const random = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  let pool = emptyLearnedPool();
  for (const word of [input("買", "mǎi", "mua"), input("商店", "shāngdiàn", "cửa hàng"), input("價格", "jiàgé", "giá"), input("便宜", "piányi", "rẻ")]) pool = addLearnedWord(pool, word);
  const first = createPairRound(pool.words, "traditional", random(1));
  const second = createPairRound(pool.words, "traditional", random(2));
  const ids = (list) => list.map((item) => item.vocabularyId);
  assert.notDeepEqual(ids(first.chinese), ids(pool.words));
  assert.notDeepEqual(ids(first.vietnamese), ids(pool.words));
  assert.notDeepEqual(ids(first.chinese), ids(first.vietnamese));
  assert.notDeepEqual(first.memory.map((item) => item.key), second.memory.map((item) => item.key));
  assert.deepEqual([...new Set(first.memory.map((item) => item.id))].sort(), ids(pool.words).sort());
  assert.deepEqual(shuffle([1, 2, 3, 4], random(3)).sort(), [1, 2, 3, 4]);
});

test("multiple choice answer slots vary by round without changing vocabulary IDs", () => {
  const question = { id: "q", type: "meaning", vocabularyId: "stable-id", prompt: "?", choices: ["correct", "a", "b", "c"], answer: "correct", explanation: "" };
  const slots = new Set();
  for (const value of [0.01, 0.24, 0.51, 0.76, 0.99]) {
    const random = () => value;
    const [round] = randomizeQuestions([question], random);
    slots.add(round.choices.indexOf(round.answer));
    assert.equal(round.vocabularyId, question.vocabularyId);
    assert.deepEqual([...round.choices].sort(), [...question.choices].sort());
  }
  assert.ok(slots.size > 1);
});

test("restarting a two-word game or choice round changes its visible arrangement", () => {
  let pool = emptyLearnedPool();
  for (const word of [input("洗澡", "xǐzǎo", "tắm"), input("起床", "qǐchuáng", "thức dậy")]) pool = addLearnedWord(pool, word);
  const first = createPairRound(pool.words, "traditional", () => 0.5);
  const second = createPairRound(pool.words, "traditional", () => 0.5, pairArrangement(first, false));
  assert.notEqual(pairArrangement(first, false), pairArrangement(second, false));
  assert.ok(second.chinese.every((word, index) => word.vocabularyId !== second.vietnamese[index].vocabularyId));
  const firstMemory = createPairRound(pool.words, "traditional", () => 0.5);
  const secondMemory = createPairRound(pool.words, "traditional", () => 0.5, pairArrangement(firstMemory, true), true);
  assert.notEqual(pairArrangement(firstMemory, true), pairArrangement(secondMemory, true));
  const question = { id: "q", type: "meaning", vocabularyId: pool.words[0].vocabularyId, prompt: "?", choices: ["tắm", "thức dậy"], answer: "tắm", explanation: "" };
  const firstChoice = randomizeQuestions([question], () => 0.5);
  const nextChoice = randomizeQuestions([question], () => 0.5, questionArrangement(firstChoice));
  assert.notEqual(questionArrangement(firstChoice), questionArrangement(nextChoice));
});

test("real TOCFL A/B words form coherent scenes in both scripts", () => {
  const imported = JSON.parse(readFileSync(new URL("../data/vocabulary/tocfl-imported.json", import.meta.url)));
  const enrichment = JSON.parse(readFileSync(new URL("../data/vocabulary/tocfl-enrichment.json", import.meta.url)));
  for (const [band, targets, expected] of [
    ["band_a", ["作業", "圖書館", "老師", "學生"], "Một ngày đi học"],
    ["band_b", ["押金", "房租", "房東", "搬家"], "Xem phòng trọ ở Đài Bắc"],
  ]) {
    let pool = emptyLearnedPool();
    const records = imported.records.filter((record) => targets.includes(record.traditional) && enrichment.entries[record.id] && record.pinyin && record.simplified);
    for (const record of records) {
      const extra = enrichment.entries[record.id];
      pool = addLearnedWord(pool, { sourceRecordId: record.id, source: "tocfl", band: record.band, level: record.levelId,
        script: "traditional", traditional: record.traditional, simplified: record.simplified, pinyin: record.pinyin,
        meaningVi: extra.meaningVi, wordClass: record.partOfSpeech.raw,
        exampleTraditional: extra.exampleTraditional, exampleSimplified: extra.exampleSimplified, exampleVi: extra.exampleVi });
    }
    for (const script of ["traditional", "simplified"]) {
      const lesson = buildLesson(pool.words, script);
      assert.ok(lesson, `${band}/${script} needs a lesson`);
      assert.equal(lesson.title, expected);
      assert.ok(lesson.words.every((word) => pool.words.includes(word)));
      assert.ok(lesson.lines.every((line) => line.chinese && line.vietnamese));
      assert.ok(buildPracticeQuestions(lesson, script, pool.words).every((question) => pool.words.some((word) => word.vocabularyId === question.vocabularyId)));
    }
  }
});

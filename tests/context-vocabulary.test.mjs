import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  contextTopics, createContextCandidates, parseContextRequest, selectContextVocabulary, simplifyManualText,
} from "../lib/context-vocabulary.ts";
import { textbooks, topicSets } from "../lib/vocabulary.ts";

const imported = JSON.parse(readFileSync(new URL("../data/vocabulary/tocfl-imported.json", import.meta.url)));
const enrichment = JSON.parse(readFileSync(new URL("../data/vocabulary/tocfl-enrichment.json", import.meta.url)));
const words = createContextCandidates(imported.records, enrichment.entries, topicSets, textbooks);
const options = { topicId: "food", purpose: "daily", difficulty: "basic", script: "traditional", count: 30, source: "auto" };

test("validates all builder choices and rejects malformed custom requests", () => {
  assert.deepEqual(parseContextRequest(options), options);
  assert.equal(parseContextRequest({ ...options, count: 31 }), null);
  assert.equal(parseContextRequest({ ...options, source: "generated" }), null);
  assert.equal(parseContextRequest({ ...options, topicId: "custom", customTopic: "" }), null);
  assert.equal(parseContextRequest({ ...options, topicId: "custom", customTopic: "âm nhạc" })?.customTopic, "âm nhạc");
  assert.ok(contextTopics.length >= 10);
});

test("official records retain source membership and complete existing study fields", () => {
  const official = words.filter((word) => word.source === "tocfl");
  assert.equal(official.length, 4741);
  assert.ok(official.every((word) => word.id in enrichment.entries && word.traditional && word.simplified && word.meaningVi && word.exampleTraditional && word.exampleSimplified && word.exampleVi));
  assert.ok(official.every((word) => word.band !== "band_c"));
  assert.ok(words.filter((word) => word.source !== "tocfl").every((word) => word.band === null && word.level === null));
});

test("automatic mode prefers official TOCFL entries and removes duplicate written forms", () => {
  const result = selectContextVocabulary(words, options);
  assert.equal(result.words.length, 30);
  assert.equal(result.words.find((word) => word.traditional === "菜單")?.source, "tocfl");
  assert.equal(new Set(result.words.map((word) => word.traditional)).size, result.words.length);
  assert.ok(result.words.every((word) => word.meaningVi && word.pinyin && word.exampleVi));
  assert.ok(!result.words.some((word) => word.traditional === "電腦"));
  const television = words.find((word) => word.traditional === "電視(機)");
  assert.ok(television);
  const duplicate = { ...television, id: "website:duplicate", source: "website", traditional: "電視", simplified: "电视", band: null, level: null };
  const entertainment = selectContextVocabulary([television, duplicate], { ...options, topicId: "entertainment" });
  assert.equal(entertainment.words.length, 1);
});

test("TOCFL purpose in automatic mode uses only official records", () => {
  const result = selectContextVocabulary(words, { ...options, purpose: "tocfl" });
  assert.ok(result.words.length > 0);
  assert.ok(result.words.every((word) => word.source === "tocfl"));
});

test("explicit source selectors never relabel textbook or website words as official", () => {
  const textbook = selectContextVocabulary(words, { ...options, topicId: "shopping", source: "textbook" });
  const website = selectContextVocabulary(words, { ...options, topicId: "shopping", source: "website" });
  assert.deepEqual(textbook.words.map((word) => word.traditional).sort(), ["便宜", "買"]);
  assert.ok(textbook.words.every((word) => word.source === "textbook" && word.band === null));
  assert.ok(website.words.every((word) => word.source === "website" && word.band === null));
  assert.ok(website.words.length < options.count);
});

test("difficulty selection does not present unreviewed Band C as a complete study card", () => {
  const advanced = selectContextVocabulary(words, { ...options, difficulty: "advanced" });
  assert.ok(advanced.words.every((word) => word.level === "level_4" && word.source === "tocfl"));
  const intermediate = selectContextVocabulary(words, { ...options, difficulty: "intermediate" });
  assert.ok(intermediate.words.every((word) => ["level_2", "level_3"].includes(word.level)));
});

test("custom topic keeps its precise scope and reports a shortfall instead of padding", () => {
  const result = selectContextVocabulary(words, { ...options, topicId: "custom", customTopic: "âm nhạc" });
  assert.equal(result.topicLabel, "âm nhạc");
  assert.ok(result.words.length > 0 && result.words.length < options.count);
  assert.ok(result.words.every((word) => !["電影", "電影院"].includes(word.traditional)));
  const unknown = selectContextVocabulary(words, { ...options, topicId: "custom", customTopic: "chủ đề không có trong kho" });
  assert.equal(unknown.words.length, 0);
});

test("manual website/textbook examples have correct Simplified forms without changing their source", () => {
  assert.equal(simplifyManualText("媽媽喜歡喝茶。"), "妈妈喜欢喝茶。");
  assert.equal(simplifyManualText("你好！很高興認識你。"), "你好！很高兴认识你。");
  const website = selectContextVocabulary(words, { ...options, topicId: "family", source: "website", script: "simplified" });
  assert.ok(website.words.every((word) => word.simplified && word.exampleSimplified && word.source === "website"));
});

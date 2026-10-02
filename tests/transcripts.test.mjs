import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildReviewContent } from "../lib/review-content.ts";
import { materializeStructuredTest } from "../lib/structured-tests.ts";

const root = join(import.meta.dirname, "..");
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const exam = read("data/structured-tests/novice-reading-2018-11.json");
const transcripts = read("data/review/listening-transcripts-201811.json");
const listeningVi = read("data/review/listening-translations-vi.json");
const readingVi = read("data/review/reading-translations-vi.json");

test("review maps all 25 transcripts and 25 reading translations to the canonical question IDs", () => {
  const traditional = materializeStructuredTest(exam, "traditional");
  const review = buildReviewContent(traditional, transcripts, listeningVi, readingVi);
  assert.equal(Object.keys(review.listening).length, 25);
  assert.equal(Object.keys(review.reading).length, 25);
  assert.ok(Object.values(review.listening).every((entry) => entry.lines.every((line) => line.vietnamese?.trim())));
  assert.ok(Object.values(review.listening).every((entry) => entry.lines.some((line) => line.highlight && line.chinese.includes(line.highlight))));
  assert.equal(review.listening["listening-q11"].lines.find((line) => line.label === "A")?.highlight, "公司的電話號碼是 8651-0426。");
  assert.equal(review.listening["listening-q21"].lines.find((line) => line.highlight)?.highlight, "今年去台灣玩");
  assert.deepEqual(review.reading["reading-q25"], { kind: "answer", vietnamese: "Rượu rẻ hơn trà." });
  assert.equal(traditional.questions[0].transcript, undefined, "exam questions must not carry review-only transcripts");
});

test("the selected script changes Chinese review text but keeps the same question mapping", () => {
  const traditional = buildReviewContent(materializeStructuredTest(exam, "traditional"), transcripts, listeningVi, readingVi);
  const simplified = buildReviewContent(materializeStructuredTest(exam, "simplified"), transcripts, listeningVi, readingVi);
  assert.equal(traditional.listening["listening-q02"].lines[0].chinese, "這是我的書。");
  assert.equal(simplified.listening["listening-q02"].lines[0].chinese, "这是我的书。");
  assert.equal(simplified.listening["listening-q21"].lines.find((line) => line.highlight)?.highlight, "今年去台湾玩");
});

test("mismatched or missing transcript entries fall back without inventing content", () => {
  const broken = structuredClone(transcripts);
  broken.questions[0].correctAnswer = "A";
  broken.questions.splice(1, 1);
  const review = buildReviewContent(materializeStructuredTest(exam, "traditional"), broken, listeningVi, readingVi);
  assert.equal(review.listening["listening-q01"], undefined);
  assert.equal(review.listening["listening-q02"], undefined);
  assert.ok(review.listening["listening-q03"]);
});

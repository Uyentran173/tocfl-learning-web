import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { materializeStructuredTest, validateStructuredPackage } from "../lib/structured-tests.ts";
import { selectTestScope } from "../lib/tests.ts";

const root = join(import.meta.dirname, "..");
const data = JSON.parse(readFileSync(join(root, "data/structured-tests/novice-reading-2018-11.json"), "utf8"));
const bandA = JSON.parse(readFileSync(join(root, "data/structured-tests/band-a-test-01.json"), "utf8"));
const assetExists = (url) => existsSync(join(root, "public", url.slice(1)));

test("one complete Band Novice exam contains 25 Listening and 25 Reading questions", () => {
  assert.deepEqual(validateStructuredPackage(data, assetExists), []);
  assert.deepEqual(data.exam.componentOrder, ["listening", "reading"]);
  assert.equal(data.exam.totalQuestions, 50);
  for (const skill of data.exam.componentOrder) {
    assert.deepEqual(data.components[skill].questions.map((question) => question.number), Array.from({ length: 25 }, (_, index) => index + 1));
  }
  assert.equal(new Set(Object.values(data.components).flatMap((component) => component.questions.map((question) => question.id))).size, 50);
});

test("script selection keeps shared answers, audio, and section score tables", () => {
  const traditional = materializeStructuredTest(data, "traditional");
  const simplified = materializeStructuredTest(data, "simplified");
  assert.equal(traditional.id, simplified.id);
  assert.equal(traditional.questions.length, 50);
  assert.deepEqual(traditional.questions.map((question) => [question.id, question.correctAnswer, question.audioUrl]), simplified.questions.map((question) => [question.id, question.correctAnswer, question.audioUrl]));
  assert.equal(traditional.questions[0].imageUrl, simplified.questions[0].imageUrl);
  assert.notEqual(traditional.questions[20].imageUrl, simplified.questions[20].imageUrl);
  assert.notEqual(traditional.questions[25].imageUrl, simplified.questions[25].imageUrl);
  assert.deepEqual(traditional.scoreProfiles, simplified.scoreProfiles);
  assert.equal(traditional.scoreProfiles.listening.scores[25], 80);
  assert.equal(traditional.scoreProfiles.reading.scores[25], 80);
  assert.equal(traditional.scoreProfiles.listening.scores[0], undefined);
});

test("Listening introductions are separate from Q1 for Novice and Band A", () => {
  for (const [packageData, expected] of [
    [data, ["part-1-intro.mp3"]],
    [bandA, ["exam-intro.mp3", "part-1-intro.mp3"]],
  ]) {
    const testData = materializeStructuredTest(packageData, "traditional");
    assert.deepEqual(testData.listeningIntroAudio.map((path) => path.split("/").at(-1)), expected);
    assert.equal(testData.questions[0].introAudioUrl, undefined);
    assert.equal(testData.questions[0].audioUrl.split("/").at(-1), "q01.mp3");
    assert.ok(testData.questions.filter((question) => question.section === "listening" && question.number > 1).some((question) => question.introAudioUrl));
  }
});

test("incomplete or swapped assets prevent publishing", () => {
  const broken = structuredClone(data);
  broken.components.listening.questions[0].audio = "/tests/missing.mp3";
  broken.components.reading.questions[0].assets.simplified = broken.components.reading.questions[0].assets.traditional;
  broken.components.reading.questions[1].id = broken.components.listening.questions[1].id;
  const errors = validateStructuredPackage(broken, assetExists).join(" ");
  assert.match(errors, /Thiếu âm thanh/);
  assert.match(errors, /Sai bản chữ/);
  assert.match(errors, /Mã hoặc thứ tự/);
});

test("Band A remains a separate 100-question test with its own answers, audio, images and scores", () => {
  assert.deepEqual(validateStructuredPackage(bandA, assetExists), []);
  const novice = materializeStructuredTest(data, "traditional");
  const traditional = materializeStructuredTest(bandA, "traditional");
  const simplified = materializeStructuredTest(bandA, "simplified");
  assert.notEqual(traditional.id, novice.id);
  assert.equal(traditional.id, "band-a-test-01");
  assert.equal(traditional.level, "Band A");
  assert.equal(traditional.questions.length, 100);
  assert.equal(traditional.questions.filter((q) => q.section === "listening").length, 50);
  assert.equal(traditional.questions.filter((q) => q.section === "reading").length, 50);
  assert.deepEqual(traditional.questions.map((q) => [q.id, q.correctAnswer, q.audioUrl]), simplified.questions.map((q) => [q.id, q.correctAnswer, q.audioUrl]));
  assert.ok(traditional.questions.every((q) => q.imageUrl.startsWith("/tests/band-a-test-01/")));
  assert.ok(novice.questions.every((q) => q.imageUrl.startsWith("/tests/novice-reading-2018-11/")));
  assert.notEqual(traditional.questions[50].imageUrl, simplified.questions[50].imageUrl);
  assert.equal(traditional.questions[49].choices.length, 4);
  assert.equal(traditional.questions[90].choices.length, 6);
  assert.equal(traditional.questions[90].metadata.uniqueChoiceUsageWithinSection, true);
  assert.equal(traditional.scoreProfiles.listening.scores[50], 80);
  assert.equal(traditional.scoreProfiles.reading.scores[50], 80);
});

test("Band A Reading shows source text in both scripts only where choices contain text", () => {
  assert.deepEqual(validateStructuredPackage(bandA, assetExists), []);
  for (const script of ["traditional", "simplified"]) {
    const bandAQuestions = materializeStructuredTest(bandA, script).questions.filter((question) => question.section === "reading");
    const noviceQuestions = materializeStructuredTest(data, script).questions.filter((question) => question.section === "reading");
    assert.ok(bandAQuestions.slice(0, 15).every((question) => question.choices.every((choice) => choice === "")));
    assert.ok(bandAQuestions.slice(15).every((question) => question.choices.every((choice) => choice.trim().length > 0)));
    assert.ok(noviceQuestions.every((question) => question.choices.every((choice) => choice === "")));
    assert.equal(bandAQuestions[15].choices.length, 3);
    assert.equal(bandAQuestions[40].choices.length, 6);
    assert.equal(bandAQuestions[49].choices.length, 4);
  }
  const traditional = materializeStructuredTest(bandA, "traditional").questions.find((question) => question.id === "reading-q16");
  const simplified = materializeStructuredTest(bandA, "simplified").questions.find((question) => question.id === "reading-q16");
  assert.equal(traditional.choices[2], "幾隻小鳥停在屋子上面。");
  assert.equal(simplified.choices[2], "几只小鸟停在屋子上面。");
  assert.equal(traditional.correctAnswer, simplified.correctAnswer);
  assert.notEqual(traditional.imageUrl, simplified.imageUrl);
});

test("scope filters sections without changing the logical test ID or question order", () => {
  const full = materializeStructuredTest(bandA, "simplified");
  const listening = selectTestScope(full, "listening");
  const reading = selectTestScope(full, "reading");
  assert.equal(listening.id, full.id);
  assert.equal(reading.id, full.id);
  assert.deepEqual(listening.sections, ["listening"]);
  assert.deepEqual(reading.sections, ["reading"]);
  assert.deepEqual(listening.questions.map((q) => q.id), full.questions.slice(0, 50).map((q) => q.id));
  assert.deepEqual(reading.questions.map((q) => q.id), full.questions.slice(50).map((q) => q.id));
  assert.equal(listening.questions.length + reading.questions.length, full.questions.length);
});

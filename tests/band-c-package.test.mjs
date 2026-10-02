import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildPlaybackSequences } from "../lib/playback-plan.ts";
import { materializeStructuredTest, validateStructuredPackage } from "../lib/structured-tests.ts";
import { selectTestScope } from "../lib/tests.ts";

const root = join(import.meta.dirname, "..");
const data = JSON.parse(readFileSync(join(root, "data/structured-tests/band-c-test-01.json"), "utf8"));
const transcripts = JSON.parse(readFileSync(join(root, "data/test-supplements/band-c-test-01/listening-transcripts.json"), "utf8"));
const assetExists = (path) => path.startsWith("/tests/band-c-test-01/") && existsSync(join(root, "public", path.slice(1)));

test("Band C is one complete logical test with isolated assets and score tables", () => {
  assert.deepEqual(validateStructuredPackage(data, assetExists), []);
  assert.equal(data.exam.id, "band-c-test-01");
  assert.equal(data.exam.level, "Band C");
  assert.deepEqual(data.exam.variants, ["traditional", "simplified"]);
  assert.deepEqual(data.exam.componentOrder, ["listening", "reading"]);
  assert.deepEqual(data.components.listening.sections.map(({ startQuestion, endQuestion }) => [startQuestion, endQuestion]), [[1, 25], [26, 50]]);
  assert.deepEqual(data.components.reading.sections.map(({ startQuestion, endQuestion }) => [startQuestion, endQuestion]), [[1, 15], [16, 50]]);
  for (const skill of data.exam.componentOrder) {
    const component = data.components[skill];
    assert.equal(component.questions.length, 50);
    assert.equal(component.scoring.maxScore, 80);
    assert.deepEqual(Object.keys(component.scoring.scoreByCorrectCount).map(Number), Array.from({ length: 50 }, (_, index) => index + 1));
    for (const [index, question] of component.questions.entries()) {
      assert.equal(question.id, `${skill}-q${String(index + 1).padStart(2, "0")}`);
      assert.equal(question.number, index + 1);
      assert.equal(question.choices.length, 4);
      assert.ok(question.choices.includes(question.correctAnswer));
      for (const script of data.exam.variants) {
        assert.ok(assetExists(question.assets[script]));
        assert.ok(question.assets[script].includes(`/${skill}/assets/${script}/`));
        const visual = question.visual[script];
        assert.equal(visual.choices.length, 4);
        if (skill === "reading") assert.ok(visual.context);
        for (const crop of [visual.context, visual.prompt, ...visual.choices].filter(Boolean)) {
          assert.ok(crop.x >= 0 && crop.y >= 0 && crop.width > 0 && crop.height > 0);
          assert.ok(crop.x + crop.width <= crop.sourceWidth && crop.y + crop.height <= crop.sourceHeight);
        }
        if (visual.prompt) assert.ok(visual.context.y + visual.context.height <= visual.prompt.y);
        for (let choice = 1; choice < 4; choice++) assert.ok(visual.choices[choice - 1].y < visual.choices[choice].y);
      }
      assert.notEqual(question.assets.traditional, question.assets.simplified);
    }
  }
});

test("Band C shared audio plays once per group in package order", () => {
  const audio = data.components.listening.audio;
  const sequences = buildPlaybackSequences(audio.examPlaybackPlan.slice(2));
  assert.equal(Object.keys(sequences).length, 50);
  assert.deepEqual(audio.examPlaybackPlan.slice(0, 2).map((step) => step.role), ["exam_intro", "part_1_instructions"]);
  for (const group of audio.groups) {
    assert.equal(Object.values(sequences).flat().filter((path) => path === group.sharedAudio).length, 1, group.id);
    const first = `listening-q${String(group.questions[0]).padStart(2, "0")}`;
    assert.equal(sequences[first].at(-2), group.sharedAudio);
    for (const number of group.questions.slice(1)) {
      const id = `listening-q${String(number).padStart(2, "0")}`;
      assert.ok(!sequences[id].includes(group.sharedAudio), id);
    }
  }
  assert.ok(Object.values(sequences).flat().every(assetExists));
  assert.deepEqual(materializeStructuredTest(data, "traditional").listeningIntroAudio, [audio.examIntro, audio.part1Intro]);
});

test("Band C variants, scopes and transcripts stay within this test", () => {
  assert.equal(transcripts.examId, data.exam.id);
  assert.deepEqual(transcripts.groups.flatMap((group) => group.questions).sort((a, b) => a - b), Array.from({ length: 50 }, (_, index) => index + 1));
  for (const script of data.exam.variants) {
    const full = materializeStructuredTest(data, script);
    assert.equal(full.questions.length, 100);
    assert.equal(selectTestScope(full, "listening").questions.length, 50);
    assert.equal(selectTestScope(full, "reading").questions.length, 50);
    assert.ok(full.questions.every((question) => question.choices.length === 4 && question.choices.every(Boolean)));
    assert.ok(full.questions.every((question) => !question.imageUrl && !question.sourceVisual));
    assert.ok(full.questions.filter((question) => question.section === "reading").every((question) => question.passage && (question.number <= 15 || question.question)));
    assert.ok(full.questions.filter((question) => question.section === "listening").every((question) => !question.question));
    assert.ok(full.questions.find((question) => question.id === "reading-q35").passage.includes("【III】"));
    assert.equal(full.scoreProfiles.listening.maxScore, 80);
    assert.equal(full.scoreProfiles.reading.maxScore, 80);
  }
});

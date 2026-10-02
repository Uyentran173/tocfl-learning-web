import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildPlaybackSequences } from "../lib/playback-plan.ts";
import { getBandBReadingVisual } from "../lib/band-b-reading-visual.ts";
import { materializeStructuredTest } from "../lib/structured-tests.ts";

const root = join(import.meta.dirname, "..");
const packageData = JSON.parse(readFileSync(join(root, "data/structured-tests/band-b-test-01.json"), "utf8"));
const transcript = JSON.parse(readFileSync(join(root, "data/test-supplements/band-b-test-01/listening-transcripts.json"), "utf8"));
const review = JSON.parse(readFileSync(join(root, "data/test-supplements/band-b-test-01/review-vi.json"), "utf8"));
const { exam, components } = packageData;
const assetExists = (path) => existsSync(join(root, "public", path.slice(1)));

test("Band B is one isolated 100-question logical test with aligned script variants", () => {
  assert.equal(exam.id, "band-b-test-01");
  assert.equal(exam.level, "Band B");
  assert.deepEqual(exam.variants, ["traditional", "simplified"]);
  assert.deepEqual(exam.componentOrder, ["listening", "reading"]);
  for (const skill of exam.componentOrder) {
    const component = components[skill];
    assert.equal(component.questions.length, 50);
    assert.deepEqual(component.questions.map((question) => question.number), Array.from({ length: 50 }, (_, index) => index + 1));
    assert.equal(component.scoring.maxScore, 80);
    assert.deepEqual(Object.keys(component.scoring.scoreByCorrectCount).map(Number), Array.from({ length: 50 }, (_, index) => index + 1));
    for (const question of component.questions) {
      assert.ok(question.choices.includes(question.correctAnswer));
      for (const script of exam.variants) {
        assert.ok(question.assets[script].startsWith(`/tests/${exam.id}/${skill}/assets/${script}/`));
        assert.ok(assetExists(question.assets[script]));
        assert.equal(question.choiceText[script].length, question.choices.length);
        assert.ok(question.choiceText[script].every(Boolean));
      }
      assert.notEqual(question.assets.traditional, question.assets.simplified);
    }
  }
  assert.deepEqual(components.listening.sections.map(({ startQuestion, endQuestion }) => [startQuestion, endQuestion]), [[1, 30], [31, 50]]);
  assert.deepEqual(components.reading.sections.map(({ startQuestion, endQuestion }) => [startQuestion, endQuestion]), [[1, 15], [16, 50]]);
});

test("the playback plan plays shared audio once before the group's individual tracks", () => {
  const plan = components.listening.audio.examPlaybackPlan;
  const sequences = buildPlaybackSequences(plan);
  assert.equal(Object.keys(sequences).length, 50);
  assert.deepEqual(sequences["listening-q21"].map((path) => path.split("/").at(-1)), ["group-q21-q22.mp3", "q21.mp3"]);
  assert.deepEqual(sequences["listening-q22"].map((path) => path.split("/").at(-1)), ["q22.mp3"]);
  assert.deepEqual(sequences["listening-q01"].map((path) => path.split("/").at(-1)), ["part-1-preamble.mp3", "part-1-intro.mp3", "q01.mp3"]);
  assert.deepEqual(sequences["listening-q31"].map((path) => path.split("/").at(-1)), ["part-2-intro.mp3", "q31.mp3"]);
  assert.equal(sequences["listening-q50"].at(-1).split("/").at(-1), "ending.mp3");
  for (const sequence of Object.values(sequences)) assert.ok(sequence.every(assetExists));
  for (const group of components.listening.audio.groups) {
    assert.equal(Object.values(sequences).flat().filter((path) => path === group.sharedAudio).length, 1);
  }
});

test("each Listening answer review has its own mapped transcript and source evidence", () => {
  assert.equal(transcript.examId, exam.id);
  assert.equal(review.testId, exam.id);
  const groups = new Map(transcript.groups.map((group) => [group.id, group]));
  for (const question of components.listening.questions) {
    const group = groups.get(question.transcriptGroupId);
    assert.ok(group?.questions.includes(question.number), question.id);
    assert.ok(group.traditional && group.simplified);
    const evidence = review.listening[question.id];
    assert.ok(evidence?.vi, question.id);
    assert.ok(group.traditional.includes(evidence.evidenceTraditional), question.id);
    assert.equal(group.traditional.length, group.simplified.length);
  }
  assert.equal(Object.keys(review.reading).length, 50);
});

test("grouped Reading images keep one shared context and only the current question area", () => {
  for (const question of components.reading.questions) {
    for (const script of exam.variants) {
      const visual = getBandBReadingVisual({ section: "reading", number: question.number, script, imageUrl: question.assets[script] });
      if (question.number === 16 || question.number === 17) { assert.equal(visual, null); continue; }
      assert.equal(visual.crops.length, 2, `${script} Q${question.number}`);
      const [context, current] = visual.crops;
      assert.equal(context.x, 0);
      assert.equal(context.y, 0);
      assert.ok(context.y + context.height <= current.y, `${script} Q${question.number}`);
      for (const crop of visual.crops) {
        assert.ok(crop.width > 0 && crop.height > 0 && crop.x >= 0 && crop.y >= 0);
        assert.ok(crop.x + crop.width <= crop.sourceWidth && crop.y + crop.height <= crop.sourceHeight, `${script} Q${question.number}`);
      }
      assert.equal(question.assets[script], components.reading.questions.find((item) => item.stimulusGroupId === question.stimulusGroupId).assets[script]);
    }
  }
});

test("Band B Reading has script-specific text for every passage and current question", () => {
  const reading = components.reading;
  const groups = new Set(reading.questions.map((question) => question.stimulusGroupId));
  assert.equal(Object.keys(reading.displayContexts).length, groups.size);
  for (const question of reading.questions) {
    const context = reading.displayContexts[question.stimulusGroupId];
    assert.ok(context, question.id);
    for (const script of exam.variants) {
      assert.ok(context[script]?.length > 20, `${question.id} ${script} passage`);
      assert.ok(!/（[A-D]）/.test(context[script]), `${question.id} ${script} passage contains choices`);
      if (question.number <= 15) {
        assert.ok(context[script].includes(`【${question.number}】`), `${question.id} ${script} blank`);
      } else {
        assert.ok(question.questionText?.[script]?.endsWith("？"), `${question.id} ${script} prompt`);
        assert.ok(!/^\d+[.、．]/.test(question.questionText[script]), `${question.id} prompt repeats question number`);
      }
      assert.equal(question.choiceText[script].length, 4);
      assert.ok(question.choiceText[script].every((text) => text.trim()));
    }
  }
  assert.equal(reading.questions[15].stimulusGroupId, "reading-g-q16");
  assert.equal(reading.questions[16].stimulusGroupId, "reading-g-q17");
  assert.equal(reading.questions[17].stimulusGroupId, reading.questions[18].stimulusGroupId);
});

test("materialized Band B exam text is per-question while source images remain for review", () => {
  for (const script of exam.variants) {
    const testData = materializeStructuredTest(packageData, script);
    const listening = testData.questions.filter((question) => question.section === "listening");
    const reading = testData.questions.filter((question) => question.section === "reading");
    assert.equal(listening.length, 50);
    assert.equal(reading.length, 50);
    assert.deepEqual(testData.listeningIntroAudio.map((path) => path.split("/").at(-1)), ["part-1-preamble.mp3", "part-1-intro.mp3"]);
    assert.deepEqual(listening[0].simulationAudioSequence.map((path) => path.split("/").at(-1)), ["q01.mp3"]);
    assert.equal(listening[0].introAudioUrl, undefined);
    assert.deepEqual(listening[1].simulationAudioSequence.map((path) => path.split("/").at(-1)), ["q02.mp3"]);
    assert.deepEqual(listening[20].simulationAudioSequence.map((path) => path.split("/").at(-1)), ["group-q21-q22.mp3", "q21.mp3"]);
    assert.deepEqual(listening[21].simulationAudioSequence.map((path) => path.split("/").at(-1)), ["q22.mp3"]);
    for (const question of listening) {
      assert.equal(question.question, "");
      assert.equal(question.passage, undefined);
      assert.equal(question.sourceImageReviewOnly, true);
      assert.ok(question.imageUrl?.includes(`/listening/assets/${script}/`));
    }
    for (const question of reading) {
      const source = components.reading.questions[question.number - 1];
      assert.equal(question.passage, components.reading.displayContexts[source.stimulusGroupId][script]);
      assert.equal(question.question, source.questionText?.[script] ?? "");
      assert.equal(question.choices.length, 4);
      assert.equal(question.sourceImageReviewOnly, true);
      assert.equal(question.imageUrl, source.assets[script]);
    }
    assert.equal(reading[17].passage, reading[18].passage);
    assert.notEqual(reading[17].question, reading[18].question);
  }
});

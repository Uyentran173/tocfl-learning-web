import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const exam = read("data/structured-tests/band-c-test-01.json");
const transcripts = read("data/test-supplements/band-c-test-01/listening-transcripts.json");
const review = read("data/test-supplements/band-c-test-01/review-vi.json");
const groups = new Map(transcripts.groups.flatMap((group) => group.questions.map((number) => [number, group])));

function spokenBody(source) {
  const lines = source.split("\n");
  let first = lines.findIndex((line) => /^[男女]：/.test(line));
  if (first < 0) {
    const instruction = lines.findIndex((line) => /^(?:現在請聽|现在请听)/.test(line));
    first = instruction >= 0 ? instruction + 1 : lines.findIndex((line) => /^(?:這年頭|这年头)/.test(line));
  }
  return lines.slice(Math.max(0, first)).filter((line) => !/^\d{1,2}\.\s/.test(line)).map((line) => line.trim()).join("");
}

test("Band C Listening review covers every question in both scripts with transcript evidence", () => {
  assert.equal(review.testId, exam.exam.id);
  assert.equal(Object.keys(review.listening).length, 50);
  for (const question of exam.components.listening.questions) {
    const note = review.listening[question.id];
    const group = groups.get(question.number);
    assert.ok(note && group, question.id);
    assert.equal(note.number, question.number);
    assert.equal(note.groupId, group.id);
    assert.equal(note.correctAnswer, question.correctAnswer);
    assert.ok(note.transcriptVietnamese.trim());
    assert.ok(note.questionVietnamese.trim());
    assert.ok(note.explanation.trim());
    assert.equal(note.optionVietnamese.length, question.choices.length);
    for (const script of exam.exam.variants) {
      assert.ok(group[script].includes(note.questionChinese[script]), `${question.id} ${script}: question`);
      assert.ok(spokenBody(group[script]).includes(note.evidence[script]), `${question.id} ${script}: evidence`);
      assert.ok(question.choiceText[script].every(Boolean), `${question.id} ${script}: option text`);
    }
  }
});

test("Band C Reading review covers full passages, all options, and passage evidence", () => {
  assert.equal(Object.keys(review.reading).length, 50);
  for (const question of exam.components.reading.questions) {
    const note = review.reading[question.id];
    assert.ok(note, question.id);
    assert.equal(note.number, question.number);
    assert.equal(note.groupId, question.stimulusGroupId);
    assert.equal(note.correctAnswer, question.correctAnswer);
    assert.ok(note.passageVietnamese.trim());
    assert.ok(note.questionVietnamese.trim());
    assert.ok(note.explanation.trim());
    assert.equal(note.optionVietnamese.length, question.choices.length);
    for (const script of exam.exam.variants) {
      const passage = exam.components.reading.displayContexts[question.stimulusGroupId][script];
      assert.ok(passage.includes(note.evidence[script]), `${question.id} ${script}: evidence`);
      assert.ok(question.choiceText[script].every(Boolean), `${question.id} ${script}: option text`);
      if (question.number > 15) assert.ok(question.questionText[script].trim(), `${question.id} ${script}: question text`);
    }
  }
});

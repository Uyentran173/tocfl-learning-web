import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { getBandAReadingVisual } from "../lib/band-a-reading-visual.ts";

const root = process.cwd();
const exam = JSON.parse(readFileSync(join(root, "data/structured-tests/band-a-test-01.json"), "utf8"));
const review = JSON.parse(readFileSync(join(root, "data/test-supplements/band-a-test-01/review-vi.json"), "utf8"));
const transcripts = JSON.parse(readFileSync(join(root, "data/test-supplements/band-a-test-01/listening-transcripts.json"), "utf8"));

test("Q31–40 reuse their actual source images while displaying one question crop at a time", () => {
  for (const script of ["traditional", "simplified"]) {
    for (const groupStart of [31, 36]) {
      const group = exam.components.reading.questions.slice(groupStart - 1, groupStart + 4);
      assert.equal(new Set(group.map((question) => question.assets[script])).size, 1);
      assert.ok(existsSync(join(root, "public", group[0].assets[script])));
      const crops = group.map((question) => getBandAReadingVisual({ ...question, section: "reading", imageUrl: question.assets[script] }));
      assert.ok(crops.every((visual) => visual?.crops.length === 2));
      assert.equal(new Set(crops.map((visual) => visual.crops[0].y)).size, 1);
      assert.equal(new Set(crops.map((visual) => visual.crops[1].y)).size, 5);
      for (const [index, visual] of crops.entries()) {
        const evidence = review.reading[group[index].id].evidence[script];
        const questionCrop = visual.crops[1];
        assert.ok(evidence.y >= questionCrop.y && evidence.y + evidence.height <= questionCrop.y + questionCrop.height);
      }
    }
  }
});

test("larger crops apply to Q41–45 and Q50, while Q46–49 keep their original display path", () => {
  for (const script of ["traditional", "simplified"]) {
    for (const question of exam.components.reading.questions.slice(40)) {
      const visual = getBandAReadingVisual({ ...question, section: "reading", imageUrl: question.assets[script] });
      if (question.number >= 46 && question.number <= 49) assert.equal(visual, null);
      else {
        assert.equal(visual?.crops.length, 1);
        const crop = visual.crops[0];
        const evidence = review.reading[question.id].evidence[script];
        assert.ok(evidence.x >= crop.x && evidence.x + evidence.width <= crop.x + crop.width);
        assert.ok(evidence.y >= crop.y && evidence.y + evidence.height <= crop.y + crop.height);
      }
    }
  }
});

test("review translations and evidence match every Band A question and both scripts", () => {
  assert.equal(review.testId, exam.exam.id);
  for (const skill of ["listening", "reading"]) {
    assert.equal(Object.keys(review[skill]).length, 50);
    for (const question of exam.components[skill].questions) {
      const entry = review[skill][question.id];
      assert.equal(entry.number, question.number);
      assert.equal(entry.correctAnswer, question.correctAnswer);
      assert.ok(entry.vi.trim());
      for (const script of ["traditional", "simplified"]) {
        if (skill === "listening") {
          const source = transcripts.questions.find((item) => item.questionId === question.id);
          assert.ok(source?.[script].includes(entry.evidence[script]), `${question.id} ${script}`);
        } else {
          const evidence = entry.evidence[script];
          assert.ok(evidence.chinese.trim());
          assert.ok(evidence.x >= 0 && evidence.y >= 0);
          assert.ok(evidence.x + evidence.width <= evidence.sourceWidth + 1);
          assert.ok(evidence.y + evidence.height <= evidence.sourceHeight + 1);
        }
      }
    }
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const scripts = ["traditional", "simplified"];
const spillover = new Set(["2:27", "2:50", "3:2", "3:5", "4:8"]);

for (const series of [2, 3, 4]) {
  const id = `band-c-test-0${series}`;
  const packageData = read(`data/structured-tests/${id}.json`);
  const review = read(`data/test-supplements/${id}/review-complete-vi.json`);
  const listening = packageData.components.listening.questions;
  const reading = packageData.components.reading.questions;
  const groupQuestions = new Map();
  for (const question of reading) {
    const group = question.stimulusGroupId;
    groupQuestions.set(group, [...(groupQuestions.get(group) ?? []), question]);
  }

  test(`${id}: every Listening question has a source-grounded review in both scripts`, () => {
    assert.equal(review.testId, id);
    assert.equal(Object.keys(review.listening).length, 50);
    for (const question of listening) {
      const entry = review.listening[question.id];
      assert.ok(entry, question.id);
      assert.equal(entry.number, question.number);
      assert.equal(entry.correctAnswer, question.correctAnswer);
      assert.ok(entry.transcriptVi.trim(), `${question.id}: transcript translation`);
      assert.ok(entry.questionVi.trim(), `${question.id}: question translation`);
      assert.ok(entry.explanationVi.trim(), `${question.id}: explanation`);
      assert.equal(entry.optionTranslations.length, 4);
      assert.ok(entry.optionTranslations.every((value) => value.trim()), `${question.id}: option translations`);
      for (const script of scripts) {
        assert.ok(entry.transcriptChinese[script].trim(), `${question.id} ${script}: transcript`);
        assert.ok(entry.questionChinese[script].trim(), `${question.id} ${script}: question`);
        assert.ok(entry.evidence?.[script], `${question.id} ${script}: evidence`);
        assert.ok(entry.transcriptChinese[script].includes(entry.evidence[script]), `${question.id} ${script}: exact evidence`);
        assert.notEqual(entry.evidence[script], entry.optionChinese[script]["ABCD".indexOf(question.correctAnswer)], `${question.id} ${script}: evidence is not a copied option`);
        assert.equal(entry.optionChinese[script].length, 4);
        for (let index = 0; index < 4; index++) {
          const original = question.choiceText[script][index];
          const reviewed = entry.optionChinese[script][index];
          if (index === 3 && spillover.has(`${series}:${question.number}`)) {
            assert.ok(original.startsWith(reviewed), `${question.id} ${script}: OCR spillover retained in exam only`);
            assert.ok(entry.note?.includes("bị nối thêm"), `${question.id}: source limitation noted`);
          } else {
            assert.equal(reviewed, original, `${question.id} ${script}: option ${index}`);
          }
        }
      }
    }
  });

  test(`${id}: every Reading question has translated choices and source-exact evidence`, () => {
    assert.equal(Object.keys(review.reading).length, 50);
    for (const question of reading) {
      const entry = review.reading[question.id];
      assert.ok(entry, question.id);
      assert.equal(entry.number, question.number);
      assert.equal(entry.correctAnswer, question.correctAnswer);
      assert.ok(entry.questionVi.trim(), `${question.id}: question translation`);
      assert.ok(entry.explanationVi.trim(), `${question.id}: explanation`);
      assert.equal(entry.optionTranslations.length, 4);
      assert.ok(entry.optionTranslations.every((value) => value.trim()), `${question.id}: option translations`);
      const group = groupQuestions.get(question.stimulusGroupId);
      const isGap = question.type === "gap_filling";
      const lastGap = isGap && question.number === Math.max(...group.map((item) => item.number));
      if (!isGap || lastGap) assert.ok(entry.passageVi.trim(), `${question.id}: full passage translation`);
      if (isGap && !lastGap) assert.ok(entry.note?.includes("câu cuối"), `${question.id}: shared gap note`);
      if (lastGap) {
        for (const script of scripts) {
          const completed = entry.completedPassageChinese?.[script];
          assert.ok(completed, `${question.id} ${script}: completed passage`);
          for (const item of group) {
            assert.ok(!completed.includes(`【${item.number}】`), `${question.id} ${script}: blank ${item.number} filled`);
            const answer = item.choiceText[script]["ABCD".indexOf(item.correctAnswer)];
            for (const part of answer.split("…").filter(Boolean)) assert.ok(completed.includes(part), `${question.id} ${script}: answer for blank ${item.number}`);
          }
        }
      }
      for (const script of scripts) {
        assert.deepEqual(entry.optionChinese[script], question.choiceText[script], `${question.id} ${script}: options`);
        assert.equal(entry.questionChinese?.[script] ?? "", question.questionText?.[script] ?? "", `${question.id} ${script}: question`);
        assert.ok(entry.passageChinese[script].trim(), `${question.id} ${script}: Chinese passage`);
        assert.ok(entry.evidence?.[script], `${question.id} ${script}: evidence`);
        assert.ok(entry.passageChinese[script].includes(entry.evidence[script]), `${question.id} ${script}: exact evidence`);
        assert.notEqual(entry.evidence[script], entry.optionChinese[script]["ABCD".indexOf(question.correctAnswer)], `${question.id} ${script}: evidence is not a copied option`);
      }
    }
  });
}

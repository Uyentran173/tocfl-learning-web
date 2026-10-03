import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const normalized = (value) => (value ?? "").replace(/\s+/g, "");

for (const testNumber of ["01", "02"]) {
  test(`Band A ${testNumber}: review data matches every source question and script`, () => {
    const id = `band-a-test-${testNumber}`;
    const exam = read(`data/structured-tests/${id}.json`);
    const transcripts = read(`data/test-supplements/${id}/listening-transcripts.json`);
    const review = read(`data/test-supplements/${id}/${testNumber === "01" ? "review-complete-vi" : "review-vi"}.json`);
    const legacy = testNumber === "01" ? read(`data/test-supplements/${id}/review-vi.json`) : null;
    assert.equal(review.testId, id);
    assert.equal(Object.keys(review.listening).length, 50);
    assert.equal(Object.keys(review.reading).length, testNumber === "01" ? 30 : 50);
    if (testNumber === "02") {
      assert.equal(review.reading["reading-q50"].optionChinese.simplified[1], "必须像他一样努力才行");
      assert.equal(review.listening["listening-q50"].optionChinese.traditional[3], "她覺得這位先生應該請客");
    }

    for (const skill of ["listening", "reading"]) {
      for (const question of exam.components[skill].questions) {
        const entry = review[skill][question.id];
        if (!entry) {
          assert.ok(testNumber === "01" && skill === "reading" && question.number >= 31 && legacy.reading[question.id], question.id);
          continue;
        }
        const label = `${id} ${question.id}`;
        assert.equal(entry.number, question.number, label);
        assert.equal(entry.correctAnswer, question.correctAnswer, label);
        assert.ok(entry.explanationVi?.trim(), label);
        assert.equal(entry.optionTranslations.length, question.choices.length, label);
        assert.ok(entry.optionTranslations.every((option) => option.trim()), label);

        for (const script of ["traditional", "simplified"]) {
          const evidence = entry.evidence?.[script];
          if (skill === "listening") {
            const source = transcripts.questions[question.number - 1][script];
            const chinese = entry.transcriptChinese[script];
            assert.ok(chinese?.trim(), `${label} ${script} transcript`);
            if (source) assert.ok(normalized(source).includes(normalized(chinese)), `${label} ${script} source`);
            if (entry.questionChinese[script]) assert.ok(chinese.includes(entry.questionChinese[script]), `${label} ${script} question`);
            assert.ok(entry.transcriptVi?.trim(), `${label} transcript translation`);
            if (evidence) {
              assert.ok(chinese.includes(evidence), `${label} ${script} evidence`);
              const correctOption = entry.optionChinese[script]["ABCDEF".indexOf(entry.correctAnswer)];
              if (correctOption) assert.notEqual(evidence, correctOption, `${label} ${script} full correct option highlighted`);
            } else assert.ok(entry.sourceLimitation?.trim(), `${label} ${script} missing evidence reason`);
            if (question.number <= 25 && source) {
              const spokenOptions = normalized(source);
              for (const option of entry.optionChinese[script]) assert.ok(spokenOptions.includes(normalized(option)), `${label} ${script} spoken option`);
            }
          } else {
            const source = entry.passageChinese?.[script] || exam.components.reading.displayContexts?.[question.stimulusGroupId]?.[script] || question.questionText?.[script] || entry.questionChinese?.[script] || "";
            if (evidence) assert.ok(normalized(source).includes(normalized(evidence)), `${label} ${script} evidence`);
            else assert.ok(entry.sourceLimitation?.trim(), `${label} missing evidence reason`);
            if (entry.questionChinese?.[script]) assert.ok(normalized(source).includes(normalized(entry.questionChinese[script])) || question.number >= 41, `${label} ${script} question`);
            if (question.choiceText?.[script]?.some(Boolean)) {
              assert.equal(entry.optionTranslations.length, question.choiceText[script].length, `${label} ${script} options`);
            }
          }
        }
      }
    }
  });
}

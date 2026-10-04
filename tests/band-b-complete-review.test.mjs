import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const normalized = (text) => (text ?? "").replace(/\s+/g, "");
const normalizedBlanks = (text) => normalized(text).replace(/【(\d+)】/g, "$1");
const correctedSource = (text, series) => series === "04" ? text
  .replaceAll("七零年付", "七零年代").replaceAll("付替", "代替")
  .replaceAll("下仙", "下令").replaceAll("新命仙", "新命令")
  .replaceAll("一付一付", "一代一代") : text;

for (const series of ["01", "02", "03", "04", "05"]) {
  test(`Band B ${series}: every published review is tied to the source question`, () => {
    const id = `band-b-test-${series}`;
    const exam = read(`data/structured-tests/${id}.json`);
    const review = read(`data/test-supplements/${id}/review-complete-vi.json`);
    assert.equal(review.testId, id);
    assert.equal(Object.keys(review.listening).length, 50);
    assert.equal(Object.keys(review.reading).length, series === "01" ? 0 : 50);

    for (const section of ["listening", "reading"]) {
      for (const question of exam.components[section].questions) {
        const entry = review[section][question.id];
        if (section === "reading" && series === "01") continue; // Existing, published reading review is retained.
        const label = `${id} ${question.id}`;
        assert.ok(entry, label);
        assert.equal(entry.number, question.number, label);
        assert.equal(entry.correctAnswer, question.correctAnswer, label);
        assert.equal(entry.optionTranslations.length, 4, label);
        assert.ok(entry.optionTranslations.every((text) => text?.trim()), label);
        assert.ok(entry.questionVi?.trim(), `${label} Vietnamese question`);
        assert.ok(entry.explanationVi?.trim() || entry.sourceLimitation?.trim(), `${label} explanation or source limitation`);
        if (section === "listening") assert.ok(entry.transcriptVi?.trim(), `${label} Vietnamese transcript`);
        if (section === "reading" && question.number > 18) assert.ok(entry.passageVi?.trim(), `${label} Vietnamese passage`);
        const sourceOptions = question.choiceText.traditional;
        const correctedOption = section === "listening" && ((series === "02" && question.number === 27) || (series === "05" && question.number === 47));
        if (correctedOption) {
          assert.deepEqual(entry.optionChinese.traditional.slice(0, 3), sourceOptions.slice(0, 3), `${label} first three choices`);
          assert.ok(sourceOptions[3].startsWith(entry.optionChinese.traditional[3]), `${label} source option before leaked next-group introduction`);
        } else assert.deepEqual(entry.optionChinese.traditional, sourceOptions, `${label} source choice order`);
        if (section === "reading" && question.assets) {
          for (const asset of Object.values(question.assets)) assert.ok(existsSync(join(root, "public", asset)), `${label} original image ${asset}`);
        }

        for (const script of ["traditional", "simplified"]) {
          const source = section === "listening" ? entry.transcriptChinese?.[script] : entry.passageChinese?.[script];
          const evidence = entry.evidence?.[script];
          assert.ok(source?.trim(), `${label} ${script} source`);
          assert.equal(entry.optionChinese?.[script]?.length, 4, `${label} ${script} Chinese options`);
          assert.ok(entry.optionChinese[script].every((text) => text?.trim()), `${label} ${script} option text`);
          if (evidence) {
            assert.ok(source.includes(evidence), `${label} ${script} exact evidence`);
            assert.notEqual(evidence, entry.optionChinese[script]["ABCD".indexOf(entry.correctAnswer)], `${label} evidence is not the answer choice`);
          } else assert.ok(entry.sourceLimitation?.trim(), `${label} ${script} missing evidence reason`);
          if (section === "reading" && !question.assets) {
            const official = exam.components.reading.displayContexts?.[question.stimulusGroupId]?.[script];
            if (official && script === "traditional") assert.equal(normalizedBlanks(source), normalizedBlanks(correctedSource(official, series)), `${label} official passage`);
          }
        }
      }
    }
  });
}

test("Band B grouped sources, gap completion, and known source limits", () => {
  const b3 = read("data/test-supplements/band-b-test-03/review-complete-vi.json");
  for (const number of [25, 26, 27]) assert.ok(b3.listening[`listening-q${number}`].transcriptChinese.traditional.includes("男：小美"));
  for (const number of [28, 29, 30]) assert.ok(b3.listening[`listening-q${number}`].transcriptChinese.traditional.includes("女：艾維"));
  const gap = b3.reading["reading-q05"];
  assert.ok(gap.completedPassageChinese.traditional.includes("雖然交通不方便，但是有很多自然風景"));
  assert.ok(gap.passageVi.trim());
  assert.ok(b3.reading["reading-q31"].sourceLimitation);
  assert.ok(read("data/test-supplements/band-b-test-02/review-complete-vi.json").reading["reading-q25"].sourceLimitation);
  assert.ok(read("data/test-supplements/band-b-test-05/review-complete-vi.json").reading["reading-q48"].sourceLimitation);
  const b4 = read("data/test-supplements/band-b-test-04/review-complete-vi.json");
  assert.ok(b4.reading["reading-q39"].evidence.simplified.includes("意大利式连锁店"));
  const b5 = read("data/test-supplements/band-b-test-05/review-complete-vi.json");
  assert.ok(b5.reading["reading-q21"].passageChinese.simplified.includes("美味法国面包店"));
});

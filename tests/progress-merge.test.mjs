import assert from "node:assert/strict";
import test from "node:test";
import { addLearnedWord, emptyLearnedPool, parseLearnedPool, recordVocabularyAnswer } from "../lib/learned-vocabulary.ts";
import { mergeGuestProgressValue } from "../lib/progress-merge.ts";

const word = (sourceRecordId, meaningVi) => ({
  sourceRecordId, source: "tocfl", band: "A", level: "level_1", script: "traditional",
  traditional: "學校", simplified: "学校", pinyin: "xuéxiào", meaningVi,
  wordClass: "Danh từ", exampleTraditional: "", exampleSimplified: "", exampleVi: "",
  studySetId: sourceRecordId,
});

test("guest vocabulary merges into an account without losing existing answers or source sets", () => {
  const account = recordVocabularyAnswer(addLearnedWord(emptyLearnedPool(), word("account-set", ""), "2026-10-11T00:00:00.000Z"), "vocab:學校:xuexiao", true);
  let guest = addLearnedWord(emptyLearnedPool(), word("guest-set", "trường học"), "2026-10-10T00:00:00.000Z");
  for (let i = 0; i < 3; i++) guest = recordVocabularyAnswer(guest, "vocab:學校:xuexiao", true, "2026-10-12T00:00:00.000Z");
  const merged = parseLearnedPool(JSON.parse(mergeGuestProgressValue("tocfl-learned-vocabulary-v2", JSON.stringify(account), JSON.stringify(guest))));
  assert.equal(merged.words.length, 1);
  assert.equal(merged.words[0].correctCount, 3);
  assert.equal(merged.words[0].meaningVi, "trường học");
  assert.deepEqual(merged.words[0].studySetIds.sort(), ["account-set", "guest-set"]);
  assert.equal(merged.words[0].learnedAt, "2026-10-10T00:00:00.000Z");
});

test("guest highlights and legacy learned IDs merge without overwriting account entries", () => {
  const accountAnnotation = { id: "same", note: "Ghi chú tài khoản" };
  const guestAnnotations = [{ id: "same", note: "Ghi chú khách" }, { id: "other", highlighted: true }];
  const annotations = JSON.parse(mergeGuestProgressValue("tocfl-practice-annotations:v1:test:traditional", JSON.stringify([accountAnnotation]), JSON.stringify(guestAnnotations)));
  assert.deepEqual(annotations, [{ id: "same", note: "Ghi chú tài khoản" }, { id: "other", highlighted: true }]);
  assert.deepEqual(JSON.parse(mergeGuestProgressValue("tocfl-band-vocabulary-progress-v1", '["a"]', '["a","b"]')), ["a", "b"]);
});

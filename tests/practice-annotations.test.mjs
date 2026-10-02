import assert from "node:assert/strict";
import test from "node:test";
import { annotationKey, createTextAnchor, removeHighlightsInRange, resolveTextAnchor, upsertAnnotation } from "../lib/practice-annotations.ts";

test("a note survives removing its highlight, and a highlight survives deleting its note", () => {
  const text = "今天我們去圖書館看書。";
  const anchor = createTextAnchor("reading-q03", "passage", text, 6, 9);
  assert.ok(anchor);
  const both = upsertAnnotation(upsertAnnotation([], anchor, { highlighted: true }), anchor, { note: "Ôn cụm này" });
  const withoutHighlight = removeHighlightsInRange(both, anchor);
  assert.equal(withoutHighlight.length, 1);
  assert.equal(withoutHighlight[0].highlighted, false);
  assert.equal(withoutHighlight[0].note, "Ôn cụm này");
  const withoutNote = upsertAnnotation(both, anchor, { note: null });
  assert.equal(withoutNote.length, 1);
  assert.equal(withoutNote[0].highlighted, true);
  assert.equal(withoutNote[0].note, undefined);
});

test("range anchors stay on the intended repeated phrase after surrounding text changes", () => {
  const oldText = "先去看書，再去看書。";
  const anchor = createTextAnchor("reading-q12", "question", oldText, 7, 9);
  assert.ok(anchor);
  const changed = "今天先去看書，再去看書。";
  assert.deepEqual(resolveTextAnchor(changed, anchor), { start: 9, end: 11 });
  assert.equal(resolveTextAnchor("今天去學校。", anchor), null);
});

test("storage keys isolate tests and scripts; non-Chinese UI text cannot be anchored", () => {
  assert.notEqual(annotationKey("band-a-test-01", "traditional"), annotationKey("band-a-test-01", "simplified"));
  assert.notEqual(annotationKey("band-a-test-01", "traditional"), annotationKey("novice-reading-2018-11", "traditional"));
  assert.equal(createTextAnchor("q1", "header", "Thời gian còn lại", 0, 5), null);
});

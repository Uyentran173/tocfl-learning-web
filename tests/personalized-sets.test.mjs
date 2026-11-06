import assert from "node:assert/strict";
import test from "node:test";
import { loadPersonalizedSets, personalizedSetId, savePersonalizedSet } from "../lib/personalized-sets.ts";
import { accountProgressKey, pendingProgressKeys, setProgressUser } from "../lib/progress-storage.ts";

test("a generated set uses a stable ID and replaces itself for the same account", () => {
  const previousWindow = globalThis.window;
  const values = new Map();
  const localStorage = {
    get length() { return values.size; }, key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.get(key) ?? null; }, setItem(key, value) { values.set(key, String(value)); }, removeItem(key) { values.delete(key); },
  };
  globalThis.window = { localStorage, dispatchEvent() {} };
  try {
    setProgressUser("user-a");
    const options = { topicId: "custom", customTopic: "du lịch", purpose: "daily", difficulty: "basic", script: "traditional", count: 20, source: "auto" };
    const id = personalizedSetId(options);
    const first = { id, options, result: { words: [], available: 1, topicLabel: "Du lịch" }, savedAt: "2026-11-01T00:00:00Z" };
    savePersonalizedSet(first);
    savePersonalizedSet({ ...first, savedAt: "2026-11-02T00:00:00Z" });
    assert.equal(loadPersonalizedSets().length, 1);
    assert.equal(loadPersonalizedSets()[0].savedAt, "2026-11-02T00:00:00Z");
    assert.ok(localStorage.getItem(accountProgressKey("user-a", "tocfl-personalized-sets:v1")));
    assert.deepEqual(pendingProgressKeys("user-a"), ["tocfl-personalized-sets:v1"]);
    setProgressUser("user-b");
    assert.deepEqual(loadPersonalizedSets(), []);
  } finally { setProgressUser(null); globalThis.window = previousWindow; }
});

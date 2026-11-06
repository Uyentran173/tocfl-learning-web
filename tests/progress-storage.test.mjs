import assert from "node:assert/strict";
import test from "node:test";
import { accountProgressKey, guestProgressEntries, pendingProgressKeys, progressRevision, progressStorage, setProgressRevision, setProgressUser } from "../lib/progress-storage.ts";

function memoryStorage() {
  const values = new Map();
  return {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

test("guest learning remains untouched when accounts save their own progress", () => {
  const previousWindow = globalThis.window;
  const localStorage = memoryStorage();
  globalThis.window = { localStorage, dispatchEvent() {} };
  try {
    setProgressUser(null);
    progressStorage().setItem("tocfl-learned-vocabulary-v2", '{"guest":true}');
    setProgressUser("account-a");
    progressStorage().setItem("tocfl-learned-vocabulary-v2", '{"account":"a"}');
    assert.equal(progressStorage().getItem("tocfl-learned-vocabulary-v2"), '{"account":"a"}');
    assert.equal(localStorage.getItem("tocfl-learned-vocabulary-v2"), '{"guest":true}');
    assert.equal(localStorage.getItem(accountProgressKey("account-a", "tocfl-learned-vocabulary-v2")), '{"account":"a"}');
    assert.deepEqual(pendingProgressKeys("account-a"), ["tocfl-learned-vocabulary-v2"]);
    setProgressUser("account-b");
    assert.equal(progressStorage().getItem("tocfl-learned-vocabulary-v2"), null);
    setProgressUser(null);
    assert.equal(progressStorage().getItem("tocfl-learned-vocabulary-v2"), '{"guest":true}');
    assert.deepEqual(guestProgressEntries(), [{ key: "tocfl-learned-vocabulary-v2", value: '{"guest":true}' }]);
  } finally {
    setProgressUser(null);
    globalThis.window = previousWindow;
  }
});

test("revisions and pending writes stay isolated by authenticated user and key", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { localStorage: memoryStorage(), dispatchEvent() {} };
  try {
    setProgressUser("account-a");
    progressStorage().setItem("tocfl-exam-v3:band-a-test-01", '{"answers":{"q1":0}}');
    setProgressRevision("account-a", "tocfl-exam-v3:band-a-test-01", 4);
    assert.equal(progressRevision("account-a", "tocfl-exam-v3:band-a-test-01"), 4);
    assert.equal(progressRevision("account-b", "tocfl-exam-v3:band-a-test-01"), 0);
    assert.deepEqual(pendingProgressKeys("account-a"), ["tocfl-exam-v3:band-a-test-01"]);
    assert.deepEqual(pendingProgressKeys("account-b"), []);
    setProgressUser("account-b");
    assert.equal(progressStorage().getItem("tocfl-exam-v3:band-a-test-01"), null);
  } finally { setProgressUser(null); globalThis.window = previousWindow; }
});

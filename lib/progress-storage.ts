// Guest keys retain their original names. Signed-in data is isolated per user on this device.
const accountPrefix = "taiwen-account:v1:";
const pendingKey = (userId: string) => `taiwen-pending:v1:${userId}`;
const trackedPrefixes = [
  "tocfl-learned-vocabulary-v2",
  "tocfl-band-vocabulary-progress-v1",
  "tocfl-vocabulary-learned-v1",
  "tocfl-exam-v3:",
  "tocfl-practice-annotations:v1:",
  "taiwen-activity:v1:",
];

let currentUserId: string | null = null;
export const progressWriteEvent = "taiwen-progress-write";

export function setProgressUser(userId: string | null) { currentUserId = userId; }
export function getProgressUser() { return currentUserId; }
export function accountProgressKey(userId: string, key: string) { return `${accountPrefix}${userId}:${key}`; }
export function isTrackedProgressKey(key: string) { return trackedPrefixes.some((prefix) => key.startsWith(prefix)); }
export function pendingProgressKeys(userId: string): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(pendingKey(userId)) ?? "[]");
    return Array.isArray(value) ? value.filter((key): key is string => typeof key === "string" && isTrackedProgressKey(key)) : [];
  } catch { return []; }
}
export function markProgressPending(userId: string, key: string) {
  window.localStorage.setItem(pendingKey(userId), JSON.stringify([...new Set([...pendingProgressKeys(userId), key])]));
}
export function clearProgressPending(userId: string, key: string) {
  window.localStorage.setItem(pendingKey(userId), JSON.stringify(pendingProgressKeys(userId).filter((item) => item !== key)));
}

export function progressStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  const keyFor = (key: string) => currentUserId && isTrackedProgressKey(key) ? accountProgressKey(currentUserId, key) : key;
  return {
    getItem(key) { return window.localStorage.getItem(keyFor(key)); },
    setItem(key, value) {
      window.localStorage.setItem(keyFor(key), value);
      if (currentUserId && isTrackedProgressKey(key)) {
        markProgressPending(currentUserId, key);
        window.dispatchEvent(new CustomEvent(progressWriteEvent, { detail: { userId: currentUserId, key, value } }));
      }
    },
    removeItem(key) {
      window.localStorage.removeItem(keyFor(key));
      if (currentUserId && isTrackedProgressKey(key)) {
        markProgressPending(currentUserId, key);
        window.dispatchEvent(new CustomEvent(progressWriteEvent, { detail: { userId: currentUserId, key, value: null } }));
      }
    },
  };
}

export function guestProgressEntries(): { key: string; value: string }[] {
  const entries: { key: string; value: string }[] = [];
  for (let index = 0; index < window.localStorage.length; index++) {
    const key = window.localStorage.key(index);
    if (!key || !isTrackedProgressKey(key)) continue;
    const value = window.localStorage.getItem(key);
    if (value !== null) entries.push({ key, value });
  }
  return entries;
}

export function accountProgressEntries(userId: string): { key: string; value: string }[] {
  const prefix = `${accountPrefix}${userId}:`;
  const entries: { key: string; value: string }[] = [];
  for (let index = 0; index < window.localStorage.length; index++) {
    const storageKey = window.localStorage.key(index);
    if (!storageKey?.startsWith(prefix)) continue;
    const key = storageKey.slice(prefix.length);
    const value = window.localStorage.getItem(storageKey);
    if (value !== null && isTrackedProgressKey(key)) entries.push({ key, value });
  }
  return entries;
}

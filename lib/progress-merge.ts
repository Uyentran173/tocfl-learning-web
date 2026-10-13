import { masteryFor, parseLearnedPool, type LearnedVocabularyPool } from "./learned-vocabulary.ts";

function safeParse(value: string): unknown { try { return JSON.parse(value); } catch { return null; } }

function mergePool(accountValue: string | null, guestValue: string): string {
  const account = parseLearnedPool(safeParse(accountValue ?? ""));
  const guest = parseLearnedPool(safeParse(guestValue));
  const words = new Map(account.words.map((word) => [word.vocabularyId, word]));
  for (const word of guest.words) {
    const saved = words.get(word.vocabularyId);
    if (!saved && !account.removedIds.includes(word.vocabularyId)) {
      words.set(word.vocabularyId, word);
      continue;
    }
    if (!saved) continue;
    const correctCount = Math.max(saved.correctCount, word.correctCount);
    const wrongCount = Math.max(saved.wrongCount, word.wrongCount);
    const recent = (Date.parse(word.lastReviewedAt ?? "") || 0) > (Date.parse(saved.lastReviewedAt ?? "") || 0) ? word : saved;
    words.set(word.vocabularyId, {
      ...saved,
      correctCount, wrongCount,
      reviewPerformance: recent.reviewPerformance,
      lastReviewedAt: recent.lastReviewedAt,
      learnedAt: Date.parse(word.learnedAt) < Date.parse(saved.learnedAt) ? word.learnedAt : saved.learnedAt,
      meaningVi: saved.meaningVi || word.meaningVi,
      exampleTraditional: saved.exampleTraditional || word.exampleTraditional,
      exampleSimplified: saved.exampleSimplified || word.exampleSimplified,
      exampleVi: saved.exampleVi || word.exampleVi,
      sourceRecordIds: [...new Set([...saved.sourceRecordIds, ...word.sourceRecordIds])],
      sources: [...new Set([...saved.sources, ...word.sources])],
      studySetIds: [...new Set([...saved.studySetIds, ...word.studySetIds])],
      topicIds: [...new Set([...saved.topicIds, ...word.topicIds])],
      masteryStatus: masteryFor(correctCount, wrongCount, recent.reviewPerformance),
    });
  }
  const merged: LearnedVocabularyPool = {
    version: 2,
    words: [...words.values()],
    removedIds: [...new Set([...account.removedIds, ...guest.removedIds])].filter((id) => !words.has(id)),
  };
  return JSON.stringify(merged);
}

function mergeArray(accountValue: string | null, guestValue: string): string {
  const account = safeParse(accountValue ?? "[]");
  const guest = safeParse(guestValue);
  if (!Array.isArray(account) || !Array.isArray(guest)) return accountValue ?? guestValue;
  if (account.every((item) => typeof item === "string") && guest.every((item) => typeof item === "string")) {
    return JSON.stringify([...new Set([...account, ...guest])]);
  }
  const byId = new Map<string, unknown>();
  for (const item of guest) if (item && typeof item === "object" && typeof item.id === "string") byId.set(item.id, item);
  for (const item of account) if (item && typeof item === "object" && typeof item.id === "string") byId.set(item.id, item);
  return JSON.stringify([...byId.values()]);
}

export function mergeGuestProgressValue(key: string, accountValue: string | null, guestValue: string): string {
  if (key === "tocfl-learned-vocabulary-v2") return mergePool(accountValue, guestValue);
  if (key.startsWith("tocfl-practice-annotations:") || key.includes("vocabulary-progress") || key.includes("vocabulary-learned")) return mergeArray(accountValue, guestValue);
  return accountValue ?? guestValue;
}

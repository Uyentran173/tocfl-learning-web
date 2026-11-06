import type { ContextRequest, ContextWord } from "./context-vocabulary";
import { progressStorage } from "./progress-storage.ts";

export const personalizedSetsKey = "tocfl-personalized-sets:v1";
export type SavedVocabularySet = {
  id: string;
  options: ContextRequest;
  result: { words: ContextWord[]; available: number; topicLabel: string };
  savedAt: string;
};

export function personalizedSetId(options: ContextRequest): string {
  return `context:${[options.topicId, encodeURIComponent(options.customTopic ?? ""), options.purpose, options.difficulty, options.script, options.count, options.source].join(":")}`;
}

export function parsePersonalizedSets(value: unknown): SavedVocabularySet[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is SavedVocabularySet =>
    !!item && typeof item === "object" && typeof item.id === "string" && item.id.startsWith("context:")
      && !!item.options && typeof item.options === "object" && !!item.result
      && typeof item.result === "object" && Array.isArray(item.result.words)
      && typeof item.result.topicLabel === "string" && typeof item.savedAt === "string");
}

export function loadPersonalizedSets(): SavedVocabularySet[] {
  try { return parsePersonalizedSets(JSON.parse(progressStorage().getItem(personalizedSetsKey) ?? "[]")); }
  catch { return []; }
}

export function savePersonalizedSet(entry: SavedVocabularySet): SavedVocabularySet[] {
  const previous = loadPersonalizedSets();
  const next = [entry, ...previous.filter((item) => item.id !== entry.id)].slice(0, 30);
  progressStorage().setItem(personalizedSetsKey, JSON.stringify(next));
  return next;
}

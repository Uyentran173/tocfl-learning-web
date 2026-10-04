export type VocabularySource = "tocfl" | "textbook" | "website";
export type VocabularyScript = "traditional" | "simplified";
export type MasteryStatus = "Mới học" | "Đang ghi nhớ" | "Đã khá chắc" | "Cần ôn lại";

export type LearnedVocabularyInput = {
  sourceRecordId: string;
  source: VocabularySource;
  band: string | null;
  level: string | null;
  script: VocabularyScript;
  traditional: string;
  simplified: string;
  pinyin: string;
  meaningVi: string;
  wordClass: string | null;
  exampleTraditional: string;
  exampleSimplified: string;
  exampleVi: string;
};

export type LearnedVocabularyWord = LearnedVocabularyInput & {
  vocabularyId: string;
  sourceRecordIds: string[];
  sources: VocabularySource[];
  learnedAt: string;
  lastReviewedAt: string | null;
  correctCount: number;
  wrongCount: number;
  reviewPerformance: boolean[];
  masteryStatus: MasteryStatus;
};

export type LearnedVocabularyPool = { version: 2; words: LearnedVocabularyWord[]; removedIds: string[] };
export const learnedPoolStorageKey = "tocfl-learned-vocabulary-v2";
export const learnedPoolChangedEvent = "tocfl-learned-vocabulary-changed";

export function canonicalHanzi(text: string): string {
  return text.split(/[\/／]/)[0].replace(/\([^)]*\)/g, "").replace(/\s/g, "").trim();
}

export function vocabularyIdFor(traditional: string, pinyin: string): string {
  const pronunciation = pinyin.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
  return `vocab:${canonicalHanzi(traditional)}:${pronunciation}`;
}

export function masteryFor(correctCount: number, wrongCount: number, recent: boolean[]): MasteryStatus {
  if (correctCount + wrongCount === 0) return "Mới học";
  if (wrongCount > correctCount || recent.slice(-2).filter((result) => !result).length === 2) return "Cần ôn lại";
  if (correctCount >= 3 && correctCount / (correctCount + wrongCount) >= 0.8 && recent.slice(-3).every(Boolean)) return "Đã khá chắc";
  return "Đang ghi nhớ";
}

export function emptyLearnedPool(): LearnedVocabularyPool { return { version: 2, words: [], removedIds: [] }; }

function isSource(value: unknown): value is VocabularySource { return value === "tocfl" || value === "textbook" || value === "website"; }
function isScript(value: unknown): value is VocabularyScript { return value === "traditional" || value === "simplified"; }

export function parseLearnedPool(value: unknown): LearnedVocabularyPool {
  if (!value || typeof value !== "object") return emptyLearnedPool();
  const input = value as Record<string, unknown>;
  if (input.version !== 2 || !Array.isArray(input.words)) return emptyLearnedPool();
  const words: LearnedVocabularyWord[] = [];
  const seen = new Set<string>();
  for (const value of input.words) {
    if (!value || typeof value !== "object") continue;
    const row = value as Record<string, unknown>;
    if (typeof row.traditional !== "string" || typeof row.pinyin !== "string" || !isSource(row.source) || !isScript(row.script)) continue;
    const vocabularyId = vocabularyIdFor(row.traditional, row.pinyin);
    if (seen.has(vocabularyId)) continue;
    seen.add(vocabularyId);
    const correctCount = Number.isSafeInteger(row.correctCount) && (row.correctCount as number) >= 0 ? row.correctCount as number : 0;
    const wrongCount = Number.isSafeInteger(row.wrongCount) && (row.wrongCount as number) >= 0 ? row.wrongCount as number : 0;
    const reviewPerformance = Array.isArray(row.reviewPerformance) ? row.reviewPerformance.filter((item): item is boolean => typeof item === "boolean").slice(-10) : [];
    words.push({
      vocabularyId, sourceRecordId: typeof row.sourceRecordId === "string" ? row.sourceRecordId : vocabularyId,
      sourceRecordIds: [...new Set([typeof row.sourceRecordId === "string" ? row.sourceRecordId : vocabularyId,
        ...(Array.isArray(row.sourceRecordIds) ? row.sourceRecordIds.filter((item): item is string => typeof item === "string") : [])])],
      source: row.source, sources: [...new Set([row.source, ...(Array.isArray(row.sources) ? row.sources.filter(isSource) : [])])],
      band: typeof row.band === "string" ? row.band : null, level: typeof row.level === "string" ? row.level : null,
      script: row.script, traditional: row.traditional,
      simplified: typeof row.simplified === "string" ? row.simplified : row.traditional,
      pinyin: row.pinyin, meaningVi: typeof row.meaningVi === "string" ? row.meaningVi : "",
      wordClass: typeof row.wordClass === "string" ? row.wordClass : null,
      exampleTraditional: typeof row.exampleTraditional === "string" ? row.exampleTraditional : "",
      exampleSimplified: typeof row.exampleSimplified === "string" ? row.exampleSimplified : "",
      exampleVi: typeof row.exampleVi === "string" ? row.exampleVi : "",
      learnedAt: typeof row.learnedAt === "string" && !Number.isNaN(Date.parse(row.learnedAt)) ? row.learnedAt : new Date().toISOString(),
      lastReviewedAt: typeof row.lastReviewedAt === "string" ? row.lastReviewedAt : null,
      correctCount, wrongCount, reviewPerformance, masteryStatus: masteryFor(correctCount, wrongCount, reviewPerformance),
    });
  }
  const removedIds = Array.isArray(input.removedIds) ? input.removedIds.filter((item): item is string => typeof item === "string") : [];
  return { version: 2, words, removedIds: [...new Set(removedIds)] };
}

export function loadLearnedPool(storage: Pick<Storage, "getItem">): LearnedVocabularyPool {
  try { return parseLearnedPool(JSON.parse(storage.getItem(learnedPoolStorageKey) ?? "null")); }
  catch { return emptyLearnedPool(); }
}

export function saveLearnedPool(storage: Pick<Storage, "setItem">, pool: LearnedVocabularyPool): void {
  storage.setItem(learnedPoolStorageKey, JSON.stringify(pool));
  if (typeof window !== "undefined") window.dispatchEvent(new Event(learnedPoolChangedEvent));
}

export function addLearnedWord(pool: LearnedVocabularyPool, input: LearnedVocabularyInput, learnedAt = new Date().toISOString()): LearnedVocabularyPool {
  const vocabularyId = vocabularyIdFor(input.traditional, input.pinyin);
  const existing = pool.words.find((word) => word.vocabularyId === vocabularyId);
  const word: LearnedVocabularyWord = existing ? {
    ...existing, ...input,
    sourceRecordId: existing.sourceRecordId,
    band: existing.band ?? input.band, level: existing.level ?? input.level,
    meaningVi: input.meaningVi || existing.meaningVi,
    exampleTraditional: input.exampleTraditional || existing.exampleTraditional,
    exampleSimplified: input.exampleSimplified || existing.exampleSimplified,
    exampleVi: input.exampleVi || existing.exampleVi,
    source: existing.source, sources: [...new Set([...existing.sources, input.source])],
    sourceRecordIds: [...new Set([...existing.sourceRecordIds, input.sourceRecordId])],
    learnedAt: existing.learnedAt,
  } : {
    ...input, vocabularyId, sourceRecordIds: [input.sourceRecordId], sources: [input.source],
    learnedAt, lastReviewedAt: null, correctCount: 0, wrongCount: 0, reviewPerformance: [], masteryStatus: "Mới học",
  };
  return { version: 2, words: [...pool.words.filter((item) => item.vocabularyId !== vocabularyId), word],
    removedIds: pool.removedIds.filter((id) => id !== vocabularyId) };
}

export function removeLearnedWord(pool: LearnedVocabularyPool, vocabularyId: string): LearnedVocabularyPool {
  return { version: 2, words: pool.words.filter((word) => word.vocabularyId !== vocabularyId), removedIds: [...new Set([...pool.removedIds, vocabularyId])] };
}

export function recordVocabularyAnswer(pool: LearnedVocabularyPool, vocabularyId: string, correct: boolean, at = new Date().toISOString()): LearnedVocabularyPool {
  return { ...pool, words: pool.words.map((word) => {
    if (word.vocabularyId !== vocabularyId) return word;
    const correctCount = word.correctCount + Number(correct);
    const wrongCount = word.wrongCount + Number(!correct);
    const reviewPerformance = [...word.reviewPerformance, correct].slice(-10);
    return { ...word, correctCount, wrongCount, reviewPerformance,
      lastReviewedAt: at, masteryStatus: masteryFor(correctCount, wrongCount, reviewPerformance) };
  }) };
}

export function mergeLegacyLearned(pool: LearnedVocabularyPool, inputs: LearnedVocabularyInput[]): LearnedVocabularyPool {
  let next = pool;
  for (const input of inputs) {
    const vocabularyId = vocabularyIdFor(input.traditional, input.pinyin);
    if (!next.removedIds.includes(vocabularyId)) next = addLearnedWord(next, input);
  }
  return next;
}

export function reviewPriority(word: LearnedVocabularyWord): number {
  return (word.masteryStatus === "Cần ôn lại" ? 100 : word.masteryStatus === "Mới học" ? 60 : word.masteryStatus === "Đang ghi nhớ" ? 40 : 0)
    + word.wrongCount * 4 - word.correctCount;
}

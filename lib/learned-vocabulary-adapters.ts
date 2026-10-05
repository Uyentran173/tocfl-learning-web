import type { TocflVocabularyRecord } from "./tocfl-vocabulary-types";
import type { VocabularyWord } from "./vocabulary";
import type { LearnedVocabularyInput, VocabularyScript } from "./learned-vocabulary";
import { simplifyManualText } from "./context-vocabulary";

export function fromBandRecord(record: TocflVocabularyRecord, script: VocabularyScript): LearnedVocabularyInput {
  return {
    sourceRecordId: record.id, source: "tocfl", band: record.band, level: record.levelId, script,
    studySetId: `band:${record.band}:${record.levelId}`,
    traditional: record.traditional, simplified: record.simplified || record.traditional,
    pinyin: record.pinyin || "", meaningVi: record.meaningVi || "", wordClass: record.partOfSpeech.raw,
    exampleTraditional: record.exampleTraditional || "", exampleSimplified: record.exampleSimplified || "",
    exampleVi: record.exampleVi || "",
  };
}

export function fromStudyWord(word: VocabularyWord, setId: string, index: number, kind: "topic" | "textbook" | "band"): LearnedVocabularyInput {
  const source = word.source ?? (kind === "textbook" ? "textbook" : "website");
  const traditional = word.traditional ?? word.hanzi;
  return {
    sourceRecordId: word.sourceRecordId ?? `${source}:${setId}:${index}`, source,
    studySetId: setId, topicId: setId.startsWith("context:") ? setId.split(":")[1] : kind === "topic" ? setId : undefined,
    band: word.band ?? null, level: word.level ?? null,
    script: word.scriptLang === "zh-Hans" ? "simplified" : "traditional",
    traditional, simplified: word.simplified ?? simplifyManualText(traditional), pinyin: word.pinyin,
    meaningVi: word.meaning, wordClass: word.wordClass ?? null,
    exampleTraditional: word.exampleTraditional ?? word.example,
    exampleSimplified: word.exampleSimplified ?? simplifyManualText(word.example), exampleVi: word.translation,
  };
}

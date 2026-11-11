import source from "../data/academy/cc1-source-content.json" with { type: "json" };
import enrichment from "../data/academy/cc1-vocabulary.json" with { type: "json" };
import type { VocabularySet, VocabularyWord } from "./vocabulary.ts";

const partOfSpeech: Record<string, string> = {
  N: "Danh từ", V: "Động từ", Vi: "Động từ nội động", Vst: "Động từ trạng thái",
  Vs: "Tính từ", Adv: "Phó từ", Ptc: "Trợ từ", Prep: "Giới từ",
  Conj: "Liên từ", M: "Lượng từ", Vaux: "Động từ năng nguyện",
  "V-sep": "Động từ li hợp", Det: "Định từ",
};

function localizedWordClass(raw: string | null): string | null {
  if (!raw) return null;
  return [...new Set((raw.match(/[A-Za-z-]+/g) ?? []).map((code) => partOfSpeech[code]).filter(Boolean))].join(" · ") || null;
}

export const cc1CourseVocabularySets: VocabularySet[] = source.lessons.map((lesson, index) => {
  const records = enrichment.lessons[index];
  if (records.lessonId !== lesson.id || records.records.length !== lesson.vocabulary.length) {
    throw new Error(`CC1 vocabulary is not aligned with ${lesson.id}`);
  }
  const words: VocabularyWord[] = records.records.map((record, wordIndex) => {
    if (record.id !== lesson.vocabulary[wordIndex].id || record.traditional !== lesson.vocabulary[wordIndex].traditional) {
      throw new Error(`CC1 vocabulary source mismatch: ${record.id}`);
    }
    return {
      id: record.id,
      source: "textbook",
      sourceRecordId: record.canonicalVocabularyId,
      sourceLabel: `Giáo trình tiếng Hoa đương đại · Bài ${String(lesson.number).padStart(2, "0")}`,
      hanzi: record.traditional,
      traditional: record.traditional,
      simplified: record.simplified,
      pinyin: record.pinyin,
      meaning: record.meaningVi,
      wordClass: localizedWordClass(record.partOfSpeechRaw),
      example: record.exampleTraditional,
      exampleTraditional: record.exampleTraditional,
      exampleSimplified: record.exampleSimplified,
      translation: record.exampleVi,
    };
  });
  return {
    id: `cc1-v1-l${String(lesson.number).padStart(2, "0")}`,
    title: `Bài ${String(lesson.number).padStart(2, "0")} · ${lesson.traditionalTitle}`,
    subtitle: lesson.titleVi,
    words,
  };
});

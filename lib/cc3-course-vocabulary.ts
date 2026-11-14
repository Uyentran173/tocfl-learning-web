import lesson01Source from "../data/academy/cc3-lesson01-vocabulary.json" with { type: "json" };
import { cc1Lesson01Words } from "./cc1-lesson01-vocabulary.ts";
import { cc1CourseVocabularySets } from "./cc1-course-vocabulary.ts";
import { cc2VocabularySets } from "./cc2-course-vocabulary.ts";
import type { VocabularySet, VocabularyWord } from "./vocabulary.ts";

const existing = [...cc1Lesson01Words, ...cc1CourseVocabularySets.flatMap((set) => set.words), ...cc2VocabularySets.flatMap((set) => set.words)];
function sameWord(word: VocabularyWord, traditional: string, pinyin: string) {
  return word.traditional === traditional && word.pinyin.toLowerCase().replaceAll(" ", "") === pinyin.toLowerCase().replaceAll(" ", "");
}

export const cc3Lesson01Words: VocabularyWord[] = lesson01Source.records.map((record) => (record.traditional === "當" ? undefined : existing.find((word) => sameWord(word, record.traditional, record.pinyin))) ?? {
  id: record.id,
  source: "textbook",
  sourceRecordId: record.id,
  sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 3 · Bài 01",
  hanzi: record.traditional,
  traditional: record.traditional,
  simplified: record.simplified,
  pinyin: record.pinyin,
  meaning: record.meaningVi,
  wordClass: record.wordClass,
  example: record.exampleTraditional,
  exampleTraditional: record.exampleTraditional,
  exampleSimplified: record.exampleSimplified,
  translation: record.exampleVi,
});

export const cc3VocabularySets: VocabularySet[] = [{
  id: "cc3-v3-l01",
  title: "Bài 01 · 開學了",
  subtitle: "Khai giảng rồi",
  words: cc3Lesson01Words,
}];

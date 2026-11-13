import source from "../data/academy/cc2-lesson01-vocabulary.json" with { type: "json" };
import { cc1Lesson01Words } from "./cc1-lesson01-vocabulary.ts";
import { cc1CourseVocabularySets } from "./cc1-course-vocabulary.ts";
import type { VocabularySet, VocabularyWord } from "./vocabulary.ts";

const existing = [...cc1Lesson01Words, ...cc1CourseVocabularySets.flatMap((set) => set.words)];
function matchingWord(traditional: string, pinyin: string) {
  return existing.find((word) => word.traditional === traditional && word.pinyin.toLowerCase().replaceAll(" ", "") === pinyin.toLowerCase().replaceAll(" ", ""));
}

export const cc2Lesson01Words: VocabularyWord[] = source.records.map((record) => {
  const prior = matchingWord(record.traditional, record.pinyin);
  return prior ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 2 · Bài 01",
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
  };
});

export const cc2VocabularySets: VocabularySet[] = [{
  id: "cc2-v2-l01",
  title: "Bài 01 · 請問，到師大怎麼走？",
  subtitle: "Hỏi đường đến Sư Đại",
  words: cc2Lesson01Words,
}];

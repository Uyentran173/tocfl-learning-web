import source from "../data/academy/cc4-lesson01-vocabulary.json" with { type: "json" };
import lesson02Source from "../data/academy/cc4-lesson02-vocabulary.json" with { type: "json" };
import { cc1Lesson01Words } from "./cc1-lesson01-vocabulary.ts";
import { cc1CourseVocabularySets } from "./cc1-course-vocabulary.ts";
import { cc2VocabularySets } from "./cc2-course-vocabulary.ts";
import { cc3VocabularySets } from "./cc3-course-vocabulary.ts";
import type { VocabularySet, VocabularyWord } from "./vocabulary.ts";

const previousWords = [cc1Lesson01Words, ...cc1CourseVocabularySets.map((set) => set.words), ...cc2VocabularySets.map((set) => set.words), ...cc3VocabularySets.map((set) => set.words)].flat();
const normalized = (value: string) => value.toLowerCase().replaceAll(" ", "");

export const cc4Lesson01Words: VocabularyWord[] = source.records.map((record) => previousWords.find((word) =>
  word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin),
) ?? {
  id: record.id,
  source: "textbook",
  sourceRecordId: record.id,
  sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 4 · Bài 01",
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

export const cc4Lesson02Words: VocabularyWord[] = lesson02Source.records.map((record) =>
  [...previousWords, ...cc4Lesson01Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 4 · Bài 02",
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

export const cc4VocabularySets: VocabularySet[] = [
  {
    id: source.lessonId,
    title: "Bài 01 · 十七歲還是二十五歲？",
    subtitle: "Mười bảy hay hai mươi lăm tuổi?",
    words: cc4Lesson01Words,
  },
  {
    id: lesson02Source.lessonId,
    title: "Bài 02 · 眼睛、耳朵的饗宴",
    subtitle: "Bữa tiệc cho mắt và tai",
    words: cc4Lesson02Words,
  },
];

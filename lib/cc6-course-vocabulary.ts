import source from "../data/academy/cc6-lesson01-vocabulary.json" with { type: "json" };
import lesson02Source from "../data/academy/cc6-lesson02-vocabulary.json" with { type: "json" };
import { cc1Lesson01Words } from "./cc1-lesson01-vocabulary.ts";
import { cc1CourseVocabularySets } from "./cc1-course-vocabulary.ts";
import { cc2VocabularySets } from "./cc2-course-vocabulary.ts";
import { cc3VocabularySets } from "./cc3-course-vocabulary.ts";
import { cc4VocabularySets } from "./cc4-course-vocabulary.ts";
import { cc5VocabularySets } from "./cc5-course-vocabulary.ts";
import type { VocabularySet, VocabularyWord } from "./vocabulary.ts";

const previousWords = [cc1Lesson01Words, ...cc1CourseVocabularySets.map((set) => set.words),
  ...cc2VocabularySets.map((set) => set.words), ...cc3VocabularySets.map((set) => set.words),
  ...cc4VocabularySets.map((set) => set.words), ...cc5VocabularySets.map((set) => set.words)].flat();
const normalized = (value: string) => value.toLowerCase().replaceAll(" ", "");

export const cc6Lesson01Words: VocabularyWord[] = source.records.map((record) => previousWords.find((word) =>
  word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
  (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
) ?? {
  id: record.id,
  source: "textbook",
  sourceRecordId: record.id,
  sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 6 · Bài 01",
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

export const cc6Lesson02Words: VocabularyWord[] = lesson02Source.records.map((record) =>
  [...previousWords, ...cc6Lesson01Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
    (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 6 · Bài 02",
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

export const cc6VocabularySets: VocabularySet[] = [{
  id: "cc6-v6-l01", title: "Bài 01 · 職校教育", subtitle: "Giáo dục nghề",
  words: cc6Lesson01Words,
}, {
  id: "cc6-v6-l02", title: "Bài 02 · 科技與生活", subtitle: "Công nghệ và đời sống",
  words: cc6Lesson02Words,
}];

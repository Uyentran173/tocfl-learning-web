import source from "../data/academy/cc5-lesson01-vocabulary.json" with { type: "json" };
import lesson02Source from "../data/academy/cc5-lesson02-vocabulary.json" with { type: "json" };
import lesson03Source from "../data/academy/cc5-lesson03-vocabulary.json" with { type: "json" };
import lesson04Source from "../data/academy/cc5-lesson04-vocabulary.json" with { type: "json" };
import lesson05Source from "../data/academy/cc5-lesson05-vocabulary.json" with { type: "json" };
import lesson06Source from "../data/academy/cc5-lesson06-vocabulary.json" with { type: "json" };
import { cc1Lesson01Words } from "./cc1-lesson01-vocabulary.ts";
import { cc1CourseVocabularySets } from "./cc1-course-vocabulary.ts";
import { cc2VocabularySets } from "./cc2-course-vocabulary.ts";
import { cc3VocabularySets } from "./cc3-course-vocabulary.ts";
import { cc4VocabularySets } from "./cc4-course-vocabulary.ts";
import type { VocabularySet, VocabularyWord } from "./vocabulary.ts";

const previousWords = [cc1Lesson01Words, ...cc1CourseVocabularySets.map((set) => set.words),
  ...cc2VocabularySets.map((set) => set.words), ...cc3VocabularySets.map((set) => set.words),
  ...cc4VocabularySets.map((set) => set.words)].flat();
const normalized = (value: string) => value.toLowerCase().replaceAll(" ", "");

export const cc5Lesson01Words: VocabularyWord[] = source.records.map((record) => previousWords.find((word) =>
  word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
  (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
) ?? {
  id: record.id,
  source: "textbook",
  sourceRecordId: record.id,
  sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 5 · Bài 01",
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

const knownWordsForLesson02 = [...previousWords, ...cc5Lesson01Words];
export const cc5Lesson02Words: VocabularyWord[] = lesson02Source.records.map((record) => knownWordsForLesson02.find((word) =>
  word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
  (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
) ?? {
  id: record.id,
  source: "textbook",
  sourceRecordId: record.id,
  sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 5 · Bài 02",
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

const knownWordsForLesson03 = [...knownWordsForLesson02, ...cc5Lesson02Words];
export const cc5Lesson03Words: VocabularyWord[] = lesson03Source.records.map((record) => knownWordsForLesson03.find((word) =>
  word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
  (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
) ?? {
  id: record.id,
  source: "textbook",
  sourceRecordId: record.id,
  sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 5 · Bài 03",
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

const knownWordsForLesson04 = [...knownWordsForLesson03, ...cc5Lesson03Words];
export const cc5Lesson04Words: VocabularyWord[] = lesson04Source.records.map((record) => knownWordsForLesson04.find((word) =>
  word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
  (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
) ?? {
  id: record.id,
  source: "textbook",
  sourceRecordId: record.id,
  sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 5 · Bài 04",
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

const knownWordsForLesson05 = [...knownWordsForLesson04, ...cc5Lesson04Words];
export const cc5Lesson05Words: VocabularyWord[] = lesson05Source.records.map((record) => knownWordsForLesson05.find((word) =>
  word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
  (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
) ?? {
  id: record.id,
  source: "textbook",
  sourceRecordId: record.id,
  sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 5 · Bài 05",
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

const knownWordsForLesson06 = [...knownWordsForLesson05, ...cc5Lesson05Words];
export const cc5Lesson06Words: VocabularyWord[] = lesson06Source.records.map((record) => knownWordsForLesson06.find((word) =>
  word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
  (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
) ?? {
  id: record.id,
  source: "textbook",
  sourceRecordId: record.id,
  sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 5 · Bài 06",
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

export const cc5VocabularySets: VocabularySet[] = [{
  id: source.lessonId,
  title: "Bài 01 · 言論自由的界線",
  subtitle: "Ranh giới của tự do ngôn luận",
  words: cc5Lesson01Words,
}, {
  id: lesson02Source.lessonId,
  title: "Bài 02 · 關於基改食品，我有話要說",
  subtitle: "Tôi có điều muốn nói về thực phẩm biến đổi gen",
  words: cc5Lesson02Words,
}, {
  id: lesson03Source.lessonId,
  title: "Bài 03 · 整型好不好",
  subtitle: "Phẫu thuật thẩm mỹ: nên hay không?",
  words: cc5Lesson03Words,
}, {
  id: lesson04Source.lessonId,
  title: "Bài 04 · 傳統與現代",
  subtitle: "Truyền thống và hiện đại",
  words: cc5Lesson04Words,
}, {
  id: lesson05Source.lessonId,
  title: "Bài 05 · 代理孕母，帶來幸福？",
  subtitle: "Mang thai hộ có đem lại hạnh phúc?",
  words: cc5Lesson05Words,
}, {
  id: lesson06Source.lessonId,
  title: "Bài 06 · 死刑的存廢",
  subtitle: "Giữ hay bãi bỏ án tử hình",
  words: cc5Lesson06Words,
}];

import source from "../data/academy/cc6-lesson01-vocabulary.json" with { type: "json" };
import lesson02Source from "../data/academy/cc6-lesson02-vocabulary.json" with { type: "json" };
import lesson03Source from "../data/academy/cc6-lesson03-vocabulary.json" with { type: "json" };
import lesson04Source from "../data/academy/cc6-lesson04-vocabulary.json" with { type: "json" };
import lesson05Source from "../data/academy/cc6-lesson05-vocabulary.json" with { type: "json" };
import lesson06Source from "../data/academy/cc6-lesson06-vocabulary.json" with { type: "json" };
import lesson07Source from "../data/academy/cc6-lesson07-vocabulary.json" with { type: "json" };
import lesson08Source from "../data/academy/cc6-lesson08-vocabulary.json" with { type: "json" };
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

export const cc6Lesson03Words: VocabularyWord[] = lesson03Source.records.map((record) =>
  [...previousWords, ...cc6Lesson01Words, ...cc6Lesson02Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
    (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 6 · Bài 03",
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

export const cc6Lesson04Words: VocabularyWord[] = lesson04Source.records.map((record) =>
  [...previousWords, ...cc6Lesson01Words, ...cc6Lesson02Words, ...cc6Lesson03Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
    (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 6 · Bài 04",
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

export const cc6Lesson05Words: VocabularyWord[] = lesson05Source.records.map((record) =>
  [...previousWords, ...cc6Lesson01Words, ...cc6Lesson02Words, ...cc6Lesson03Words, ...cc6Lesson04Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
    (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 6 · Bài 05",
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

export const cc6Lesson06Words: VocabularyWord[] = lesson06Source.records.map((record) =>
  [...previousWords, ...cc6Lesson01Words, ...cc6Lesson02Words, ...cc6Lesson03Words, ...cc6Lesson04Words, ...cc6Lesson05Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
    (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 6 · Bài 06",
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

export const cc6Lesson07Words: VocabularyWord[] = lesson07Source.records.map((record) =>
  [...previousWords, ...cc6Lesson01Words, ...cc6Lesson02Words, ...cc6Lesson03Words, ...cc6Lesson04Words, ...cc6Lesson05Words, ...cc6Lesson06Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
    (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 6 · Bài 07",
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

export const cc6Lesson08Words: VocabularyWord[] = lesson08Source.records.map((record) =>
  [...previousWords, ...cc6Lesson01Words, ...cc6Lesson02Words, ...cc6Lesson03Words, ...cc6Lesson04Words, ...cc6Lesson05Words, ...cc6Lesson06Words, ...cc6Lesson07Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin) &&
    (word.wordClass === record.wordClass || word.meaning === record.meaningVi),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 6 · Bài 08",
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
}, {
  id: "cc6-v6-l03", title: "Bài 03 · 舞蹈藝術", subtitle: "Nghệ thuật múa",
  words: cc6Lesson03Words,
}, {
  id: "cc6-v6-l04", title: "Bài 04 · 做人心法", subtitle: "Cách ứng xử",
  words: cc6Lesson04Words,
}, {
  id: "cc6-v6-l05", title: "Bài 05 · 國際語言", subtitle: "Ngôn ngữ quốc tế",
  words: cc6Lesson05Words,
}, {
  id: "cc6-v6-l06", title: "Bài 06 · 貓熊角色", subtitle: "Vai trò của gấu trúc",
  words: cc6Lesson06Words,
}, {
  id: "cc6-v6-l07", title: "Bài 07 · 感情世界", subtitle: "Thế giới tình cảm",
  words: cc6Lesson07Words,
}, {
  id: "cc6-v6-l08", title: "Bài 08 · 奧運黑洞", subtitle: "Hố đen Olympic",
  words: cc6Lesson08Words,
}];

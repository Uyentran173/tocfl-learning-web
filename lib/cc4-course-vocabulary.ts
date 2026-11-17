import source from "../data/academy/cc4-lesson01-vocabulary.json" with { type: "json" };
import lesson02Source from "../data/academy/cc4-lesson02-vocabulary.json" with { type: "json" };
import lesson03Source from "../data/academy/cc4-lesson03-vocabulary.json" with { type: "json" };
import lesson04Source from "../data/academy/cc4-lesson04-vocabulary.json" with { type: "json" };
import lesson05Source from "../data/academy/cc4-lesson05-vocabulary.json" with { type: "json" };
import lesson06Source from "../data/academy/cc4-lesson06-vocabulary.json" with { type: "json" };
import lesson07Source from "../data/academy/cc4-lesson07-vocabulary.json" with { type: "json" };
import lesson08Source from "../data/academy/cc4-lesson08-vocabulary.json" with { type: "json" };
import lesson09Source from "../data/academy/cc4-lesson09-vocabulary.json" with { type: "json" };
import lesson10Source from "../data/academy/cc4-lesson10-vocabulary.json" with { type: "json" };
import lesson11Source from "../data/academy/cc4-lesson11-vocabulary.json" with { type: "json" };
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

export const cc4Lesson03Words: VocabularyWord[] = lesson03Source.records.map((record) =>
  [...previousWords, ...cc4Lesson01Words, ...cc4Lesson02Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 4 · Bài 03",
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

export const cc4Lesson04Words: VocabularyWord[] = lesson04Source.records.map((record) =>
  [...previousWords, ...cc4Lesson01Words, ...cc4Lesson02Words, ...cc4Lesson03Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 4 · Bài 04",
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

export const cc4Lesson05Words: VocabularyWord[] = lesson05Source.records.map((record) =>
  [...previousWords, ...cc4Lesson01Words, ...cc4Lesson02Words, ...cc4Lesson03Words, ...cc4Lesson04Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 4 · Bài 05",
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

export const cc4Lesson06Words: VocabularyWord[] = lesson06Source.records.map((record) =>
  [...previousWords, ...cc4Lesson01Words, ...cc4Lesson02Words, ...cc4Lesson03Words, ...cc4Lesson04Words, ...cc4Lesson05Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 4 · Bài 06",
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

export const cc4Lesson07Words: VocabularyWord[] = lesson07Source.records.map((record) =>
  [...previousWords, ...cc4Lesson01Words, ...cc4Lesson02Words, ...cc4Lesson03Words, ...cc4Lesson04Words, ...cc4Lesson05Words, ...cc4Lesson06Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 4 · Bài 07",
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

export const cc4Lesson08Words: VocabularyWord[] = lesson08Source.records.map((record) =>
  [...previousWords, ...cc4Lesson01Words, ...cc4Lesson02Words, ...cc4Lesson03Words, ...cc4Lesson04Words, ...cc4Lesson05Words, ...cc4Lesson06Words, ...cc4Lesson07Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 4 · Bài 08",
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

export const cc4Lesson09Words: VocabularyWord[] = lesson09Source.records.map((record) =>
  [...previousWords, ...cc4Lesson01Words, ...cc4Lesson02Words, ...cc4Lesson03Words, ...cc4Lesson04Words, ...cc4Lesson05Words, ...cc4Lesson06Words, ...cc4Lesson07Words, ...cc4Lesson08Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 4 · Bài 09",
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

export const cc4Lesson10Words: VocabularyWord[] = lesson10Source.records.map((record) =>
  [...previousWords, ...cc4Lesson01Words, ...cc4Lesson02Words, ...cc4Lesson03Words, ...cc4Lesson04Words, ...cc4Lesson05Words, ...cc4Lesson06Words, ...cc4Lesson07Words, ...cc4Lesson08Words, ...cc4Lesson09Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 4 · Bài 10",
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

export const cc4Lesson11Words: VocabularyWord[] = lesson11Source.records.map((record) =>
  [...previousWords, ...cc4Lesson01Words, ...cc4Lesson02Words, ...cc4Lesson03Words, ...cc4Lesson04Words, ...cc4Lesson05Words, ...cc4Lesson06Words, ...cc4Lesson07Words, ...cc4Lesson08Words, ...cc4Lesson09Words, ...cc4Lesson10Words].find((word) =>
    word.traditional === record.traditional && normalized(word.pinyin) === normalized(record.pinyin),
  ) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: "Giáo trình tiếng Hoa đương đại · Tập 4 · Bài 11",
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
  {
    id: lesson03Source.lessonId,
    title: "Bài 03 · 雲端科技",
    subtitle: "Công nghệ đám mây",
    words: cc4Lesson03Words,
  },
  {
    id: lesson04Source.lessonId,
    title: "Bài 04 · 床該擺哪裡？",
    subtitle: "Nên đặt giường ở đâu?",
    words: cc4Lesson04Words,
  },
  {
    id: lesson05Source.lessonId,
    title: "Bài 05 · 有夢最美",
    subtitle: "Có ước mơ là điều đẹp nhất",
    words: cc4Lesson05Words,
  },
  {
    id: lesson06Source.lessonId,
    title: "Bài 06 · 天搖地動",
    subtitle: "Đất trời rung chuyển",
    words: cc4Lesson06Words,
  },
  {
    id: lesson07Source.lessonId,
    title: "Bài 07 · 大學生的事",
    subtitle: "Chuyện của sinh viên đại học",
    words: cc4Lesson07Words,
  },
  {
    id: lesson08Source.lessonId,
    title: "Bài 08 · 他們的選擇",
    subtitle: "Lựa chọn của họ",
    words: cc4Lesson08Words,
  },
  {
    id: lesson09Source.lessonId,
    title: "Bài 09 · 再談台灣故事",
    subtitle: "Tìm hiểu thêm chuyện Đài Loan",
    words: cc4Lesson09Words,
  },
  {
    id: lesson10Source.lessonId,
    title: "Bài 10 · 應徵",
    subtitle: "Ứng tuyển việc làm",
    words: cc4Lesson10Words,
  },
  {
    id: lesson11Source.lessonId,
    title: "Bài 11 · 文化、種族的大熔爐",
    subtitle: "Nơi hội tụ nhiều nền văn hóa và sắc tộc",
    words: cc4Lesson11Words,
  },
];

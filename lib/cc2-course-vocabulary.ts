import lesson01Source from "../data/academy/cc2-lesson01-vocabulary.json" with { type: "json" };
import lesson02Source from "../data/academy/cc2-lesson02-vocabulary.json" with { type: "json" };
import lesson03Source from "../data/academy/cc2-lesson03-vocabulary.json" with { type: "json" };
import lesson04Source from "../data/academy/cc2-lesson04-vocabulary.json" with { type: "json" };
import lesson05Source from "../data/academy/cc2-lesson05-vocabulary.json" with { type: "json" };
import lesson06Source from "../data/academy/cc2-lesson06-vocabulary.json" with { type: "json" };
import lesson07Source from "../data/academy/cc2-lesson07-vocabulary.json" with { type: "json" };
import lesson08Source from "../data/academy/cc2-lesson08-vocabulary.json" with { type: "json" };
import lesson09Source from "../data/academy/cc2-lesson09-vocabulary.json" with { type: "json" };
import lesson10Source from "../data/academy/cc2-lesson10-vocabulary.json" with { type: "json" };
import lesson11Source from "../data/academy/cc2-lesson11-vocabulary.json" with { type: "json" };
import lesson12Source from "../data/academy/cc2-lesson12-vocabulary.json" with { type: "json" };
import lesson13Source from "../data/academy/cc2-lesson13-vocabulary.json" with { type: "json" };
import lesson14Source from "../data/academy/cc2-lesson14-vocabulary.json" with { type: "json" };
import lesson15Source from "../data/academy/cc2-lesson15-vocabulary.json" with { type: "json" };
import { cc1Lesson01Words } from "./cc1-lesson01-vocabulary.ts";
import { cc1CourseVocabularySets } from "./cc1-course-vocabulary.ts";
import type { VocabularySet, VocabularyWord } from "./vocabulary.ts";

const existing = [...cc1Lesson01Words, ...cc1CourseVocabularySets.flatMap((set) => set.words)];
function matchingWord(words: VocabularyWord[], traditional: string, pinyin: string) {
  return words.find((word) => word.traditional === traditional && word.pinyin.toLowerCase().replaceAll(" ", "") === pinyin.toLowerCase().replaceAll(" ", ""));
}

function lessonWords(records: typeof lesson01Source.records, lessonNumber: number, priorWords: VocabularyWord[]): VocabularyWord[] {
  const repeatedForms = new Set(records.filter((record) => records.filter((other) => other.traditional === record.traditional && other.pinyin === record.pinyin).length > 1).map((record) => record.traditional));
  return records.map((record) => (repeatedForms.has(record.traditional) || (lessonNumber === 13 && record.traditional === "過") ? undefined : matchingWord(priorWords, record.traditional, record.pinyin)) ?? {
    id: record.id,
    source: "textbook",
    sourceRecordId: record.id,
    sourceLabel: `Giáo trình tiếng Hoa đương đại · Tập 2 · Bài ${String(lessonNumber).padStart(2, "0")}`,
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
}

export const cc2Lesson01Words = lessonWords(lesson01Source.records, 1, existing);
export const cc2Lesson02Words = lessonWords(lesson02Source.records, 2, [...existing, ...cc2Lesson01Words]);
export const cc2Lesson03Words = lessonWords(lesson03Source.records, 3, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words]);
export const cc2Lesson04Words = lessonWords(lesson04Source.records, 4, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words]);
export const cc2Lesson05Words = lessonWords(lesson05Source.records, 5, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words, ...cc2Lesson04Words]);
export const cc2Lesson06Words = lessonWords(lesson06Source.records, 6, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words, ...cc2Lesson04Words, ...cc2Lesson05Words]);
export const cc2Lesson07Words = lessonWords(lesson07Source.records, 7, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words, ...cc2Lesson04Words, ...cc2Lesson05Words, ...cc2Lesson06Words]);
export const cc2Lesson08Words = lessonWords(lesson08Source.records, 8, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words, ...cc2Lesson04Words, ...cc2Lesson05Words, ...cc2Lesson06Words, ...cc2Lesson07Words]);
export const cc2Lesson09Words = lessonWords(lesson09Source.records, 9, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words, ...cc2Lesson04Words, ...cc2Lesson05Words, ...cc2Lesson06Words, ...cc2Lesson07Words, ...cc2Lesson08Words]);
export const cc2Lesson10Words = lessonWords(lesson10Source.records, 10, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words, ...cc2Lesson04Words, ...cc2Lesson05Words, ...cc2Lesson06Words, ...cc2Lesson07Words, ...cc2Lesson08Words, ...cc2Lesson09Words]);
export const cc2Lesson11Words = lessonWords(lesson11Source.records, 11, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words, ...cc2Lesson04Words, ...cc2Lesson05Words, ...cc2Lesson06Words, ...cc2Lesson07Words, ...cc2Lesson08Words, ...cc2Lesson09Words, ...cc2Lesson10Words]);
export const cc2Lesson12Words = lessonWords(lesson12Source.records, 12, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words, ...cc2Lesson04Words, ...cc2Lesson05Words, ...cc2Lesson06Words, ...cc2Lesson07Words, ...cc2Lesson08Words, ...cc2Lesson09Words, ...cc2Lesson10Words, ...cc2Lesson11Words]);
export const cc2Lesson13Words = lessonWords(lesson13Source.records, 13, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words, ...cc2Lesson04Words, ...cc2Lesson05Words, ...cc2Lesson06Words, ...cc2Lesson07Words, ...cc2Lesson08Words, ...cc2Lesson09Words, ...cc2Lesson10Words, ...cc2Lesson11Words, ...cc2Lesson12Words]);
export const cc2Lesson14Words = lessonWords(lesson14Source.records, 14, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words, ...cc2Lesson04Words, ...cc2Lesson05Words, ...cc2Lesson06Words, ...cc2Lesson07Words, ...cc2Lesson08Words, ...cc2Lesson09Words, ...cc2Lesson10Words, ...cc2Lesson11Words, ...cc2Lesson12Words, ...cc2Lesson13Words]);
export const cc2Lesson15Words = lessonWords(lesson15Source.records, 15, [...existing, ...cc2Lesson01Words, ...cc2Lesson02Words, ...cc2Lesson03Words, ...cc2Lesson04Words, ...cc2Lesson05Words, ...cc2Lesson06Words, ...cc2Lesson07Words, ...cc2Lesson08Words, ...cc2Lesson09Words, ...cc2Lesson10Words, ...cc2Lesson11Words, ...cc2Lesson12Words, ...cc2Lesson13Words, ...cc2Lesson14Words]);

export const cc2VocabularySets: VocabularySet[] = [{
  id: "cc2-v2-l01",
  title: "Bài 01 · 請問，到師大怎麼走？",
  subtitle: "Hỏi đường đến Sư Đại",
  words: cc2Lesson01Words,
}, {
  id: "cc2-v2-l02",
  title: "Bài 02 · 還是坐捷運吧！",
  subtitle: "Đi MRT thì hơn!",
  words: cc2Lesson02Words,
}, {
  id: "cc2-v2-l03",
  title: "Bài 03 · 你的中文進步了！",
  subtitle: "Tiếng Hoa của bạn tiến bộ rồi!",
  words: cc2Lesson03Words,
}, {
  id: "cc2-v2-l04",
  title: "Bài 04 · 我打工，我教法文",
  subtitle: "Tôi làm thêm, dạy tiếng Pháp",
  words: cc2Lesson04Words,
}, {
  id: "cc2-v2-l05",
  title: "Bài 05 · 吃喜酒",
  subtitle: "Đi dự tiệc cưới",
  words: cc2Lesson05Words,
}, {
  id: "cc2-v2-l06",
  title: "Bài 06 · 我打算搬到學校附近",
  subtitle: "Tôi định chuyển đến gần trường",
  words: cc2Lesson06Words,
}, {
  id: "cc2-v2-l07",
  title: "Bài 07 · 垃圾車來了！",
  subtitle: "Xe rác đến rồi!",
  words: cc2Lesson07Words,
}, {
  id: "cc2-v2-l08",
  title: "Bài 08 · 學功夫",
  subtitle: "Học võ công",
  words: cc2Lesson08Words,
}, {
  id: "cc2-v2-l09",
  title: "Bài 09 · 那個城市好漂亮",
  subtitle: "Thành phố ấy đẹp quá",
  words: cc2Lesson09Words,
}, {
  id: "cc2-v2-l10",
  title: "Bài 10 · 歡迎到我家來包餃子",
  subtitle: "Mời đến nhà tôi gói sủi cảo",
  words: cc2Lesson10Words,
}, {
  id: "cc2-v2-l11",
  title: "Bài 11 · 台灣好玩的地方真多",
  subtitle: "Đài Loan có nhiều nơi thú vị quá",
  words: cc2Lesson11Words,
}, {
  id: "cc2-v2-l12",
  title: "Bài 12 · 怎麼吃才健康？",
  subtitle: "Ăn thế nào mới khỏe?",
  words: cc2Lesson12Words,
}, {
  id: "cc2-v2-l13",
  title: "Bài 13 · 我的手機掉了",
  subtitle: "Tôi làm mất điện thoại rồi",
  words: cc2Lesson13Words,
}, {
  id: "cc2-v2-l14",
  title: "Bài 14 · 我要開始找工作了",
  subtitle: "Tôi sắp bắt đầu tìm việc",
  words: cc2Lesson14Words,
}, {
  id: "cc2-v2-l15",
  title: "Bài 15 · 過春節",
  subtitle: "Đón Tết Nguyên đán",
  words: cc2Lesson15Words,
}];

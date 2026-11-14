import lesson01Source from "../data/academy/cc3-lesson01-vocabulary.json" with { type: "json" };
import lesson02Source from "../data/academy/cc3-lesson02-vocabulary.json" with { type: "json" };
import lesson03Source from "../data/academy/cc3-lesson03-vocabulary.json" with { type: "json" };
import lesson04Source from "../data/academy/cc3-lesson04-vocabulary.json" with { type: "json" };
import lesson05Source from "../data/academy/cc3-lesson05-vocabulary.json" with { type: "json" };
import lesson06Source from "../data/academy/cc3-lesson06-vocabulary.json" with { type: "json" };
import lesson07Source from "../data/academy/cc3-lesson07-vocabulary.json" with { type: "json" };
import lesson08Source from "../data/academy/cc3-lesson08-vocabulary.json" with { type: "json" };
import lesson09Source from "../data/academy/cc3-lesson09-vocabulary.json" with { type: "json" };
import lesson10Source from "../data/academy/cc3-lesson10-vocabulary.json" with { type: "json" };
import lesson11Source from "../data/academy/cc3-lesson11-vocabulary.json" with { type: "json" };
import lesson12Source from "../data/academy/cc3-lesson12-vocabulary.json" with { type: "json" };
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

const lessonSources = [lesson02Source, lesson03Source, lesson04Source, lesson05Source, lesson06Source, lesson07Source, lesson08Source, lesson09Source, lesson10Source, lesson11Source, lesson12Source];
const lessonTitles = ["八折起", "外套帶了沒有？", "我愛台灣的人情味", "現在流行什麼？", "到鄉下住一晚！", "我最親的家「人」", "我想做自己", "網購時代", "我住院了", "台灣故事", "我要去投票"];
const lessonViTitles = ["Giảm giá từ 20%", "Bạn đã mang áo khoác chưa?", "Tôi yêu sự ấm áp của người Đài Loan", "Bây giờ thịnh hành gì?", "Ở miền quê một đêm", "Người thân thiết nhất như gia đình", "Tôi muốn là chính mình", "Thời đại mua sắm trực tuyến", "Tôi nhập viện rồi", "Câu chuyện Đài Loan", "Tôi sẽ đi bỏ phiếu"];
const previousWords = [...existing, ...cc3Lesson01Words];
export const cc3LessonWords02to12: VocabularyWord[][] = lessonSources.map((source, index) => {
  const lessonNumber = String(index + 2).padStart(2, "0");
  const words = source.records.map((record) => {
    const reused = source.lessonId === "cc3-v3-l07" && record.traditional === "亂" ? undefined : previousWords.find((word) => sameWord(word, record.traditional, record.pinyin));
    return reused ?? {
      id: record.id,
      source: "textbook" as const,
      sourceRecordId: record.id,
      sourceLabel: `Giáo trình tiếng Hoa đương đại · Tập 3 · Bài ${lessonNumber}`,
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
  previousWords.push(...words);
  return words;
});

export const cc3VocabularySets: VocabularySet[] = [{
  id: "cc3-v3-l01",
  title: "Bài 01 · 開學了",
  subtitle: "Khai giảng rồi",
  words: cc3Lesson01Words,
}, ...cc3LessonWords02to12.map((words, index) => ({
  id: lessonSources[index].lessonId,
  title: `Bài ${String(index + 2).padStart(2, "0")} · ${lessonTitles[index]}`,
  subtitle: lessonViTitles[index],
  words,
}))];

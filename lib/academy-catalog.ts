import { textbookSets } from "./vocabulary.ts";
import { academyLesson01 } from "./academy-lesson01.ts";
import cc1Lessons from "../data/academy/cc1-lessons.json" with { type: "json" };
import cc2Lesson01Data from "../data/academy/cc2-lesson01.json" with { type: "json" };
import cc2Lesson02Data from "../data/academy/cc2-lesson02.json" with { type: "json" };
import cc2Lesson03Data from "../data/academy/cc2-lesson03.json" with { type: "json" };
import cc2Lesson04Data from "../data/academy/cc2-lesson04.json" with { type: "json" };
import cc2Lesson05Data from "../data/academy/cc2-lesson05.json" with { type: "json" };
import cc2Lesson06Data from "../data/academy/cc2-lesson06.json" with { type: "json" };
import cc2Lesson07Data from "../data/academy/cc2-lesson07.json" with { type: "json" };
import cc2Lesson08Data from "../data/academy/cc2-lesson08.json" with { type: "json" };
import cc2Lesson09Data from "../data/academy/cc2-lesson09.json" with { type: "json" };
import cc2Lesson10Data from "../data/academy/cc2-lesson10.json" with { type: "json" };
import cc2Lesson11Data from "../data/academy/cc2-lesson11.json" with { type: "json" };
import cc2Lesson12Data from "../data/academy/cc2-lesson12.json" with { type: "json" };
import cc2Lesson13Data from "../data/academy/cc2-lesson13.json" with { type: "json" };
import cc2Lesson14Data from "../data/academy/cc2-lesson14.json" with { type: "json" };
import cc2Lesson15Data from "../data/academy/cc2-lesson15.json" with { type: "json" };
import { cc2Lesson01Words, cc2Lesson02Words, cc2Lesson03Words, cc2Lesson04Words, cc2Lesson05Words, cc2Lesson06Words, cc2Lesson07Words, cc2Lesson08Words, cc2Lesson09Words, cc2Lesson10Words, cc2Lesson11Words, cc2Lesson12Words, cc2Lesson13Words, cc2Lesson14Words, cc2Lesson15Words } from "./cc2-course-vocabulary.ts";
export { academyLesson01 };

export const academyActivityKinds = ["lecture", "vocabulary", "grammar", "practice", "assessment"] as const;
export const academyExtendedActivityKinds = ["lecture", "vocabulary", "grammar", "listening", "practice", "assessment"] as const;
export type AcademyActivityKind = (typeof academyExtendedActivityKinds)[number];
export function academyActivityKindsForLesson(lessonId: string): readonly AcademyActivityKind[] {
  return lessonId === academyLesson01.id ? academyActivityKinds : academyExtendedActivityKinds;
}
export type AcademyPublication = "draft" | "published";
export type AcademyQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  feedback: string;
  skill: string;
  kind?: "fill" | "order" | "dialogue" | "reading" | "self-introduction";
  passage?: string;
  audioTrackId?: string;
};
export type AcademySentence = { chinese: string; simplified: string; pinyin: string; meaningVi: string };
export type AcademyLessonContent = {
  contentVersion: 2;
  id: string;
  title: string;
  titleVi: string;
  description: string;
  objectives: string[];
  estimatedMinutes: number | null;
  lecture: {
    introduction: string;
    sections: ({ id: string; title: string; body: string } & AcademySentence)[];
    dialogues: { id: string; title: string; context: string; audioTrackId?: string; turns: ({ speaker: string } & AcademySentence)[] }[];
    checks: AcademyQuestion[];
    pronunciation: ({ id: string; title: string; explanation: string } & AcademySentence)[];
    culture: { id: string; title: string; body: string }[];
  };
  vocabulary: { introduction: string; wordIds: string[]; audioTracks?: { id: string; label: string }[] };
  grammar: {
    id: string; title: string; explanation: string; structure: string; examples: AcademySentence[]; audioTrackId?: string;
    commonMistake: string; check: AcademyQuestion;
  }[];
  listening?: AcademyQuestion[];
  practice: AcademyQuestion[];
  assessment: AcademyQuestion[];
  writingTask?: { id: string; title: string; prompt: string; sampleTraditional?: string; sampleSimplified?: string };
};

export const academyLearningPath = {
  id: "taiwen-academy-path",
  title: "Học theo giáo trình",
  seriesIds: ["contemporary-chinese"],
} as const;
export const academySeries = {
  id: "contemporary-chinese",
  title: "A Course in Contemporary Chinese",
  subtitle: "Giáo trình tiếng Hoa đương đại",
  volumeIds: ["cc1-v1", "cc2-v2"],
} as const;
export const academyVolume = {
  id: "cc1-v1",
  seriesId: academySeries.id,
  number: 1,
  lessonIds: Array.from({ length: 15 }, (_, index) => `cc1-v1-l${String(index + 1).padStart(2, "0")}`),
} as const;
export const academyVolume2 = {
  id: "cc2-v2",
  seriesId: academySeries.id,
  number: 2,
  lessonIds: Array.from({ length: 15 }, (_, index) => `cc2-v2-l${String(index + 1).padStart(2, "0")}`),
} as const;
export const academyVolume2Lesson01 = {
  ...cc2Lesson01Data,
  vocabulary: { ...cc2Lesson01Data.vocabulary, wordIds: cc2Lesson01Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson02 = {
  ...cc2Lesson02Data,
  vocabulary: { ...cc2Lesson02Data.vocabulary, wordIds: cc2Lesson02Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson03 = {
  ...cc2Lesson03Data,
  vocabulary: { ...cc2Lesson03Data.vocabulary, wordIds: cc2Lesson03Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson04 = {
  ...cc2Lesson04Data,
  vocabulary: { ...cc2Lesson04Data.vocabulary, wordIds: cc2Lesson04Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson05 = {
  ...cc2Lesson05Data,
  vocabulary: { ...cc2Lesson05Data.vocabulary, wordIds: cc2Lesson05Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson06 = {
  ...cc2Lesson06Data,
  vocabulary: { ...cc2Lesson06Data.vocabulary, wordIds: cc2Lesson06Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson07 = {
  ...cc2Lesson07Data,
  vocabulary: { ...cc2Lesson07Data.vocabulary, wordIds: cc2Lesson07Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson08 = {
  ...cc2Lesson08Data,
  vocabulary: { ...cc2Lesson08Data.vocabulary, wordIds: cc2Lesson08Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson09 = {
  ...cc2Lesson09Data,
  vocabulary: { ...cc2Lesson09Data.vocabulary, wordIds: cc2Lesson09Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson10 = {
  ...cc2Lesson10Data,
  vocabulary: { ...cc2Lesson10Data.vocabulary, wordIds: cc2Lesson10Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson11 = {
  ...cc2Lesson11Data,
  vocabulary: { ...cc2Lesson11Data.vocabulary, wordIds: cc2Lesson11Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson12 = {
  ...cc2Lesson12Data,
  vocabulary: { ...cc2Lesson12Data.vocabulary, wordIds: cc2Lesson12Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson13 = {
  ...cc2Lesson13Data,
  vocabulary: { ...cc2Lesson13Data.vocabulary, wordIds: cc2Lesson13Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson14 = {
  ...cc2Lesson14Data,
  vocabulary: { ...cc2Lesson14Data.vocabulary, wordIds: cc2Lesson14Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2Lesson15 = {
  ...cc2Lesson15Data,
  vocabulary: { ...cc2Lesson15Data.vocabulary, wordIds: cc2Lesson15Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume2LessonSummaries = [
  { chinese: "請問，到師大怎麼走？", vi: "Hỏi đường đến Sư Đại" },
  { chinese: "還是坐捷運吧！", vi: "Đi MRT thì hơn!" },
  { chinese: "你的中文進步了！", vi: "Tiếng Hoa của bạn tiến bộ rồi!" },
  { chinese: "我打工，我教法文", vi: "Tôi đi làm thêm, dạy tiếng Pháp" },
  { chinese: "吃喜酒", vi: "Đi dự tiệc cưới" },
  { chinese: "我打算搬到學校附近", vi: "Tôi định chuyển đến gần trường" },
  { chinese: "垃圾車來了！", vi: "Xe rác đến rồi!" },
  { chinese: "學功夫", vi: "Học võ công" },
  { chinese: "那個城市好漂亮", vi: "Thành phố đó đẹp quá" },
  { chinese: "歡迎到我家來包餃子", vi: "Mời đến nhà tôi gói sủi cảo" },
  { chinese: "台灣好玩的地方真多", vi: "Đài Loan có nhiều nơi vui quá" },
  { chinese: "怎麼吃才健康？", vi: "Ăn thế nào mới khỏe?" },
  { chinese: "我的手機掉了", vi: "Tôi làm rơi điện thoại rồi" },
  { chinese: "我要開始找工作了", vi: "Tôi sắp bắt đầu tìm việc" },
  { chinese: "過春節", vi: "Đón Tết Nguyên đán" },
] as const;

// Titles follow the Volume 1 contents page. Unpublished lessons have no activity content.
export const academyLessonSummaries = [
  { chinese: "歡迎你來臺灣！", vi: "Chào mừng bạn đến Đài Loan!" },
  { chinese: "我的家人", vi: "Gia đình tôi" },
  { chinese: "週末做什麼？", vi: "Cuối tuần làm gì?" },
  { chinese: "請問一共多少錢？", vi: "Xin hỏi, tổng cộng bao nhiêu tiền?" },
  { chinese: "牛肉麵真好吃", vi: "Mì bò ngon thật!" },
  { chinese: "他們學校在山上", vi: "Trường của họ ở trên núi" },
  { chinese: "早上九點去KTV", vi: "Chín giờ sáng đi hát KTV" },
  { chinese: "坐火車去臺南", vi: "Đi tàu hỏa đến Đài Nam" },
  { chinese: "放假去哪裡玩？", vi: "Nghỉ lễ đi chơi ở đâu?" },
  { chinese: "臺灣的水果很好吃", vi: "Trái cây Đài Loan rất ngon" },
  { chinese: "我要租房子", vi: "Tôi muốn thuê nhà" },
  { chinese: "你在臺灣學多久的中文？", vi: "Bạn học tiếng Hoa ở Đài Loan bao lâu?" },
  { chinese: "生日快樂", vi: "Chúc mừng sinh nhật" },
  { chinese: "天氣這麼冷！", vi: "Trời lạnh thế!" },
  { chinese: "我很不舒服", vi: "Tôi thấy không khỏe" },
] as const;

export function academyLessonId(number: number) {
  return academyVolume.lessonIds[number - 1];
}
export function academyLessonNumber(id: string) {
  const index = id.startsWith("cc2-v2-") ? academyVolume2.lessonIds.indexOf(id) : academyVolume.lessonIds.indexOf(id);
  return index < 0 ? null : index + 1;
}
export function academyActivityId(lessonId: string, kind: AcademyActivityKind) {
  return `${lessonId}-${kind}`;
}
export function academyLessonStatus(number: number): AcademyPublication {
  return Number.isInteger(number) && number >= 1 && number <= academyVolume.lessonIds.length ? "published" : "draft";
}
export const academyLessons02to15 = cc1Lessons.lessons as unknown as AcademyLessonContent[];
export function academyStaticLesson(number: number): AcademyLessonContent | null {
  if (number === 1) return academyLesson01;
  return academyLessons02to15[number - 2] ?? null;
}
export function academyStaticLessonById(id: string): AcademyLessonContent | null {
  if (id === academyVolume2Lesson01.id) return academyVolume2Lesson01;
  if (id === academyVolume2Lesson02.id) return academyVolume2Lesson02;
  if (id === academyVolume2Lesson03.id) return academyVolume2Lesson03;
  if (id === academyVolume2Lesson04.id) return academyVolume2Lesson04;
  if (id === academyVolume2Lesson05.id) return academyVolume2Lesson05;
  if (id === academyVolume2Lesson06.id) return academyVolume2Lesson06;
  if (id === academyVolume2Lesson07.id) return academyVolume2Lesson07;
  if (id === academyVolume2Lesson08.id) return academyVolume2Lesson08;
  if (id === academyVolume2Lesson09.id) return academyVolume2Lesson09;
  if (id === academyVolume2Lesson10.id) return academyVolume2Lesson10;
  if (id === academyVolume2Lesson11.id) return academyVolume2Lesson11;
  if (id === academyVolume2Lesson12.id) return academyVolume2Lesson12;
  if (id === academyVolume2Lesson13.id) return academyVolume2Lesson13;
  if (id === academyVolume2Lesson14.id) return academyVolume2Lesson14;
  if (id === academyVolume2Lesson15.id) return academyVolume2Lesson15;
  const number = academyLessonNumber(id);
  return number && id.startsWith("cc1-v1-") ? academyStaticLesson(number) : null;
}
export const academyActivityLabels: Record<AcademyActivityKind, string> = {
  lecture: "Bài giảng",
  vocabulary: "Từ vựng",
  grammar: "Ngữ pháp",
  listening: "Luyện nghe",
  practice: "Luyện tập",
  assessment: "Đánh giá bài học",
};

export function academyVocabularyByIds(ids: string[]) {
  const words = textbookSets.flatMap((set) => set.words);
  return ids.map((id) => words.find((word) => word.id === id)).filter((word): word is (typeof words)[number] => Boolean(word));
}

export function validateAcademyLessonContent(value: unknown): value is AcademyLessonContent {
  const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
  const text = (v: unknown, max = 4000) => typeof v === "string" && v.length > 0 && v.length <= max;
  const sentence = (v: unknown) => record(v) && text(v.chinese) && text(v.simplified) && text(v.pinyin) && text(v.meaningVi);
  const question = (v: unknown) => record(v) && text(v.id, 100) && text(v.prompt) && text(v.feedback) && text(v.skill, 100) && Array.isArray(v.options) && v.options.length >= 2 && v.options.length <= 6 && v.options.every((choice: unknown) => record(choice) && text(choice.id, 10) && text(choice.text)) && new Set(v.options.map((choice: { id: string }) => choice.id)).size === v.options.length && v.options.some((choice: { id: string }) => choice.id === v.correctOptionId);
  const questionList = (v: unknown, min: number, max: number) => Array.isArray(v) && v.length >= min && v.length <= max && v.every(question) && new Set(v.map((q: { id: string }) => q.id)).size === v.length;
  if (!record(value) || value.contentVersion !== 2 || !text(value.id, 100) || ![...academyVolume.lessonIds, ...academyVolume2.lessonIds].includes(value.id as string) || !text(value.title, 100) || !text(value.titleVi, 100) || !text(value.description, 500) || !Array.isArray(value.objectives) || !value.objectives.length || !value.objectives.every((item: unknown) => text(item, 300)) || !(value.estimatedMinutes === null || (Number.isInteger(value.estimatedMinutes) && Number(value.estimatedMinutes) > 0 && Number(value.estimatedMinutes) <= 300))) return false;
  const isFirst = value.id === academyLesson01.id;
  if (!record(value.lecture) || !text(value.lecture.introduction) || !Array.isArray(value.lecture.sections) || value.lecture.sections.length < 2 || !value.lecture.sections.every((item: unknown) => record(item) && sentence(item) && text(item.id, 100) && text(item.title, 100) && text(item.body)) || !Array.isArray(value.lecture.dialogues) || value.lecture.dialogues.length < 2 || !value.lecture.dialogues.every((item: unknown) => record(item) && text(item.id, 100) && text(item.title, 100) && text(item.context) && Array.isArray(item.turns) && item.turns.length >= 2 && item.turns.every((turn: unknown) => record(turn) && text(turn.speaker, 100) && sentence(turn))) || !questionList(value.lecture.checks, 1, 10) || !Array.isArray(value.lecture.pronunciation) || (isFirst && value.lecture.pronunciation.length < 2) || !value.lecture.pronunciation.every((item: unknown) => record(item) && sentence(item) && text(item.id, 100) && text(item.title, 100) && text(item.explanation)) || !Array.isArray(value.lecture.culture) || (isFirst && value.lecture.culture.length < 1) || !value.lecture.culture.every((item: unknown) => record(item) && text(item.id, 100) && text(item.title, 100) && text(item.body))) return false;
  const expected = academyStaticLessonById(value.id as string);
  if (!expected || !record(value.vocabulary) || !text(value.vocabulary.introduction) || !Array.isArray(value.vocabulary.wordIds) || value.vocabulary.wordIds.length !== expected.vocabulary.wordIds.length || !value.vocabulary.wordIds.every((id: unknown, index: number) => id === expected.vocabulary.wordIds[index] && academyVocabularyByIds([id as string]).length === 1)) return false;
  if (!Array.isArray(value.grammar) || value.grammar.length < (isFirst ? 5 : 4) || !value.grammar.every((point: unknown) => record(point) && text(point.id, 100) && text(point.title, 100) && text(point.explanation) && text(point.structure) && text(point.commonMistake) && Array.isArray(point.examples) && point.examples.length >= 2 && point.examples.every(sentence) && question(point.check))) return false;
  if (!isFirst && !questionList(value.listening, 4, 20)) return false;
  return questionList(value.practice, 8, 30) && questionList(value.assessment, 10, 15) && (value.practice as AcademyQuestion[]).every((item, index) => item.id === expected.practice[index]?.id) && (value.assessment as AcademyQuestion[]).every((item, index) => item.id === expected.assessment[index]?.id);
}

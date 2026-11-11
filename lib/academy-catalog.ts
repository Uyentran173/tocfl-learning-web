import { textbookSets } from "./vocabulary.ts";
import { academyLesson01 } from "./academy-lesson01.ts";
import cc1Lessons from "../data/academy/cc1-lessons.json" with { type: "json" };
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
    dialogues: { id: string; title: string; context: string; turns: ({ speaker: string } & AcademySentence)[] }[];
    checks: AcademyQuestion[];
    pronunciation: ({ id: string; title: string; explanation: string } & AcademySentence)[];
    culture: { id: string; title: string; body: string }[];
  };
  vocabulary: { introduction: string; wordIds: string[] };
  grammar: {
    id: string; title: string; explanation: string; structure: string; examples: AcademySentence[];
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
  volumeIds: ["cc1-v1"],
} as const;
export const academyVolume = {
  id: "cc1-v1",
  seriesId: academySeries.id,
  number: 1,
  lessonIds: Array.from({ length: 15 }, (_, index) => `cc1-v1-l${String(index + 1).padStart(2, "0")}`),
} as const;

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
  const index = academyVolume.lessonIds.indexOf(id);
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
  if (!record(value) || value.contentVersion !== 2 || !text(value.id, 100) || !academyVolume.lessonIds.includes(value.id as typeof academyVolume.lessonIds[number]) || !text(value.title, 100) || !text(value.titleVi, 100) || !text(value.description, 500) || !Array.isArray(value.objectives) || !value.objectives.length || !value.objectives.every((item: unknown) => text(item, 300)) || !(value.estimatedMinutes === null || (Number.isInteger(value.estimatedMinutes) && Number(value.estimatedMinutes) > 0 && Number(value.estimatedMinutes) <= 300))) return false;
  const isFirst = value.id === academyLesson01.id;
  if (!record(value.lecture) || !text(value.lecture.introduction) || !Array.isArray(value.lecture.sections) || value.lecture.sections.length < 2 || !value.lecture.sections.every((item: unknown) => record(item) && sentence(item) && text(item.id, 100) && text(item.title, 100) && text(item.body)) || !Array.isArray(value.lecture.dialogues) || value.lecture.dialogues.length < 2 || !value.lecture.dialogues.every((item: unknown) => record(item) && text(item.id, 100) && text(item.title, 100) && text(item.context) && Array.isArray(item.turns) && item.turns.length >= 2 && item.turns.every((turn: unknown) => record(turn) && text(turn.speaker, 100) && sentence(turn))) || !questionList(value.lecture.checks, 1, 10) || !Array.isArray(value.lecture.pronunciation) || (isFirst && value.lecture.pronunciation.length < 2) || !value.lecture.pronunciation.every((item: unknown) => record(item) && sentence(item) && text(item.id, 100) && text(item.title, 100) && text(item.explanation)) || !Array.isArray(value.lecture.culture) || (isFirst && value.lecture.culture.length < 1) || !value.lecture.culture.every((item: unknown) => record(item) && text(item.id, 100) && text(item.title, 100) && text(item.body))) return false;
  const expected = academyStaticLesson(academyLessonNumber(value.id as string) ?? 0);
  if (!expected || !record(value.vocabulary) || !text(value.vocabulary.introduction) || !Array.isArray(value.vocabulary.wordIds) || value.vocabulary.wordIds.length !== expected.vocabulary.wordIds.length || !value.vocabulary.wordIds.every((id: unknown, index: number) => id === expected.vocabulary.wordIds[index] && academyVocabularyByIds([id as string]).length === 1)) return false;
  if (!Array.isArray(value.grammar) || value.grammar.length < (isFirst ? 5 : 4) || !value.grammar.every((point: unknown) => record(point) && text(point.id, 100) && text(point.title, 100) && text(point.explanation) && text(point.structure) && text(point.commonMistake) && Array.isArray(point.examples) && point.examples.length >= 2 && point.examples.every(sentence) && question(point.check))) return false;
  if (!isFirst && !questionList(value.listening, 4, 20)) return false;
  return questionList(value.practice, 8, 30) && questionList(value.assessment, 10, 15) && (value.practice as AcademyQuestion[]).every((item, index) => item.id === expected.practice[index]?.id) && (value.assessment as AcademyQuestion[]).every((item, index) => item.id === expected.assessment[index]?.id);
}

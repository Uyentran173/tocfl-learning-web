import { textbookSets } from "@/lib/vocabulary";

export const academyActivityKinds = ["lecture", "vocabulary", "grammar", "practice", "assessment"] as const;
export type AcademyActivityKind = (typeof academyActivityKinds)[number];
export type AcademyPublication = "draft" | "published";
export type AcademyQuestion = {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  feedback: string;
};
export type AcademyLessonContent = {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  estimatedMinutes: number | null;
  lecture: { introduction: string; dialogue: { speaker: string; chinese: string; meaningVi: string }[] };
  vocabulary: { introduction: string; wordIds: string[] };
  grammar: { id: string; title: string; explanation: string; example: string; meaningVi: string }[];
  practice: AcademyQuestion[];
  assessment: AcademyQuestion[];
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
  return number === 1 ? "published" : "draft";
}
export const academyActivityLabels: Record<AcademyActivityKind, string> = {
  lecture: "Bài giảng",
  vocabulary: "Từ vựng",
  grammar: "Ngữ pháp",
  practice: "Luyện tập",
  assessment: "Đánh giá bài học",
};

// This is original Tai Wén sample material. It does not reproduce either CC1 PDF.
// The vocabulary section resolves IDs from the existing textbook vocabulary set.
export const academyLesson01: AcademyLessonContent = {
  id: "cc1-v1-l01",
  title: "Bài 01 · Làm quen",
  description: "Một bài học mẫu của Tai Wén để luyện giới thiệu bản thân bằng tiếng Hoa.",
  objectives: ["Chào hỏi và giới thiệu tên", "Dùng 我, 你, 叫 và 學生 trong câu ngắn", "Nhận biết mẫu câu 是 và câu hỏi 嗎"],
  estimatedMinutes: 20,
  lecture: {
    introduction: "Đọc đoạn hội thoại ngắn, rồi thử nói lại bằng tên của bạn.",
    dialogue: [
      { speaker: "A", chinese: "你好！我叫小安。你叫什麼名字？", meaningVi: "Chào bạn! Mình tên Tiểu An. Bạn tên gì?" },
      { speaker: "B", chinese: "你好！我叫小明。我是學生。", meaningVi: "Chào bạn! Mình tên Tiểu Minh. Mình là học sinh." },
      { speaker: "A", chinese: "我也是學生。很高興認識你！", meaningVi: "Mình cũng là học sinh. Rất vui được gặp bạn!" },
    ],
  },
  vocabulary: { introduction: "Ôn bốn từ đã có trong bộ từ vựng theo giáo trình của Tai Wén.", wordIds: ["textbook-intro-l01-wo", "textbook-intro-l01-ni", "textbook-intro-l01-jiao", "textbook-intro-l01-xuesheng"] },
  grammar: [
    { id: "cc1-v1-l01-grammar-shi", title: "A 是 B", explanation: "Dùng 是 để nói A là B.", example: "我是學生。", meaningVi: "Mình là học sinh." },
    { id: "cc1-v1-l01-grammar-ma", title: "Câu hỏi với 嗎", explanation: "Thêm 嗎 ở cuối câu trần thuật để hỏi có hay không.", example: "你是學生嗎？", meaningVi: "Bạn là học sinh à?" },
  ],
  practice: [
    { id: "cc1-v1-l01-practice-01", prompt: "“我叫小安。” có nghĩa là gì?", options: [{ id: "a", text: "Mình tên Tiểu An." }, { id: "b", text: "Bạn tên Tiểu An." }, { id: "c", text: "Mình là học sinh." }], correctOptionId: "a", feedback: "我 là “mình/tôi”; 叫 dùng để giới thiệu tên." },
    { id: "cc1-v1-l01-practice-02", prompt: "Chọn câu hỏi “Bạn là học sinh à?”", options: [{ id: "a", text: "我是學生。" }, { id: "b", text: "你是學生嗎？" }, { id: "c", text: "你叫學生。" }], correctOptionId: "b", feedback: "你 là “bạn”; 嗎 biến câu thành câu hỏi có/không." },
  ],
  assessment: [
    { id: "cc1-v1-l01-assessment-01", prompt: "Chọn cách giới thiệu “Mình tên Tiểu Minh.”", options: [{ id: "a", text: "你叫小明。" }, { id: "b", text: "我叫小明。" }, { id: "c", text: "我是小明嗎？" }], correctOptionId: "b", feedback: "Mẫu giới thiệu tên là 我叫 + tên." },
    { id: "cc1-v1-l01-assessment-02", prompt: "“我也是學生。” có nghĩa là gì?", options: [{ id: "a", text: "Mình cũng là học sinh." }, { id: "b", text: "Bạn là học sinh à?" }, { id: "c", text: "Mình tên là học sinh." }], correctOptionId: "a", feedback: "也 có nghĩa là “cũng”." },
  ],
};

export function academyVocabularyByIds(ids: string[]) {
  const words = textbookSets.flatMap((set) => set.words);
  return ids.map((id) => words.find((word) => word.id === id)).filter((word): word is (typeof words)[number] => Boolean(word));
}

export function validateAcademyLessonContent(value: unknown): value is AcademyLessonContent {
  const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
  if (!record(value)) return false;
  const item = value as Partial<AcademyLessonContent>;
  const text = (v: unknown, max = 2000) => typeof v === "string" && v.length > 0 && v.length <= max;
  const questions = (v: unknown) => Array.isArray(v) && v.length > 0 && v.length <= 20 &&
    new Set(v.map((q) => record(q) ? q.id : null)).size === v.length && v.every((q) =>
      record(q) && text(q.id, 100) && text(q.prompt) && text(q.feedback) && Array.isArray(q.options) && q.options.length >= 2 && q.options.length <= 6 &&
      q.options.every((option: unknown) => record(option) && text(option.id, 20) && text(option.text)) &&
      new Set(q.options.map((option: { id: string }) => option.id)).size === q.options.length &&
      q.options.some((option: { id: string }) => option.id === q.correctOptionId));
  return item.id === academyLesson01.id && text(item.title, 100) && text(item.description, 500) &&
    Array.isArray(item.objectives) && item.objectives.length > 0 && item.objectives.length <= 10 && item.objectives.every((objective) => text(objective, 300)) &&
    (item.estimatedMinutes === null || (Number.isInteger(item.estimatedMinutes) && Number(item.estimatedMinutes) > 0 && Number(item.estimatedMinutes) <= 300)) &&
    !!item.lecture && text(item.lecture.introduction) && Array.isArray(item.lecture.dialogue) && item.lecture.dialogue.length > 0 &&
    item.lecture.dialogue.length <= 20 && item.lecture.dialogue.every((turn) => record(turn) && text(turn.speaker, 50) && text(turn.chinese) && text(turn.meaningVi)) &&
    !!item.vocabulary && text(item.vocabulary.introduction) && Array.isArray(item.vocabulary.wordIds) && item.vocabulary.wordIds.length > 0 &&
    item.vocabulary.wordIds.length <= 50 && item.vocabulary.wordIds.every((id) => text(id, 100) && academyVocabularyByIds([id]).length === 1) &&
    Array.isArray(item.grammar) && item.grammar.length > 0 && item.grammar.length <= 20 && item.grammar.every((point) => record(point) && text(point.id, 100) && text(point.title, 100) && text(point.explanation) && text(point.example) && text(point.meaningVi)) &&
    Array.isArray(item.practice) && Array.isArray(item.assessment) && questions(item.practice) && questions(item.assessment) &&
    item.practice.length === academyLesson01.practice.length && item.assessment.length === academyLesson01.assessment.length &&
    item.practice.every((question, index) => question.id === academyLesson01.practice[index].id) &&
    item.assessment.every((question, index) => question.id === academyLesson01.assessment[index].id) &&
    new Set([...item.practice.map((question) => question.id), ...item.assessment.map((question) => question.id)]).size === item.practice.length + item.assessment.length;
}

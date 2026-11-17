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
import cc3Lesson01Data from "../data/academy/cc3-lesson01.json" with { type: "json" };
import cc3Lesson02Data from "../data/academy/cc3-lesson02.json" with { type: "json" };
import cc3Lesson03Data from "../data/academy/cc3-lesson03.json" with { type: "json" };
import cc3Lesson04Data from "../data/academy/cc3-lesson04.json" with { type: "json" };
import cc3Lesson05Data from "../data/academy/cc3-lesson05.json" with { type: "json" };
import cc3Lesson06Data from "../data/academy/cc3-lesson06.json" with { type: "json" };
import cc3Lesson07Data from "../data/academy/cc3-lesson07.json" with { type: "json" };
import cc3Lesson08Data from "../data/academy/cc3-lesson08.json" with { type: "json" };
import cc3Lesson09Data from "../data/academy/cc3-lesson09.json" with { type: "json" };
import cc3Lesson10Data from "../data/academy/cc3-lesson10.json" with { type: "json" };
import cc3Lesson11Data from "../data/academy/cc3-lesson11.json" with { type: "json" };
import cc3Lesson12Data from "../data/academy/cc3-lesson12.json" with { type: "json" };
import { cc3Lesson01Words, cc3LessonWords02to12 } from "./cc3-course-vocabulary.ts";
import cc4Lesson01Data from "../data/academy/cc4-lesson01.json" with { type: "json" };
import cc4Lesson02Data from "../data/academy/cc4-lesson02.json" with { type: "json" };
import cc4Lesson03Data from "../data/academy/cc4-lesson03.json" with { type: "json" };
import cc4Lesson04Data from "../data/academy/cc4-lesson04.json" with { type: "json" };
import cc4Lesson05Data from "../data/academy/cc4-lesson05.json" with { type: "json" };
import cc4Lesson06Data from "../data/academy/cc4-lesson06.json" with { type: "json" };
import cc4Lesson07Data from "../data/academy/cc4-lesson07.json" with { type: "json" };
import cc4Lesson08Data from "../data/academy/cc4-lesson08.json" with { type: "json" };
import cc4Lesson09Data from "../data/academy/cc4-lesson09.json" with { type: "json" };
import cc4Lesson10Data from "../data/academy/cc4-lesson10.json" with { type: "json" };
import cc4Lesson11Data from "../data/academy/cc4-lesson11.json" with { type: "json" };
import cc4Lesson12Data from "../data/academy/cc4-lesson12.json" with { type: "json" };
import { cc4Lesson01Words, cc4Lesson02Words, cc4Lesson03Words, cc4Lesson04Words, cc4Lesson05Words, cc4Lesson06Words, cc4Lesson07Words, cc4Lesson08Words, cc4Lesson09Words, cc4Lesson10Words, cc4Lesson11Words, cc4Lesson12Words } from "./cc4-course-vocabulary.ts";
import cc5Lesson01Data from "../data/academy/cc5-lesson01.json" with { type: "json" };
import { cc5Lesson01Words } from "./cc5-course-vocabulary.ts";
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
  volumeIds: ["cc1-v1", "cc2-v2", "cc3-v3", "cc4-v4", "cc5-v5"],
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
export const academyVolume3 = {
  id: "cc3-v3",
  seriesId: academySeries.id,
  number: 3,
  lessonIds: Array.from({ length: 12 }, (_, index) => `cc3-v3-l${String(index + 1).padStart(2, "0")}`),
} as const;
export const academyVolume4 = {
  id: "cc4-v4",
  seriesId: academySeries.id,
  number: 4,
  lessonIds: Array.from({ length: 12 }, (_, index) => `cc4-v4-l${String(index + 1).padStart(2, "0")}`),
} as const;
export const academyVolume4Lesson01 = {
  ...cc4Lesson01Data,
  vocabulary: { ...cc4Lesson01Data.vocabulary, wordIds: cc4Lesson01Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lesson02 = {
  ...cc4Lesson02Data,
  vocabulary: { ...cc4Lesson02Data.vocabulary, wordIds: cc4Lesson02Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lesson03 = {
  ...cc4Lesson03Data,
  vocabulary: { ...cc4Lesson03Data.vocabulary, wordIds: cc4Lesson03Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lesson04 = {
  ...cc4Lesson04Data,
  vocabulary: { ...cc4Lesson04Data.vocabulary, wordIds: cc4Lesson04Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lesson05 = {
  ...cc4Lesson05Data,
  vocabulary: { ...cc4Lesson05Data.vocabulary, wordIds: cc4Lesson05Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lesson06 = {
  ...cc4Lesson06Data,
  vocabulary: { ...cc4Lesson06Data.vocabulary, wordIds: cc4Lesson06Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lesson07 = {
  ...cc4Lesson07Data,
  vocabulary: { ...cc4Lesson07Data.vocabulary, wordIds: cc4Lesson07Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lesson08 = {
  ...cc4Lesson08Data,
  vocabulary: { ...cc4Lesson08Data.vocabulary, wordIds: cc4Lesson08Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lesson09 = {
  ...cc4Lesson09Data,
  vocabulary: { ...cc4Lesson09Data.vocabulary, wordIds: cc4Lesson09Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lesson10 = {
  ...cc4Lesson10Data,
  vocabulary: { ...cc4Lesson10Data.vocabulary, wordIds: cc4Lesson10Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lesson11 = {
  ...cc4Lesson11Data,
  vocabulary: { ...cc4Lesson11Data.vocabulary, wordIds: cc4Lesson11Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lesson12 = {
  ...cc4Lesson12Data,
  vocabulary: { ...cc4Lesson12Data.vocabulary, wordIds: cc4Lesson12Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume4Lessons = [academyVolume4Lesson01, academyVolume4Lesson02, academyVolume4Lesson03, academyVolume4Lesson04, academyVolume4Lesson05, academyVolume4Lesson06, academyVolume4Lesson07, academyVolume4Lesson08, academyVolume4Lesson09, academyVolume4Lesson10, academyVolume4Lesson11, academyVolume4Lesson12];
export const academyVolume5 = {
  id: "cc5-v5",
  seriesId: academySeries.id,
  number: 5,
  lessonIds: Array.from({ length: 10 }, (_, index) => `cc5-v5-l${String(index + 1).padStart(2, "0")}`),
} as const;
export const academyVolume5Lesson01 = {
  ...cc5Lesson01Data,
  vocabulary: { ...cc5Lesson01Data.vocabulary, wordIds: cc5Lesson01Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
export const academyVolume5Lessons = [academyVolume5Lesson01];
export const academyVolume3Lesson01 = {
  ...cc3Lesson01Data,
  vocabulary: { ...cc3Lesson01Data.vocabulary, wordIds: cc3Lesson01Words.map((word) => word.id!) },
} as unknown as AcademyLessonContent;
const cc3LessonData02to12 = [cc3Lesson02Data, cc3Lesson03Data, cc3Lesson04Data, cc3Lesson05Data, cc3Lesson06Data, cc3Lesson07Data, cc3Lesson08Data, cc3Lesson09Data, cc3Lesson10Data, cc3Lesson11Data, cc3Lesson12Data];
export const academyVolume3Lessons02to12: AcademyLessonContent[] = cc3LessonData02to12.map((data, index) => ({
  ...data,
  vocabulary: { ...data.vocabulary, wordIds: cc3LessonWords02to12[index].map((word) => word.id!) },
}) as unknown as AcademyLessonContent);
export const academyVolume3Lessons = [academyVolume3Lesson01, ...academyVolume3Lessons02to12];
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
export const academyVolume3LessonSummaries = [
  { chinese: "開學了", vi: "Khai giảng rồi" },
  { chinese: "八折起", vi: "Giảm giá từ 20%" },
  { chinese: "外套帶了沒有？", vi: "Bạn đã mang áo khoác chưa?" },
  { chinese: "我愛台灣的人情味", vi: "Tôi yêu sự ấm áp của người Đài Loan" },
  { chinese: "現在流行什麼？", vi: "Bây giờ thịnh hành gì?" },
  { chinese: "到鄉下住一晚！", vi: "Ở miền quê một đêm" },
  { chinese: "我最親的家「人」", vi: "Người thân thiết nhất như gia đình" },
  { chinese: "我想做自己", vi: "Tôi muốn là chính mình" },
  { chinese: "網購時代", vi: "Thời đại mua sắm trực tuyến" },
  { chinese: "我住院了", vi: "Tôi nhập viện rồi" },
  { chinese: "台灣故事", vi: "Câu chuyện Đài Loan" },
  { chinese: "我要去投票", vi: "Tôi sẽ đi bỏ phiếu" },
] as const;
export const academyVolume4LessonSummaries = [
  { chinese: "十七歲還是二十五歲？", vi: "Mười bảy hay hai mươi lăm tuổi?" },
  { chinese: "眼睛、耳朵的饗宴", vi: "Bữa tiệc cho mắt và tai" },
  { chinese: "雲端科技", vi: "Công nghệ đám mây" },
  { chinese: "床該擺哪裡", vi: "Nên đặt giường ở đâu?" },
  { chinese: "有夢最美", vi: "Có ước mơ thật đẹp" },
  { chinese: "天搖地動", vi: "Đất rung trời chuyển" },
  { chinese: "大學生的事", vi: "Chuyện của sinh viên đại học" },
  { chinese: "他們的選擇", vi: "Lựa chọn của họ" },
  { chinese: "再談台灣故事", vi: "Nói tiếp chuyện Đài Loan" },
  { chinese: "應徵", vi: "Ứng tuyển" },
  { chinese: "文化、種族的大熔爐", vi: "Nơi giao thoa văn hóa và sắc tộc" },
  { chinese: "期待美好的未來", vi: "Mong đợi tương lai tươi đẹp" },
] as const;
export const academyVolume5LessonSummaries = [
  { chinese: "言論自由的界線", vi: "Ranh giới của tự do ngôn luận" },
  { chinese: "關於基改食品，我有話要說", vi: "Tôi có điều muốn nói về thực phẩm biến đổi gen" },
  { chinese: "整形好不好", vi: "Phẫu thuật thẩm mỹ: nên hay không?" },
  { chinese: "傳統與現代", vi: "Truyền thống và hiện đại" },
  { chinese: "代理孕母，帶來幸福", vi: "Mang thai hộ và hạnh phúc" },
  { chinese: "死刑的存廢", vi: "Giữ hay bỏ án tử hình?" },
  { chinese: "增富人稅＝減窮人苦", vi: "Tăng thuế người giàu, giảm khó cho người nghèo?" },
  { chinese: "左右為難的難民問題", vi: "Bài toán người tị nạn khó xử" },
  { chinese: "有核到底可不可", vi: "Có nên dùng điện hạt nhân?" },
  { chinese: "同性婚姻合法化", vi: "Hợp pháp hóa hôn nhân đồng giới" },
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
  const index = id.startsWith("cc5-v5-") ? academyVolume5.lessonIds.indexOf(id) : id.startsWith("cc4-v4-") ? academyVolume4.lessonIds.indexOf(id) : id.startsWith("cc3-v3-") ? academyVolume3.lessonIds.indexOf(id) : id.startsWith("cc2-v2-") ? academyVolume2.lessonIds.indexOf(id) : academyVolume.lessonIds.indexOf(id);
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
  const volume5Lesson = academyVolume5Lessons.find((lesson) => lesson.id === id);
  if (volume5Lesson) return volume5Lesson;
  const volume4Lesson = academyVolume4Lessons.find((lesson) => lesson.id === id);
  if (volume4Lesson) return volume4Lesson;
  const volume3Lesson = academyVolume3Lessons.find((lesson) => lesson.id === id);
  if (volume3Lesson) return volume3Lesson;
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
  if (!record(value) || value.contentVersion !== 2 || !text(value.id, 100) || ![...academyVolume.lessonIds, ...academyVolume2.lessonIds, ...academyVolume3.lessonIds, ...academyVolume4.lessonIds, ...academyVolume5.lessonIds].includes(value.id as string) || !text(value.title, 100) || !text(value.titleVi, 100) || !text(value.description, 500) || !Array.isArray(value.objectives) || !value.objectives.length || !value.objectives.every((item: unknown) => text(item, 300)) || !(value.estimatedMinutes === null || (Number.isInteger(value.estimatedMinutes) && Number(value.estimatedMinutes) > 0 && Number(value.estimatedMinutes) <= 300))) return false;
  const isFirst = value.id === academyLesson01.id;
  if (!record(value.lecture) || !text(value.lecture.introduction) || !Array.isArray(value.lecture.sections) || value.lecture.sections.length < 2 || !value.lecture.sections.every((item: unknown) => record(item) && sentence(item) && text(item.id, 100) && text(item.title, 100) && text(item.body)) || !Array.isArray(value.lecture.dialogues) || value.lecture.dialogues.length < 2 || !value.lecture.dialogues.every((item: unknown) => record(item) && text(item.id, 100) && text(item.title, 100) && text(item.context) && Array.isArray(item.turns) && item.turns.length >= 2 && item.turns.every((turn: unknown) => record(turn) && text(turn.speaker, 100) && sentence(turn))) || !questionList(value.lecture.checks, 1, 10) || !Array.isArray(value.lecture.pronunciation) || (isFirst && value.lecture.pronunciation.length < 2) || !value.lecture.pronunciation.every((item: unknown) => record(item) && sentence(item) && text(item.id, 100) && text(item.title, 100) && text(item.explanation)) || !Array.isArray(value.lecture.culture) || (isFirst && value.lecture.culture.length < 1) || !value.lecture.culture.every((item: unknown) => record(item) && text(item.id, 100) && text(item.title, 100) && text(item.body))) return false;
  const expected = academyStaticLessonById(value.id as string);
  if (!expected || !record(value.vocabulary) || !text(value.vocabulary.introduction) || !Array.isArray(value.vocabulary.wordIds) || value.vocabulary.wordIds.length !== expected.vocabulary.wordIds.length || !value.vocabulary.wordIds.every((id: unknown, index: number) => id === expected.vocabulary.wordIds[index] && academyVocabularyByIds([id as string]).length === 1)) return false;
  if (!Array.isArray(value.grammar) || value.grammar.length < (isFirst ? 5 : 4) || !value.grammar.every((point: unknown) => record(point) && text(point.id, 100) && text(point.title, 100) && text(point.explanation) && text(point.structure) && typeof point.commonMistake === "string" && Array.isArray(point.examples) && point.examples.length >= 2 && point.examples.every(sentence) && question(point.check))) return false;
  if (!isFirst && !questionList(value.listening, 4, 20)) return false;
  return questionList(value.practice, 8, 30) && questionList(value.assessment, 10, 15) && (value.practice as AcademyQuestion[]).every((item, index) => item.id === expected.practice[index]?.id) && (value.assessment as AcademyQuestion[]).every((item, index) => item.id === expected.assessment[index]?.id);
}

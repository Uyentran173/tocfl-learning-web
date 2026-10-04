import Link from "next/link";
import VocabularyPractice from "@/components/VocabularyPractice";

export default function VocabularyPracticePage() {
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/vocabulary" className="button-quiet text-sm">← Học từ vựng</Link>
    <div className="mb-8 mt-7 max-w-3xl"><p className="page-eyebrow">SAU KHI HỌC TỪ</p><h1 className="page-title">Dùng từ đã học trong bài khóa, bài tập và trò chơi.</h1><p className="page-lead">Từ ba lối học được gom vào một kho trên thiết bị này. Bài khóa sử dụng câu ví dụ có sẵn; đáp án luyện tập cập nhật mức độ ghi nhớ của từng từ.</p></div>
    <VocabularyPractice />
  </main>;
}

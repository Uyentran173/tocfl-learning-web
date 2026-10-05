import Link from "next/link";
import { Suspense } from "react";
import VocabularyPracticeClient from "@/components/VocabularyPracticeClient";

export default function VocabularyPracticePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/vocabulary" className="button-quiet text-sm">← Học từ vựng</Link>
      <div className="mb-8 mt-7 max-w-3xl">
        <p className="page-eyebrow">SAU KHI HỌC TỪ</p>
        <h1 className="page-title">Dùng từ đã học trong bài khóa, bài tập và trò chơi.</h1>
        <p className="page-lead">Từ ba lối học được gom vào một kho trên thiết bị này. Bài khóa đặt những từ đã học vào một tình huống gần gũi; đáp án luyện tập cập nhật mức độ ghi nhớ của từng từ.</p>
      </div>
      <Suspense fallback={<div className="py-8 text-center text-sm muted">Đang tải luyện tập…</div>}>
        <VocabularyPracticeClient />
      </Suspense>
    </main>
  );
}

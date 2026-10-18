import Link from "next/link";
import { Suspense } from "react";
import VocabularyPracticeClient from "@/components/VocabularyPracticeClient";
import { createPageMetadata } from "@/lib/seo";
import T from "@/components/T";

export const metadata = createPageMetadata("Ôn tập từ vựng", "Luyện tập từ đã học qua bài khóa, bài tập và trò chơi.", "/vocabulary/practice");

export default function VocabularyPracticePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Link href="/vocabulary" className="button-quiet text-sm">← Học từ vựng</Link>
      <div className="mb-8 mt-7 max-w-3xl">
        <p className="page-eyebrow"><T>SAU KHI HỌC TỪ</T></p>
        <h1 className="page-title"><T>Dùng từ đã học trong bài khóa, bài tập và trò chơi.</T></h1>
        <p className="page-lead"><T>Từ ba lối học được gom vào một kho trên thiết bị này. Bài khóa đặt những từ đã học vào một tình huống gần gũi; đáp án luyện tập cập nhật mức độ ghi nhớ của từng từ.</T></p>
      </div>
      <Suspense fallback={<div className="py-8 text-center text-sm muted"><T>Đang tải luyện tập…</T></div>}>
        <VocabularyPracticeClient />
      </Suspense>
    </main>
  );
}

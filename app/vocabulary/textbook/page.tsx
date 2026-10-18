import Link from "next/link";
import VocabularyStudy from "@/components/VocabularyStudy";
import { textbooks } from "@/lib/vocabulary";
import { createPageMetadata } from "@/lib/seo";
import T from "@/components/T";

export const metadata = createPageMetadata("Học từ vựng theo giáo trình", "Học từ vựng tiếng Hoa theo từng bài và theo dõi tiến độ học.", "/vocabulary/textbook");

export default function TextbookVocabularyPage() {
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/vocabulary" className="button-quiet text-sm">← <T>Ba cách học từ vựng</T></Link>
    <div className="mb-9 mt-7 max-w-3xl">
      <p className="page-eyebrow"><T>HỌC TỪNG BƯỚC</T></p>
      <h1 className="page-title"><T>Học từ vựng theo từng bài, từ nền tảng đến ứng dụng.</T></h1>
      <p className="page-lead"><T>Bắt đầu từ các bài nhập môn, học theo thứ tự, đánh dấu từ đã thuộc và quay lại ôn khi cần.</T></p>
    </div>
    <VocabularyStudy sets={textbooks.flatMap((book) => book.chapters.flatMap((chapter) => chapter.lessons))} kind="textbook" groups={textbooks.flatMap((book) => book.chapters.map((chapter) => ({ id: `${book.id}-${chapter.id}`, label: `${book.title} · ${chapter.title}`, setIds: chapter.lessons.map((lesson) => lesson.id) })))} />
  </main>;
}

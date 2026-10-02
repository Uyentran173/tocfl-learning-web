import Link from "next/link";
import VocabularyStudy from "@/components/VocabularyStudy";
import { textbooks } from "@/lib/vocabulary";

export default function TextbookVocabularyPage() {
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/vocabulary" className="button-quiet text-sm">← Ba cách học từ vựng</Link>
    <div className="mb-9 mt-7 max-w-3xl">
      <p className="page-eyebrow">HỌC TỪNG BƯỚC</p>
      <h1 className="page-title">Học từ vựng theo từng bài, từ nền tảng đến ứng dụng.</h1>
      <p className="page-lead">Bắt đầu từ các bài nhập môn, học theo thứ tự, đánh dấu từ đã thuộc và quay lại ôn khi cần.</p>
    </div>
    <VocabularyStudy sets={textbooks.flatMap((book) => book.chapters.flatMap((chapter) => chapter.lessons))} kind="textbook" groups={textbooks.flatMap((book) => book.chapters.map((chapter) => ({ id: `${book.id}-${chapter.id}`, label: `${book.title} · ${chapter.title}`, setIds: chapter.lessons.map((lesson) => lesson.id) })))} />
  </main>;
}

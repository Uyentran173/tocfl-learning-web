import Link from "next/link";
import ContextVocabularyBuilder from "@/components/ContextVocabularyBuilder";

export default function TopicVocabularyPage() {
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/vocabulary" className="button-quiet text-sm">← Ba cách học từ vựng</Link>
    <div className="mb-9 mt-7 max-w-3xl">
      <p className="page-eyebrow">HỌC THEO NGỮ CẢNH</p>
      <h1 className="page-title">Học những từ phù hợp với tình huống bạn chọn.</h1>
      <p className="page-lead">Chọn chủ đề, mục đích học và trình độ để tạo bộ từ phù hợp từ các kho từ đang có.</p>
    </div>
    <ContextVocabularyBuilder />
    <p className="mt-8 text-xs muted">Một số câu ví dụ TOCFL lấy từ <a href="https://tatoeba.org/" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">Tatoeba</a> (CC BY 2.0 FR); tác giả và liên kết câu gốc được hiển thị trên thẻ từ.</p>
  </main>;
}

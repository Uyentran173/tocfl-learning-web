import Link from "next/link";
import ContextVocabularyBuilder from "@/components/ContextVocabularyBuilder";
import { createPageMetadata } from "@/lib/seo";
import T from "@/components/T";

export const metadata = createPageMetadata("Học từ vựng theo ngữ cảnh", "Học tiếng Hoa qua chủ đề và tình huống phù hợp với bạn.", "/vocabulary/topic");

export default function TopicVocabularyPage() {
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/vocabulary" className="button-quiet text-sm">← <T>Ba cách học từ vựng</T></Link>
    <div className="mb-9 mt-7 max-w-3xl">
      <p className="page-eyebrow"><T>HỌC THEO NGỮ CẢNH</T></p>
      <h1 className="page-title"><T>Học những từ phù hợp với tình huống bạn chọn.</T></h1>
      <p className="page-lead"><T>Chọn chủ đề, mục đích học và trình độ để tạo bộ từ phù hợp từ các kho từ đang có.</T></p>
    </div>
    <ContextVocabularyBuilder />
    <p className="mt-8 text-xs muted"><T>Một số câu ví dụ TOCFL lấy từ</T> <a href="https://tatoeba.org/" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">Tatoeba</a> (CC BY 2.0 FR); <T>tác giả và liên kết câu gốc được hiển thị trên thẻ từ.</T></p>
  </main>;
}

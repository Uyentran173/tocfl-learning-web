import Link from "next/link";
import VocabularyStudy from "@/components/VocabularyStudy";
import { topicSets } from "@/lib/vocabulary";

export default function TopicVocabularyPage() {
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/vocabulary" className="button-quiet text-sm">← Ba cách học từ vựng</Link>
    <div className="mb-9 mt-7 max-w-3xl">
      <p className="page-eyebrow">HỌC THEO NGỮ CẢNH</p>
      <h1 className="page-title">Học những từ phù hợp với tình huống bạn chọn.</h1>
      <p className="page-lead">Chọn một chủ đề gần gũi như giao tiếp, ăn uống hoặc đi lại để học những từ bạn có thể dùng ngay.</p>
    </div>
    <VocabularyStudy sets={topicSets} kind="topic" />
  </main>;
}

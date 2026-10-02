import Link from "next/link";
import BandVocabularyStudy from "@/components/BandVocabularyStudy";
import MascotSticker from "@/components/MascotSticker";
import { getTocflVocabularyBands } from "@/lib/tocfl-vocabulary-data";

export default function BandVocabularyPage() {
  const bands = getTocflVocabularyBands();
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/vocabulary" className="button-quiet text-sm">← Ba cách học từ vựng</Link>
    <div className="mb-9 mt-7 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-3xl"><p className="page-eyebrow">LỘ TRÌNH TOCFL</p><h1 className="page-title">Học từ vựng theo từng Band.</h1><p className="page-lead">Chọn Band và cấp độ, xem danh sách từ, rồi học hoặc ôn lại theo nhịp của bạn. Tiến độ được lưu trên thiết bị này.</p></div>
      <MascotSticker variant="graduate" className="vocabulary-header-sticker mascot-float" decorative />
    </div>
    <BandVocabularyStudy bands={bands} />
    <p className="mt-8 text-xs muted">Phần nghĩa tiếng Việt được biên soạn có tham khảo <a href="https://cc-cedict.org/" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">CC-CEDICT</a> (CC BY-SA 4.0). Một số câu ví dụ từ <a href="https://tatoeba.org/" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">Tatoeba</a> (CC BY 2.0 FR); tác giả được ghi cạnh từng câu.</p>
  </main>;
}

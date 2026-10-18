import Link from "next/link";
import BandVocabularyStudy from "@/components/BandVocabularyStudy";
import MascotSticker from "@/components/MascotSticker";
import { getTocflVocabularyBands } from "@/lib/tocfl-vocabulary-data";
import { createPageMetadata } from "@/lib/seo";
import T from "@/components/T";

export const metadata = createPageMetadata("Từ vựng theo Band TOCFL", "Học và ôn từ vựng TOCFL theo từng Band, với thẻ từ và tiến độ học rõ ràng.", "/vocabulary/band");

export default function BandVocabularyPage() {
  const bands = getTocflVocabularyBands();
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/vocabulary" className="button-quiet text-sm">← <T>Ba cách học từ vựng</T></Link>
    <div className="mb-9 mt-7 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-3xl"><p className="page-eyebrow"><T>LỘ TRÌNH TOCFL</T></p><h1 className="page-title"><T>Học từ vựng theo từng Band.</T></h1><p className="page-lead"><T>Chọn Band và cấp độ, xem danh sách từ, rồi học hoặc ôn lại theo nhịp của bạn. Tiến độ được lưu trên thiết bị này.</T></p></div>
      <MascotSticker variant="graduate" className="vocabulary-header-sticker mascot-float" decorative />
    </div>
    <BandVocabularyStudy bands={bands} />
    <p className="mt-8 text-xs muted"><T>Phần nghĩa tiếng Việt được biên soạn có tham khảo</T> <a href="https://cc-cedict.org/" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">CC-CEDICT</a> (CC BY-SA 4.0). <T>Một số câu ví dụ từ</T> <a href="https://tatoeba.org/" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">Tatoeba</a> (CC BY 2.0 FR); <T>tác giả được ghi cạnh từng câu.</T></p>
  </main>;
}

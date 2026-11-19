import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import MascotSticker from "@/components/MascotSticker";
import T from "@/components/T";
import { academyLearningPath, academySeries, academyVolume, academyVolume2, academyVolume3, academyVolume4, academyVolume5, academyVolume6 } from "@/lib/academy-catalog";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Tai Wén Academy · Kệ sách", "Khám phá lộ trình học tiếng Hoa theo giáo trình tại Tai Wén Academy.", "/academy");

const availableVolumes = [academyVolume, academyVolume2, academyVolume3, academyVolume4, academyVolume5, academyVolume6] as const;

function BookCover({ number }: { number: number }) {
  return <div className={`academy-book-cover academy-book-cover--v${number}`} aria-hidden="true">
    <span className={`academy-book-cover-art academy-book-cover-art--v${number}`} />
  </div>;
}

export default function AcademyPage() {
  return <main className="academy-landing mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Breadcrumbs items={[{ label: "Tai Wén", href: "/", translate: false }, { label: "Academy", translate: false }]} />
    <div className="academy-landing-hero mt-8"><div><p className="page-eyebrow">TAI WÉN ACADEMY</p><h1 className="page-title"><T>Mở sách, bắt đầu hành trình tiếng Hoa.</T></h1><p className="page-lead"><T>Chọn giáo trình, học từng bài và tiếp tục từ nơi bạn dừng lại.</T></p><p className="mt-5 text-sm font-semibold text-[var(--brand)]"><T>Lộ trình</T> · <T>{academyLearningPath.title}</T></p></div><MascotSticker variant="study" decorative className="academy-landing-mascot" /></div>
    <section className="mt-12" aria-labelledby="academy-shelf-heading"><div className="section-heading"><div><p className="page-eyebrow"><T>KỆ SÁCH SỐ</T></p><h2 id="academy-shelf-heading"><T>Giáo trình trong thư viện</T></h2></div></div>
      <div className="academy-shelf mt-6">
        {availableVolumes.map((volume) => <Link key={volume.id} href={`/academy/contemporary-chinese/${volume.id}`} className="academy-book-card academy-card-link is-available">
          <BookCover number={volume.number} />
          <div className="academy-book-details"><h3 className="mt-2 text-xl font-bold">{academySeries.title}</h3><p className="mt-1 text-sm muted"><T>{`Tập ${volume.number}`}</T> · {volume.number === 6 ? <T>Bài 01 đã mở</T> : <>{volume.lessonIds.length} <T>bài học</T></>}</p><p className="mt-4 text-sm leading-6 muted"><T>{volume.number === 1 ? "Học hội thoại, từ vựng, ngữ pháp và luyện nghe qua 15 bài của Tập 1." : "Học qua hội thoại, bài đọc, từ vựng, ngữ pháp và luyện nghe."}</T></p><span className="academy-card-arrow" aria-hidden="true">→</span></div>
        </Link>)}
      </div>
    </section>
    <div className="academy-crosslinks paper mt-12 p-5 sm:p-6"><p className="font-bold"><T>Tiếp tục theo cách của bạn</T></p><div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm"><Link href="/vocabulary/textbook"><T>Học từ vựng theo giáo trình</T> ↗</Link><Link href="/tocfl"><T>Luyện đề TOCFL</T> ↗</Link></div></div>
  </main>;
}

import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import MascotSticker from "@/components/MascotSticker";
import T from "@/components/T";
import { academyLearningPath, academySeries, academyVolume, academyVolume2 } from "@/lib/academy-catalog";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Tai Wén Academy · Kệ sách", "Khám phá lộ trình học tiếng Hoa theo giáo trình tại Tai Wén Academy.", "/academy");

export default function AcademyPage() {
  return <main className="academy-landing mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Breadcrumbs items={[{ label: "Tai Wén", href: "/", translate: false }, { label: "Academy", translate: false }]} />
    <div className="academy-landing-hero mt-8"><div><p className="page-eyebrow">TAI WÉN ACADEMY</p><h1 className="page-title"><T>Mở sách, bắt đầu hành trình tiếng Hoa.</T></h1><p className="page-lead"><T>Chọn giáo trình, học từng bài và tiếp tục từ nơi bạn dừng lại.</T></p><p className="mt-5 text-sm font-semibold text-[var(--brand)]"><T>Lộ trình</T> · <T>{academyLearningPath.title}</T></p></div><MascotSticker variant="study" decorative className="academy-landing-mascot" /></div>
    <section className="mt-12" aria-labelledby="academy-shelf-heading"><div className="section-heading"><div><p className="page-eyebrow"><T>KỆ SÁCH SỐ</T></p><h2 id="academy-shelf-heading"><T>Giáo trình trong thư viện</T></h2></div></div>
      <div className="academy-shelf mt-6">
        <Link href="/academy/contemporary-chinese/cc1-v1" className="academy-book-card academy-card-link is-available"><div className="academy-book-cover" aria-hidden="true"><span className="academy-book-cover-kicker">TAI WÉN ACADEMY</span><span className="academy-book-cover-mark">文</span><span className="academy-book-cover-title academy-book-cover-title-zh" lang="zh-Hant">當代中文</span><span className="academy-book-cover-volume">VOL. 01</span></div><div className="academy-book-details"><h3 className="mt-2 text-xl font-bold">{academySeries.title}</h3><p className="mt-1 text-sm muted"><T>Tập 1</T> · {academyVolume.lessonIds.length} <T>bài học</T></p><p className="mt-4 text-sm leading-6 muted"><T>Học hội thoại, từ vựng, ngữ pháp và luyện nghe qua 15 bài của Tập 1.</T></p><span className="academy-card-arrow" aria-hidden="true">→</span></div></Link>
        <Link href="/academy/contemporary-chinese/cc2-v2" className="academy-book-card academy-card-link is-available"><div className="academy-book-cover" aria-hidden="true"><span className="academy-book-cover-kicker">TAI WÉN ACADEMY</span><span className="academy-book-cover-mark">文</span><span className="academy-book-cover-title academy-book-cover-title-zh" lang="zh-Hant">當代中文</span><span className="academy-book-cover-volume">VOL. 02</span></div><div className="academy-book-details"><h3 className="mt-2 text-xl font-bold">{academySeries.title}</h3><p className="mt-1 text-sm muted"><T>Tập 2</T> · {academyVolume2.lessonIds.length} <T>bài học</T></p><p className="mt-4 text-sm leading-6 muted"><T>Bài 01–05 đã mở: học từ hội thoại đời thường đến công việc và lễ cưới.</T></p><span className="academy-card-arrow" aria-hidden="true">→</span></div></Link>
        <article className="academy-book-card is-upcoming"><div className="academy-book-cover academy-book-cover-quiet" aria-hidden="true"><span className="academy-book-cover-kicker">TAI WÉN ACADEMY</span><span className="academy-book-cover-mark">⋯</span><span className="academy-book-cover-title"><T>SẮP RA MẮT</T></span></div><div className="academy-book-details"><h3 className="mt-2 text-xl font-bold"><T>Thêm giáo trình trong tương lai</T></h3></div></article>
      </div>
    </section>
    <div className="academy-crosslinks paper mt-12 p-5 sm:p-6"><p className="font-bold"><T>Tiếp tục theo cách của bạn</T></p><div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm"><Link href="/vocabulary/textbook"><T>Học từ vựng theo giáo trình</T> ↗</Link><Link href="/tocfl"><T>Luyện đề TOCFL</T> ↗</Link></div></div>
  </main>;
}

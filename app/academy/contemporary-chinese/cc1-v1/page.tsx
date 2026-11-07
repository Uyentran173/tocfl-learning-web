import Link from "next/link";
import AcademyJourney from "@/components/AcademyJourney";
import MascotSticker from "@/components/MascotSticker";
import T from "@/components/T";
import { academyLesson01, academySeries } from "@/lib/academy-catalog";
import { publishedAcademyLesson01 } from "@/lib/academy-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Hành trình học · Giáo trình Đương đại 1", "Theo dõi 15 bài học của Giáo trình tiếng Hoa đương đại, tập 1.", "/academy/contemporary-chinese/cc1-v1");
export const dynamic = "force-dynamic";

export default async function AcademyVolumePage() {
  const content = await publishedAcademyLesson01();
  return <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
    <nav className="academy-crumbs" aria-label="Đường dẫn học tập"><Link href="/academy">Tai Wén Academy</Link><span>›</span><span>{academySeries.title}</span><span>›</span><span><T>Tập 1</T></span></nav>
    <div className="mt-9 flex items-center justify-between gap-6"><div><p className="page-eyebrow"><T>HÀNH TRÌNH HỌC TẬP</T> · <T>{academySeries.subtitle}</T></p><h1 className="page-title"><T>Đi từng trạm, vững từng bài.</T></h1><p className="page-lead"><T>Tập 1 có 15 bài. Bạn có thể vào bất kỳ hoạt động nào trong bài đã mở; tiến độ sẽ đưa bạn trở lại đúng nơi đang học.</T></p></div><MascotSticker variant="study" decorative className="hidden w-28 sm:block" /></div>
    <AcademyJourney lessonTitle={content.title ?? academyLesson01.title} estimatedMinutes={content.estimatedMinutes} />
  </main>;
}

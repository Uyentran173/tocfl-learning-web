import Breadcrumbs from "@/components/Breadcrumbs";
import AcademyJourney from "@/components/AcademyJourney";
import MascotSticker from "@/components/MascotSticker";
import T from "@/components/T";
import { academySeries, academyVolume3, academyVolume3Lesson01, academyVolume3LessonSummaries } from "@/lib/academy-catalog";
import { publishedAcademyLessonByFallback } from "@/lib/academy-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Hành trình học · Giáo trình Đương đại 3", "Học Giáo trình tiếng Hoa đương đại, tập 3, theo từng bài đã hoàn thiện.", "/academy/contemporary-chinese/cc3-v3");
export const dynamic = "force-dynamic";

export default async function AcademyVolume3Page() {
  const lesson = await publishedAcademyLessonByFallback(academyVolume3Lesson01);
  return <main className="academy-volume-page mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
    <Breadcrumbs items={[{ label: "Tai Wén Academy", href: "/academy", translate: false }, { label: academySeries.title, href: "/academy", translate: false }, { label: "Tập 3" }]} />
    <div className="mt-9 flex items-center justify-between gap-6"><div><p className="page-eyebrow"><T>HÀNH TRÌNH HỌC TẬP</T> · <T>Tập 3</T></p><h1 className="page-title"><T>Đi từng trạm, vững từng bài.</T></h1><p className="page-lead"><T>Chọn một bài đã mở để bắt đầu hoặc tiếp tục học.</T></p></div><MascotSticker variant="study" decorative className="hidden w-28 sm:block" /></div>
    <AcademyJourney lessons={[{ number: 1, title: lesson.title, estimatedMinutes: lesson.estimatedMinutes }]} volume={academyVolume3} summaries={academyVolume3LessonSummaries} lessonRoute="/academy/cc3/lesson" />
  </main>;
}

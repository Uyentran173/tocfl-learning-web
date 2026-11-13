import Breadcrumbs from "@/components/Breadcrumbs";
import AcademyJourney from "@/components/AcademyJourney";
import MascotSticker from "@/components/MascotSticker";
import T from "@/components/T";
import { academySeries, academyVolume2, academyVolume2Lesson01, academyVolume2Lesson02, academyVolume2Lesson03, academyVolume2Lesson04, academyVolume2Lesson05, academyVolume2Lesson06, academyVolume2Lesson07, academyVolume2LessonSummaries } from "@/lib/academy-catalog";
import { publishedAcademyLessonByFallback } from "@/lib/academy-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Hành trình học · Giáo trình Đương đại 2", "Học Giáo trình tiếng Hoa đương đại, tập 2, theo từng bài đã hoàn thiện.", "/academy/contemporary-chinese/cc2-v2");
export const dynamic = "force-dynamic";

export default async function AcademyVolume2Page() {
  const lessons = await Promise.all([academyVolume2Lesson01, academyVolume2Lesson02, academyVolume2Lesson03, academyVolume2Lesson04, academyVolume2Lesson05, academyVolume2Lesson06, academyVolume2Lesson07].map(publishedAcademyLessonByFallback));
  return <main className="academy-volume-page mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
    <Breadcrumbs items={[{ label: "Tai Wén Academy", href: "/academy", translate: false }, { label: academySeries.title, href: "/academy", translate: false }, { label: "Tập 2" }]} />
    <div className="mt-9 flex items-center justify-between gap-6"><div><p className="page-eyebrow"><T>HÀNH TRÌNH HỌC TẬP</T> · <T>Tập 2</T></p><h1 className="page-title"><T>Đi từng trạm, vững từng bài.</T></h1><p className="page-lead"><T>Bài 01–07 đã sẵn sàng. Các bài tiếp theo sẽ xuất hiện sau khi được hoàn thiện.</T></p></div><MascotSticker variant="study" decorative className="hidden w-28 sm:block" /></div>
    <AcademyJourney lessons={lessons.map((lesson, index) => ({ number: index + 1, title: lesson.title, estimatedMinutes: lesson.estimatedMinutes }))} volume={academyVolume2} summaries={academyVolume2LessonSummaries} lessonRoute="/academy/cc2/lesson" />
  </main>;
}

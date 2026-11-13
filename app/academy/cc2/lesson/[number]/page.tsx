import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import AcademyLessonWorkspace from "@/components/AcademyLessonWorkspace";
import { academyTracksForLesson } from "@/lib/academy";
import { academyVolume2Lesson01, academyVolume2Lesson02, academyVolume2Lesson03, academyVolume2Lesson04, academyVolume2Lesson05, academyVolume2Lesson06, academyVolume2Lesson07, academyVolume2Lesson08, academyVolume2Lesson09, validateAcademyLessonContent } from "@/lib/academy-catalog";
import { publishedAcademyLessonByFallback } from "@/lib/academy-content";
import { createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ number: string }> };
export const dynamic = "force-dynamic";
const publishedLessons = { "01": academyVolume2Lesson01, "02": academyVolume2Lesson02, "03": academyVolume2Lesson03, "04": academyVolume2Lesson04, "05": academyVolume2Lesson05, "06": academyVolume2Lesson06, "07": academyVolume2Lesson07, "08": academyVolume2Lesson08, "09": academyVolume2Lesson09 } as const;
function lessonForNumber(number: string) {
  return publishedLessons[number as keyof typeof publishedLessons] ?? null;
}

export async function generateMetadata({ params }: Props) {
  const { number } = await params;
  const lesson = lessonForNumber(number);
  if (!lesson) return {};
  return createPageMetadata(`${lesson.titleVi} · Tai Wén Academy`, lesson.description, `/academy/cc2/lesson/${number}`, { noIndex: true });
}

export default async function AcademyVolume2LessonPage({ params }: Props) {
  const { number } = await params;
  const lesson = lessonForNumber(number);
  if (!lesson || !validateAcademyLessonContent(lesson)) notFound();
  const content = await publishedAcademyLessonByFallback(lesson);
  const tracks = academyTracksForLesson(Number(number), true, "cc2");
  return <main className="academy-lesson-page mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
    <Breadcrumbs items={[{ label: "Tai Wén Academy", href: "/academy", translate: false }, { label: "Tập 2", href: "/academy/contemporary-chinese/cc2-v2" }, { label: `Bài ${number}` }]} />
    <AcademyLessonWorkspace content={content} tracks={tracks} availableTrackIds={tracks.map((track) => track.id)} canEdit={false} />
  </main>;
}

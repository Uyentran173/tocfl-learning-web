import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import AcademyLessonWorkspace from "@/components/AcademyLessonWorkspace";
import { academyTracksForLesson } from "@/lib/academy";
import { academyVolume4Lessons, validateAcademyLessonContent } from "@/lib/academy-catalog";
import { publishedAcademyLessonByFallback } from "@/lib/academy-content";
import { createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ number: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { number } = await params;
  const lesson = academyVolume4Lessons.find((item) => item.id.endsWith(`l${number}`));
  if (!lesson) return {};
  return createPageMetadata(`${lesson.titleVi} · Tai Wén Academy`, lesson.description, `/academy/cc4/lesson/${number}`, { noIndex: true });
}

export default async function AcademyVolume4LessonPage({ params }: Props) {
  const { number } = await params;
  const lesson = academyVolume4Lessons.find((item) => item.id.endsWith(`l${number}`));
  if (!lesson || !validateAcademyLessonContent(lesson)) notFound();
  const content = await publishedAcademyLessonByFallback(lesson);
  const tracks = academyTracksForLesson(Number(number), true, "cc4");
  return <main className="academy-lesson-page mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
    <Breadcrumbs items={[{ label: "Tai Wén Academy", href: "/academy", translate: false }, { label: "Tập 4", href: "/academy/contemporary-chinese/cc4-v4" }, { label: `Bài ${number}` }]} />
    <AcademyLessonWorkspace content={content} tracks={tracks} availableTrackIds={tracks.map((track) => track.id)} canEdit={false} />
  </main>;
}

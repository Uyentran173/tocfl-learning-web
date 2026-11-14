import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import AcademyLessonWorkspace from "@/components/AcademyLessonWorkspace";
import { academyTracksForLesson } from "@/lib/academy";
import { academyVolume3Lesson01, validateAcademyLessonContent } from "@/lib/academy-catalog";
import { publishedAcademyLessonByFallback } from "@/lib/academy-content";
import { createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ number: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { number } = await params;
  if (number !== "01") return {};
  return createPageMetadata(`${academyVolume3Lesson01.titleVi} · Tai Wén Academy`, academyVolume3Lesson01.description, `/academy/cc3/lesson/${number}`, { noIndex: true });
}

export default async function AcademyVolume3LessonPage({ params }: Props) {
  const { number } = await params;
  if (number !== "01" || !validateAcademyLessonContent(academyVolume3Lesson01)) notFound();
  const content = await publishedAcademyLessonByFallback(academyVolume3Lesson01);
  const tracks = academyTracksForLesson(1, true, "cc3");
  return <main className="academy-lesson-page mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
    <Breadcrumbs items={[{ label: "Tai Wén Academy", href: "/academy", translate: false }, { label: "Tập 3", href: "/academy/contemporary-chinese/cc3-v3" }, { label: "Bài 01" }]} />
    <AcademyLessonWorkspace content={content} tracks={tracks} availableTrackIds={tracks.map((track) => track.id)} canEdit={false} />
  </main>;
}

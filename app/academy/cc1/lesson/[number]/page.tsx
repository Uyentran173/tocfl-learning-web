import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import AcademyLessonWorkspace from "@/components/AcademyLessonWorkspace";
import { academyTracksForLesson } from "@/lib/academy";
import { academyEditor, publishedAcademyLesson } from "@/lib/academy-content";
import { academySeries, academyStaticLesson, validateAcademyLessonContent } from "@/lib/academy-catalog";
import { createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ number: string }> };
export async function generateMetadata({ params }: Props) {
  const { number: value } = await params;
  const number = Number(value);
  const content = value === String(number).padStart(2, "0") ? academyStaticLesson(number) : null;
  if (!content) return {};
  return createPageMetadata(`${content.titleVi} · Tai Wén Academy`, content.description, `/academy/cc1/lesson/${value}`, { noIndex: true });
}

export default async function AcademyLessonPage({ params }: Props) {
  const { number: value } = await params;
  const number = Number(value);
  const fallback = value === String(number).padStart(2, "0") && number >= 2 ? academyStaticLesson(number) : null;
  if (!fallback || !validateAcademyLessonContent(fallback)) notFound();
  const content = await publishedAcademyLesson(number);
  const tracks = academyTracksForLesson(number);
  const availableTrackIds = tracks.map((track) => track.id);
  const editor = await academyEditor();
  return <main className="academy-lesson-page mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
    <Breadcrumbs items={[{ label: "Tai Wén Academy", href: "/academy", translate: false }, { label: academySeries.title, href: "/academy/contemporary-chinese/cc1-v1", translate: false }, { label: `Bài ${value}` }]} />
    <AcademyLessonWorkspace content={content} tracks={tracks} availableTrackIds={availableTrackIds} canEdit={Boolean(editor)} />
  </main>;
}

import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import AcademyLessonWorkspace from "@/components/AcademyLessonWorkspace";
import T from "@/components/T";
import { academyTracksForLesson } from "@/lib/academy";
import { academyEditor, publishedAcademyLesson01 } from "@/lib/academy-content";
import { academySeries } from "@/lib/academy-catalog";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Bài 01 · Tai Wén Academy", "Bài học mẫu về giới thiệu bản thân tại Tai Wén Academy.", "/academy/cc1/lesson/01", { noIndex: true });
export const dynamic = "force-dynamic";

export default async function AcademyLesson01Page() {
  const [content, editor] = await Promise.all([publishedAcademyLesson01(), academyEditor()]);
  const tracks = academyTracksForLesson(1);
  const availableTrackIds = process.env.NODE_ENV === "development"
    ? tracks.filter((track) => existsSync(path.join(process.cwd(), ".private", "academy", "cc1", track.privatePath))).map((track) => track.id)
    : [];
  return <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
    <nav className="academy-crumbs" aria-label="Đường dẫn học tập"><Link href="/academy">Tai Wén Academy</Link><span>›</span><Link href="/academy/contemporary-chinese/cc1-v1">{academySeries.title} · <T>Tập 1</T></Link><span>›</span><span><T>Bài 01</T></span></nav>
    <div className="mt-8"><p className="page-eyebrow">TAI WÉN ACADEMY · <T>BÀI</T> 01</p><h1 className="page-title">{content.title}</h1><p className="page-lead">{content.description}</p>{content.objectives.length > 0 && <div className="academy-objectives mt-5"><strong><T>Sau bài này, bạn có thể:</T></strong><ul>{content.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>{content.estimatedMinutes && <span className="text-sm muted">{content.estimatedMinutes} <T>phút dự kiến</T></span>}</div>}</div>
    <AcademyLessonWorkspace content={content} tracks={tracks} availableTrackIds={availableTrackIds} canEdit={Boolean(editor)} />
  </main>;
}

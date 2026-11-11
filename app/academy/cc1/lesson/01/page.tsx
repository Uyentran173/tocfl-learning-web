import { existsSync } from "node:fs";
import path from "node:path";
import Breadcrumbs from "@/components/Breadcrumbs";
import AcademyLessonWorkspace from "@/components/AcademyLessonWorkspace";
import { academyTracksForLesson } from "@/lib/academy";
import { academyEditor, publishedAcademyLesson01 } from "@/lib/academy-content";
import { academySeries } from "@/lib/academy-catalog";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("歡迎你來臺灣！ · Tai Wén Academy", "Bài 01: Chào mừng bạn đến Đài Loan! Chào hỏi, giới thiệu bản thân và luyện những mẫu câu tiếng Hoa đầu tiên.", "/academy/cc1/lesson/01", { noIndex: true });
export const dynamic = "force-dynamic";

export default async function AcademyLesson01Page() {
  const [content, editor] = await Promise.all([publishedAcademyLesson01(), academyEditor()]);
  const tracks = academyTracksForLesson(1);
  const availableTrackIds = process.env.NODE_ENV === "development"
    ? tracks.filter((track) => existsSync(path.join(process.cwd(), ".private", "academy", "cc1", track.privatePath))).map((track) => track.id)
    : [];
  return <main className="academy-lesson-page mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
    <Breadcrumbs items={[{ label: "Tai Wén Academy", href: "/academy", translate: false }, { label: academySeries.title, href: "/academy/contemporary-chinese/cc1-v1", translate: false }, { label: "Bài 01" }]} />
    <AcademyLessonWorkspace content={content} tracks={tracks} availableTrackIds={availableTrackIds} canEdit={Boolean(editor)} />
  </main>;
}

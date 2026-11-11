import { notFound } from "next/navigation";
import AcademyLessonEditor from "@/components/AcademyLessonEditor";
import { academyLesson01 } from "@/lib/academy-catalog";
import { academyEditor } from "@/lib/academy-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Biên tập bài học · Tai Wén Academy", "Biên tập nội dung bài học.", "/academy/cc1/lesson/01/edit", { noIndex: true });
export const dynamic = "force-dynamic";

export default async function AcademyEditPage() {
  const editor = await academyEditor();
  if (!editor) notFound();
  return <AcademyLessonEditor initialContent={academyLesson01} />;
}

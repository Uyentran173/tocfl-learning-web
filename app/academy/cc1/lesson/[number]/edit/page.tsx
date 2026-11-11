import { notFound } from "next/navigation";
import AcademyLessonEditor from "@/components/AcademyLessonEditor";
import { academyEditor } from "@/lib/academy-content";
import { academyStaticLesson } from "@/lib/academy-catalog";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Biên tập bài học · Tai Wén Academy", "Biên tập nội dung bài học.", "/academy", { noIndex: true });
export const dynamic = "force-dynamic";

export default async function AcademyEditPage({ params }: { params: Promise<{ number: string }> }) {
  const { number: value } = await params;
  const number = Number(value);
  const content = number >= 2 && value === String(number).padStart(2, "0") ? academyStaticLesson(number) : null;
  if (!content || !await academyEditor()) notFound();
  return <AcademyLessonEditor initialContent={content} />;
}

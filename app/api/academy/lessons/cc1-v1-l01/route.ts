import { academyEditor } from "@/lib/academy-content";
import { academyLesson01, validateAcademyLessonContent } from "@/lib/academy-catalog";

export const runtime = "nodejs";

export async function GET() {
  const editor = await academyEditor();
  if (!editor) return Response.json({ error: "Không có quyền chỉnh sửa bài học." }, { status: 403 });
  const { data, error } = await editor.client.from("academy_lesson_content")
    .select("status,content,updated_at").eq("lesson_id", academyLesson01.id).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (error) return Response.json({ error: "Chưa tải được bản biên tập." }, { status: 503 });
  return Response.json({ status: data?.status ?? "published", content: validateAcademyLessonContent(data?.content) ? data.content : academyLesson01, updatedAt: data?.updated_at ?? null });
}

export async function PUT(request: Request) {
  const editor = await academyEditor();
  if (!editor) return Response.json({ error: "Không có quyền chỉnh sửa bài học." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  const { status, content } = body as { status?: unknown; content?: unknown };
  if ((status !== "draft" && status !== "published") || !validateAcademyLessonContent(content)) {
    return Response.json({ error: "Hãy kiểm tra nội dung, mã từ vựng và đáp án trước khi lưu." }, { status: 400 });
  }
  const { error } = await editor.client.from("academy_lesson_content").upsert({
    lesson_id: academyLesson01.id, status, content, updated_by: editor.userId, updated_at: new Date().toISOString(),
  }, { onConflict: "lesson_id,status" });
  if (error) return Response.json({ error: "Chưa lưu được bài học. Hãy thử lại." }, { status: 503 });
  if (status === "published") {
    const { error: cleanupError } = await editor.client.from("academy_lesson_content").delete().eq("lesson_id", academyLesson01.id).eq("status", "draft");
    if (cleanupError) return Response.json({ status, content, warning: "Bài học đã xuất bản nhưng bản nháp cũ chưa được dọn. Vui lòng tải lại trang." });
  }
  return Response.json({ status, content });
}

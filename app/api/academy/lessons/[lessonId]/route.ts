import { academyEditor } from "@/lib/academy-content";
import { academyStaticLesson, validateAcademyLessonContent } from "@/lib/academy-catalog";

export const runtime = "nodejs";
type Context = { params: Promise<{ lessonId: string }> };

function baseForId(id: string) {
  const match = /^cc1-v1-l(0[2-9]|1[0-5])$/.exec(id);
  return match ? academyStaticLesson(Number(match[1])) : null;
}

export async function GET(_request: Request, { params }: Context) {
  const { lessonId } = await params;
  const base = baseForId(lessonId);
  if (!base) return Response.json({ error: "Không tìm thấy bài học." }, { status: 404 });
  const editor = await academyEditor();
  if (!editor) return Response.json({ error: "Không có quyền chỉnh sửa bài học." }, { status: 403 });
  const { data, error } = await editor.client.from("academy_lesson_content")
    .select("status,content,updated_at").eq("lesson_id", lessonId).order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (error) return Response.json({ error: "Chưa tải được bản biên tập." }, { status: 503 });
  return Response.json({ status: data?.status ?? "published", content: validateAcademyLessonContent(data?.content) && data.content.id === lessonId ? data.content : base, updatedAt: data?.updated_at ?? null });
}

export async function PUT(request: Request, { params }: Context) {
  const { lessonId } = await params;
  if (!baseForId(lessonId)) return Response.json({ error: "Không tìm thấy bài học." }, { status: 404 });
  const editor = await academyEditor();
  if (!editor) return Response.json({ error: "Không có quyền chỉnh sửa bài học." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  const { status, content } = body as { status?: unknown; content?: unknown };
  if ((status !== "draft" && status !== "published") || !validateAcademyLessonContent(content) || content.id !== lessonId) {
    return Response.json({ error: "Hãy kiểm tra mã bài, nội dung, mã từ vựng và đáp án trước khi lưu." }, { status: 400 });
  }
  const { error } = await editor.client.from("academy_lesson_content").upsert({
    lesson_id: lessonId, status, content, updated_by: editor.userId, updated_at: new Date().toISOString(),
  }, { onConflict: "lesson_id,status" });
  if (error) return Response.json({ error: "Chưa lưu được bài học. Hãy thử lại." }, { status: 503 });
  if (status === "published") {
    const { error: cleanupError } = await editor.client.from("academy_lesson_content").delete().eq("lesson_id", lessonId).eq("status", "draft");
    if (cleanupError) return Response.json({ status, content, warning: "Bài học đã xuất bản nhưng bản nháp cũ chưa được dọn. Vui lòng tải lại trang." });
  }
  return Response.json({ status, content });
}

import { createClient } from "@supabase/supabase-js";
import { academyLesson01, validateAcademyLessonContent, type AcademyLessonContent } from "./academy-catalog";
import { createSupabaseServerClient } from "./supabase/server";

export async function publishedAcademyLesson01(): Promise<AcademyLessonContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return academyLesson01;
  try {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.from("academy_lesson_content").select("content").eq("lesson_id", academyLesson01.id).eq("status", "published").maybeSingle();
    if (error || !validateAcademyLessonContent(data?.content)) return academyLesson01;
    return data.content;
  } catch {
    return academyLesson01;
  }
}

export async function academyEditor() {
  try {
    const client = await createSupabaseServerClient();
    if (!client) return null;
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !auth.user) return null;
    const { data, error } = await client.from("academy_editors").select("user_id").eq("user_id", auth.user.id).maybeSingle();
    return !error && data ? { client, userId: auth.user.id } : null;
  } catch { return null; }
}

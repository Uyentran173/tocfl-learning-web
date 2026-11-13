import { createClient } from "@supabase/supabase-js";
import { academyStaticLesson, validateAcademyLessonContent, type AcademyLessonContent } from "./academy-catalog";
import { createSupabaseServerClient } from "./supabase/server";

export async function publishedAcademyLesson01(): Promise<AcademyLessonContent> {
  return publishedAcademyLesson(1);
}

export async function publishedAcademyLesson(number: number): Promise<AcademyLessonContent> {
  const fallback = academyStaticLesson(number);
  if (!fallback) throw new Error(`Unknown Academy lesson ${number}`);
  return publishedAcademyLessonByFallback(fallback);
}

export async function publishedAcademyLessonByFallback(fallback: AcademyLessonContent): Promise<AcademyLessonContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return fallback;
  try {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.from("academy_lesson_content").select("content").eq("lesson_id", fallback.id).eq("status", "published").maybeSingle();
    if (error || !validateAcademyLessonContent(data?.content) || data.content.id !== fallback.id) return fallback;
    return data.content;
  } catch {
    return fallback;
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

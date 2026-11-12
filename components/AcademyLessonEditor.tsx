"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { validateAcademyLessonContent, type AcademyLessonContent, type AcademyPublication } from "@/lib/academy-catalog";
import { academyLessonLabel } from "@/lib/i18n-academy";
import { usePreferences } from "./PreferencesProvider";

export default function AcademyLessonEditor({ initialContent }: { initialContent: AcademyLessonContent }) {
  const { t, locale } = usePreferences();
  const [json, setJson] = useState(JSON.stringify(initialContent, null, 2));
  const lessonNumber = initialContent.id.slice(-2);
  const apiPath = `/api/academy/lessons/${initialContent.id}`;
  const [status, setStatus] = useState<AcademyPublication>("published");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let live = true;
    void fetch(apiPath, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Chưa tải được bản biên tập. Hãy thử lại trước khi lưu.");
      return response.json();
    }).then((data) => {
      if (!live) return;
      if (validateAcademyLessonContent(data.content) && data.content.id === initialContent.id) setJson(JSON.stringify(data.content, null, 2));
      setStatus(data.status === "draft" ? "draft" : "published");
      setLoaded(true);
    }).catch(() => { if (live) setMessage("Chưa tải được bản biên tập. Hãy thử lại trước khi lưu."); });
    return () => { live = false; };
  }, [apiPath, initialContent.id]);
  async function save(nextStatus: AcademyPublication) {
    let content: unknown;
    try { content = JSON.parse(json); } catch { setMessage("Định dạng JSON chưa hợp lệ."); return; }
    if (!validateAcademyLessonContent(content) || content.id !== initialContent.id) { setMessage("Nội dung còn thiếu, mã bài hoặc mã từ vựng không đúng, hoặc đáp án chưa khớp."); return; }
    setSaving(true); setMessage("");
    try {
      const response = await fetch(apiPath, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus, content }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Chưa lưu được bài học.");
      setStatus(nextStatus); setMessage(nextStatus === "published" ? "Đã xuất bản bài học." : "Đã lưu bản nháp.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Chưa lưu được bài học."); }
    finally { setSaving(false); }
  }
  return <main className="academy-editor-page mx-auto max-w-4xl px-5 py-10 sm:px-8">
    <nav className="academy-crumbs" aria-label={t("Đường dẫn bài học")}><Link href="/academy">Tai Wén Academy</Link><span>›</span><Link href={`/academy/cc1/lesson/${lessonNumber}`}>{academyLessonLabel(locale, Number(lessonNumber))}</Link><span>›</span><span>{t("Biên tập")}</span></nav>
    <p className="page-eyebrow mt-8">TAI WÉN ACADEMY · {t("CHỈ CHỦ SỞ HỮU")}</p>
    <h1 className="page-title">{t("Biên tập bài học")}</h1>
    <p className="page-lead">{t("Chỉ chủ sở hữu có thể thay đổi nội dung bài học. Giữ nguyên mã bài và mã câu để bảo toàn tiến độ của học viên.")}</p>
    <div className="paper mt-7 space-y-5 p-5 sm:p-7">
      <label className="block font-semibold">{t("Nội dung bài học")}<textarea className="academy-response mt-2 text-sm" rows={28} spellCheck={false} value={json} onChange={(event) => setJson(event.target.value)} /></label>
      <p className="text-sm muted">{t("Giữ nguyên mã bài, mã câu và mã từ vựng khi biên tập để không làm mất tiến độ đã lưu.")}</p>
      <p className="text-sm muted">{t("Trạng thái hiện tại")}: {t(status === "published" ? "Đã xuất bản" : "Bản nháp")}</p>
      {message && <p role="status" className="rounded-xl bg-[var(--brand-soft)] p-3 text-sm">{t(message)}</p>}
      <div className="flex flex-wrap gap-3"><button type="button" disabled={saving || !loaded} className="button-secondary" onClick={() => void save("draft")}>{t("Lưu bản nháp")}</button><button type="button" disabled={saving || !loaded} className="button-primary" onClick={() => void save("published")}>{t("Xuất bản bài học")}</button></div>
    </div>
  </main>;
}

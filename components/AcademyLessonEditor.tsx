"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { academyLesson01, validateAcademyLessonContent, type AcademyPublication } from "@/lib/academy-catalog";
import { useT } from "./PreferencesProvider";

export default function AcademyLessonEditor() {
  const t = useT();
  const [json, setJson] = useState(JSON.stringify(academyLesson01, null, 2));
  const [status, setStatus] = useState<AcademyPublication>("published");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let live = true;
    void fetch("/api/academy/lessons/cc1-v1-l01", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Chưa tải được bản biên tập. Hãy thử lại trước khi lưu.");
      return response.json();
    }).then((data) => {
      if (!live) return;
      if (validateAcademyLessonContent(data.content)) setJson(JSON.stringify(data.content, null, 2));
      setStatus(data.status === "draft" ? "draft" : "published");
      setLoaded(true);
    }).catch(() => { if (live) setMessage("Chưa tải được bản biên tập. Hãy thử lại trước khi lưu."); });
    return () => { live = false; };
  }, []);
  async function save(nextStatus: AcademyPublication) {
    let content: unknown;
    try { content = JSON.parse(json); } catch { setMessage("Định dạng JSON chưa hợp lệ."); return; }
    if (!validateAcademyLessonContent(content)) { setMessage("Nội dung còn thiếu, mã từ vựng không đúng hoặc đáp án chưa khớp."); return; }
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/academy/lessons/cc1-v1-l01", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus, content }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Chưa lưu được bài học.");
      setStatus(nextStatus); setMessage(nextStatus === "published" ? "Đã xuất bản bài học." : "Đã lưu bản nháp.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Chưa lưu được bài học."); }
    finally { setSaving(false); }
  }
  return <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
    <nav className="academy-crumbs" aria-label={t("Đường dẫn bài học")}><Link href="/academy">Tai Wén Academy</Link><span>›</span><Link href="/academy/cc1/lesson/01">{t("Bài 01")}</Link><span>›</span><span>{t("Biên tập")}</span></nav>
    <p className="page-eyebrow mt-8">TAI WÉN ACADEMY · {t("CHỈ CHỦ SỞ HỮU")}</p>
    <h1 className="page-title">{t("Biên tập bài học")}</h1>
    <p className="page-lead">{t("Nội dung này do Tai Wén biên soạn. Âm thanh giáo trình không nằm trong bản xuất bản.")}</p>
    <div className="paper mt-7 space-y-5 p-5 sm:p-7">
      <label className="block font-semibold">{t("Nội dung bài học")}<textarea className="academy-response mt-2 font-mono text-sm" rows={28} spellCheck={false} value={json} onChange={(event) => setJson(event.target.value)} /></label>
      <p className="text-sm muted">{t("Giữ nguyên mã bài, mã câu và mã từ vựng khi biên tập để không làm mất tiến độ đã lưu.")}</p>
      <p className="text-sm muted">{t("Trạng thái hiện tại")}: {t(status === "published" ? "Đã xuất bản" : "Bản nháp")}</p>
      {message && <p role="status" className="rounded-xl bg-[var(--brand-soft)] p-3 text-sm">{t(message)}</p>}
      <div className="flex flex-wrap gap-3"><button type="button" disabled={saving || !loaded} className="button-secondary" onClick={() => void save("draft")}>{t("Lưu bản nháp")}</button><button type="button" disabled={saving || !loaded} className="button-primary" onClick={() => void save("published")}>{t("Xuất bản bài học")}</button></div>
    </div>
  </main>;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { academyLesson01, validateAcademyLessonContent, type AcademyLessonContent, type AcademyPublication } from "@/lib/academy-catalog";
import { useT } from "./PreferencesProvider";

type JsonField = "dialogue" | "grammar" | "practice" | "assessment";
const jsonFields: { key: JsonField; label: string; hint: string }[] = [
  { key: "dialogue", label: "Hội thoại", hint: "Mỗi lượt có speaker, chinese và meaningVi." },
  { key: "grammar", label: "Điểm ngữ pháp", hint: "Mỗi mục có id, title, explanation, example và meaningVi." },
  { key: "practice", label: "Câu luyện tập", hint: "Mỗi câu có id, prompt, options, correctOptionId và feedback." },
  { key: "assessment", label: "Câu đánh giá", hint: "Giữ mã câu và đáp án chính xác khi biên tập." },
];
const pretty = (value: unknown) => JSON.stringify(value, null, 2);

export default function AcademyLessonEditor() {
  const t = useT();
  const [content, setContent] = useState<AcademyLessonContent>(academyLesson01);
  const [status, setStatus] = useState<AcademyPublication>("published");
  const [json, setJson] = useState<Record<JsonField, string>>({ dialogue: pretty(academyLesson01.lecture.dialogue), grammar: pretty(academyLesson01.grammar), practice: pretty(academyLesson01.practice), assessment: pretty(academyLesson01.assessment) });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    void fetch("/api/academy/lessons/cc1-v1-l01", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Chưa tải được bản biên tập. Hãy thử lại trước khi lưu.");
      return response.json();
    }).then((data) => {
      if (!live || !validateAcademyLessonContent(data.content)) return;
      setContent(data.content);
      setStatus(data.status === "draft" ? "draft" : "published");
      setJson({ dialogue: pretty(data.content.lecture.dialogue), grammar: pretty(data.content.grammar), practice: pretty(data.content.practice), assessment: pretty(data.content.assessment) });
      setLoaded(true);
    }).catch(() => { if (live) setMessage("Chưa tải được bản biên tập. Hãy thử lại trước khi lưu."); });
    return () => { live = false; };
  }, []);

  function updateJson(key: JsonField, value: string) { setJson((current) => ({ ...current, [key]: value })); }
  async function save(nextStatus: AcademyPublication) {
    let next: AcademyLessonContent;
    try {
      next = { ...content, lecture: { ...content.lecture, dialogue: JSON.parse(json.dialogue) }, grammar: JSON.parse(json.grammar), practice: JSON.parse(json.practice), assessment: JSON.parse(json.assessment) };
    } catch { setMessage("Định dạng một trong các phần nội dung chưa hợp lệ."); return; }
    if (!validateAcademyLessonContent(next)) { setMessage("Nội dung còn thiếu hoặc đáp án chưa khớp với lựa chọn."); return; }
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/academy/lessons/cc1-v1-l01", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus, content: next }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Chưa lưu được bài học.");
      setContent(next); setStatus(nextStatus); setMessage(nextStatus === "published" ? "Đã xuất bản bài học." : "Đã lưu bản nháp.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Chưa lưu được bài học."); }
    finally { setSaving(false); }
  }
  return <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
    <nav className="academy-crumbs" aria-label={t("Đường dẫn bài học")}><Link href="/academy">Tai Wén Academy</Link><span>›</span><Link href="/academy/cc1/lesson/01">{t("Bài 01")}</Link><span>›</span><span>{t("Biên tập")}</span></nav>
    <p className="page-eyebrow mt-8">TAI WÉN ACADEMY · {t("CHỈ CHỦ SỞ HỮU")}</p>
    <h1 className="page-title">{t("Biên tập bài học mẫu")}</h1>
    <p className="page-lead">{t("Nội dung này do Tai Wén biên soạn. Âm thanh giáo trình không nằm trong bản xuất bản.")}</p>
    <div className="paper mt-7 space-y-5 p-5 sm:p-7">
      <label className="block font-semibold">{t("Tên bài học")}<input className="academy-response mt-2" value={content.title} onChange={(event) => setContent({ ...content, title: event.target.value })} /></label>
      <label className="block font-semibold">{t("Giới thiệu")}<textarea className="academy-response mt-2" rows={3} value={content.description} onChange={(event) => setContent({ ...content, description: event.target.value })} /></label>
      <label className="block font-semibold">{t("Mục tiêu học tập")}<textarea className="academy-response mt-2" rows={4} value={content.objectives.join("\n")} onChange={(event) => setContent({ ...content, objectives: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })} /><span className="text-xs muted">{t("Mỗi dòng là một mục tiêu.")}</span></label>
      <label className="block font-semibold">{t("Thời gian ước tính (phút)")}<input type="number" min={1} max={300} className="academy-response mt-2" value={content.estimatedMinutes ?? ""} onChange={(event) => setContent({ ...content, estimatedMinutes: event.target.value ? Number(event.target.value) : null })} /></label>
      <label className="block font-semibold">{t("Dẫn nhập bài khóa")}<textarea className="academy-response mt-2" rows={2} value={content.lecture.introduction} onChange={(event) => setContent({ ...content, lecture: { ...content.lecture, introduction: event.target.value } })} /></label>
      <label className="block font-semibold">{t("Dẫn nhập từ vựng")}<textarea className="academy-response mt-2" rows={2} value={content.vocabulary.introduction} onChange={(event) => setContent({ ...content, vocabulary: { ...content.vocabulary, introduction: event.target.value } })} /></label>
      <p className="text-sm muted">{t("Từ vựng tham chiếu bộ từ theo giáo trình hiện có; thay mã từ trong dữ liệu khi cần, không tạo bản sao.")}</p>
      {jsonFields.map((field) => <label key={field.key} className="block font-semibold">{t(field.label)}<textarea className="academy-response mt-2 font-mono text-sm" rows={field.key === "dialogue" ? 12 : 9} spellCheck={false} value={json[field.key]} onChange={(event) => updateJson(field.key, event.target.value)} /><span className="text-xs muted">{t(field.hint)}</span></label>)}
      <p className="text-sm muted">{t("Trạng thái hiện tại")}: {t(status === "published" ? "Đã xuất bản" : "Bản nháp")}</p>
      {message && <p role="status" className="rounded-xl bg-[var(--brand-soft)] p-3 text-sm">{t(message)}</p>}
      <div className="flex flex-wrap gap-3"><button type="button" disabled={saving || !loaded} className="button-secondary" onClick={() => void save("draft")}>{t("Lưu bản nháp")}</button><button type="button" disabled={saving || !loaded} className="button-primary" onClick={() => void save("published")}>{t("Xuất bản bài học")}</button></div>
    </div>
  </main>;
}

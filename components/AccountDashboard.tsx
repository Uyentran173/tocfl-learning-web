"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { loadTestHistory, savedAccountProgress, type TestAttemptRow } from "@/lib/cloud-progress";
import { loadLearnedPool, type LearnedVocabularyPool } from "@/lib/learned-vocabulary";
import { progressStorage } from "@/lib/progress-storage";
import { scriptQuery } from "@/lib/tests";
import type { ExamSession } from "@/lib/session";
import type { ActivityProgress } from "@/lib/activity-progress";
import { usePreferences } from "./PreferencesProvider";

type TestTitle = { id: string; title: string };

export default function AccountDashboard({ tests }: { tests: TestTitle[] }) {
  const { t, locale } = usePreferences();
  const dateLabel = (value: string) => new Date(value).toLocaleDateString(locale);
  const { user, configured, syncError, syncing, displayName, updateDisplayName, conflicts, resolveConflict, guestMigrationAvailable, migrateGuest, signOut } = useAuth();
  const [pool, setPool] = useState<LearnedVocabularyPool | null>(null);
  const [history, setHistory] = useState<TestAttemptRow[]>([]);
  const [activities, setActivities] = useState<ActivityProgress[]>([]);
  const [annotations, setAnnotations] = useState(0);
  const [activeTests, setActiveTests] = useState<ExamSession[]>([]);
  const [busy, setBusy] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      setPool(loadLearnedPool(progressStorage()));
      const entries = savedAccountProgress(user.id);
      const activity = entries.filter((item) => item.key.startsWith("taiwen-activity:v1:")).flatMap((item) => {
        try { return [JSON.parse(item.value) as ActivityProgress]; } catch { return []; }
      });
      setActivities(activity);
      setActiveTests(entries.filter((item) => item.key.startsWith("tocfl-exam-v3:")).flatMap((item) => {
        try {
          const session = JSON.parse(item.value) as ExamSession;
          return session.status === "in-progress" && session.testId === item.key.slice("tocfl-exam-v3:".length) ? [session] : [];
        } catch { return []; }
      }));
      setAnnotations(entries.filter((item) => item.key.startsWith("tocfl-practice-annotations:v1:")).reduce((count, item) => {
        try { const value: unknown = JSON.parse(item.value); return count + (Array.isArray(value) ? value.length : 0); } catch { return count; }
      }, 0));
      void loadTestHistory(user.id).then(setHistory).catch(() => setMessage("Chưa tải được lịch sử luyện đề. Vui lòng thử lại sau."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);

  if (!user) return <main className="account-guest-page mx-auto max-w-4xl px-5 py-16">
    <section className="paper p-7 sm:p-10"><p className="page-eyebrow">{t("HỒ SƠ KHÁCH")}</p><h1 className="page-title">{t("Học theo cách của bạn")}</h1><p className="mt-4 leading-7 muted">{t("Bạn vẫn có thể học và luyện đề mà không cần tài khoản. Tiến độ khách được giữ trên thiết bị này.")}</p>
      <Link href="/login" className="button-primary mt-7 inline-block">{t("Đăng nhập để đồng bộ tiến độ")}</Link>
      {!configured && <p className="mt-4 text-sm muted">{t("Tính năng đăng nhập đang chờ kết nối Supabase.")}</p>}
    </section>
  </main>;

  const words = pool?.words ?? [];
  const reviewWords = words.filter((word) => word.masteryStatus === "Cần ôn lại");
  const totalRounds = activities.reduce((count, item) => count + (item.rounds || 0), 0);
  const rawName = displayName ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email;
  const name = typeof rawName === "string" ? rawName : t("Người học Tai Wén");
  const titleFor = (id: string) => tests.find((test) => test.id === id)?.title ?? id;

  return <main className="account-dashboard-page mx-auto max-w-6xl px-5 py-12 sm:py-16">
    <p className="page-eyebrow">{t("TÀI KHOẢN TAI WÉN")}</p>
    <h1 className="page-title">{t("Hồ sơ học tập")}</h1>
    <p className="page-lead">{t("Theo dõi hành trình học tiếng Hoa và luyện thi TOCFL của bạn.")}</p>
    <nav className="mt-7 flex flex-wrap gap-2" aria-label={t("Mục trong hồ sơ")}>
      {[["#profile", "Hồ sơ của tôi"], ["#progress", "Tiến độ học tập"], ["#words", "Từ vựng đã học"], ["#active-tests", "Đề đang làm"], ["#history", "Lịch sử luyện đề"]].map(([href, label]) => <a key={href} href={href} className="button-secondary text-sm">{t(label)}</a>)}
    </nav>
    {syncing && <p className="mt-4 text-xs muted" role="status">{t("Đang đồng bộ tiến độ…")}</p>}
    {(syncError || message) && <p className="ui-alert mt-6" data-variant="warning" role="status">{t(syncError || message || "")}</p>}
    {conflicts.length > 0 && <section className="paper mt-6 p-5 sm:p-6" aria-label={t("Tiến độ cần chọn phiên bản")}>
      <h2 className="font-bold">{t("Tiến độ cần chọn phiên bản")}</h2>
      <p className="mt-2 text-sm muted">{t("Tiến độ đã thay đổi ở một thiết bị khác. Bản trên thiết bị này vẫn được giữ nguyên cho tới khi bạn chọn.")}</p>
      {conflicts.map((key) => <div key={key} className="mt-4 rounded-xl border border-[var(--border)] p-4">
        <p className="font-semibold">{t(key.startsWith("tocfl-exam-v3:") ? "Luyện đề" : key.startsWith("tocfl-practice-annotations:") ? "Ghi chú" : "Học từ vựng")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={!!resolving} className="button-secondary text-sm" onClick={() => { setResolving(key); void resolveConflict(key, "cloud").catch(() => { setMessage("Chưa giải quyết được xung đột. Cả hai bản vẫn được giữ."); setResolving(null); }); }}>{t("Dùng bản đã đồng bộ")}</button>
          <button type="button" disabled={!!resolving} className="button-primary text-sm" onClick={() => { setResolving(key); void resolveConflict(key, "device").catch(() => { setMessage("Chưa giải quyết được xung đột. Cả hai bản vẫn được giữ."); setResolving(null); }); }}>{t("Dùng bản trên thiết bị này")}</button>
        </div>
      </div>)}
    </section>}
    {guestMigrationAvailable && <section className="mt-7 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[var(--brand)]">{t("Chuyển tiến độ khách vào tài khoản?")}</h2>
      <p className="mt-2 text-sm leading-6">{t("Tai Wén tìm thấy tiến độ học trên thiết bị này. Bạn có thể gộp vào tài khoản; dữ liệu khách gốc vẫn được giữ lại.")}</p>
      <button type="button" disabled={busy} className="button-primary mt-4" onClick={() => { setBusy(true); void migrateGuest().catch(() => { setMessage("Chuyển tiến độ chưa hoàn tất. Dữ liệu khách vẫn an toàn trên thiết bị này."); setBusy(false); }); }}>{t(busy ? "Đang chuyển tiến độ…" : "Gộp tiến độ khách")}</button>
      <p className="mt-3 text-xs muted">{t("Bạn có thể bỏ qua và quay lại gộp sau.")}</p>
    </section>}
    <section id="profile" className="paper mt-8 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><h2 className="text-xl font-bold">{t("Hồ sơ của tôi")}</h2><p className="mt-3 font-semibold text-[var(--brand)]">{name}</p><p className="mt-1 text-sm muted">{user.email ?? t("Đã kết nối tài khoản")}</p></div><button type="button" className="button-secondary" onClick={() => void signOut().catch(() => setMessage("Chưa đăng xuất được. Vui lòng thử lại."))}>{t("Đăng xuất")}</button></div>
      <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); setSavingName(true); void updateDisplayName(nameDraft ?? name).then(() => setMessage(null)).catch(() => setMessage("Chưa lưu được tên hiển thị. Vui lòng thử lại.")).finally(() => setSavingName(false)); }}>
        <label className="grid min-w-48 flex-1 gap-1 text-sm font-semibold">{t("Tên hiển thị")}<input className="ui-input" maxLength={100} value={nameDraft ?? name} onChange={(event) => setNameDraft(event.target.value)} /></label>
        <button className="button-secondary" type="submit" disabled={savingName || !(nameDraft ?? name).trim()}>{t(savingName ? "Đang lưu…" : "Lưu tên")}</button>
      </form>
    </section>
    <section id="progress" className="paper mt-6 p-6 sm:p-8"><h2 className="text-xl font-bold">{t("Tiến độ học tập")}</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">
      {[[words.length, "Từ đã học"], [reviewWords.length, "Từ cần ôn"], [totalRounds, "Lượt bài khóa / trò chơi"]].map(([value, label]) => <div key={String(label)} className="rounded-2xl bg-[var(--brand-soft)] p-5"><p className="text-3xl font-bold text-[var(--brand)]">{value}</p><p className="mt-1 text-sm muted">{t(String(label))}</p></div>)}
    </div><p className="mt-4 text-sm muted">{t("Bạn cũng đã lưu")} {annotations} {t("đoạn ghi chú hoặc đánh dấu khi luyện tập.")}</p></section>
    <section id="active-tests" className="paper mt-6 p-6 sm:p-8"><h2 className="text-xl font-bold">{t("Đề đang làm")}</h2>
      {activeTests.length ? <ul className="mt-5 grid gap-3">{activeTests.map((session) => <li key={`${session.testId}:${session.startedAt}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-4"><div><strong>{titleFor(session.testId)}</strong><p className="mt-1 text-xs muted">{t(session.mode === "simulation" ? "Mô phỏng" : "Luyện tập")} · {t(session.scope === "listening" ? "Phần Nghe" : session.scope === "reading" ? "Phần Đọc" : "Toàn bộ đề")} · {dateLabel(new Date(session.startedAt).toISOString())}</p></div><Link className="button-primary text-sm" href={`/tocfl/${session.testId}/exam${scriptQuery({ script: session.script, scope: session.scope })}`}>{t("Tiếp tục làm bài")}</Link></li>)}</ul> : <p className="mt-4 text-sm muted">{t("Bạn chưa có đề đang làm.")}</p>}
    </section>
    <section id="history" className="paper mt-6 p-6 sm:p-8"><h2 className="text-xl font-bold">{t("Lịch sử luyện đề")}</h2>
      {history.length ? <ul className="mt-5 grid gap-3">{history.map((attempt) => <li key={`${attempt.test_id}:${attempt.started_at}`} className="rounded-xl border border-[var(--border)] p-4"><div className="flex flex-wrap justify-between gap-2"><strong>{titleFor(attempt.test_id)}</strong><span className="font-bold text-[var(--brand)]">{attempt.correct}/{attempt.total} {t("câu đúng")}</span></div><p className="mt-2 text-xs muted">{dateLabel(attempt.completed_at)} · {t(attempt.mode === "practice" ? "Luyện tập" : "Mô phỏng")} · {t(attempt.scope === "full" ? "Toàn bộ đề" : attempt.scope === "listening" ? "Phần Nghe" : "Phần Đọc")}{attempt.listening_correct !== null ? ` · ${t("Nghe")}: ${attempt.listening_correct}` : ""}{attempt.reading_correct !== null ? ` · ${t("Đọc")}: ${attempt.reading_correct}` : ""}</p></li>)}</ul> : <p className="mt-4 text-sm muted">{t("Chưa có bài thi đã nộp trên tài khoản này.")}</p>}
    </section>
    <section id="words" className="paper mt-6 p-6 sm:p-8"><h2 className="text-xl font-bold">{t("Từ vựng đã học")}</h2>
      {words.length ? <><p className="mt-2 text-sm muted">{words.length} {t("từ đã học")} · {reviewWords.length} {t("từ cần ôn lại")}</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{[...reviewWords, ...words.filter((word) => word.masteryStatus !== "Cần ôn lại")].slice(0, 20).map((word) => <div key={word.vocabularyId} className="rounded-xl border border-[var(--border)] p-3"><strong className="text-lg text-[var(--brand)]">{word.traditional}</strong><span className="ml-2 text-sm muted" lang="vi">{word.meaningVi}</span><p className="mt-1 text-xs muted">{t(word.masteryStatus)}</p></div>)}</div><Link className="button-secondary mt-5 inline-block" href="/vocabulary/practice">{t("Ôn tập từ vựng")}</Link></> : <p className="mt-4 text-sm muted">{t("Hãy đánh dấu một từ đã học để bắt đầu theo dõi tiến độ.")}</p>}
    </section>
  </main>;
}

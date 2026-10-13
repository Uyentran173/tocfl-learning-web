"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { loadTestHistory, savedAccountProgress, type TestAttemptRow } from "@/lib/cloud-progress";
import { loadLearnedPool, type LearnedVocabularyPool } from "@/lib/learned-vocabulary";
import { progressStorage } from "@/lib/progress-storage";
import type { ActivityProgress } from "@/lib/activity-progress";

type TestTitle = { id: string; title: string };
const dateLabel = (value: string) => new Date(value).toLocaleDateString("vi-VN");

export default function AccountDashboard({ tests }: { tests: TestTitle[] }) {
  const { user, configured, syncError, guestMigrationAvailable, migrateGuest, signOut } = useAuth();
  const [pool, setPool] = useState<LearnedVocabularyPool | null>(null);
  const [history, setHistory] = useState<TestAttemptRow[]>([]);
  const [activities, setActivities] = useState<ActivityProgress[]>([]);
  const [annotations, setAnnotations] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      setPool(loadLearnedPool(progressStorage()));
      const entries = savedAccountProgress(user.id);
      const activity = entries.filter((item) => item.key.startsWith("taiwen-activity:v1:")).flatMap((item) => {
        try { return [JSON.parse(item.value) as ActivityProgress]; } catch { return []; }
      });
      setActivities(activity);
      setAnnotations(entries.filter((item) => item.key.startsWith("tocfl-practice-annotations:v1:")).reduce((count, item) => {
        try { const value: unknown = JSON.parse(item.value); return count + (Array.isArray(value) ? value.length : 0); } catch { return count; }
      }, 0));
      void loadTestHistory(user.id).then(setHistory).catch(() => setMessage("Chưa tải được lịch sử luyện đề. Vui lòng thử lại sau."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);

  if (!user) return <main className="mx-auto max-w-4xl px-5 py-16">
    <section className="paper p-7 sm:p-10"><p className="page-eyebrow">HỒ SƠ KHÁCH</p><h1 className="page-title">Học theo cách của bạn</h1><p className="mt-4 leading-7 muted">Bạn vẫn có thể học và luyện đề mà không cần tài khoản. Tiến độ khách được giữ trên thiết bị này.</p>
      <Link href="/login" className="button-primary mt-7 inline-block">Đăng nhập để đồng bộ tiến độ</Link>
      {!configured && <p className="mt-4 text-sm muted">Tính năng đăng nhập đang chờ kết nối Supabase.</p>}
    </section>
  </main>;

  const words = pool?.words ?? [];
  const reviewWords = words.filter((word) => word.masteryStatus === "Cần ôn lại");
  const totalRounds = activities.reduce((count, item) => count + (item.rounds || 0), 0);
  const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? "Người học Tai Wén";
  const titleFor = (id: string) => tests.find((test) => test.id === id)?.title ?? id;

  return <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
    <p className="page-eyebrow">TÀI KHOẢN TAI WÉN</p>
    <h1 className="page-title">Hồ sơ học tập</h1>
    <p className="page-lead">Theo dõi hành trình học tiếng Hoa và luyện thi TOCFL của bạn.</p>
    <nav className="mt-7 flex flex-wrap gap-2" aria-label="Mục trong hồ sơ">
      {[["#profile", "Hồ sơ"], ["#progress", "Tiến độ học"], ["#history", "Lịch sử luyện đề"], ["#words", "Từ đã học / cần ôn"]].map(([href, label]) => <a key={href} href={href} className="button-secondary text-sm">{label}</a>)}
    </nav>
    {(syncError || message) && <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">{syncError || message}</p>}
    {guestMigrationAvailable && <section className="mt-7 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 sm:p-6">
      <h2 className="text-lg font-bold text-[var(--brand)]">Chuyển tiến độ khách vào tài khoản?</h2>
      <p className="mt-2 text-sm leading-6">Tai Wén tìm thấy tiến độ học trên thiết bị này. Bạn có thể gộp vào tài khoản; dữ liệu khách gốc vẫn được giữ lại.</p>
      <button type="button" disabled={busy} className="button-primary mt-4" onClick={() => { setBusy(true); void migrateGuest().catch(() => { setMessage("Chuyển tiến độ chưa hoàn tất. Dữ liệu khách vẫn an toàn trên thiết bị này."); setBusy(false); }); }}>{busy ? "Đang chuyển tiến độ…" : "Gộp tiến độ khách"}</button>
      <p className="mt-3 text-xs muted">Bạn có thể bỏ qua và quay lại gộp sau.</p>
    </section>}
    <section id="profile" className="paper mt-8 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><h2 className="text-xl font-bold">Hồ sơ</h2><p className="mt-3 font-semibold text-[var(--brand)]">{typeof name === "string" ? name : "Người học Tai Wén"}</p><p className="mt-1 text-sm muted">{user.email ?? "Đã kết nối tài khoản"}</p></div><button type="button" className="button-secondary" onClick={() => void signOut().catch(() => setMessage("Chưa đăng xuất được. Vui lòng thử lại."))}>Đăng xuất</button></div>
    </section>
    <section id="progress" className="paper mt-6 p-6 sm:p-8"><h2 className="text-xl font-bold">Tiến độ học</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">
      {[[words.length, "Từ đã học"], [reviewWords.length, "Từ cần ôn"], [totalRounds, "Lượt bài khóa / trò chơi"]].map(([value, label]) => <div key={String(label)} className="rounded-2xl bg-[var(--brand-soft)] p-5"><p className="text-3xl font-bold text-[var(--brand)]">{value}</p><p className="mt-1 text-sm muted">{label}</p></div>)}
    </div><p className="mt-4 text-sm muted">Bạn cũng đã lưu {annotations} đoạn ghi chú hoặc đánh dấu khi luyện tập.</p></section>
    <section id="history" className="paper mt-6 p-6 sm:p-8"><h2 className="text-xl font-bold">Lịch sử luyện đề</h2>
      {history.length ? <ul className="mt-5 grid gap-3">{history.map((attempt) => <li key={`${attempt.test_id}:${attempt.started_at}`} className="rounded-xl border border-[var(--border)] p-4"><div className="flex flex-wrap justify-between gap-2"><strong>{titleFor(attempt.test_id)}</strong><span className="font-bold text-[var(--brand)]">{attempt.correct}/{attempt.total} câu đúng</span></div><p className="mt-2 text-xs muted">{dateLabel(attempt.completed_at)} · {attempt.mode === "practice" ? "Luyện tập" : "Mô phỏng"} · {attempt.scope === "full" ? "Toàn bộ đề" : attempt.scope === "listening" ? "Phần Nghe" : "Phần Đọc"}{attempt.listening_correct !== null ? ` · Nghe: ${attempt.listening_correct}` : ""}{attempt.reading_correct !== null ? ` · Đọc: ${attempt.reading_correct}` : ""}</p></li>)}</ul> : <p className="mt-4 text-sm muted">Chưa có bài thi đã nộp trên tài khoản này.</p>}
    </section>
    <section id="words" className="paper mt-6 p-6 sm:p-8"><h2 className="text-xl font-bold">Từ đã học / cần ôn</h2>
      {words.length ? <><p className="mt-2 text-sm muted">{words.length} từ đã học · {reviewWords.length} từ cần ôn lại</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{[...reviewWords, ...words.filter((word) => word.masteryStatus !== "Cần ôn lại")].slice(0, 20).map((word) => <div key={word.vocabularyId} className="rounded-xl border border-[var(--border)] p-3"><strong className="text-lg text-[var(--brand)]">{word.traditional}</strong><span className="ml-2 text-sm muted">{word.meaningVi}</span><p className="mt-1 text-xs muted">{word.masteryStatus}</p></div>)}</div><Link className="button-secondary mt-5 inline-block" href="/vocabulary/practice">Ôn tập từ vựng</Link></> : <p className="mt-4 text-sm muted">Hãy đánh dấu một từ đã học để bắt đầu theo dõi tiến độ.</p>}
    </section>
  </main>;
}

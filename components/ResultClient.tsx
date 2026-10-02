"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { scriptQuery, type MockTest } from "@/lib/tests";
import { clearSession, readSession, startSession, type ExamSession } from "@/lib/session";
import MascotSticker from "./MascotSticker";

export default function ResultClient({ test }: { test: MockTest }) {
  const router = useRouter();
  const [session, setSession] = useState<ExamSession | null>(null);
  const basePath = "/tocfl/" + test.id;
  const suffix = scriptQuery(test);
  const scope = test.scope ?? "full";
  const script = test.script;

  useEffect(() => {
    const saved = readSession(test.id);
    if (!saved) { router.replace(basePath + "/instructions"); return; }
    if ((saved.scope ?? "full") !== scope || saved.script !== script) { router.replace(basePath + "/result" + scriptQuery({ script: saved.script, scope: saved.scope ?? "full" })); return; }
    if (saved.status !== "submitted") { router.replace(basePath + "/exam" + suffix); return; }
    const timeout = window.setTimeout(() => setSession(saved), 0);
    return () => window.clearTimeout(timeout);
  }, [router, test.id, basePath, suffix, scope, script]);

  if (!session?.result) return <div className="report-shell"><main className="mx-auto max-w-5xl px-5 py-12">Đang tải kết quả…</main></div>;

  const result = session.result;
  const percent = Math.round(result.correct / test.questions.length * 100);
  const mascot = percent < 50
    ? { variant: "faint" as const, title: "Gấu cũng cần nghỉ một chút", message: "Bạn có thể xem lại những câu chưa chắc, rồi làm lại khi sẵn sàng." }
    : percent < 80
      ? { variant: "study" as const, title: "Bạn đang tiến bộ từng bước", message: "Hãy xem lại các câu sai để củng cố phần còn thiếu." }
      : { variant: "graduate" as const, title: "Một bước tiến rất đáng vui", message: "Tiếp tục ôn đều để giữ phong độ ở các đề tiếp theo." };

  return <div className="report-shell">
    
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="report-surface overflow-hidden">
        <div className="border-b border-[var(--border)] px-6 py-8 sm:px-10 sm:py-10">
          <p className="report-eyebrow">Đã hoàn thành bài thi</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--brand)] sm:text-4xl">Kết quả bài thi thử</h1>
          <p className="mt-2 text-base text-[#5e6674]">{test.title} · {test.scope === "listening" ? "Phần Nghe" : test.scope === "reading" ? "Phần Đọc" : "Toàn bộ đề"}</p>
        </div>
          <div className="grid items-center gap-7 border-b border-[var(--border)] bg-[var(--brand-soft)] px-6 py-8 sm:grid-cols-[1fr_auto] sm:px-10 sm:py-9">
          <div>
            <p className="report-eyebrow">Điểm của bạn</p>
            <p className="mt-3 text-5xl font-bold tabular-nums text-[var(--brand)] sm:text-6xl">{result.correct}<span className="ml-3 text-2xl font-medium text-[#657184]">/ {test.questions.length}</span></p>
            <p className="mt-3 text-sm leading-6 text-[#5e6674]">Kết quả dựa trên số câu trả lời đúng trong đề luyện tập này.</p>
            {test.scoreProfile?.scores[String(result.earnedPoints ?? result.correct)] !== undefined && <p className="mt-2 text-sm font-semibold text-[var(--brand)]">Điểm quy đổi: {test.scoreProfile.scores[String(result.earnedPoints ?? result.correct)]} / 80</p>}
            <p className="mt-3 max-w-xl text-xs leading-5 text-[#657184]">Điểm số này được tính theo thang điểm của đề thi thử và chỉ mang tính tham khảo. Đây không phải là kết quả chính thức của kỳ thi TOCFL.</p>
          </div>
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-[var(--brand)] bg-white text-3xl font-bold tabular-nums text-[var(--brand)]" aria-label={percent + "% số câu trả lời đúng"}>{percent}%</div>
        </div>
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="result-mascot-panel mb-8" role="note"><MascotSticker variant={mascot.variant} alt={mascot.title} className="result-mascot-art mascot-pop" /><div><p className="font-semibold text-[var(--brand)]">{mascot.title}</p><p className="mt-1 text-sm leading-6 muted">{mascot.message}</p></div></div>
          <h2 className="text-xl font-bold text-[#1C1C1C]">Kết quả theo phần</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {test.sections.map((section) => <div key={section} className="rounded-xl border border-[var(--border)] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[#5e6674]">{section === "listening" ? "Nghe" : "Đọc"}</p><span className="text-xs text-[#667184]">{session.sectionCompleted?.[section] ? "Đã kết thúc" : "Chưa bắt đầu"}</span></div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-[var(--brand)]">{result.sections[section].correct} <span className="text-lg font-medium text-[#667184]">/ {result.sections[section].total} câu đúng</span></p>
              {test.scoreProfiles?.[section] && <p className="mt-2 text-sm font-semibold text-[var(--brand)]">{test.scoreProfiles[section]?.scores[String(result.sections[section].correct)] !== undefined ? `Điểm quy đổi: ${test.scoreProfiles[section]?.scores[String(result.sections[section].correct)]} / ${test.scoreProfiles[section]?.maxScore}` : "Chưa có điểm quy đổi cho số câu đúng này."}</p>}
              <p className="mt-2 text-xs muted">{result.sections[section].incorrect} sai · {result.sections[section].unanswered} chưa trả lời</p>
            </div>)}
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-7 text-center">
            <div><p className="text-2xl font-bold tabular-nums text-[var(--brand)]">{result.correct}</p><p className="mt-1 text-xs font-medium text-[#5e6674] sm:text-sm">Đúng</p></div>
            <div><p className="text-2xl font-bold tabular-nums text-[#a23d3d]">{result.incorrect}</p><p className="mt-1 text-xs font-medium text-[#5e6674] sm:text-sm">Sai</p></div>
            <div><p className="text-2xl font-bold tabular-nums text-[#4d5665]">{result.unanswered}</p><p className="mt-1 text-xs font-medium text-[#5e6674] sm:text-sm">Chưa trả lời</p></div>
          </div>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link className="report-primary-button" href={basePath + "/review" + suffix}>Xem lại đáp án</Link>
            <Link className="report-secondary-button" href="/tocfl">Về thư viện đề</Link>
            <button type="button" className="report-secondary-button" onClick={() => {
              clearSession(test.id);
              if (session.mode === "simulation") window.sessionStorage.setItem("tocfl-simulation-intro:" + test.id, "1");
              else startSession(test, "practice");
              router.push(basePath + "/exam" + suffix);
            }}>Làm lại</button>
          </div>
        </div>
      </div>
    </main>
  </div>;
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scriptQuery, type ScriptVariant, type Section, type TestScope } from "@/lib/tests";
import { clearSession, readSession, startSession, type ExamMode } from "@/lib/session";
import { preloadStartAudio, type ExamStartData } from "@/lib/exam-start-preload";
import { preloadQuestionImages } from "@/lib/exam-image-preload";
import ExamStartPending from "./ExamStartPending";
import { useT } from "./PreferencesProvider";

const scopes: { value: TestScope; title: string; description: string }[] = [
  { value: "listening", title: "Chỉ phần Nghe", description: "Làm và nhận kết quả riêng cho phần Nghe." },
  { value: "reading", title: "Chỉ phần Đọc", description: "Làm và nhận kết quả riêng cho phần Đọc." },
  { value: "full", title: "Làm toàn bộ đề", description: "Làm phần Nghe, tiếp đến phần Đọc." },
];

type TestSummary = { id: string; title: string; level: string; sections: Section[]; questionCount: number; sectionCounts: Record<Section, number> };

export default function TestSetup({ test, starts }: { test: TestSummary; starts: Record<ScriptVariant, Record<TestScope, ExamStartData>> }) {
  const t = useT();
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<ExamMode | null>(null);
  const [selectedScope, setSelectedScope] = useState<TestScope | null>(null);
  const [pendingSection, setPendingSection] = useState<Section | null>(null);
  const startingRef = useRef(false);
  const availableScopes = scopes.filter((option) => option.value === "full" ? test.sections.length > 1 : test.sections.includes(option.value));

  useEffect(() => {
    // The intro and first audio question are shared by both scripts.
    preloadStartAudio(starts.traditional.full);
  }, [starts]);

  useEffect(() => {
    if (!selectedScope) return;
    for (const script of ["traditional", "simplified"] as const) {
      const selected = starts[script][selectedScope];
      router.prefetch(`/tocfl/${test.id}/exam${scriptQuery(selected)}`);
      preloadStartAudio(selected);
      if (selected.questions[0]) void preloadQuestionImages(selected.questions[0]);
    }
  }, [router, selectedScope, starts, test.id]);

  function beginTest(selected: ExamStartData) {
    if (startingRef.current || !selectedMode) return;
    startingRef.current = true;
    setPendingSection(selected.questions[0]?.section ?? "listening");
    const mode = selectedMode;
    const destination = `/tocfl/${test.id}/exam${scriptQuery(selected)}`;
    // Paint the next-screen shell before reading storage or starting navigation.
    window.requestAnimationFrame(() => window.setTimeout(() => {
      if (mode === "simulation") {
        clearSession(test.id);
        window.sessionStorage.setItem(`tocfl-simulation-intro:${test.id}`, "1");
      } else {
        window.sessionStorage.removeItem(`tocfl-simulation-intro:${test.id}`);
        const existing = readSession(test.id);
        if (!existing || existing.status === "submitted" || existing.mode !== mode || (existing.scope ?? "full") !== (selected.scope ?? "full") || existing.script !== selected.script) startSession(selected, mode);
        // ExamClient restores older practice sessions with the complete test data.
      }
      router.push(destination);
    }, 0));
  }

  if (pendingSection) return <ExamStartPending section={pendingSection} />;

  return <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-14">
    <Link href="/tocfl" className="button-quiet text-sm">← {t("Thư viện đề thi")}</Link>
    <div className="paper mt-7 overflow-hidden rounded-2xl">
      <div className="border-b border-[var(--border)] bg-[var(--brand-soft)] px-6 py-8 sm:px-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[var(--brand)]">{t("Trước khi bắt đầu")}</p>
        <h1 className="text-3xl font-semibold">{t(test.title)}</h1>
        <p className="mt-2 text-lg muted">{t("Chọn chế độ, phần thi và loại chữ phù hợp với bạn.")}</p>
      </div>
      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-5 sm:grid-cols-3">
          <div><p className="text-sm muted">{t("Cấp độ")}</p><p className="mt-1 text-xl font-semibold">{test.level}</p></div>
          <div><p className="text-sm muted">{t("Số câu hỏi")}</p><p className="mt-1 text-xl font-semibold">{test.questionCount}</p></div>
          <div><p className="text-sm muted">{t("Thời gian luyện tập")}</p><p className="mt-1 text-xl font-semibold">{t("60 phút / phần")}</p></div>
        </div>
        <div className="my-8 h-px bg-[var(--border)]" />
        <h2 className="text-lg font-semibold">{t("Phần thi trong đề")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{test.sections.map((section) => <div key={section} className="rounded-xl border border-[var(--border)] p-4"><span className="font-semibold">{t(section === "listening" ? "Nghe" : "Đọc")}</span><span className="float-right text-sm muted">{test.sectionCounts[section]} {t("câu")}</span></div>)}</div>
        <h2 className="mt-9 text-lg font-semibold">{t("Lưu ý trước khi làm bài")}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 muted">
          <li>{t("Câu trả lời và câu đang làm được tự động lưu trên thiết bị này.")}</li>
          <li>{t("Ở chế độ Luyện tập, bạn có thể chuyển tự do giữa các câu. Mỗi phần được chọn có 60 phút riêng.")}</li>
          <li>{t("Ở chế độ Mô phỏng, phần Nghe theo nhịp âm thanh và không có đồng hồ đếm ngược; phần Đọc có 60 phút kể từ khi bắt đầu phần này.")}</li>
          <li>{t("Bạn sẽ được hỏi xác nhận trước khi nộp bài. Câu bỏ trống được tính là chưa trả lời.")}</li>
          <li>{t("Tránh tải lại hoặc đóng trang khi đang làm bài, đặc biệt trong phần Nghe, để không làm gián đoạn âm thanh.")}</li>
        </ul>
        <div className="mt-9 border-t border-[var(--border)] pt-7">
          {!selectedMode ? <>
            <h2 className="text-lg font-semibold">{t("Chọn chế độ làm bài")}</h2>
            <p className="mt-2 text-sm leading-6 muted">{t("Cả hai chế độ dùng cùng bộ câu hỏi và cách chấm điểm.")}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="mode-card"><p className="text-lg font-semibold">{t("Chế độ Luyện tập")}</p><p className="mt-2 min-h-12 text-sm leading-6 muted">{t("Chủ động chọn câu hỏi và theo dõi thời gian của từng phần.")}</p><button type="button" className="button-secondary" onClick={() => setSelectedMode("practice")}>{t("Chọn Luyện tập")} →</button></div>
              <div className="mode-card"><p className="text-lg font-semibold">{t("Chế độ Mô phỏng")}</p><p className="mt-2 min-h-12 text-sm leading-6 muted">{t("Làm bài trong giao diện tập trung, gần với nhịp thi thực tế.")}</p><button type="button" className="button-secondary" onClick={() => setSelectedMode("simulation")}>{t("Chọn Mô phỏng")} →</button></div>
            </div>
          </> : !selectedScope ? <>
            <h2 className="text-lg font-semibold">{t("Chọn phần thi")}</h2>
            <p className="mt-2 text-sm leading-6 muted">{t("Bạn có thể luyện riêng từng kỹ năng hoặc làm toàn bộ đề.")}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">{availableScopes.map((option) => <div key={option.value} className="mode-card flex flex-col"><p className="text-lg font-semibold">{t(option.title)}</p><p className="mt-2 flex-1 text-sm leading-6 muted">{t(option.description)}</p><button type="button" className="button-secondary mt-4" onClick={() => setSelectedScope(option.value)}>{t("Chọn phần này")} →</button></div>)}</div>
            <button type="button" className="button-quiet mt-5 text-sm" onClick={() => setSelectedMode(null)}>← {t("Chọn lại chế độ")}</button>
          </> : <>
            <h2 className="text-lg font-semibold">{t("Chọn loại chữ")}</h2>
            <p className="mt-2 text-sm leading-6 muted">{t("Phần thi đã chọn:")} {t(scopes.find((option) => option.value === selectedScope)?.title ?? "")}.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{(["traditional", "simplified"] as const).map((script) => {
              const selectedTest = starts[script][selectedScope];
              return <div key={script} className="mode-card"><p className="text-lg font-semibold">{t(script === "traditional" ? "Chữ Phồn thể" : "Chữ Giản thể")}</p><p className="mt-2 min-h-12 text-sm leading-6 muted">{t(script === "traditional" ? "Đọc đề theo chữ Phồn thể." : "Đọc đề theo chữ Giản thể.")}</p><button type="button" className="button-secondary" onClick={() => beginTest(selectedTest)}>{t("Bắt đầu")} →</button></div>;
            })}</div>
            <button type="button" className="button-quiet mt-5 text-sm" onClick={() => setSelectedScope(null)}>← {t("Chọn lại phần thi")}</button>
          </>}
        </div>
        <div className="mt-8"><Link href="/tocfl" className="button-secondary inline-block">{t("Quay lại thư viện")}</Link></div>
      </div>
    </div>
  </main>;
}

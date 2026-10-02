"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { scriptQuery, sectionCount, selectTestScope, type MockTest, type ScriptVariant, type TestScope } from "@/lib/tests";
import StartTestButton from "./StartTestButton";
import { clearSession, type ExamMode } from "@/lib/session";

const scopes: { value: TestScope; title: string; description: string }[] = [
  { value: "listening", title: "Chỉ phần Nghe", description: "Làm và nhận kết quả riêng cho phần Nghe." },
  { value: "reading", title: "Chỉ phần Đọc", description: "Làm và nhận kết quả riêng cho phần Đọc." },
  { value: "full", title: "Làm toàn bộ đề", description: "Làm phần Nghe, tiếp đến phần Đọc." },
];

export default function TestSetup({ test, variants }: { test: MockTest; variants?: Record<ScriptVariant, MockTest> }) {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<ExamMode | null>(null);
  const [selectedScope, setSelectedScope] = useState<TestScope | null>(null);
  const availableScopes = scopes.filter((option) => option.value === "full" ? test.sections.length > 1 : test.sections.includes(option.value));
  function enterSimulation(selectedTest: MockTest) {
    clearSession(test.id);
    window.sessionStorage.setItem(`tocfl-simulation-intro:${test.id}`, "1");
    router.push(`/tocfl/${test.id}/exam${scriptQuery(selectedTest)}`);
  }

  return <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-14">
    <Link href="/tocfl" className="button-quiet text-sm">← Thư viện đề thi</Link>
    <div className="paper mt-7 overflow-hidden rounded-2xl">
      <div className="border-b border-[var(--border)] bg-[var(--brand-soft)] px-6 py-8 sm:px-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[var(--brand)]">Trước khi bắt đầu</p>
        <h1 className="text-3xl font-semibold">{test.title}</h1>
        <p className="mt-2 text-lg muted">Chọn chế độ, phần thi và loại chữ phù hợp với bạn.</p>
      </div>
      <div className="px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-5 sm:grid-cols-3">
          <div><p className="text-sm muted">Cấp độ</p><p className="mt-1 text-xl font-semibold">{test.level}</p></div>
          <div><p className="text-sm muted">Số câu hỏi</p><p className="mt-1 text-xl font-semibold">{test.questions.length}</p></div>
          <div><p className="text-sm muted">Thời gian luyện tập</p><p className="mt-1 text-xl font-semibold">60 phút / phần</p></div>
        </div>
        <div className="my-8 h-px bg-[var(--border)]" />
        <h2 className="text-lg font-semibold">Phần thi trong đề</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{test.sections.map((section) => <div key={section} className="rounded-xl border border-[var(--border)] p-4"><span className="font-semibold">{section === "listening" ? "Nghe" : "Đọc"}</span><span className="float-right text-sm muted">{sectionCount(test, section)} câu</span></div>)}</div>
        <h2 className="mt-9 text-lg font-semibold">Lưu ý trước khi làm bài</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 muted">
          <li>Câu trả lời và câu đang làm được tự động lưu trên thiết bị này.</li>
          <li>Ở chế độ Luyện tập, bạn có thể chuyển tự do giữa các câu. Mỗi phần được chọn có 60 phút riêng.</li>
          <li>Ở chế độ Mô phỏng, phần Nghe theo nhịp âm thanh và không có đồng hồ đếm ngược; phần Đọc có 60 phút kể từ khi bắt đầu phần này.</li>
          <li>Bạn sẽ được hỏi xác nhận trước khi nộp bài. Câu bỏ trống được tính là chưa trả lời.</li>
          <li>Tránh tải lại hoặc đóng trang khi đang làm bài, đặc biệt trong phần Nghe, để không làm gián đoạn âm thanh.</li>
        </ul>
        <div className="mt-9 border-t border-[var(--border)] pt-7">
          {!selectedMode ? <>
            <h2 className="text-lg font-semibold">Chọn chế độ làm bài</h2>
            <p className="mt-2 text-sm leading-6 muted">Cả hai chế độ dùng cùng bộ câu hỏi và cách chấm điểm.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="mode-card"><p className="text-lg font-semibold">Chế độ Luyện tập</p><p className="mt-2 min-h-12 text-sm leading-6 muted">Chủ động chọn câu hỏi và theo dõi thời gian của từng phần.</p><button type="button" className="button-secondary" onClick={() => setSelectedMode("practice")}>Chọn Luyện tập →</button></div>
              <div className="mode-card"><p className="text-lg font-semibold">Chế độ Mô phỏng</p><p className="mt-2 min-h-12 text-sm leading-6 muted">Làm bài trong giao diện tập trung, gần với nhịp thi thực tế.</p><button type="button" className="button-secondary" onClick={() => setSelectedMode("simulation")}>Chọn Mô phỏng →</button></div>
            </div>
          </> : !selectedScope ? <>
            <h2 className="text-lg font-semibold">Chọn phần thi</h2>
            <p className="mt-2 text-sm leading-6 muted">Bạn có thể luyện riêng từng kỹ năng hoặc làm toàn bộ đề.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">{availableScopes.map((option) => <div key={option.value} className="mode-card flex flex-col"><p className="text-lg font-semibold">{option.title}</p><p className="mt-2 flex-1 text-sm leading-6 muted">{option.description}</p><button type="button" className="button-secondary mt-4" onClick={() => setSelectedScope(option.value)}>Chọn phần này →</button></div>)}</div>
            <button type="button" className="button-quiet mt-5 text-sm" onClick={() => setSelectedMode(null)}>← Chọn lại chế độ</button>
          </> : <>
            <h2 className="text-lg font-semibold">Chọn loại chữ</h2>
            <p className="mt-2 text-sm leading-6 muted">Phần thi đã chọn: {scopes.find((option) => option.value === selectedScope)?.title}.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">{(["traditional", "simplified"] as const).map((script) => {
              const selectedTest = selectTestScope(variants?.[script] ?? test, selectedScope);
              return <div key={script} className="mode-card"><p className="text-lg font-semibold">{script === "traditional" ? "Chữ Phồn thể" : "Chữ Giản thể"}</p><p className="mt-2 min-h-12 text-sm leading-6 muted">{script === "traditional" ? "Đọc đề theo chữ Phồn thể." : "Đọc đề theo chữ Giản thể."}</p>{selectedMode === "practice" ? <StartTestButton test={selectedTest} mode="practice" label="Bắt đầu →" className="button-secondary" /> : <button type="button" className="button-secondary" onClick={() => enterSimulation(selectedTest)}>Bắt đầu →</button>}</div>;
            })}</div>
            <button type="button" className="button-quiet mt-5 text-sm" onClick={() => setSelectedScope(null)}>← Chọn lại phần thi</button>
          </>}
        </div>
        <div className="mt-8"><Link href="/tocfl" className="button-secondary inline-block">Quay lại thư viện</Link></div>
      </div>
    </div>
  </main>;
}

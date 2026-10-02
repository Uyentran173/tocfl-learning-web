"use client";

import Link from "next/link";
import { useState } from "react";
import MascotSticker from "./MascotSticker";

type TestSummary = {
  id: string;
  title: string;
  level: string;
  levelId: string;
  sections: ("listening" | "reading")[];
  questionCount: number;
  ready: boolean;
};
const bands = [
  { id: "all", label: "Tất cả" },
  { id: "novice", label: "Novice" },
  { id: "a", label: "Band A" },
  { id: "b", label: "Band B" },
  { id: "c", label: "Band C" },
] as const;

export default function TestLibrary({ records }: { records: TestSummary[] }) {
  const [band, setBand] = useState<string>("all");
  const visible = records.filter((record) => band === "all" || record.levelId === band);
  const groups = bands.slice(1).map((item) => ({
    ...item,
    records: visible.filter((record) => record.levelId === item.id),
  })).filter((group) => group.records.length);
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
    <div className="mb-11 flex items-end justify-between gap-5 border-b border-[var(--border)] pb-9">
      <div>
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 py-2 text-xs font-bold text-[var(--brand)]"><span aria-hidden="true">✦</span> Học vững từng ngày</div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[var(--brand)]">Luyện đề TOCFL</p>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Luyện đề TOCFL theo nhịp học của bạn.</h1>
        <p className="mt-4 max-w-2xl leading-7 muted">Chọn đề và cách làm bài phù hợp. Câu trả lời của bạn được tự động lưu trong lúc luyện tập.</p>
      </div>
      <MascotSticker variant="graduate" decorative className="vocabulary-header-sticker mascot-float" />
    </div>
    <div className="mb-5 flex items-end justify-between gap-4"><h2 className="text-xl font-semibold">Đề luyện tập</h2><span className="text-sm muted">{visible.filter((record) => record.ready).length} đề</span></div>
    <div role="group" aria-label="Lọc đề theo Band" className="mb-9 flex flex-wrap gap-2">{bands.map((item) => <button key={item.id} type="button" aria-pressed={band === item.id} onClick={() => setBand(item.id)} className={["rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]", band === item.id ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[var(--border)] bg-white text-[var(--brand)] hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)]"].join(" ")}>{item.label}</button>)}</div>
    {groups.length ? <div className="space-y-11">{groups.map((group) => <section key={group.id} aria-label={group.label}>
      <div className="mb-5 flex items-center gap-3"><h3 className="text-xl font-semibold text-[var(--brand)]">{group.label === "Novice" ? "Band Novice" : group.label}</h3><span className="text-sm muted">{group.records.length} đề</span></div>
      <div className="grid gap-5 md:grid-cols-2">{group.records.map((record) => <article key={record.id} className="paper flex flex-col rounded-2xl p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4"><div><p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[var(--brand)]">Bài thi {record.sections.map((section) => section === "reading" ? "Đọc" : "Nghe").join(" & ")}</p><h4 className="text-2xl font-semibold">{record.title}</h4><p className="mt-2 text-sm muted">Có bản Chữ Phồn thể và Chữ Giản thể.</p></div><span className="shrink-0 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand)]">{record.level}</span></div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-y border-[var(--border)] py-5 text-sm">
          <div><p className="muted">Phần thi</p><p className="mt-1 font-semibold">{record.sections.map((section) => section === "reading" ? "Đọc" : "Nghe").join(" · ")}</p></div>
          <div><p className="muted">Số câu hỏi</p><p className="mt-1 font-semibold">{record.questionCount} câu</p></div>
          <div><p className="muted">Thời gian luyện tập</p><p className="mt-1 font-semibold">60 phút mỗi phần</p></div>
          <div><p className="muted">Thời gian mô phỏng</p><p className="mt-1 font-semibold">Nghe theo âm thanh · Đọc 60 phút</p></div>
        </div>
        {record.ready ? <Link href={`/tocfl/${record.id}/instructions`} className="button-primary mt-7 inline-flex w-fit items-center gap-2">Chọn chế độ <span aria-hidden="true">→</span></Link> : <p className="mt-6 text-sm leading-6 muted">Đề này đang được hoàn thiện. Bạn vui lòng quay lại sau.</p>}
      </article>)}</div>
    </section>)}</div> : <div className="paper rounded-2xl px-6 py-10 text-center"><p className="font-semibold text-[var(--brand)]">Chưa có đề ở Band này</p><p className="mt-2 text-sm muted">Bạn có thể chọn Band khác để tiếp tục luyện tập.</p></div>}
  </main>;
}

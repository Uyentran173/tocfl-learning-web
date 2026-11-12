"use client";
import type { Section } from "@/lib/tests";
import { useT } from "./PreferencesProvider";
import MascotLoader from "./MascotLoader";

export default function ExamStartPending({ section }: { section?: Section }) {
  const t = useT();
  return <main className="min-h-screen px-5 py-10 sm:py-16" aria-busy="true">
    <section className="mx-auto max-w-2xl rounded-2xl border border-[var(--brand-border)] bg-[var(--surface)] px-6 py-9 text-center shadow-sm sm:px-10 sm:py-12">
      <MascotLoader variant="taipei" message="Đang mở bài thi của bạn…" />
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--brand)]">{section === "reading" ? t("Phần Đọc") : section === "listening" ? t("Phần Nghe") : t("Bài thi TOCFL")}</p>
      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{section === "reading" ? t("Chuẩn bị cho phần Đọc") : t("Hướng dẫn trước khi làm bài")}</h1>
      <div className="mx-auto mt-8 max-w-md rounded-xl border border-[var(--border)] bg-[var(--brand-soft)] p-4">
        <div className="h-10 animate-pulse ui-skeleton" aria-hidden="true" />
      </div>
    </section>
  </main>;
}

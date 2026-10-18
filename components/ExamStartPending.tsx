"use client";
import type { Section } from "@/lib/tests";
import { useT } from "./PreferencesProvider";

export default function ExamStartPending({ section }: { section?: Section }) {
  const t = useT();
  return <main className="min-h-screen px-5 py-10 sm:py-16" aria-busy="true">
    <section className="mx-auto max-w-2xl rounded-2xl border border-[var(--brand-border)] bg-white px-6 py-9 text-center shadow-sm sm:px-10 sm:py-12" role="status" aria-label={t("Đang chuẩn bị bài thi")}>
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-soft)] text-4xl text-[var(--brand)]" aria-hidden="true">♫</div>
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--brand)]">{section === "reading" ? t("Phần Đọc") : section === "listening" ? t("Phần Nghe") : t("Bài thi TOCFL")}</p>
      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{section === "reading" ? t("Chuẩn bị cho phần Đọc") : t("Hướng dẫn trước khi làm bài")}</h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 muted">{t("Đang mở bài thi của bạn…")}</p>
      <div className="mx-auto mt-8 max-w-md rounded-xl border border-[var(--border)] bg-[var(--brand-soft)] p-4">
        <div className="h-10 animate-pulse rounded-lg bg-white" aria-hidden="true" />
      </div>
    </section>
  </main>;
}

"use client";
import { useEffect, useRef } from "react";
import { useT } from "./PreferencesProvider";

export default function SubmitModal({ answered, total, onContinue, onSubmit }: { answered: number; total: number; onContinue: () => void; onSubmit: () => void }) {
  const t = useT();
  const continueRef = useRef<HTMLButtonElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const onContinueRef = useRef(onContinue);
  useEffect(() => { onContinueRef.current = onContinue; }, [onContinue]);
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    continueRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onContinueRef.current(); }
      if (event.key === "Tab") {
        if (event.shiftKey && document.activeElement === continueRef.current) { event.preventDefault(); submitRef.current?.focus(); }
        else if (!event.shiftKey && document.activeElement === submitRef.current) { event.preventDefault(); continueRef.current?.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previouslyFocused?.focus(); };
  }, []);
  return <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#101d46]/60 p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onContinue(); }}>
    <div role="alertdialog" aria-modal="true" aria-labelledby="submit-title" className="ui-modal p-6 sm:p-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[var(--brand)]">{t("Xác nhận nộp bài")}</p>
      <h2 id="submit-title" className="text-2xl font-semibold">{t("Bạn muốn nộp bài?")}</h2>
      <p className="mt-3 leading-7 muted">{t("Sau khi nộp, bạn có thể xem điểm và đáp án của từng câu.")}</p>
      <div className="my-6 grid grid-cols-2 gap-3">
        <div className="ui-modal-stat"><p className="text-sm muted">{t("Đã trả lời")}</p><p className="mt-1 text-xl font-bold">{answered} / {total}</p></div>
        <div className="ui-modal-stat" data-variant="warning"><p className="text-sm muted">{t("Chưa trả lời")}</p><p className="mt-1 text-xl font-bold">{total - answered}</p></div>
      </div>
      <div className="flex flex-wrap justify-end gap-3"><button ref={continueRef} type="button" className="button-secondary" onClick={onContinue}>{t("Tiếp tục làm bài")}</button><button ref={submitRef} type="button" className="button-primary" onClick={onSubmit}>{t("Nộp bài")}</button></div>
    </div>
  </div>;
}

"use client";

export default function SubmitModal({ answered, total, onContinue, onSubmit }: { answered: number; total: number; onContinue: () => void; onSubmit: () => void }) {
  return <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#101d46]/60 p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onContinue(); }}>
    <div role="alertdialog" aria-modal="true" aria-labelledby="submit-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[var(--brand)]">Xác nhận nộp bài</p>
      <h2 id="submit-title" className="text-2xl font-semibold">Bạn muốn nộp bài?</h2>
      <p className="mt-3 leading-7 muted">Sau khi nộp, bạn có thể xem điểm và đáp án của từng câu.</p>
      <div className="my-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--brand-soft)] p-4"><p className="text-sm muted">Đã trả lời</p><p className="mt-1 text-xl font-bold">{answered} / {total}</p></div>
        <div className="rounded-xl bg-[#f7f5f1] p-4"><p className="text-sm muted">Chưa trả lời</p><p className="mt-1 text-xl font-bold">{total - answered}</p></div>
      </div>
      <div className="flex flex-wrap justify-end gap-3"><button type="button" className="button-secondary" onClick={onContinue}>Tiếp tục làm bài</button><button type="button" className="button-primary" onClick={onSubmit}>Nộp bài</button></div>
    </div>
  </div>;
}

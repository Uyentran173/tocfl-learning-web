"use client";

import { useEffect, useMemo, useState } from "react";
import type { TocflVocabularyBand, TocflVocabularyRecord } from "@/lib/tocfl-vocabulary-types";
import MascotSticker from "./MascotSticker";

const progressKey = "tocfl-band-vocabulary-progress-v1";
const pageSize = 40;
type View = "list" | "study" | "review";
type Script = "traditional" | "simplified";

export default function BandVocabularyStudy({ bands }: { bands: TocflVocabularyBand[] }) {
  const [bandId, setBandId] = useState(bands[0]?.id ?? "");
  const [levelId, setLevelId] = useState("all");
  const [script, setScript] = useState<Script>("traditional");
  const [records, setRecords] = useState<TocflVocabularyRecord[]>([]);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [view, setView] = useState<View>("list");
  const [page, setPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let timeout: number | undefined;
    try {
      const saved: unknown = JSON.parse(window.localStorage.getItem(progressKey) ?? "[]");
      if (Array.isArray(saved)) timeout = window.setTimeout(() => setLearnedIds(saved.filter((id): id is string => typeof id === "string")), 0);
    } catch { /* A missing or invalid local list starts empty. */ }
    return () => { if (timeout !== undefined) window.clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/vocabulary/band?band=${encodeURIComponent(bandId)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Không tải được danh sách từ vựng.");
        return response.json() as Promise<{ records: TocflVocabularyRecord[] }>;
      })
      .then((data) => { setRecords(data.records); setLoading(false); })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Không tải được danh sách từ vựng.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [bandId, retryKey]);

  const band = bands.find((item) => item.id === bandId) ?? bands[0];
  const levelNames = new Map(band?.levels.map((level) => [level.id, level.label]) ?? []);
  const visibleRecords = useMemo(() => records.filter((record) => levelId === "all" || record.levelId === levelId), [records, levelId]);
  const learnedSet = useMemo(() => new Set(learnedIds), [learnedIds]);
  const learnedCount = visibleRecords.filter((record) => learnedSet.has(record.id)).length;
  const reviewedCount = visibleRecords.filter((record) => record.meaningVi && record.exampleTraditional && record.exampleSimplified && record.exampleVi).length;
  const studyRecords = view === "review" ? visibleRecords.filter((record) => learnedSet.has(record.id)) : visibleRecords;
  const currentIndex = Math.min(activeIndex, Math.max(0, studyRecords.length - 1));
  const word = studyRecords[currentIndex];
  const pageCount = Math.max(1, Math.ceil(visibleRecords.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;

  function chooseBand(id: string) {
    if (id === bandId) return;
    setBandId(id);
    setLevelId("all");
    setRecords([]);
    setLoading(true);
    setError("");
    setView("list");
    setPage(1);
    setActiveIndex(0);
  }
  function chooseLevel(id: string) {
    setLevelId(id);
    setPage(1);
    setActiveIndex(0);
  }
  function chooseView(next: View, index = 0) {
    setView(next);
    setActiveIndex(index);
  }
  function toggleLearned(id: string) {
    const next = learnedSet.has(id) ? learnedIds.filter((item) => item !== id) : [...learnedIds, id];
    setLearnedIds(next);
    window.localStorage.setItem(progressKey, JSON.stringify(next));
  }
  function wordForm(record: TocflVocabularyRecord) {
    return script === "simplified" && record.simplified ? record.simplified : record.traditional;
  }
  function exampleForm(record: TocflVocabularyRecord) {
    return script === "simplified" ? record.exampleSimplified : record.exampleTraditional;
  }

  if (!band) return <p className="paper p-8 muted">Chưa có danh sách từ vựng theo Band.</p>;

  return <div className="space-y-6">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label="Chọn Band TOCFL">
      {bands.map((item) => <button key={item.id} type="button" onClick={() => chooseBand(item.id)} aria-pressed={bandId === item.id} className={`rounded-2xl border p-5 text-left shadow-sm transition-colors duration-200 ${bandId === item.id ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border)] bg-white hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)]"}`}>
        <span className="block text-xs font-bold uppercase tracking-[.13em] text-[var(--brand)]">TOCFL</span>
        <strong className="mt-2 block text-lg">{item.label}</strong>
        <span className="mt-1 block text-sm muted">{item.entryCount.toLocaleString("vi-VN")} từ</span>
      </button>)}
    </div>

    <div className="paper p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="page-eyebrow">{band.label}</p><h2 className="mt-2 text-2xl font-bold">{band.entryCount.toLocaleString("vi-VN")} mục từ</h2><p className="mt-2 text-sm muted">{learnedCount.toLocaleString("vi-VN")} / {(levelId === "all" ? band.entryCount : band.levels.find((level) => level.id === levelId)?.entryCount ?? 0).toLocaleString("vi-VN")} từ đã học trong mục đang xem</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn chữ viết">
          <button type="button" className={`rounded-xl border px-4 py-2 text-sm font-semibold ${script === "traditional" ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--border)] bg-white"}`} aria-pressed={script === "traditional"} onClick={() => setScript("traditional")}>Chữ Phồn thể</button>
          <button type="button" className={`rounded-xl border px-4 py-2 text-sm font-semibold ${script === "simplified" ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--border)] bg-white"}`} aria-pressed={script === "simplified"} onClick={() => setScript("simplified")}>Chữ Giản thể</button>
        </div>
      </div>
      <div className="study-progress mt-5" role="progressbar" aria-label="Tiến độ học từ" aria-valuemin={0} aria-valuemax={visibleRecords.length || band.entryCount} aria-valuenow={learnedCount}><span style={{ width: `${visibleRecords.length ? learnedCount / visibleRecords.length * 100 : 0}%` }} /></div>
      {band.coverageNote && <p className="mt-4 text-sm muted">{band.coverageNote}</p>}
      {!loading && !error && reviewedCount < visibleRecords.length && <p className="mt-4 rounded-xl bg-[var(--brand-soft)] px-4 py-3 text-sm text-[var(--brand)]" role="status">{reviewedCount === 0 ? "Nghĩa và câu ví dụ của Band này đang được biên tập. Bạn vẫn có thể xem từ vựng và lưu tiến độ học." : `${reviewedCount.toLocaleString("vi-VN")} từ đã có nghĩa và ví dụ được rà soát. Các từ còn lại đang được biên tập.`}</p>}
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Chọn cấp độ">
        <button type="button" onClick={() => chooseLevel("all")} aria-pressed={levelId === "all"} className={`rounded-full border px-4 py-2 text-sm font-semibold ${levelId === "all" ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--border)] bg-white"}`}>Tất cả cấp · {band.entryCount.toLocaleString("vi-VN")}</button>
        {band.levels.map((level) => <button key={level.id} type="button" onClick={() => chooseLevel(level.id)} aria-pressed={levelId === level.id} className={`rounded-full border px-4 py-2 text-sm font-semibold ${levelId === level.id ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--border)] bg-white"}`}>{level.label} · {level.entryCount.toLocaleString("vi-VN")}</button>)}
      </div>
      <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border)] pt-5">
        <button type="button" className={view === "list" ? "button-primary" : "button-secondary"} onClick={() => chooseView("list")}>Danh sách từ</button>
        <button type="button" className={view === "study" ? "button-primary" : "button-secondary"} onClick={() => chooseView("study")}>Học từ</button>
        <button type="button" className={view === "review" ? "button-primary" : "button-secondary"} onClick={() => chooseView("review")}>Ôn từ đã học</button>
      </div>
    </div>

    {loading ? <div className="paper p-10 text-center muted" role="status">Đang tải danh sách từ…</div> : error ? <div className="paper p-10 text-center"><p role="alert" className="text-red-700">{error}</p><button type="button" className="button-secondary mt-4" onClick={() => { setLoading(true); setError(""); setRetryKey((current) => current + 1); }}>Thử lại</button></div> : view === "list" ? <section className="paper overflow-hidden" aria-label="Danh sách từ vựng">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-5 py-4 sm:px-7"><h3 className="text-lg font-bold">Danh sách từ</h3><span className="text-sm muted">{visibleRecords.length.toLocaleString("vi-VN")} từ · Trang {currentPage}/{pageCount}</span></div>
      <div className="divide-y divide-[var(--border)]">{visibleRecords.slice(pageStart, pageStart + pageSize).map((record, index) => <button key={record.id} type="button" onClick={() => chooseView("study", pageStart + index)} className="grid w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--brand-soft)] sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:px-7">
        <span className="flex min-w-0 items-start gap-3"><span className="w-8 shrink-0 pt-1 text-xs muted">{record.globalSequence}</span><span><strong className="block text-xl text-[var(--brand)]" lang={script === "simplified" && record.simplified ? "zh-Hans" : "zh-Hant"}>{wordForm(record)}</strong><span className="mt-0.5 block text-sm muted">{record.pinyin || "Chưa có phiên âm"}</span><span className="mt-2 flex flex-wrap gap-1.5 text-xs"><span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 font-semibold text-[var(--brand)]">{levelNames.get(record.levelId) ?? record.levelId}</span>{record.partOfSpeech.raw && <span className="rounded-full border border-[var(--border)] px-2 py-0.5 muted">{record.partOfSpeech.raw}</span>}{learnedSet.has(record.id) && <span className="font-semibold text-[var(--brand)]">✓ Đã học</span>}</span></span></span>
        <span className="min-w-0 text-sm leading-6">{record.meaningVi && <strong className="block font-semibold">{record.meaningVi}</strong>}{exampleForm(record) && <span className="mt-1 block" lang={script === "simplified" ? "zh-Hans" : "zh-Hant"}>{exampleForm(record)}</span>}{record.exampleVi && <span className="block muted">{record.exampleVi}</span>}{record.exampleSource?.kind === "tatoeba" && <span className="mt-1 block text-xs muted">Ví dụ: Tatoeba · {record.exampleSource.author}</span>}</span>
      </button>)}</div>
      <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4 sm:px-7"><button type="button" className="button-secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>← Trang trước</button><span className="text-sm muted">{currentPage} / {pageCount}</span><button type="button" className="button-secondary" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Trang sau →</button></div>
    </section> : !word ? <div className="paper px-6 py-12 text-center"><MascotSticker variant="puzzled" decorative className="band-empty-sticker mascot-float" /><h3 className="mt-3 text-lg font-bold">{view === "review" ? "Bạn chưa đánh dấu từ nào đã học ở mục này" : "Chưa có từ vựng ở cấp này"}</h3><p className="mt-2 text-sm muted">{view === "review" ? "Hãy học và đánh dấu vài từ trước khi ôn lại nhé." : "Chọn cấp độ khác để tiếp tục học."}</p><button type="button" className="button-secondary mt-5" onClick={() => chooseView("list")}>Xem danh sách từ</button></div> : <section className="paper p-5 sm:p-8" aria-label={view === "review" ? "Ôn từ đã học" : "Học từ vựng"}>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="page-eyebrow">{view === "review" ? "ÔN TẬP" : "HỌC TỪ"}</p><h3 className="mt-2 text-xl font-bold">Từ {currentIndex + 1} / {studyRecords.length.toLocaleString("vi-VN")}</h3></div><span className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand)]">{levelNames.get(word.levelId) ?? word.levelId}</span></div>
      <div className="mt-5 rounded-2xl border border-[var(--brand-border)] bg-gradient-to-br from-white to-[var(--brand-soft)] p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[.13em] text-[var(--brand)]">Từ vựng</p>
        <h4 className="mt-3 text-4xl font-semibold text-[var(--brand)] sm:text-5xl" lang={script === "simplified" && word.simplified ? "zh-Hans" : "zh-Hant"}>{wordForm(word)}</h4>
        {script === "simplified" && !word.simplified && <p className="mt-2 text-sm muted">Nguồn chỉ có chữ Phồn thể cho từ này.</p>}
        <div className="mt-6 grid gap-4 border-t border-[var(--brand-border)] pt-5 text-sm sm:grid-cols-2">
          <div><p className="text-xs font-bold uppercase tracking-wide muted">Pinyin</p><p className="mt-1 text-base font-semibold">{word.pinyin || "Chưa có phiên âm"}</p></div>
          {word.meaningVi && <div><p className="text-xs font-bold uppercase tracking-wide muted">Nghĩa tiếng Việt</p><p className="mt-1 text-base font-semibold">{word.meaningVi}</p></div>}
          {word.partOfSpeech.raw && <div><p className="text-xs font-bold uppercase tracking-wide muted">Từ loại</p><p className="mt-1">{word.partOfSpeech.raw}</p></div>}
          {word.context && <div><p className="text-xs font-bold uppercase tracking-wide muted">Ngữ cảnh</p><p className="mt-1" lang="zh-Hant">{word.context}</p></div>}
        </div>
        {exampleForm(word) && word.exampleVi && <div className="mt-6 border-t border-[var(--brand-border)] pt-5"><p className="text-xs font-bold uppercase tracking-wide muted">Ví dụ</p><p className="mt-2 text-lg leading-8" lang={script === "simplified" ? "zh-Hans" : "zh-Hant"}>{exampleForm(word)}</p><p className="mt-4 text-xs font-bold uppercase tracking-wide muted">Dịch câu ví dụ</p><p className="mt-2 leading-7">{word.exampleVi}</p>{word.exampleSource?.kind === "tatoeba" && <a className="mt-3 inline-block text-xs muted underline underline-offset-2" href={`https://tatoeba.org/en/sentences/show/${word.exampleSource.id}`} target="_blank" rel="noopener noreferrer">Ví dụ từ Tatoeba · {word.exampleSource.author}</a>}</div>}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><button type="button" className="button-secondary" disabled={currentIndex === 0} onClick={() => setActiveIndex(currentIndex - 1)}>← Từ trước</button><button type="button" className="button-secondary" aria-pressed={learnedSet.has(word.id)} onClick={() => toggleLearned(word.id)}>{learnedSet.has(word.id) ? "✓ Đã học" : "Đánh dấu đã học"}</button><button type="button" className="button-primary" disabled={currentIndex === studyRecords.length - 1} onClick={() => setActiveIndex(currentIndex + 1)}>Từ sau →</button></div>
    </section>}
  </div>;
}

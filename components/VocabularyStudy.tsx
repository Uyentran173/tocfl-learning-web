"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { VocabularySet } from "@/lib/vocabulary";
import { addLearnedWord, learnedPoolChangedEvent, loadLearnedPool, mergeLegacyLearned, removeLearnedWord, saveLearnedPool, vocabularyIdFor } from "@/lib/learned-vocabulary";
import { fromStudyWord } from "@/lib/learned-vocabulary-adapters";
import MascotSticker from "./MascotSticker";

const storageKey = "tocfl-vocabulary-learned-v1";

export default function VocabularyStudy({ sets, kind, groups, initialSetId, showSetSelector = true }: { sets: VocabularySet[]; kind: "topic" | "textbook" | "band"; groups?: { id: string; label: string; setIds: string[] }[]; initialSetId?: string; showSetSelector?: boolean }) {
  const [selectedId, setSelectedId] = useState(initialSetId ?? sets[0].id);
  const [wordIndex, setWordIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [learned, setLearned] = useState<string[]>([]);
  const [poolIds, setPoolIds] = useState<string[]>([]);
  const [removedPoolIds, setRemovedPoolIds] = useState<string[]>([]);

  useEffect(() => {
    let timeout: number | undefined;
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
      if (Array.isArray(saved)) timeout = window.setTimeout(() => setLearned(saved.filter((item): item is string => typeof item === "string")), 0);
    } catch { /* Keep a fresh study list if saved data is unavailable. */ }
    return () => { if (timeout !== undefined) window.clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    const sync = () => { const pool = loadLearnedPool(window.localStorage); setPoolIds(pool.words.map((item) => item.vocabularyId)); setRemovedPoolIds(pool.removedIds); };
    sync();
    window.addEventListener(learnedPoolChangedEvent, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(learnedPoolChangedEvent, sync); window.removeEventListener("storage", sync); };
  }, []);

  useEffect(() => {
    if (!learned.length) return;
    const legacy = sets.flatMap((item) => item.words.flatMap((entry, index) => learned.includes(`${item.id}:${entry.hanzi}`) ? [fromStudyWord(entry, item.id, index, kind)] : []));
    if (legacy.length) saveLearnedPool(window.localStorage, mergeLegacyLearned(loadLearnedPool(window.localStorage), legacy));
  }, [learned, sets, kind]);

  const set = sets.find((item) => item.id === selectedId) ?? sets[0];
  const word = set.words[wordIndex];
  const wordKey = word ? set.id + ":" + word.hanzi : "";
  const wordPoolId = word ? vocabularyIdFor(word.traditional ?? word.hanzi, word.pinyin) : "";
  const isLearned = !removedPoolIds.includes(wordPoolId) && (learned.includes(wordKey) || poolIds.includes(wordPoolId));
  const learnedCount = set.words.filter((item) => { const id = vocabularyIdFor(item.traditional ?? item.hanzi, item.pinyin); return !removedPoolIds.includes(id) && (learned.includes(set.id + ":" + item.hanzi) || poolIds.includes(id)); }).length;

  function chooseSet(id: string) {
    setSelectedId(id);
    setWordIndex(0);
    setRevealed(false);
  }
  function move(offset: number) {
    setWordIndex((current) => Math.max(0, Math.min(set.words.length - 1, current + offset)));
    setRevealed(false);
  }
  function toggleLearned() {
    if (!word) return;
    const next = isLearned ? learned.filter((item) => item !== wordKey) : [...learned, wordKey];
    setLearned(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    const pool = loadLearnedPool(window.localStorage);
    saveLearnedPool(window.localStorage, isLearned ? removeLearnedWord(pool, wordPoolId) : addLearnedWord(pool, fromStudyWord(word, set.id, wordIndex, kind)));
  }
  const setButton = (item: VocabularySet, index: number) => <button key={item.id} type="button" onClick={() => chooseSet(item.id)} aria-pressed={item.id === set.id} className="study-set-button">
    <span className="study-set-index">{String(index + 1).padStart(2, "0")}</span>
    <span><strong>{item.title}</strong><small>{item.subtitle}</small></span>
  </button>;

  return <div className={showSetSelector ? "grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]" : ""}>
    {showSetSelector && <aside className="paper h-fit p-5">
      <p className="mb-4 text-xs font-bold uppercase tracking-[.15em] text-[var(--brand)]">{kind === "topic" ? "Chọn ngữ cảnh" : kind === "band" ? "Chọn Band TOCFL" : "Chọn bài học"}</p>
      <div className="space-y-2">
        {groups ? groups.map((group) => <div key={group.id}><p className="px-3 pb-1 pt-3 text-xs font-semibold text-[var(--muted)]">{group.label}</p>{sets.filter((item) => group.setIds.includes(item.id)).map((item) => setButton(item, sets.indexOf(item)))}</div>) : sets.map(setButton)}
      </div>
    </aside>}
    <section className="paper p-5 sm:p-8" aria-labelledby="study-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-[var(--brand)]">{kind === "topic" ? "Học theo ngữ cảnh" : kind === "band" ? "Học theo Band TOCFL" : "Học theo giáo trình"}</p>
          <h2 id="study-title" className="mt-2 text-2xl font-bold">{set.title}</h2>
          <p className="mt-1 text-sm muted">{set.subtitle}</p>
          {word?.sourceLabel && <p className="mt-2 text-xs muted">Nguồn: {word.sourceLabel}{word.levelLabel ? ` · ${word.levelLabel}` : ""}</p>}
        </div>
        <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand)]">{learnedCount}/{set.words.length} đã thuộc</span>
      </div>
      <div role="progressbar" aria-label="Tiến độ từ vựng" aria-valuemin={0} aria-valuemax={set.words.length} aria-valuenow={learnedCount} className="study-progress mt-6"><span style={{ width: (set.words.length ? learnedCount / set.words.length * 100 : 0) + "%" }} /></div>
      {word ? <><p className="mt-6 text-sm font-semibold muted">Thẻ {wordIndex + 1} / {set.words.length}</p>
      <button type="button" className="study-flashcard" onClick={() => setRevealed((value) => !value)} aria-expanded={revealed} aria-label={revealed ? "Ẩn nghĩa của từ" : "Hiện nghĩa của từ"}>
        <span className="study-flashcard-hanzi" lang={word.scriptLang ?? "zh-Hant"}>{word.hanzi}</span>
        {revealed ? <span className="study-flashcard-answer"><strong>{word.pinyin}</strong><span>{word.meaning}</span>{word.wordClass && <small>Từ loại: {word.wordClass}</small>}<span lang={word.scriptLang ?? "zh-Hant"}>{word.example}</span><small>{word.translation}</small>{word.exampleSource?.kind === "tatoeba" && <small>Ví dụ: Tatoeba · {word.exampleSource.author}</small>}</span> : <span className="study-flashcard-hint">Chạm để xem phiên âm, nghĩa và ví dụ ✨</span>}
      </button>
      {revealed && word.exampleSource?.kind === "tatoeba" && <a className="mt-2 inline-block text-xs muted underline underline-offset-2" href={`https://tatoeba.org/en/sentences/show/${word.exampleSource.id}`} target="_blank" rel="noopener noreferrer">Xem câu gốc trên Tatoeba</a>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="button-secondary" disabled={wordIndex === 0} onClick={() => move(-1)}>← Từ trước</button>
        <button type="button" className="button-secondary" aria-pressed={isLearned} onClick={toggleLearned}>{isLearned ? "✓ Đã thuộc" : "Đánh dấu đã thuộc"}</button>
        <button type="button" className="button-primary" disabled={wordIndex === set.words.length - 1} onClick={() => move(1)}>Từ sau →</button>
      </div>{learnedCount >= 2 && <div className="mt-6 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-4"><p className="text-sm font-semibold text-[var(--brand)]">Học từ → Bài khóa → Bài tập → Trò chơi → Ôn lại</p><Link href={`/vocabulary/practice?focus=${encodeURIComponent(set.id)}`} className="mt-3 inline-block text-sm font-semibold text-[var(--brand)] underline underline-offset-4">Bài khóa từ các từ đã học →</Link></div>}</> : <div className="mt-7 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)] px-6 py-10 text-center"><MascotSticker variant="puzzled" decorative className="band-empty-sticker mascot-float" /><p className="text-lg font-semibold text-[var(--brand)]">Chưa có bài học ở cấp độ này</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 muted">Bạn có thể chọn cấp độ khác để tiếp tục học.</p></div>}
    </section>
  </div>;
}

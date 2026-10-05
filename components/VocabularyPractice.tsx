"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { emptyLearnedPool, learnedPoolChangedEvent, loadLearnedPool, mergeLegacyLearned, recordVocabularyAnswer, reviewPriority, saveLearnedPool, type LearnedVocabularyPool, type VocabularyScript } from "@/lib/learned-vocabulary";
import { buildGameQuestions, buildLesson, buildPracticeQuestions, createPairRound, focusWords, pairArrangement, questionArrangement, randomizeQuestions, wordForm, type PracticeLesson, type PracticeQuestion } from "@/lib/vocabulary-practice";

type Game = "pairs" | "quick" | "fill" | "order" | "memory";
type Mode = "lesson" | "exercise" | "game" | "review" | "summary";
type Summary = { correct: number; wrong: number; ids: string[]; goodIds: string[]; weakIds: string[]; origin: "exercise" | "game" | "review" };
const gameNames: Record<Game, string> = { pairs: "Ghép cặp", quick: "Chọn nhanh", fill: "Điền từ", order: "Xếp câu", memory: "Memory cards" };
const sourceNames = { tocfl: "TOCFL", textbook: "Giáo trình", website: "Kho từ website" };

function safeOldList(key: string): string[] {
  try { const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]"); return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; } catch { return []; }
}

function HighlightedLine({ line, lesson, script }: { line: string; lesson: PracticeLesson; script: VocabularyScript }) {
  const forms = lesson.words.map((word) => ({ word, text: wordForm(word, script) })).filter((item) => item.text).sort((a, b) => b.text.length - a.text.length);
  const parts: { text: string; id?: string }[] = [];
  for (let index = 0; index < line.length;) {
    const match = forms.find((item) => line.startsWith(item.text, index));
    if (match) { parts.push({ text: match.text, id: match.word.vocabularyId }); index += match.text.length; }
    else { const last = parts.at(-1); if (last && !last.id) last.text += line[index]; else parts.push({ text: line[index] }); index++; }
  }
  return <span lang={script === "simplified" ? "zh-Hans" : "zh-Hant"}>{parts.map((part, index) => part.id ? <mark key={index} className="rounded bg-[#dfe8ff] px-0.5 text-[var(--brand)]">{part.text}</mark> : <span key={index}>{part.text}</span>)}</span>;
}

function LessonComprehension({ question }: { question: PracticeQuestion }) {
  const [choices] = useState(() => randomizeQuestions([question])[0].choices);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  return <div className="mt-7 rounded-xl border border-[var(--brand-border)] p-4"><h3 className="font-bold">Kiểm tra hiểu bài</h3><p className="mt-2 text-sm">{question.prompt}</p><div className="mt-3 flex flex-wrap gap-2">{choices?.map((choice) => <button key={choice} type="button" disabled={checked} aria-pressed={selected === choice} className={selected === choice ? "button-primary" : "button-secondary"} onClick={() => setSelected(choice)}>{choice}</button>)}</div>{selected && !checked && <button type="button" className="mt-3 text-sm font-semibold text-[var(--brand)] underline" onClick={() => setChecked(true)}>Kiểm tra</button>}{checked && <p className="mt-3 text-sm" role="status">{selected === question.answer ? "✓ Chính xác." : `Chưa đúng. Đáp án: ${question.answer}.`} {question.explanation}</p>}</div>;
}

function QuestionSession({ questions, timed, previousArrangement, onArrangement, onAnswer, onDone }: { questions: PracticeQuestion[]; timed: boolean; previousArrangement?: string; onArrangement?: (value: string) => void; onAnswer: (id: string, correct: boolean) => void; onDone: (summary: Summary) => void }) {
  const [roundQuestions] = useState(() => randomizeQuestions(questions, Math.random, previousArrangement));
  useEffect(() => { onArrangement?.(questionArrangement(roundQuestions)); }, [onArrangement, roundQuestions]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [remaining, setRemaining] = useState(12);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);
  const question = roundQuestions?.[index];
  useEffect(() => {
    if (!timed || submitted || !question) return;
    const timer = window.setTimeout(() => { if (remaining <= 1) submit(""); else setRemaining(remaining - 1); }, 1000);
    return () => window.clearTimeout(timer);
  });
  function submit(value?: string) {
    if (submitted || !question) return;
    const answerValue = value ?? (question.type === "ordering" ? order.join("") : selected ?? "");
    const correct = answerValue === question.answer;
    setSubmitted(true);
    setResults((current) => [...current, { id: question.vocabularyId, correct }]);
    onAnswer(question.vocabularyId, correct);
  }
  function next() {
    if (index + 1 === roundQuestions?.length) {
      onDone({ correct: results.filter((item) => item.correct).length, wrong: results.filter((item) => !item.correct).length,
        ids: [...new Set(results.map((item) => item.id))], goodIds: [...new Set(results.filter((item) => item.correct).map((item) => item.id))],
        weakIds: [...new Set(results.filter((item) => !item.correct).map((item) => item.id))], origin: timed ? "game" : "exercise" });
    } else { setIndex(index + 1); setSelected(null); setOrder([]); setSubmitted(false); setRemaining(12); }
  }
  if (!question) return <p>Chưa có câu hỏi phù hợp với các từ đã học.</p>;
  return <section className="paper p-5 sm:p-8" aria-live="polite">
    <div className="flex items-center justify-between gap-3"><p className="page-eyebrow">{timed ? "CHỌN NHANH" : "BÀI TẬP"} · {index + 1}/{roundQuestions.length}</p>{timed && <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 font-bold text-[var(--brand)]">⏱ {remaining}s</span>}</div>
    <h2 className="mt-5 text-xl font-bold leading-8">{question.prompt}</h2>
    {question.type === "ordering" ? <><div className="mt-5 min-h-14 rounded-xl border border-dashed border-[var(--brand-border)] p-3 text-xl" lang="zh">{order.join("") || "Chạm các phần theo đúng thứ tự"}</div><div className="mt-4 flex flex-wrap gap-2">{question.choices.map((part, partIndex) => <button key={partIndex} type="button" disabled={submitted || order.includes(part)} className="button-secondary" onClick={() => setOrder((current) => [...current, part])}>{part}</button>)}</div><button type="button" className="mt-3 text-sm text-[var(--brand)] underline" disabled={submitted} onClick={() => setOrder([])}>Xếp lại</button></>
      : <div className="mt-5 grid gap-3 sm:grid-cols-2">{question.choices.map((choice, choiceIndex) => <button key={`${choiceIndex}:${choice}`} type="button" className={`rounded-xl border p-4 text-left text-base leading-7 ${selected === choice ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--border)] bg-white"}`} aria-pressed={selected === choice} disabled={submitted} onClick={() => setSelected(choice)}>{choice}</button>)}</div>}
    {!submitted ? <button type="button" className="button-primary mt-6" disabled={question.type === "ordering" ? order.length !== question.choices.length : !selected} onClick={() => submit()}>Kiểm tra</button> : <div className="mt-6 rounded-xl bg-[var(--brand-soft)] p-4"><p className="font-bold text-[var(--brand)]">{results.at(-1)?.correct ? "✓ Chính xác" : `Chưa đúng · Đáp án: ${question.answer}`}</p><p className="mt-2 text-sm leading-6">{question.explanation}</p><button type="button" className="button-primary mt-4" onClick={next}>{index + 1 === roundQuestions.length ? "Xem kết quả" : "Câu tiếp theo →"}</button></div>}
  </section>;
}

function PairGame({ lesson, script, memory, previousArrangement, onArrangement, onAnswer, onDone }: { lesson: PracticeLesson; script: VocabularyScript; memory: boolean; previousArrangement?: string; onArrangement: (value: string) => void; onAnswer: (id: string, correct: boolean) => void; onDone: (summary: Summary) => void }) {
  const words = lesson.words.slice(0, 5);
  const [round] = useState(() => createPairRound(words, script, Math.random, previousArrangement, memory));
  useEffect(() => { onArrangement(pairArrangement(round, memory)); }, [onArrangement, round, memory]);
  const [left, setLeft] = useState<string | null>(null);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [weakIds, setWeakIds] = useState<string[]>([]);
  const cards = round.memory;
  function selectCard(key: string) {
    if (matched.includes(key) || open.includes(key)) return;
    const next = [...open, key]; setOpen(next);
    if (next.length !== 2) return;
    const first = cards.find((card) => card.key === next[0]); const second = cards.find((card) => card.key === next[1]);
    const success = first?.id === second?.id && first?.side !== second?.side;
    if (success && first) { onAnswer(first.id, true); setCorrect((count) => count + 1); setMatched((items) => [...items, ...next]); window.setTimeout(() => setOpen([]), 350); }
    else { if (first) { onAnswer(first.id, false); setWeakIds((ids) => [...new Set([...ids, first.id])]); } setWrong((count) => count + 1); window.setTimeout(() => setOpen([]), 850); }
  }
  function selectMeaning(id: string) {
    if (!left || matched.includes(id)) return;
    const success = left === id; onAnswer(left, success);
    if (success) { setCorrect((count) => count + 1); setMatched((items) => [...items, id]); setLeft(null); }
    else { setWrong((count) => count + 1); setWeakIds((ids) => [...new Set([...ids, left])]); setLeft(null); }
  }
  const complete = matched.length === (memory ? words.length * 2 : words.length);
  return <section className="paper p-5 sm:p-8"><p className="page-eyebrow">LUYỆN BẰNG TRÒ CHƠI</p><h2 className="mt-2 text-2xl font-bold">{memory ? "Memory cards" : "Ghép cặp"} 🧩</h2><p className="mt-2 text-sm muted">Ghép chữ Hán với nghĩa tiếng Việt từ kho từ bạn đã học.</p>
    {memory ? <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">{cards.map((card) => <button key={card.key} type="button" disabled={matched.includes(card.key) || open.length === 2} onClick={() => selectCard(card.key)} className="min-h-24 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-3 font-semibold text-[var(--brand)]">{matched.includes(card.key) ? "✓" : open.includes(card.key) ? card.text : "✦"}</button>)}</div> : <div className="mt-6 grid grid-cols-2 gap-3">{(["zh", "vi"] as const).map((side) => <div key={side} className="grid gap-2">{(side === "zh" ? round.chinese : round.vietnamese).map((word) => <button key={`${side}:${word.vocabularyId}`} type="button" disabled={matched.includes(word.vocabularyId)} aria-pressed={side === "zh" && left === word.vocabularyId} onClick={() => side === "zh" ? setLeft(word.vocabularyId) : selectMeaning(word.vocabularyId)} className={`min-h-16 rounded-xl border p-3 text-center ${side === "zh" && left === word.vocabularyId ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border)] bg-white"}`}>{matched.includes(word.vocabularyId) ? "✓" : side === "zh" ? wordForm(word, script) : word.meaningVi}</button>)}</div>)}</div>}
    <p className="mt-5 text-sm muted">Đúng: {correct} · Sai: {wrong}</p>{complete && <button type="button" className="button-primary mt-4" onClick={() => onDone({ correct, wrong, ids: words.map((word) => word.vocabularyId), goodIds: words.filter((word) => !weakIds.includes(word.vocabularyId)).map((word) => word.vocabularyId), weakIds, origin: "game" })}>Xem kết quả</button>}
  </section>;
}

export default function VocabularyPractice({ focus }: { focus: string | null }) {
  const [pool, setPool] = useState<LearnedVocabularyPool | null>(null);
  const [script, setScript] = useState<VocabularyScript>(focus?.includes(":simplified:") ? "simplified" : "traditional");
  const [mode, setMode] = useState<Mode>("lesson");
  const [game, setGame] = useState<Game>("pairs");
  const [gameRound, setGameRound] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [translationOpen, setTranslationOpen] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [migrationError, setMigrationError] = useState("");
  const [previousGameArrangements, setPreviousGameArrangements] = useState<Record<string, string>>({});
  useEffect(() => {
    const sync = () => setPool(loadLearnedPool(window.localStorage));
    sync(); window.addEventListener(learnedPoolChangedEvent, sync); window.addEventListener("storage", sync);
    const bandIds = safeOldList("tocfl-band-vocabulary-progress-v1"); const setKeys = safeOldList("tocfl-vocabulary-learned-v1");
    if (bandIds.length || setKeys.length) void fetch("/api/vocabulary/learned/resolve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bandIds, setKeys }) })
      .then(async (response) => { if (!response.ok) throw new Error("Không chuyển được tiến độ cũ."); return response.json() as Promise<{ words: Parameters<typeof mergeLegacyLearned>[1] }> })
      .then((result) => saveLearnedPool(window.localStorage, mergeLegacyLearned(loadLearnedPool(window.localStorage), result.words)))
      .catch(() => setMigrationError("Chưa chuyển được một phần tiến độ cũ. Hãy thử tải lại trang."));
    return () => { window.removeEventListener(learnedPoolChangedEvent, sync); window.removeEventListener("storage", sync); };
  }, []);
  const words = pool?.words ?? emptyLearnedPool().words;
  const activeWords = useMemo(() => focusWords(words, focus), [words, focus]);
  const lesson = useMemo(() => buildLesson(words, script, lessonIndex, focus), [words, script, lessonIndex, focus]);
  const questions = useMemo(() => lesson ? buildPracticeQuestions(lesson, script, words) : [], [lesson, script, words]);
  const gameLesson = useMemo<PracticeLesson | null>(() => {
    const selected = [...activeWords].filter((word) => word.meaningVi.trim()).sort((a, b) => Date.parse(b.learnedAt) - Date.parse(a.learnedAt)).slice(0, 8);
    return selected.length ? { id: selected.map((word) => word.vocabularyId).join("|"), title: "Trò chơi từ đã học", kind: "game", lines: [], words: selected, recentCount: selected.length, supporting: [] } : null;
  }, [activeWords]);
  const gameQuestions = useMemo(() => {
    if (game !== "quick" && game !== "fill" && game !== "order") return [];
    const source = game === "quick" ? gameLesson : lesson;
    return source ? buildGameQuestions(source, script, words, game) : [];
  }, [gameLesson, lesson, script, words, game]);
  const gameArrangementKey = `${game}:${script}:${game === "quick" || game === "pairs" || game === "memory" ? gameLesson?.id : lesson?.id}`;
  const weak = useMemo(() => [...words].sort((a, b) => reviewPriority(b) - reviewPriority(a)).slice(0, 8), [words]);
  const reviewQuestions: PracticeQuestion[] = weak.flatMap((word, index) => {
    const choices = [...new Set([word.meaningVi, ...words.filter((other) => other.vocabularyId !== word.vocabularyId).map((other) => other.meaningVi)])].filter(Boolean).slice(0, 4);
    return choices.length < 2 ? [] : [{ id: `review:${word.vocabularyId}`, type: "meaning", vocabularyId: word.vocabularyId, prompt: `${wordForm(word, script)} có nghĩa là gì?`, choices: [...choices.slice(index % choices.length), ...choices.slice(0, index % choices.length)], answer: word.meaningVi, explanation: `${wordForm(word, script)}: ${word.meaningVi}.` }];
  });
  function answer(id: string, correct: boolean) { saveLearnedPool(window.localStorage, recordVocabularyAnswer(loadLearnedPool(window.localStorage), id, correct)); }
  function anotherLesson() { setLessonIndex((current) => current + 1); setTranslationOpen(false); setMode("lesson"); }
  function startGame(next: Game) { setGame(next); setGameRound((current) => current + 1); setMode("game"); }
  if (!pool) return <div className="paper p-8" role="status">Đang tải từ đã học…</div>;
  return <div className="space-y-6">
    {migrationError && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{migrationError}</p>}
    <div className="paper flex flex-wrap items-center justify-between gap-4 p-5 sm:p-7"><div><p className="page-eyebrow">KHO TỪ ĐÃ HỌC</p><p className="mt-2 text-2xl font-bold">{words.length} từ từ cả ba lối học</p><p className="mt-1 text-sm muted">Đánh dấu “Đã học” để thêm từ; mức độ vững được cập nhật qua câu trả lời.</p></div><div className="flex gap-2"><button type="button" className={`button-secondary ${script === "traditional" ? "bg-[var(--brand-soft)]" : ""}`} aria-pressed={script === "traditional"} onClick={() => setScript("traditional")}>Phồn thể</button><button type="button" className={`button-secondary ${script === "simplified" ? "bg-[var(--brand-soft)]" : ""}`} aria-pressed={script === "simplified"} onClick={() => setScript("simplified")}>Giản thể</button></div></div>
    {activeWords.length < 2 ? <div className="paper p-8 text-center"><h2 className="text-xl font-bold">Hãy học thêm vài từ cùng chủ đề nhé</h2><p className="mt-2 muted">Đánh dấu ít nhất hai từ trong lối học này để mở bài khóa và trò chơi.</p><Link href="/vocabulary" className="button-primary mt-5 inline-block">Quay lại học từ</Link></div> : <>
      <nav className="flex flex-wrap gap-2" aria-label="Luyện từ đã học"><button type="button" className={mode === "lesson" ? "button-primary" : "button-secondary"} onClick={() => setMode("lesson")}>Bài khóa</button><button type="button" className={mode === "exercise" ? "button-primary" : "button-secondary"} onClick={() => setMode("exercise")}>Bài tập</button><button type="button" className={mode === "game" ? "button-primary" : "button-secondary"} onClick={() => startGame(game)}>Luyện bằng trò chơi</button><button type="button" className={mode === "review" ? "button-primary" : "button-secondary"} onClick={() => setMode("review")}>Ôn từ đã học</button></nav>
      {mode === "lesson" && (lesson ? <section className="paper p-5 sm:p-8"><p className="page-eyebrow">BÀI KHÓA · {lesson.kind}</p><h2 className="mt-2 text-2xl font-bold">{lesson.title}</h2><p className="mt-2 text-sm muted">Đã sử dụng {lesson.words.length}/{lesson.recentCount} từ bạn vừa học. Bài khóa diễn ra trong một tình huống gần gũi, dùng những từ phù hợp trong kho của bạn.</p><div className="mt-6 space-y-4">{lesson.lines.map((line, lineIndex) => <div key={lineIndex} className="rounded-xl border border-[var(--border)] p-4 text-lg leading-9"><HighlightedLine line={line.chinese} lesson={lesson} script={script} />{translationOpen && <p className="mt-2 border-t border-[var(--border)] pt-2 text-sm leading-7 muted">{line.vietnamese}</p>}</div>)}</div><button type="button" className="button-secondary mt-5" aria-expanded={translationOpen} onClick={() => setTranslationOpen((open) => !open)}>{translationOpen ? "Ẩn bản dịch" : "Xem bản dịch tiếng Việt"}</button>{lesson.comprehension && <LessonComprehension key={lesson.id} question={lesson.comprehension} />}<h3 className="mt-7 font-bold">Từ đã học dùng trong bài</h3><div className="mt-3 flex flex-wrap gap-2">{lesson.words.map((word) => <span key={word.vocabularyId} className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-sm text-[var(--brand)]">{wordForm(word, script)} · {word.meaningVi} <small>({word.sources.map((source) => sourceNames[source]).join(" / ")})</small></span>)}</div><h3 className="mt-6 font-bold">Từ mới trong bài</h3><p className="mt-2 text-sm muted">{lesson.supporting.length ? lesson.supporting.map((item) => `${item.chinese}${item.vietnamese ? ` · ${item.vietnamese}` : ""}`).join(" · ") : "Không có từ hỗ trợ riêng trong bài này."}</p><div className="mt-7 flex flex-wrap gap-3"><button type="button" className="button-primary" disabled={!questions.length} onClick={() => setMode("exercise")}>Làm bài tập →</button><button type="button" className="button-secondary" onClick={anotherLesson}>Bài khóa khác</button></div></section> : <div className="paper p-8"><p>Chưa có tình huống bài khóa phù hợp với nhóm từ đã học này. Hãy học thêm vài từ cùng chủ đề; bạn vẫn có thể ôn nghĩa bằng trò chơi.</p><button className="button-secondary mt-4" onClick={() => setMode("review")}>Ôn từ đã học</button></div>)}
      {mode === "exercise" && (questions.length ? <><p className="text-sm muted">Bài tập theo “{lesson?.title}”. Từ hỗ trợ trong bài: {lesson?.supporting.length ? lesson.supporting.map((item) => `${item.chinese}${item.vietnamese ? ` (${item.vietnamese})` : ""}`).join(", ") : "không có"}.</p><QuestionSession key={`ex:${lesson?.id}`} questions={questions} timed={false} onAnswer={answer} onDone={(result) => { setSummary(result); setMode("summary"); }} /></> : <div className="paper p-8">Cần một bài khóa phù hợp để tạo bài tập theo ngữ cảnh.</div>)}
      {mode === "game" && <><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{(Object.keys(gameNames) as Game[]).map((item) => <button type="button" key={item} className={`rounded-xl border p-4 font-bold ${game === item ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--border)] bg-white"}`} onClick={() => startGame(item)}>{gameNames[item]}</button>)}</div><button type="button" className="text-sm font-semibold text-[var(--brand)] underline" onClick={() => startGame(game)}>Chơi ván mới ↻</button>{(game === "fill" || game === "order") && lesson && <p className="text-sm muted">Câu lấy từ bài khóa “{lesson.title}”. Từ hỗ trợ: {lesson.supporting.length ? lesson.supporting.map((item) => `${item.chinese}${item.vietnamese ? ` (${item.vietnamese})` : ""}`).join(", ") : "không có"}.</p>}{gameLesson && (game === "pairs" || game === "memory") && gameLesson.words.length >= 2 ? <PairGame key={`${game}:${gameLesson.id}:${script}:${gameRound}`} lesson={gameLesson} script={script} memory={game === "memory"} previousArrangement={previousGameArrangements[gameArrangementKey]} onArrangement={(value) => setPreviousGameArrangements((current) => current[gameArrangementKey] === value ? current : { ...current, [gameArrangementKey]: value })} onAnswer={answer} onDone={(result) => { setSummary(result); setMode("summary"); }} /> : (game === "pairs" || game === "memory") ? <div className="paper p-8">Cần ít nhất hai từ đã học có nghĩa tiếng Việt để chơi.</div> : <QuestionSession key={`${game}:${game === "quick" ? gameLesson?.id : lesson?.id}:${script}:${gameRound}`} questions={gameQuestions} timed={game === "quick"} previousArrangement={previousGameArrangements[gameArrangementKey]} onArrangement={(value) => setPreviousGameArrangements((current) => current[gameArrangementKey] === value ? current : { ...current, [gameArrangementKey]: value })} onAnswer={answer} onDone={(result) => { setSummary({ ...result, origin: "game" }); setMode("summary"); }} />}</>}
      {mode === "review" && <><section className="paper p-5 sm:p-8"><p className="page-eyebrow">ÔN TỪ ĐÃ HỌC</p><h2 className="mt-2 text-2xl font-bold">Ưu tiên từ cần ôn lại</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{weak.map((word) => <div key={word.vocabularyId} className="rounded-xl border border-[var(--border)] p-4"><span className="text-xl font-bold text-[var(--brand)]">{wordForm(word, script)}</span><span className="ml-2 text-sm muted">{word.meaningVi}</span><p className="mt-2 text-xs muted">{word.masteryStatus} · Đúng {word.correctCount} · Sai {word.wrongCount} · {sourceNames[word.source]}</p></div>)}</div></section>{reviewQuestions.length > 0 && <QuestionSession key={`review:${script}`} questions={reviewQuestions} timed={false} onAnswer={answer} onDone={(result) => { setSummary({ ...result, origin: "review" }); setMode("summary"); }} />}</>}
      {mode === "summary" && summary && <section className="paper p-6 sm:p-9"><p className="page-eyebrow">KẾT QUẢ BUỔI LUYỆN</p><h2 className="mt-2 text-2xl font-bold">Bạn đã luyện {summary.ids.length} từ ✨</h2><p className="mt-4 text-lg">Đúng <strong className="text-[var(--brand)]">{summary.correct}</strong> · Sai <strong>{summary.wrong}</strong></p><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-emerald-50 p-4"><h3 className="font-bold">Từ làm tốt</h3><p className="mt-2 text-sm leading-7">{words.filter((word) => summary.goodIds.includes(word.vocabularyId) && !summary.weakIds.includes(word.vocabularyId)).map((word) => wordForm(word, script)).join(" · ") || "Chưa có từ trả lời đúng trọn vẹn trong lượt này."}</p></div><div className="rounded-xl bg-amber-50 p-4"><h3 className="font-bold">Từ cần ôn lại</h3><p className="mt-2 text-sm leading-7">{words.filter((word) => summary.weakIds.includes(word.vocabularyId) || (summary.ids.includes(word.vocabularyId) && word.masteryStatus === "Cần ôn lại")).map((word) => wordForm(word, script)).join(" · ") || "Chưa có từ nào cần ôn lại trong lượt này."}</p></div></div><div className="mt-7 flex flex-wrap gap-3"><button type="button" className="button-primary" onClick={() => setMode("review")}>Ôn lại từ chưa chắc</button><button type="button" className="button-secondary" onClick={anotherLesson}>Làm bài khóa khác</button><button type="button" className="button-secondary" onClick={() => startGame(game)}>Chơi tiếp</button><Link href="/vocabulary" className="button-secondary">Quay lại học từ</Link></div></section>}
    </>}
  </div>;
}

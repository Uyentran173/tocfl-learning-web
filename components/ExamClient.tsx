"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scriptQuery, type MockTest } from "@/lib/tests";
import { completeListeningIntro, enterPracticeSection, ensurePracticeTiming, isPracticeListeningIntroPending, nextAvailablePracticeSection, PRACTICE_SECTION_SECONDS, readSession, saveSession, secondsLeft, startSession, submitSession, type ExamSession } from "@/lib/session";
import { ChoiceList, formatTime, QuestionContent, QuestionNavigator } from "./ExamParts";
import { SimulationExam, SimulationExamShell } from "./SimulationExam";
import ListeningIntroStep from "./ListeningIntroStep";
import { PracticeAnnotationProvider } from "./PracticeAnnotations";
import SubmitModal from "./SubmitModal";
import { useExamImagePreload } from "./useExamImagePreload";

export default function ExamClient({ test }: { test: MockTest }) {
  const router = useRouter();
  const [session, setSession] = useState<ExamSession | null>(null);
  const sessionRef = useRef<ExamSession | null>(null);
  const [remaining, setRemaining] = useState(PRACTICE_SECTION_SECONDS);
  const [sectionNotice, setSectionNotice] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showIntro, setShowIntro] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioIndexRef = useRef(-1);
  const audioTokenRef = useRef(0);
  const audioDelayRef = useRef<number | null>(null);
  const listeningPhaseRef = useRef<"idle" | "playing" | "answering" | "advancing" | "blocked">("idle");
  const lastAdvanceAtRef = useRef(0);
  const advanceListeningRef = useRef<() => void>(() => {});
  const visibleIndex = session?.currentIndex ?? 0;
  const questionAssetsReady = useExamImagePreload(test.questions, visibleIndex);

  const update = useCallback((next: ExamSession) => { sessionRef.current = next; setSession(next); saveSession(next); }, []);
  const stopListeningAudio = useCallback(() => {
    audioTokenRef.current++;
    if (audioDelayRef.current !== null) window.clearTimeout(audioDelayRef.current);
    audioDelayRef.current = null;
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.onended = null; audio.onerror = null; }
    audioIndexRef.current = -1;
  }, []);
  const startListeningAudio = useCallback((nextIndex: number, immediate = false) => {
    const question = test.questions[nextIndex];
    if (!question || question.section !== "listening") return;
    stopListeningAudio();
    audioIndexRef.current = nextIndex;
    const token = audioTokenRef.current;
    listeningPhaseRef.current = "playing";
    setAudioBlocked(false);
    const sequence = question.simulationAudioSequence?.length ? question.simulationAudioSequence : [question.introAudioUrl, question.audioUrl].filter((path): path is string => Boolean(path));
    if (!sequence.length) { listeningPhaseRef.current = "blocked"; setAudioBlocked(true); return; }
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.volume = volume;
    let trackIndex = 0;
    audio.src = sequence[trackIndex];
    audio.onended = () => {
      if (token !== audioTokenRef.current) return;
      if (trackIndex + 1 < sequence.length) {
        trackIndex++;
        audio.src = sequence[trackIndex];
        void audio.play().catch(() => { listeningPhaseRef.current = "blocked"; setAudioBlocked(true); });
      } else {
        listeningPhaseRef.current = "answering";
        advanceListeningRef.current();
      }
    };
    audio.onerror = () => { if (token === audioTokenRef.current) { listeningPhaseRef.current = "blocked"; setAudioBlocked(true); } };
    const play = () => {
      audioDelayRef.current = null;
      if (token !== audioTokenRef.current) return;
      void audioRef.current?.play().catch(() => {
        if (token === audioTokenRef.current) { listeningPhaseRef.current = "blocked"; setAudioBlocked(true); }
      });
    };
    if (immediate) play();
    else audioDelayRef.current = window.setTimeout(play, 1800);
  }, [stopListeningAudio, test.questions, volume]);
  const advanceListening = useCallback(() => {
    const current = sessionRef.current;
    if (!current || current.mode !== "simulation" || current.status !== "in-progress" || test.questions[current.currentIndex]?.section !== "listening") return;
    if (listeningPhaseRef.current === "advancing" || Date.now() - lastAdvanceAtRef.current < 450) return;
    lastAdvanceAtRef.current = Date.now();
    listeningPhaseRef.current = "advancing";
    stopListeningAudio();
    const nextIndex = current.currentIndex + 1;
    if (nextIndex >= test.questions.length) { setConfirmOpen(true); return; }
    update({ ...current, currentIndex: nextIndex, sectionCompleted: test.questions[nextIndex].section === "reading" ? { ...current.sectionCompleted, listening: true } : current.sectionCompleted });
    document.querySelector(".sim-scroll-region")?.scrollTo({ top: 0 });
    if (test.questions[nextIndex].section === "listening") startListeningAudio(nextIndex);
  }, [startListeningAudio, stopListeningAudio, test.questions, update]);
  useEffect(() => { advanceListeningRef.current = advanceListening; }, [advanceListening]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  useEffect(() => {
    if (session?.mode === "simulation" && session.status === "in-progress" && session.listeningIntroCompleted !== false && test.questions[session.currentIndex]?.section === "listening" && audioIndexRef.current !== session.currentIndex) startListeningAudio(session.currentIndex);
  }, [session?.mode, session?.status, session?.currentIndex, session?.listeningIntroCompleted, startListeningAudio, test.questions]);
  useEffect(() => () => { stopListeningAudio(); }, [stopListeningAudio]);
  function finish() {
    const current = sessionRef.current;
    if (!current || current.status === "submitted") return;
    stopListeningAudio();
    update(submitSession(test, current));
    if (document.fullscreenElement) void document.exitFullscreen();
    router.replace(`/tocfl/${test.id}/result${scriptQuery(test)}`);
  }
  useEffect(() => {
    const saved = readSession(test.id);
    const pendingIntro = window.sessionStorage.getItem(`tocfl-simulation-intro:${test.id}`) === "1";
    let initialDisplay: number | undefined;
    if (saved && ((saved.scope ?? "full") !== (test.scope ?? "full") || saved.script !== test.script) && !pendingIntro) {
      router.replace(`/tocfl/${test.id}/instructions`);
      return;
    }
    if (pendingIntro || (saved?.status === "in-progress" && saved.mode === "simulation" && test.questions[saved.currentIndex]?.section === "listening")) {
      initialDisplay = window.setTimeout(() => setShowIntro(true), 0);
    } else {
      if (!saved) { router.replace(`/tocfl/${test.id}/instructions`); return; }
      if (saved.status === "submitted") { router.replace(`/tocfl/${test.id}/result${scriptQuery(test)}`); return; }
      let active = ensurePracticeTiming(test, saved);
      const untimedListening = active.mode === "simulation" && !active.readingStarted;
      let left = untimedListening ? 0 : secondsLeft(active);
      if (left === 0 && active.mode !== "simulation") {
        const next = nextAvailablePracticeSection(test, active);
        if (next) {
          active = next;
          saveSession(active);
          left = active.remainingSeconds;
        }
      }
      if (!untimedListening && left === 0) {
        const finished = submitSession(test, active);
        sessionRef.current = finished;
        if (document.fullscreenElement) void document.exitFullscreen();
        router.replace(`/tocfl/${test.id}/result${scriptQuery(test)}`);
        return;
      }
      sessionRef.current = active;
      initialDisplay = window.setTimeout(() => { setSession(active); setRemaining(left); }, 0);
    }
    const interval = window.setInterval(() => {
      const current = sessionRef.current;
      if (!current || current.status !== "in-progress" || isPracticeListeningIntroPending(current) || (current.mode === "simulation" && !current.readingStarted)) return;
      const seconds = secondsLeft(current);
      setRemaining(seconds);
      if (seconds === 0) {
        if (current.mode !== "simulation") {
          const next = nextAvailablePracticeSection(test, current);
          if (next) {
            update(next);
            setRemaining(next.remainingSeconds);
            setSectionNotice(`Phần ${current.activeSection === "reading" ? "Đọc" : "Nghe"} đã hết giờ. Bạn được chuyển sang phần ${next.activeSection === "reading" ? "Đọc" : "Nghe"}.`);
            return;
          }
        }
        const finished = submitSession(test, current);
        sessionRef.current = finished;
        if (document.fullscreenElement) void document.exitFullscreen();
        router.replace(`/tocfl/${test.id}/result${scriptQuery(test)}`);
      } else if (seconds !== current.remainingSeconds) {
        const next = { ...current, remainingSeconds: seconds, ...(current.mode !== "simulation" && current.activeSection ? { practiceRemaining: { listening: current.practiceRemaining?.listening ?? PRACTICE_SECTION_SECONDS, reading: current.practiceRemaining?.reading ?? PRACTICE_SECTION_SECONDS, [current.activeSection]: seconds } } : {}) };
        sessionRef.current = next;
        saveSession(next);
      }
    }, 1000);
    return () => { if (initialDisplay !== undefined) window.clearTimeout(initialDisplay); window.clearInterval(interval); };
  }, [router, test, update]);
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setConfirmOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  const jump = useCallback((nextIndex: number) => {
    const current = sessionRef.current;
    if (!current || current.status !== "in-progress") return;
    const currentQuestion = test.questions[current.currentIndex];
    const target = test.questions[nextIndex];
    const targetUnavailable = target && current.mode !== "simulation" && target.section !== currentQuestion.section && (current.practiceRemaining?.[target.section] ?? PRACTICE_SECTION_SECONDS) <= 0;
    if (target && !targetUnavailable && (current.mode !== "simulation" || (current.readingStarted && target.section === "reading"))) {
      const next = current.mode === "simulation" ? { ...current, currentIndex: nextIndex } : enterPracticeSection(test, current, nextIndex);
      update(next);
      if (current.mode !== "simulation" && current.activeSection !== next.activeSection) { setRemaining(next.remainingSeconds); setSectionNotice(""); }
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.querySelector(".sim-scroll-region")?.scrollTo({ top: 0 });
    }
  }, [test, update]);
  const select = useCallback((choice: number) => {
    const current = sessionRef.current;
    if (!current || current.status !== "in-progress" || current.currentIndex !== visibleIndex) return;
    const activeQuestion = test.questions[current.currentIndex];
    if (!activeQuestion || (current.mode === "simulation" && activeQuestion.section === "reading" && !current.readingStarted)) return;
    const answers = { ...current.answers };
    if (activeQuestion.metadata?.uniqueChoiceUsageWithinSection) {
      const selectedId = activeQuestion.choiceIds?.[choice];
      for (const sibling of test.questions) {
        if (sibling.id !== activeQuestion.id && sibling.sectionId === activeQuestion.sectionId && sibling.choiceIds?.[answers[sibling.id]] === selectedId) delete answers[sibling.id];
      }
    }
    answers[activeQuestion.id] = choice;
    update({ ...current, answers });
  }, [test.questions, update, visibleIndex]);
  const previousQuestion = useCallback(() => { const current = sessionRef.current; if (current) jump(current.currentIndex - 1); }, [jump]);
  const nextQuestion = useCallback(() => { const current = sessionRef.current; if (!current) return; if (test.questions[current.currentIndex]?.section === "listening") advanceListening(); else jump(current.currentIndex + 1); }, [advanceListening, jump, test.questions]);
  const requestSubmit = useCallback(() => setConfirmOpen(true), []);
  const beginReading = useCallback(() => { const current = sessionRef.current; if (!current || current.readingStarted) return; const seconds = PRACTICE_SECTION_SECONDS; const deadlineAt = Date.now() + seconds * 1000; update({ ...current, readingStarted: true, deadlineAt, remainingSeconds: seconds, sectionCompleted: { ...current.sectionCompleted, listening: true } }); setRemaining(seconds); }, [update]);
  const retryAudio = useCallback(() => { const current = sessionRef.current; if (current) startListeningAudio(current.currentIndex, true); }, [startListeningAudio]);
  const isUnavailable = useCallback((item: (typeof test.questions)[number]) => {
    const current = sessionRef.current;
    if (!current || current.mode === "simulation") return false;
    return item.section !== test.questions[current.currentIndex]?.section && (current.practiceRemaining?.[item.section] ?? PRACTICE_SECTION_SECONDS) <= 0;
  }, [test.questions]);

  if (showIntro) return <SimulationExam phase="intro" test={test} onStart={() => {
    const saved = readSession(test.id);
    const firstIsReading = test.questions[0]?.section === "reading";
    const simulationSeconds = PRACTICE_SECTION_SECONDS;
    const fresh = saved?.status === "in-progress" ? saved.mode === "simulation" ? saved : { ...saved, mode: "simulation" as const, deadlineAt: firstIsReading ? Date.now() + simulationSeconds * 1000 : 0, remainingSeconds: firstIsReading ? simulationSeconds : 0, readingStarted: firstIsReading, sectionCompleted: { listening: false, reading: false } } : startSession(test, "simulation");
    saveSession(fresh);
    window.sessionStorage.removeItem(`tocfl-simulation-intro:${test.id}`);
    sessionRef.current = fresh;
    setSession(fresh);
    setRemaining(fresh.readingStarted ? secondsLeft(fresh) : 0);
    if (fresh.listeningIntroCompleted !== false && test.questions[fresh.currentIndex]?.section === "listening") startListeningAudio(fresh.currentIndex);
    setShowIntro(false);
  }} onBack={() => { window.sessionStorage.removeItem(`tocfl-simulation-intro:${test.id}`); router.push(`/tocfl/${test.id}/instructions`); }} />;
  if (!session || session.status === "submitted") return <div className="mx-auto max-w-5xl px-5 py-12 muted">Đang tải bài thi…</div>;
  if (session.currentIndex === 0 && session.listeningIntroCompleted === false && test.questions[0]?.section === "listening" && test.listeningIntroAudio?.length) {
    const intro = <ListeningIntroStep audioPaths={test.listeningIntroAudio} onComplete={() => {
      const current = sessionRef.current;
      if (current?.status === "in-progress" && current.currentIndex === 0 && current.listeningIntroCompleted === false) {
        const next = completeListeningIntro(current);
        update(next);
        setRemaining(next.remainingSeconds);
      }
    }} />;
    if (session.mode === "simulation") return <SimulationExamShell section="listening">{intro}</SimulationExamShell>;
    return <div className="min-h-screen px-5 py-10 sm:py-16"><p className="mx-auto mb-6 max-w-2xl text-sm font-semibold text-[var(--brand)]">{test.title} · Luyện tập phần Nghe</p>{intro}<p className="mx-auto mt-5 max-w-2xl text-right text-sm muted">Đồng hồ 60 phút sẽ bắt đầu khi bạn vào câu 1.</p></div>;
  }
  const index = Math.max(0, Math.min(session.currentIndex, test.questions.length - 1));
  const question = test.questions[index];
  const answered = test.questions.filter((item) => session.answers[item.id] !== undefined).length;
  const unavailable = (section: "listening" | "reading") => session.mode !== "simulation" && section !== question.section && (session.practiceRemaining?.[section] ?? PRACTICE_SECTION_SECONDS) <= 0;
  const submitModal = confirmOpen && <SubmitModal answered={answered} total={test.questions.length} onContinue={() => setConfirmOpen(false)} onSubmit={finish} />;

  if (session.mode === "simulation") {
    return <>
      <SimulationExam
        phase="active"
        test={test}
        question={question}
        index={index}
        selected={session.answers[question.id]}
        remaining={remaining}
        volume={volume}
        onVolumeChange={setVolume}
        onSelect={select}
        onPrevious={previousQuestion}
        onNext={nextQuestion}
        onFinish={requestSubmit}
        readingTransition={question.section === "reading" && !session.readingStarted}
        onBeginReading={beginReading}
        audioBlocked={audioBlocked}
        onRetryAudio={retryAudio}
        questionAssetsReady={questionAssetsReady}
      />
      {submitModal}
    </>;
  }

  return <div className="min-h-screen">
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--brand)]">Luyện đề TOCFL</p>
          <p className="mt-1 text-base font-semibold sm:text-lg">{test.title}</p>
        </div>
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-2 text-right sm:px-4">
          <p className="text-[10px] font-bold uppercase tracking-[.13em] text-[var(--brand)]">{question.section === "listening" ? "Nghe" : "Đọc"} · Thời gian còn lại</p>
          <p aria-live="off" className={`font-mono text-lg font-bold tabular-nums sm:text-xl ${remaining <= 300 ? "text-[#9a4c43]" : "text-[var(--brand)]"}`}>{formatTime(remaining)}</p>
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-9">
      {sectionNotice && <p role="status" className="mb-5 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 py-3 text-sm font-medium text-[var(--brand)]">{sectionNotice}</p>}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold text-[var(--brand)]">{question.section === "listening" ? "Nghe" : "Đọc"}</p><p className="mt-1 text-sm muted">Câu {question.number} / {test.questions.filter((item) => item.section === question.section).length}</p></div>
        <button type="button" className="button-secondary text-sm" onClick={() => setConfirmOpen(true)}>Nộp bài</button>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="paper rounded-2xl p-5 sm:p-8 lg:p-10">
          {question.section === "reading" ? <PracticeAnnotationProvider key={question.id} testId={test.id} script={test.script ?? "traditional"} questionId={question.id}>
            <QuestionContent question={question}/>
            <ChoiceList question={question} selected={session.answers[question.id]} onSelect={select}/>
          </PracticeAnnotationProvider> : <><QuestionContent question={question} autoplayAudio={index === 0 && session.listeningIntroCompleted === true && Boolean(test.listeningIntroAudio?.length)}/><ChoiceList question={question} selected={session.answers[question.id]} onSelect={select}/></>}
          <div className="mt-9 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
            <button type="button" className="button-secondary" disabled={index === 0 || unavailable(test.questions[index - 1].section)} onClick={() => jump(index - 1)}>← Câu trước</button>
            <button type="button" className="button-primary" disabled={index === test.questions.length - 1 || unavailable(test.questions[index + 1].section)} onClick={() => jump(index + 1)}>Câu sau →</button>
          </div>
        </div>
        <aside className="hidden lg:block">
          <div className="paper sticky top-28 rounded-2xl p-5">
            <QuestionNavigator questions={test.questions} currentIndex={index} answers={session.answers} onJump={jump} isUnavailable={isUnavailable}/>
            <p className="mt-6 border-t border-[var(--border)] pt-5 text-sm muted">Câu trả lời được lưu ngay khi bạn chọn.</p>
          </div>
        </aside>
      </div>
      <details className="paper mt-5 rounded-2xl p-5 lg:hidden">
        <summary className="cursor-pointer font-bold text-[var(--brand)]">Điều hướng câu hỏi · Đã trả lời {answered}/{test.questions.length}</summary>
        <div className="mt-5"><QuestionNavigator questions={test.questions} currentIndex={index} answers={session.answers} onJump={jump} isUnavailable={isUnavailable}/></div>
      </details>
    </main>
    {submitModal}
  </div>;
}

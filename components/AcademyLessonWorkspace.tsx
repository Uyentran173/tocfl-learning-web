"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AcademyTrack } from "@/lib/academy";
import { academyActivityId, academyActivityKinds, academyActivityLabels, academyVocabularyByIds, type AcademyActivityKind, type AcademyLessonContent, type AcademyQuestion } from "@/lib/academy-catalog";
import { academyActivityKindFromId, academyLessonProgressKey, emptyAcademyLessonProgress, parseAcademyLessonProgress } from "@/lib/academy-progress";
import { progressStorage } from "@/lib/progress-storage";
import AcademyAudioLesson from "./AcademyAudioLesson";
import { useT } from "./PreferencesProvider";

function QuestionList({ questions, answers, guestAnswers, onAnswer }: { questions: AcademyQuestion[]; answers: Record<string, string>; guestAnswers: Record<string, string>; onAnswer: (id: string, choice: string) => void }) {
  const t = useT();
  return <div className="mt-5 grid gap-4">{questions.map((question, index) => {
    const chosen = answers[question.id];
    return <fieldset key={question.id} className="academy-quiz paper p-4 sm:p-5"><legend className="px-2 font-bold">{t("Câu")} {index + 1}</legend><p className="mb-4 font-semibold">{question.prompt}</p><div className="grid gap-2">{question.options.map((option) => <button type="button" key={option.id} className="academy-answer" aria-pressed={chosen === option.id} onClick={() => onAnswer(question.id, option.id)}><span className="academy-answer-letter">{option.id.toUpperCase()}</span><span>{option.text}</span></button>)}</div>{chosen && <p className={`mt-4 rounded-xl p-3 text-sm ${chosen === question.correctOptionId ? "academy-feedback-correct" : "academy-feedback-review"}`} role="status"><strong>{t(chosen === question.correctOptionId ? "Chính xác!" : "Cần ôn lại")}</strong> {question.feedback}</p>}{guestAnswers[question.id] && <p className="mt-2 text-xs muted">{t("Lựa chọn cũ từ chế độ khách")}: {guestAnswers[question.id].toUpperCase()}</p>}</fieldset>;
  })}</div>;
}

export default function AcademyLessonWorkspace({ content, tracks, availableTrackIds, canEdit }: { content: AcademyLessonContent; tracks: AcademyTrack[]; availableTrackIds: string[]; canEdit: boolean }) {
  const t = useT();
  const [progress, setProgress] = useState(emptyAcademyLessonProgress);
  const [hydrated, setHydrated] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = parseAcademyLessonProgress(progressStorage().getItem(academyLessonProgressKey));
      const fromUrl = new URLSearchParams(window.location.search).get("activity");
      setProgress({ ...saved, currentActivityId: fromUrl && academyActivityKindFromId(fromUrl) ? fromUrl : saved.currentActivityId });
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (hydrated && dirty) progressStorage().setItem(academyLessonProgressKey, JSON.stringify(progress)); }, [progress, hydrated, dirty]);

  const kind = academyActivityKindFromId(progress.currentActivityId) ?? "lecture";
  const complete = progress.completedActivityIds.includes(progress.currentActivityId);
  const number = academyActivityKinds.indexOf(kind) + 1;
  const questions = kind === "practice" ? content.practice : kind === "assessment" ? content.assessment : [];
  const allAnswered = questions.every((question) => Boolean(progress.answers[question.id]));
  function navigate(next: AcademyActivityKind) {
    const id = academyActivityId(content.id, next);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?activity=${encodeURIComponent(id)}`);
    setDirty(true);
    setProgress((current) => ({ ...current, currentActivityId: id }));
  }
  function answer(questionId: string, choiceId: string) {
    setDirty(true);
    setProgress((current) => ({ ...current, answers: { ...current.answers, [questionId]: choiceId } }));
  }
  function markComplete() {
    if (questions.length && !allAnswered) return;
    setDirty(true);
    setProgress((current) => ({ ...current, completedActivityIds: [...new Set([...current.completedActivityIds, current.currentActivityId])] }));
  }
  const next = academyActivityKinds[number];
  const score = kind === "assessment" ? questions.filter((question) => progress.answers[question.id] === question.correctOptionId).length : 0;
  return <div className="academy-workspace mt-8">
    <aside className="academy-workspace-nav paper" aria-label={t("Nội dung bài học")}>
      <div className="academy-workspace-nav-heading"><p className="page-eyebrow">{t("Bài 01")}</p><h2 className="mt-2 font-bold">{content.title}</h2><p className="mt-2 text-xs muted">{progress.completedActivityIds.length}/{academyActivityKinds.length} {t("hoạt động hoàn thành")}</p></div>
      <nav className="academy-activity-nav" aria-label={t("Các hoạt động trong bài")}>
        {academyActivityKinds.map((item, index) => {
          const id = academyActivityId(content.id, item);
          return <button type="button" key={id} className="academy-activity-button" aria-current={kind === item ? "step" : undefined} onClick={() => navigate(item)}><span className="academy-activity-index">{String(index + 1).padStart(2, "0")}</span><span>{t(academyActivityLabels[item])}</span><span className="ml-auto" aria-label={progress.completedActivityIds.includes(id) ? t("Đã hoàn thành") : undefined}>{progress.completedActivityIds.includes(id) ? "✓" : ""}</span></button>;
        })}
      </nav>
      <Link className="academy-overview-link" href="/academy/contemporary-chinese/cc1-v1">← {t("Xem hành trình học")}</Link>
    </aside>
    <article className="academy-workspace-panel paper" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="page-eyebrow">{t("HOẠT ĐỘNG")} {String(number).padStart(2, "0")} / 05</p><h2 className="mt-2 text-2xl font-bold">{t(academyActivityLabels[kind])}</h2></div><span className="academy-status">{t(complete ? "Đã hoàn thành" : "Theo nhịp của bạn")}</span></div>
      {kind === "lecture" && <section className="mt-6"><p className="muted">{content.lecture.introduction}</p><div className="mt-5 space-y-3">{content.lecture.dialogue.map((turn, index) => <div key={`${turn.speaker}-${index}`} className="academy-dialogue"><span className="academy-dialogue-speaker">{turn.speaker}</span><div><p lang="zh-Hant" className="text-lg font-medium leading-8">{turn.chinese}</p><p className="mt-1 text-sm muted">{turn.meaningVi}</p></div></div>)}</div></section>}
      {kind === "vocabulary" && <section className="mt-6"><p className="muted">{content.vocabulary.introduction}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{academyVocabularyByIds(content.vocabulary.wordIds).map((word) => <div key={word.id} className="academy-word"><p lang="zh-Hant" className="text-2xl font-bold">{word.hanzi}</p><p className="mt-1 text-sm muted">{word.pinyin}</p><p className="mt-3 font-semibold">{word.meaning}</p><p lang="zh-Hant" className="mt-2 text-sm">{word.example}</p><p className="mt-1 text-xs muted">{word.translation}</p></div>)}</div><Link className="academy-route-link mt-5" href="/vocabulary/textbook">{t("Ôn thêm trong Học từ vựng")} ↗</Link></section>}
      {kind === "grammar" && <section className="mt-6 grid gap-4">{content.grammar.map((point) => <div key={point.id} className="academy-grammar"><h3 lang="zh-Hant" className="text-lg font-bold">{point.title}</h3><p className="mt-2 muted">{point.explanation}</p><p lang="zh-Hant" className="mt-3 text-lg">{point.example}</p><p className="mt-1 text-sm muted">{point.meaningVi}</p></div>)}</section>}
      {kind === "practice" && <section className="mt-6"><p className="muted">{t("Thử trả lời từng câu. Bạn có thể quay lại bất kỳ hoạt động nào.")}</p><QuestionList questions={content.practice} answers={progress.answers} guestAnswers={progress.guestAnswers} onAnswer={answer} /><details className="academy-audio-details mt-7"><summary>{t("Bài nghe từ giáo trình (chưa phát hành công khai)")}</summary><p className="mt-3 text-sm muted">{t("Chỉ phát các bản ghi âm đã được cấp quyền; bài tập mẫu bên trên không phụ thuộc vào âm thanh này.")}</p><AcademyAudioLesson embedded tracks={tracks} availableTrackIds={availableTrackIds} /></details></section>}
      {kind === "assessment" && <section className="mt-6"><p className="muted">{t("Tự kiểm tra những gì bạn vừa học. Kết quả chỉ thuộc bài học mẫu này.")}</p><QuestionList questions={content.assessment} answers={progress.answers} guestAnswers={progress.guestAnswers} onAnswer={answer} />{allAnswered && <p className="academy-score mt-5" role="status">{t("Bạn trả lời đúng")} {score}/{questions.length} {t("câu")}</p>}</section>}
      <div className="academy-workspace-actions mt-8"><p className="text-xs muted">{t("Tiến độ được lưu tự động.")}</p><div className="flex flex-wrap gap-3"><button type="button" className="button-secondary text-sm" disabled={complete || (questions.length > 0 && !allAnswered)} onClick={markComplete}>{t(complete ? "Đã hoàn thành" : "Đánh dấu hoàn thành")}</button>{next && <button type="button" className="button-primary text-sm" onClick={() => navigate(next)}>{t("Hoạt động tiếp theo")} →</button>}</div></div>
      {canEdit && <Link className="academy-route-link mt-5" href="/academy/cc1/lesson/01/edit">{t("Biên tập bài học")} ↗</Link>}
    </article>
  </div>;
}

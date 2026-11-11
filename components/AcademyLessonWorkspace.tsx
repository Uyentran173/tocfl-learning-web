"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AcademyTrack } from "@/lib/academy";
import { academyActivityId, academyActivityKindsForLesson, academyActivityLabels, academyLessonNumber, academyVocabularyByIds, type AcademyActivityKind, type AcademyLessonContent, type AcademyQuestion } from "@/lib/academy-catalog";
import { academyActivityKindFromId, academyProgressKeyForLesson, emptyAcademyProgressForLesson, parseAcademyLessonProgress } from "@/lib/academy-progress";
import { academyScriptText, type AcademyScript } from "@/lib/academy-script";
import { addLearnedWord, learnedPoolChangedEvent, loadLearnedPool, removeLearnedWord, saveLearnedPool, vocabularyIdFor } from "@/lib/learned-vocabulary";
import { fromStudyWord } from "@/lib/learned-vocabulary-adapters";
import { progressStorage } from "@/lib/progress-storage";
import { academyLessonLabel } from "@/lib/i18n-academy";
import AcademySentence from "./AcademySentence";
import AcademyAudioLesson from "./AcademyAudioLesson";
import { usePreferences, useT } from "./PreferencesProvider";

function QuestionList({ questions, answers, guestAnswers, onAnswer, script, showFeedback, prefix = "" }: { questions: AcademyQuestion[]; answers: Record<string, string>; guestAnswers: Record<string, string>; onAnswer: (id: string, choice: string) => void; script: AcademyScript; showFeedback: boolean; prefix?: string }) {
  const t = useT();
  return <div className="academy-question-list">{questions.map((question, index) => {
    const chosen = answers[question.id];
    return <fieldset key={question.id} className="academy-quiz paper"><legend className="px-2 font-bold">{prefix}{t("Câu")} {index + 1}</legend><p className="academy-question-prompt">{academyScriptText(question.prompt, script)}</p>{question.passage && <p className="academy-question-passage" lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{academyScriptText(question.passage, script)}</p>}
      <div className="academy-answer-grid">{question.options.map((option) => <button type="button" key={option.id} className="academy-answer" aria-pressed={chosen === option.id} onClick={() => onAnswer(question.id, option.id)}><span className="academy-answer-letter">{option.id.toUpperCase()}</span><span>{academyScriptText(option.text, script)}</span></button>)}</div>
      {showFeedback && chosen && <p className={`academy-question-feedback ${chosen === question.correctOptionId ? "academy-feedback-correct" : "academy-feedback-review"}`} role="status"><strong>{t(chosen === question.correctOptionId ? "Chính xác!" : "Cần ôn lại")}</strong> {academyScriptText(question.feedback, script)}</p>}
      {guestAnswers[question.id] && <p className="mt-2 text-xs muted">{t("Lựa chọn cũ từ chế độ khách")}: {guestAnswers[question.id].toUpperCase()}</p>}
    </fieldset>;
  })}</div>;
}

export default function AcademyLessonWorkspace({ content, tracks, availableTrackIds, canEdit }: { content: AcademyLessonContent; tracks: AcademyTrack[]; availableTrackIds: string[]; canEdit: boolean }) {
  const { t, locale } = usePreferences();
  const lessonNumber = academyLessonNumber(content.id) ?? 1;
  const activityKinds = academyActivityKindsForLesson(content.id);
  const lessonLabel = academyLessonLabel(locale, lessonNumber);
  const progressKey = academyProgressKeyForLesson(content.id);
  const [progress, setProgress] = useState(() => emptyAcademyProgressForLesson(content.id));
  const [hydrated, setHydrated] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [revealedWords, setRevealedWords] = useState<string[]>([]);
  const [revealedDialogues, setRevealedDialogues] = useState<string[]>([]);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [showWritingGuide, setShowWritingGuide] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = parseAcademyLessonProgress(progressStorage().getItem(progressKey), content.id);
      const fromUrl = new URLSearchParams(window.location.search).get("activity");
      setProgress({ ...saved, currentActivityId: fromUrl && academyActivityKindFromId(fromUrl, content.id) ? fromUrl : saved.currentActivityId });
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [content.id, progressKey]);
  useEffect(() => { if (hydrated && dirty) progressStorage().setItem(progressKey, JSON.stringify(progress)); }, [progress, hydrated, dirty, progressKey]);
  useEffect(() => {
    const sync = () => { const pool = loadLearnedPool(window.localStorage); setLearnedIds(pool.words.filter((word) => !pool.removedIds.includes(word.vocabularyId)).map((word) => word.vocabularyId)); };
    sync(); window.addEventListener(learnedPoolChangedEvent, sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener(learnedPoolChangedEvent, sync); window.removeEventListener("storage", sync); };
  }, []);
  const kind = academyActivityKindFromId(progress.currentActivityId, content.id) ?? "lecture";
  const number = activityKinds.indexOf(kind) + 1;
  const complete = progress.completedActivityIds.includes(progress.currentActivityId);
  const questions = kind === "practice" ? content.practice : kind === "assessment" ? content.assessment : kind === "listening" ? content.listening ?? [] : [];
  const allAnswered = questions.every((item) => Boolean(progress.answers[item.id]));
  const writingTask = content.writingTask ?? { id: "self-introduction", title: "Tự giới thiệu ngắn", prompt: "Hãy viết 2–3 câu tiếng Hoa: họ tên, quốc tịch và đồ uống bạn thích. Bài viết được lưu để bạn tự ôn; hệ thống chưa chấm tự động.", sampleTraditional: "我姓陳，叫月美。我是臺灣人。我喜歡喝茶。" };
  const writingDone = Boolean(progress.writingResponses[writingTask.id]?.trim());
  const score = useMemo(() => content.assessment.filter((item) => progress.answers[item.id] === item.correctOptionId).length, [content.assessment, progress.answers]);
  const weakSkills = useMemo(() => [...new Set(content.assessment.filter((item) => progress.answers[item.id] && progress.answers[item.id] !== item.correctOptionId).map((item) => item.skill))], [content.assessment, progress.answers]);
  const listeningTracks = useMemo(() => tracks.filter((track) => content.listening?.some((item) => item.audioTrackId === track.id)), [tracks, content.listening]);
  const script = progress.script;
  const words = academyVocabularyByIds(content.vocabulary.wordIds);
  function update(updateFn: (current: typeof progress) => typeof progress) { setDirty(true); setProgress(updateFn); }
  function navigate(next: AcademyActivityKind) {
    const id = academyActivityId(content.id, next);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}?activity=${encodeURIComponent(id)}`);
    update((current) => ({ ...current, currentActivityId: id }));
  }
  function answer(questionId: string, choiceId: string) { update((current) => ({ ...current, answers: { ...current.answers, [questionId]: choiceId }, assessmentSubmitted: questionId.includes("assessment") ? false : current.assessmentSubmitted, completedActivityIds: questionId.includes("assessment") ? current.completedActivityIds.filter((id) => id !== academyActivityId(content.id, "assessment")) : current.completedActivityIds })); }
  function completeActivity() {
    if (kind === "practice" && (!allAnswered || !writingDone)) return;
    if (kind === "listening" && !allAnswered) return;
    if (kind === "assessment" && !progress.assessmentSubmitted) return;
    update((current) => ({ ...current, completedActivityIds: [...new Set([...current.completedActivityIds, current.currentActivityId])] }));
  }
  function markWord(wordIndex: number) {
    const word = words[wordIndex]; if (!word) return;
    const id = vocabularyIdFor(word.traditional ?? word.hanzi, word.pinyin);
    const pool = loadLearnedPool(window.localStorage);
    saveLearnedPool(window.localStorage, learnedIds.includes(id) ? removeLearnedWord(pool, id) : addLearnedWord(pool, fromStudyWord(word, `lesson-${lessonNumber}`, wordIndex, "textbook")));
  }
  const next = activityKinds[number];
  return <><header className="mt-8"><p className="page-eyebrow">TAI WÉN ACADEMY · {t(lessonLabel)}</p><h1 className="page-title" lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{academyScriptText(content.title, script)}</h1><p className="mt-2 text-xl font-semibold text-[var(--brand)]">{content.titleVi}</p><p className="page-lead">{content.description}</p><div className="academy-objectives mt-5"><strong>{t("Sau bài này, bạn có thể:")}</strong><ul>{content.objectives.map((objective) => <li key={objective}>{objective}</li>)}</ul>{content.estimatedMinutes && <span className="text-sm muted">{content.estimatedMinutes} {t("phút dự kiến")}</span>}</div></header><div className="academy-workspace mt-7">
    <aside className="academy-workspace-nav paper" aria-label={t("Nội dung bài học")}>
      <div className="academy-workspace-nav-heading"><p className="page-eyebrow">{t(lessonLabel)}</p><h2 className="mt-2 font-bold" lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{academyScriptText(content.title, script)}</h2><p className="mt-1 text-sm muted">{content.titleVi}</p><p className="mt-2 text-xs muted">{progress.completedActivityIds.length}/{activityKinds.length} {t("hoạt động hoàn thành")}</p></div>
      <nav className="academy-activity-nav" aria-label={t("Các hoạt động trong bài")}>{activityKinds.map((item, index) => {
        const id = academyActivityId(content.id, item);
        return <button type="button" key={id} className="academy-activity-button" aria-current={kind === item ? "step" : undefined} onClick={() => navigate(item)}><span className="academy-activity-index">{String(index + 1).padStart(2, "0")}</span><span>{t(academyActivityLabels[item])}</span><span className="ml-auto" aria-label={progress.completedActivityIds.includes(id) ? t("Đã hoàn thành") : undefined}>{progress.completedActivityIds.includes(id) ? "✓" : ""}</span></button>;
      })}</nav>
      <Link className="academy-overview-link" href="/academy/contemporary-chinese/cc1-v1">← {t("Xem hành trình học")}</Link>
    </aside>
    <article className="academy-workspace-panel paper" data-kind={kind}>
      <div className="academy-panel-top"><div><p className="page-eyebrow">{t("HOẠT ĐỘNG")} {String(number).padStart(2, "0")} / {String(activityKinds.length).padStart(2, "0")}</p><h2 className="mt-2 text-2xl font-bold">{t(academyActivityLabels[kind])}</h2></div><div className="academy-script-toggle" role="group" aria-label={t("Kiểu chữ tiếng Hoa")}><button type="button" aria-pressed={script === "traditional"} onClick={() => update((current) => ({ ...current, script: "traditional" }))}>{t("Phồn thể")}</button><button type="button" aria-pressed={script === "simplified"} onClick={() => update((current) => ({ ...current, script: "simplified" }))}>{t("Giản thể")}</button></div></div>
      {kind === "lecture" && <section className="academy-lesson-section"><p className="academy-intro">{content.lecture.introduction}</p><div className="academy-lesson-blocks">{content.lecture.sections.map((section) => <div key={section.id} className="academy-learning-block"><h3>{section.title}</h3><p>{section.body}</p><AcademySentence sentence={section} script={script} /></div>)}</div>
        <h3 className="academy-section-title">{t("Hội thoại")}</h3>{content.lecture.dialogues.map((dialogue) => { const all = revealedDialogues.includes(dialogue.id); return <div key={dialogue.id} className="academy-dialogue-panel"><div className="academy-dialogue-heading"><div><h4>{dialogue.title}</h4><p>{dialogue.context}</p></div><button type="button" className="academy-mini-action" aria-pressed={all} onClick={() => setRevealedDialogues((current) => all ? current.filter((id) => id !== dialogue.id) : [...current, dialogue.id])}>{t(all ? "Ẩn toàn bộ hỗ trợ" : "Xem hỗ trợ cả đoạn")}</button></div><div className="academy-dialogue-turns">{dialogue.turns.map((turn, index) => <div key={`${dialogue.id}-${index}-${all}`} className="academy-dialogue"><span className="academy-dialogue-speaker">{turn.speaker}</span><AcademySentence sentence={turn} script={script} revealAll={all} /></div>)}</div></div>; })}
        <h3 className="academy-section-title">{t("Tự kiểm tra nhanh")}</h3><QuestionList questions={content.lecture.checks} answers={progress.answers} guestAnswers={progress.guestAnswers} onAnswer={answer} script={script} showFeedback />
        {content.lecture.pronunciation.length > 0 && <><h3 className="academy-section-title">{t("Phát âm cần nhớ")}</h3><div className="academy-lesson-blocks">{content.lecture.pronunciation.map((item) => <div key={item.id} className="academy-learning-block"><h4>{item.title}</h4><p>{item.explanation}</p><AcademySentence sentence={item} script={script} /></div>)}</div></>}
        {content.lecture.culture.length > 0 && <><h3 className="academy-section-title">{t("Góc văn hóa Đài Loan")}</h3><div className="academy-lesson-blocks">{content.lecture.culture.map((item) => <div key={item.id} className="academy-learning-block"><h4>{item.title}</h4><p>{item.body}</p></div>)}</div></>}
      </section>}
      {kind === "listening" && content.listening && <section className="academy-lesson-section"><p className="academy-intro">{t("Nghe hội thoại trước khi mở transcript. Bạn có thể nghe lại, đổi tốc độ và ghi chú những câu muốn luyện thêm.")}</p><AcademyAudioLesson embedded tracks={listeningTracks} availableTrackIds={availableTrackIds} lessonNumber={lessonNumber} script={script} /><h3 className="academy-section-title">{t("Tự kiểm tra nghe hiểu")}</h3><QuestionList questions={content.listening} answers={progress.answers} guestAnswers={progress.guestAnswers} onAnswer={answer} script={script} showFeedback /></section>}
      {kind === "vocabulary" && <section className="academy-lesson-section"><p className="academy-intro">{content.vocabulary.introduction}</p><p className="text-sm muted">{words.length} {t("mục từ")} · {learnedIds.filter((id) => words.some((word) => vocabularyIdFor(word.traditional ?? word.hanzi, word.pinyin) === id)).length} {t("đã thuộc")}</p><div className="academy-vocab-grid">{words.map((word, index) => { const open = revealedWords.includes(word.id!); const learned = learnedIds.includes(vocabularyIdFor(word.traditional ?? word.hanzi, word.pinyin)); return <div key={word.id} className="academy-word"><button type="button" className="academy-word-front" aria-expanded={open} onClick={() => setRevealedWords((current) => open ? current.filter((id) => id !== word.id) : [...current, word.id!])}><span className="academy-vocab-number">{String(index + 1).padStart(2, "0")}</span><strong lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{script === "traditional" ? word.traditional : word.simplified}</strong><span aria-hidden="true">{open ? "−" : "+"}</span></button>{open && <div className="academy-word-back"><p className="academy-pinyin">{word.pinyin}</p><p className="font-semibold">{word.meaning}</p><p className="text-xs muted">{word.wordClass}</p><p className="mt-3" lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{script === "traditional" ? word.exampleTraditional : word.exampleSimplified}</p><p className="text-sm muted">{word.translation}</p><button type="button" className="academy-mini-action mt-3" aria-pressed={learned} onClick={() => markWord(index)}>{t(learned ? "✓ Đã thuộc" : "Đánh dấu đã thuộc")}</button></div>}</div>; })}</div><Link className="academy-route-link mt-6" href="/vocabulary/textbook">{t("Ôn thêm trong Học từ vựng")} ↗</Link></section>}
      {kind === "grammar" && <section className="academy-lesson-section"><p className="academy-intro">{t("Đọc ví dụ rồi tự kiểm tra ngay dưới mỗi điểm.")}</p><div className="academy-grammar-list">{content.grammar.map((point, index) => <div key={point.id} className="academy-grammar"><p className="page-eyebrow">{String(index + 1).padStart(2, "0")} / {String(content.grammar.length).padStart(2, "0")}</p><h3>{point.title}</h3><p>{point.explanation}</p><p className="academy-grammar-pattern">{academyScriptText(point.structure, script)}</p><div className="academy-example-list">{point.examples.map((example, exampleIndex) => <AcademySentence key={`${point.id}-${exampleIndex}`} sentence={example} script={script} />)}</div><p className="academy-grammar-mistake"><strong>{t("Lỗi dễ gặp:")}</strong> {academyScriptText(point.commonMistake, script)}</p><QuestionList questions={[point.check]} answers={progress.answers} guestAnswers={progress.guestAnswers} onAnswer={answer} script={script} showFeedback /></div>)}</div></section>}
      {kind === "practice" && <section className="academy-lesson-section"><p className="academy-intro">{t("Luyện theo từng tình huống. Bạn có thể sửa câu trả lời và quay lại bất kỳ lúc nào.")}</p><QuestionList questions={content.practice} answers={progress.answers} guestAnswers={progress.guestAnswers} onAnswer={answer} script={script} showFeedback />
        <div className="academy-writing paper"><h3>{t(writingTask.title)}</h3><p>{t(writingTask.prompt)}</p><label className="sr-only" htmlFor="academy-writing-response">{t("Bài viết của bạn")}</label><textarea id="academy-writing-response" className="academy-response mt-3" rows={4} value={progress.writingResponses[writingTask.id] ?? ""} onChange={(event) => update((current) => ({ ...current, writingResponses: { ...current.writingResponses, [writingTask.id]: event.target.value } }))} />{writingTask.sampleTraditional && <><button type="button" className="academy-mini-action mt-3" aria-expanded={showWritingGuide} onClick={() => setShowWritingGuide((value) => !value)}>{t(showWritingGuide ? "Ẩn câu gợi ý" : "Xem câu gợi ý")}</button>{showWritingGuide && <p className="academy-writing-guide" lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{script === "simplified" && writingTask.sampleSimplified ? writingTask.sampleSimplified : academyScriptText(writingTask.sampleTraditional, script)}</p>}</>}</div>
        <details className="academy-audio-details mt-6"><summary>{t("Luyện nghe theo bài")}</summary><p className="mt-3 text-sm muted">{t("Chọn bản ghi âm đã được đối chiếu với nội dung trong sách. Bạn có thể nghe lại và ghi chú theo nhịp học của mình.")}</p>{availableTrackIds.length > 0 && <AcademyAudioLesson embedded tracks={tracks} availableTrackIds={availableTrackIds} lessonNumber={lessonNumber} script={script} />}</details>
      </section>}
      {kind === "assessment" && <section className="academy-lesson-section"><p className="academy-intro">{t("Hoàn thành bài đánh giá để xem điểm và những phần nên ôn thêm. Đáp án chỉ hiện sau khi nộp.")}</p><QuestionList questions={content.assessment} answers={progress.answers} guestAnswers={progress.guestAnswers} onAnswer={answer} script={script} showFeedback={progress.assessmentSubmitted} />{!progress.assessmentSubmitted && <button type="button" className="button-primary mt-5" disabled={!allAnswered} onClick={() => update((current) => ({ ...current, assessmentSubmitted: true, completedActivityIds: [...new Set([...current.completedActivityIds, academyActivityId(content.id, "assessment")])] }))}>{t("Nộp bài đánh giá")}</button>}{progress.assessmentSubmitted && <div className="academy-score mt-5" role="status"><strong>{t("Bạn trả lời đúng")} {score}/{content.assessment.length} {t("câu")}</strong><p className="mt-2 text-sm">{weakSkills.length ? `${t("Nên ôn thêm:")} ${weakSkills.join(" · ")}` : t("Bạn đã nắm chắc các nội dung trong bài. Hãy tiếp tục luyện tập nhé!")}</p></div>}</section>}
      <div className="academy-workspace-actions mt-8"><p className="text-xs muted">{t("Tiến độ được lưu tự động.")}</p><div className="flex flex-wrap gap-3"><button type="button" className="button-secondary text-sm" disabled={complete || (kind === "practice" && (!allAnswered || !writingDone)) || (kind === "listening" && !allAnswered) || (kind === "assessment" && !progress.assessmentSubmitted)} onClick={completeActivity}>{t(complete ? "Đã hoàn thành" : "Đánh dấu hoàn thành")}</button>{next && <button type="button" className="button-primary text-sm" onClick={() => navigate(next)}>{t("Hoạt động tiếp theo")} →</button>}</div></div>
      {canEdit && <Link className="academy-route-link mt-5" href={`/academy/cc1/lesson/${String(lessonNumber).padStart(2, "0")}/edit`}>{t("Biên tập bài học")} ↗</Link>}
    </article>
  </div></>;
}

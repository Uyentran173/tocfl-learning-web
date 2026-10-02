"use client";
import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import type { Question } from "@/lib/tests";
import { getBandAReadingVisual } from "@/lib/band-a-reading-visual";
import BandAReadingImage from "./BandAReadingImage";
import { CroppedSource } from "./BandAReadingImage";
import { getBandBReadingVisual, isBandBDocumentQuestion } from "@/lib/band-b-reading-visual";
import BandBReadingImage from "./BandBReadingImage";
import StructuredSourceImage from "./StructuredSourceImage";
import { AnnotatableText, usePracticeAnnotationMode } from "./PracticeAnnotations";
import { hasChinese } from "@/lib/practice-annotations";
import type { SourceEvidence } from "@/lib/review-content";

export const letters = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
export function formatTime(totalSeconds: number) { const minutes = Math.floor(totalSeconds / 60); return String(minutes).padStart(2, "0") + ":" + String(totalSeconds % 60).padStart(2, "0"); }

export function AudioPlayer({ question, review = false, autoplayOnMount = false }: { question: Question; review?: boolean; autoplayOnMount?: boolean }) {
  const sequence = question.reviewAudioSequence?.length ? question.reviewAudioSequence : question.audioUrl ? [question.audioUrl] : [];
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  useEffect(() => {
    if (!autoplayOnMount) return;
    const timer = window.setTimeout(() => { void audioRefs.current[0]?.play().catch(() => {}); }, 1800);
    return () => window.clearTimeout(timer);
  }, [autoplayOnMount, question.id]);
  return <div className="rounded-xl border border-[var(--border)] bg-[var(--brand-soft)] p-4 sm:p-5">
    <p className={review ? "mb-3 text-xs font-bold uppercase tracking-[.14em] text-[var(--brand)]" : "mb-3 text-xs font-bold uppercase tracking-[.14em] text-[var(--brand)]"}>Âm thanh câu hỏi</p>
    {sequence.length ? <div className="space-y-3">{sequence.map((path, index) => <div key={path}>
      {sequence.length > 1 && <p className="mb-1 text-xs font-semibold text-[var(--brand)]">{index === 0 ? "Nội dung nghe chung" : "Âm thanh câu hỏi"}</p>}
      <audio ref={(element) => { audioRefs.current[index] = element; }} onEnded={() => { if (path.startsWith("/tests/band-c-test-01/") && index + 1 < sequence.length) void audioRefs.current[index + 1]?.play().catch(() => {}); }} controls preload="metadata" className="w-full" aria-label={sequence.length > 1 && index === 0 ? "Nội dung nghe chung" : "Âm thanh câu hỏi"} src={path}>Trình duyệt không hỗ trợ phát âm thanh.</audio>
    </div>)}</div> : <p className="text-sm muted">Câu này chưa có tệp âm thanh.</p>}
    {sequence.length > 0 && <p className={review ? "mt-3 text-xs text-[#596473]" : "mt-3 text-xs muted"}>{review ? "Bạn có thể nghe lại bản ghi âm khi xem đáp án." : "Bạn có thể phát lại bản ghi âm trong lúc luyện tập."}</p>}
  </div>;
}

export function QuestionContent({ question, review = false, afterAudio, imageEvidence, autoplayAudio = false }: { question: Question; review?: boolean; afterAudio?: ReactNode; imageEvidence?: SourceEvidence; autoplayAudio?: boolean }) {
  const documentQuestion = isBandBDocumentQuestion(question);
  return <div className="space-y-5">
    {question.section === "listening" && <AudioPlayer key={question.id} question={question} review={review} autoplayOnMount={autoplayAudio} />}
    {review && question.section === "listening" && afterAudio}
    {question.imageUrl && (review || !question.sourceImageReviewOnly || documentQuestion) && (question.sourceVisual ? <StructuredSourceImage question={question} /> : getBandAReadingVisual(question) ? <BandAReadingImage question={question} evidence={review ? imageEvidence : undefined} /> : getBandBReadingVisual(question) ? <BandBReadingImage question={question} evidence={review ? imageEvidence : undefined} /> : <div className="rounded-xl border border-[var(--border)] bg-white p-4 text-center">{review && imageEvidence ? <span className="relative inline-block max-w-full leading-none"><Image src={question.imageUrl} alt={question.imageAlt || "Hình câu hỏi"} width={1530} height={660} unoptimized className="mx-auto h-auto max-h-[520px] w-auto max-w-full object-contain" /><span aria-hidden="true" className="review-image-evidence" style={{ left: `${imageEvidence.x / imageEvidence.sourceWidth * 100}%`, top: `${imageEvidence.y / imageEvidence.sourceHeight * 100}%`, width: `${imageEvidence.width / imageEvidence.sourceWidth * 100}%`, height: `${imageEvidence.height / imageEvidence.sourceHeight * 100}%` }} /></span> : <Image src={question.imageUrl} alt={question.imageAlt || "Hình câu hỏi"} width={1530} height={660} unoptimized className="mx-auto h-auto max-h-[520px] w-auto max-w-full object-contain" />}</div>)}
    {question.passage && !documentQuestion && (!review || !question.sourceImageReviewOnly) && <div className={review ? "rounded-r-xl border-l-4 border-[var(--brand)] bg-[var(--brand-soft)] px-5 py-5" : "rounded-r-xl border-l-4 border-[var(--brand-border)] bg-[var(--brand-soft)] px-5 py-5"}>
      <p className={review ? "mb-2 text-xs font-bold uppercase tracking-[.14em] text-[var(--brand)]" : "mb-2 text-xs font-bold uppercase tracking-[.14em] muted"}>Đoạn văn</p>
      <p lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className={review ? "text-xl leading-9 text-[#1C1C1C]" : `text-lg leading-9 ${question.sourceImageReviewOnly ? "whitespace-pre-line" : ""}`}><AnnotatableText field="passage" text={question.passage}/></p>
    </div>}
    {question.question && (!review || !question.sourceImageReviewOnly || documentQuestion) && <div>
      <p className={review ? "mb-2 text-xs font-bold uppercase tracking-[.14em] text-[var(--brand)]" : "mb-2 text-xs font-bold uppercase tracking-[.14em] muted"}>Câu hỏi</p>
      <h2 lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className={review ? "text-2xl leading-9 font-semibold text-[#1C1C1C]" : "text-xl leading-9 font-semibold sm:text-2xl"}><AnnotatableText field="question" text={question.question}/></h2>
    </div>}
  </div>;
}

export function ChoiceList({ question, selected, onSelect, review = false }: { question: Question; selected?: number; onSelect?: (choice: number) => void; review?: boolean }) {
  const practiceAnnotations = usePracticeAnnotationMode() && question.section === "reading" && !review;
  const imageChoices = question.choiceImages?.some(Boolean);
  return <div className={imageChoices ? "mt-7 grid gap-3 sm:grid-cols-3" : "mt-7 space-y-3"} role={review ? undefined : "radiogroup"} aria-label="Các đáp án">{question.choices.map((choice, index) => {
    const sourceCrop = question.sourceVisual?.choices[index];
    const isCorrect = review && index === question.correctAnswer;
    const isWrong = review && index === selected && selected !== question.correctAnswer;
    const optionColor = review
      ? isCorrect ? "border-[var(--brand)] bg-[var(--brand-soft)]" : isWrong ? "border-[#a23d3d] bg-[#fff2f2]" : "border-[var(--border)] bg-white"
      : isCorrect ? "border-[var(--brand)] bg-[var(--brand-soft)]" : isWrong ? "border-[#ba7970] bg-[#fbf1ef]" : selected === index ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--border)] bg-white hover:border-[var(--brand-border)]";
    const letterColor = review
      ? isCorrect ? "border-[var(--brand)] bg-[var(--brand)] text-white" : isWrong ? "border-[#a23d3d] bg-[#a23d3d] text-white" : "border-[#aab5c5] bg-white text-[#344054]"
      : selected === index || isCorrect ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[var(--brand-border)] text-[var(--muted)]";
    if (practiceAnnotations && hasChinese(choice)) return <div key={index} onClick={(event) => {
      if ((event.target as Element).closest("button") || window.getSelection()?.isCollapsed === false) return;
      onSelect?.(index);
    }} className={["flex min-h-14 w-full cursor-pointer items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors", optionColor].join(" ")}>
      <button type="button" role="radio" aria-label={`Chọn đáp án ${letters[index]}: ${choice}`} aria-checked={selected === index} onClick={() => onSelect?.(index)} className={["flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]", letterColor].join(" ")}>{letters[index]}</button>
      <span lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className="min-w-0 flex-1 text-lg leading-7"><AnnotatableText field={`choice:${index}`} text={choice}/>{question.choiceImages?.[index] && <Image src={question.choiceImages[index]!} alt={`Hình đáp án ${letters[index] ?? index + 1}`} width={510} height={440} unoptimized className="mt-1 h-auto max-h-44 w-auto max-w-full rounded-lg object-contain" />}</span>
    </div>;
    return <button type="button" key={index} disabled={review} role={review ? undefined : "radio"} aria-label={sourceCrop ? `Đáp án ${letters[index]}` : undefined} aria-checked={review ? undefined : selected === index} onClick={() => onSelect?.(index)} className={["flex min-h-14 w-full gap-4 border px-4 py-3 text-left transition-colors", imageChoices ? "flex-col items-start" : "items-center", review ? "rounded-xl cursor-default" : "rounded-xl", optionColor].join(" ")}>
      {!sourceCrop && <span className={["flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold", letterColor].join(" ")}>{letters[index]}</span>}
      <span lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className={review ? "min-w-0 flex-1 text-lg leading-7 text-[#1C1C1C]" : "min-w-0 flex-1 text-lg leading-7"}>{sourceCrop ? <CroppedSource question={question} crop={sourceCrop} label={`Đáp án ${letters[index]}`} /> : choice}{question.choiceImages?.[index] && <Image src={question.choiceImages[index]!} alt={`Hình đáp án ${letters[index] ?? index + 1}`} width={510} height={440} unoptimized className="mt-1 h-auto max-h-44 w-auto max-w-full rounded-lg object-contain" />}</span>
      {isCorrect && <span className="ml-auto text-xs font-bold text-[var(--brand)]">Đáp án đúng</span>}
      {isWrong && <span className="ml-auto text-xs font-bold text-[#922f2f]">Đáp án của bạn</span>}
    </button>;
  })}</div>;
}

export function QuestionNavigator({ questions, currentIndex, answers, onJump, review = false, isUnavailable }: { questions: Question[]; currentIndex: number; answers: Record<string, number>; onJump: (index: number) => void; review?: boolean; isUnavailable?: (question: Question) => boolean }) {
  if (review) return <div>
    <div className="mb-4 flex items-start justify-between gap-3"><h2 className="text-sm font-bold text-[#1C1C1C]">Điều hướng câu hỏi</h2><span className="text-xs text-[#596473]">{Object.keys(answers).length} / {questions.length} đã trả lời</span></div>
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">{questions.map((question, index) => {
      const answer = answers[question.id];
      const status = answer === undefined ? "chưa trả lời" : answer === question.correctAnswer ? "đúng" : "sai";
      const statusColor = status === "đúng" ? "border-[var(--brand)] bg-[var(--brand)] text-white" : status === "sai" ? "border-[#a23d3d] bg-[#a23d3d] text-white" : "border-[var(--border)] bg-white text-[#344054]";
      return <button key={question.id} type="button" onClick={() => onJump(index)} aria-label={(question.section === "listening" ? "Nghe" : "Đọc") + ", câu " + (question.number ?? index + 1) + ", " + status + (currentIndex === index ? ", đang xem" : "")} aria-current={currentIndex === index ? "step" : undefined} className={["h-10 rounded-lg border text-sm font-bold transition-colors hover:opacity-80", statusColor, currentIndex === index ? "ring-2 ring-[#1C1C1C] ring-offset-2" : ""].join(" ")}>{question.section === "listening" ? "N" : "Đ"}{question.number ?? index + 1}</button>;
    })}</div>
    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#4f5a6a]"><span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 bg-[var(--brand)]" aria-hidden="true" />Đúng</span><span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 bg-[#a23d3d]" aria-hidden="true" />Sai</span><span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 border border-[var(--border)] bg-white" aria-hidden="true" />Chưa trả lời</span></div>
    <p className="mt-4 text-xs text-[#596473]">Viền đậm đánh dấu câu đang xem. Chọn số để chuyển câu.</p>
  </div>;

  return <div><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-[var(--brand)]">Điều hướng câu hỏi</h2><span className="text-xs muted">Đã trả lời {Object.keys(answers).length} / {questions.length}</span></div><div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">{questions.map((question, index) => <button key={question.id} type="button" disabled={isUnavailable?.(question)} onClick={() => onJump(index)} aria-label={(question.section === "listening" ? "Nghe" : "Đọc") + ", câu " + (question.number ?? index + 1) + (answers[question.id] === undefined ? ", chưa trả lời" : ", đã trả lời") + (isUnavailable?.(question) ? ", đã hết giờ phần này" : "")} aria-current={currentIndex === index ? "step" : undefined} className={["h-10 rounded-2xl border text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40", currentIndex === index ? "border-[var(--brand)] bg-[var(--brand)] text-white" : answers[question.id] !== undefined ? "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand)]" : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--brand-border)]"].join(" ")}>{question.section === "listening" ? "N" : "Đ"}{question.number ?? index + 1}</button>)}</div><div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs muted"><span>● Câu hiện tại</span><span>▣ Đã trả lời</span><span>□ Chưa trả lời</span><span>N: Nghe · Đ: Đọc</span></div></div>;
}

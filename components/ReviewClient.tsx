"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scriptQuery, type MockTest, type Question } from "@/lib/tests";
import { readSession, type ExamSession } from "@/lib/session";
import { ChoiceList, letters, QuestionContent, QuestionNavigator } from "./ExamParts";
import { CroppedSource } from "./BandAReadingImage";
import MascotSticker from "./MascotSticker";
import type { ListeningReview, ReadingReview, ReviewContent, ReviewLine } from "@/lib/review-content";
import { useT } from "./PreferencesProvider";

function HighlightedChinese({ line, reading = false }: { line: ReviewLine; reading?: boolean }) {
  const position = line.highlight ? line.chinese.indexOf(line.highlight) : -1;
  if (position < 0 || !line.highlight) return <>{line.chinese}</>;
  return <>{line.chinese.slice(0, position)}<mark className={reading ? "rounded bg-[var(--evidence)] px-0.5 font-semibold text-[var(--evidence-ink)]" : "review-evidence"}>{line.highlight}</mark>{line.chinese.slice(position + line.highlight.length)}</>;
}

function ReviewTranscriptPanel({ transcript, script, bandA }: { transcript?: ListeningReview; script?: "traditional" | "simplified"; bandA: boolean }) {
  const t = useT();
  if (transcript?.options && transcript.lines[0]?.vietnamese) {
    const line = transcript.lines[0];
    return <section className="transcript-panel review-transcript space-y-5" aria-label={t("Giải thích câu Nghe")}>
      <div><h2 className="transcript-label">{t("Transcript")}</h2><p lang={script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 whitespace-pre-line text-base leading-8 text-[var(--text)]"><HighlightedChinese line={line} /></p></div>
      <div><h3 className="text-sm font-bold text-[var(--brand)]">{t("Dịch transcript")}</h3><p lang="vi" className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--text)]">{line.vietnamese}</p></div>
      {transcript.question && <div><h3 className="text-sm font-bold text-[var(--brand)]">{t("Câu hỏi")}</h3><p lang={script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 text-base leading-7 text-[var(--text)]">{transcript.question.chinese}</p><p lang="vi" className="mt-1 text-sm text-[var(--muted)]">→ {transcript.question.vietnamese}</p></div>}
      <div><h3 className="text-sm font-bold text-[var(--brand)]">{t("Các lựa chọn")}</h3><div className="mt-2 space-y-2">{transcript.options.map((option, index) => <div key={index} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"><p lang={script === "simplified" ? "zh-Hans" : "zh-Hant"} className="text-base text-[var(--text)]">{option.label}. {option.chinese}</p>{bandA && option.imageUrl && <Image src={option.imageUrl} alt={`${t("Hình lựa chọn")} ${option.label}`} width={510} height={440} unoptimized className="mt-2 h-auto max-h-44 w-auto max-w-full" />}<p lang="vi" className="mt-1 text-sm text-[var(--muted)]">→ {option.vietnamese}</p></div>)}</div></div>
      {line.highlight && <div><h3 className="text-sm font-bold text-[var(--brand)]">{t("Từ khóa / Dấu hiệu")}</h3><p lang={script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 text-base leading-7"><mark className="rounded bg-[var(--evidence)] px-1 text-[var(--evidence-ink)]">{line.highlight}</mark></p></div>}
      {transcript.explanation && <div><h3 className="text-sm font-bold text-[var(--brand)]">{t("Giải thích")}</h3><p lang="vi" className="mt-2 text-sm leading-7 text-[var(--text)]">{transcript.explanation}</p></div>}
      {transcript.note && <p className="text-sm text-[var(--muted)]">{transcript.note}</p>}
    </section>;
  }
  const hasTranslation = transcript?.lines.some((line) => Boolean(line.vietnamese));
  return <section className="transcript-panel review-transcript" aria-label={t(hasTranslation ? "Lời thoại và bản dịch câu Nghe" : "Lời thoại câu Nghe")}>
    <h2 className="transcript-label">{t(hasTranslation ? "Nội dung bài nghe và dịch nghĩa" : "Nội dung bài nghe")}</h2>
    {!transcript ? <p className="mt-3 text-sm muted">{t("Chưa có bản ghi lời thoại cho câu này.")}</p> : <div className="mt-3 space-y-3">
      {transcript.lines.map((line, index) => <div key={index} className="review-transcript-line">
        <span className="review-transcript-label" aria-hidden={!line.label}>{line.label ?? ""}</span>
        <div><p lang={script === "simplified" ? "zh-Hans" : "zh-Hant"} className="transcript-chinese whitespace-pre-line"><HighlightedChinese line={line}/></p>{line.vietnamese && <p className="transcript-vietnamese">{line.vietnamese}</p>}</div>
      </div>)}
      {!hasTranslation && <p className="text-sm muted">{t("Chưa có bản dịch tiếng Việt cho câu này.")}</p>}
    </div>}
  </section>;
}

function AnswerSummary({ question, choice, transcript, readingReview, bandA }: { question: Question; choice?: number; transcript?: ListeningReview; readingReview?: ReadingReview; bandA: boolean }) {
  const t = useT();
  if (choice === undefined) return <p className="mt-2 font-semibold text-[var(--text)]">{t("Chưa trả lời")}</p>;
  const spokenChoice = transcript?.lines.find((line) => line.label === letters[choice]);
  return <div className="mt-2 flex items-start gap-3"><span className="font-bold text-[var(--brand)]">{letters[choice]}.</span><div lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className="min-w-0 flex-1 font-semibold text-[var(--text)]">{bandA ? readingReview?.optionChinese?.[choice] || question.choices[choice] || spokenChoice?.chinese : question.choices[choice] || readingReview?.optionChinese?.[choice] || spokenChoice?.chinese}{question.sourceVisual?.choices[choice] && <CroppedSource question={question} crop={question.sourceVisual.choices[choice]} label={`${t("Nội dung đáp án")} ${letters[choice]}`} />}{spokenChoice?.vietnamese && <p lang="vi" className="mt-1 text-sm font-normal text-[var(--muted)]">{spokenChoice.vietnamese}</p>}{question.choiceImages?.[choice] && <Image src={question.choiceImages[choice]!} alt={`${t("Hình lựa chọn")} ${letters[choice]}`} width={510} height={440} unoptimized className="mt-2 h-auto max-h-40 w-auto max-w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] object-contain" />}</div></div>;
}

function ReadingReviewPanel({ question, review, selected, bandA, detailed }: { question: Question; review?: ReadingReview; selected?: number; bandA: boolean; detailed: boolean }) {
  const t = useT();
  const chineseOptions = review?.optionChinese ?? question.choices;
  const hasTextOptions = chineseOptions.some((choice) => Boolean(choice.trim()));
  const options = review?.optionVietnamese;
  const hasReviewOptions = hasTextOptions || (bandA && Boolean(options?.length));
  const passage = review?.passageVietnamese;
  const questionMeaning = review?.questionVietnamese ?? (review?.kind === "question" ? review.vietnamese : undefined);
  const evidenceText = review?.evidenceText;
  const evidencePhrase = review?.evidencePhrase;
  return <section className="mt-5 space-y-6 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-6 sm:px-6" aria-label={t("Giải thích câu Đọc")}>
    <div>
      <h2 className="text-base font-bold text-[var(--brand)]">{t(detailed ? "Dịch bài đọc" : "Dịch bài / câu hỏi")}</h2>
      {review?.completedPassageChinese && <p lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base leading-8 text-[var(--text)]">{review.completedPassageChinese}</p>}
      {passage && <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--text)]">{passage}</p>}
      {questionMeaning && (!passage || !passage.includes(questionMeaning)) && <p className="mt-2 text-sm leading-7 text-[var(--text)]">{questionMeaning}</p>}
      {!passage && !questionMeaning && <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{t(hasTextOptions ? "Nội dung câu hỏi nằm trong hình phía trên; xem nghĩa từng lựa chọn bên dưới." : "Chưa có bản dịch cho câu này.")}</p>}
      {review?.note && <p className="mt-3 rounded-lg bg-[var(--brand-soft)] px-3 py-2 text-sm text-[var(--brand)]">{review.note}</p>}
    </div>
    {detailed && (review?.questionChinese || questionMeaning) && <div><h3 className="text-sm font-bold text-[var(--brand)]">{t("Câu hỏi")}</h3>{review?.questionChinese && <p lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 text-base leading-7 text-[var(--text)]">{review.questionChinese}</p>}{questionMeaning && <p lang="vi" className="mt-1 text-sm leading-7 text-[var(--muted)]">→ {questionMeaning}</p>}</div>}
    {hasReviewOptions && <div>
      <h3 className="text-sm font-bold text-[var(--brand)]">{t("Các lựa chọn")}</h3>
      <div className="mt-3 space-y-2">{chineseOptions.map((choice, choiceIndex) => {
        const correct = choiceIndex === question.correctAnswer;
        const wrong = choiceIndex === selected && !correct;
        return <div key={choiceIndex} className={["flex gap-3 rounded-xl border px-4 py-3", correct ? "border-[var(--brand)] bg-[var(--brand-soft)]" : wrong ? "border-[var(--error)] bg-[var(--error-soft)]" : "border-[var(--border)] bg-[var(--surface)]"].join(" ")}>
          <span className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold", correct ? "border-[var(--brand-fill)] bg-[var(--brand-fill)] text-white" : wrong ? "border-[var(--error-fill)] bg-[var(--error-fill)] text-white" : "border-[var(--border)] text-[var(--text)]"].join(" ")}>{letters[choiceIndex]}</span>
          <div className="min-w-0 flex-1">{(choice || !bandA) && <p lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className="break-words text-base leading-7 text-[var(--text)]">{choice}</p>}{bandA && question.choiceImages?.[choiceIndex] && <Image src={question.choiceImages[choiceIndex]!} alt={`${t("Hình lựa chọn")} ${letters[choiceIndex]}`} width={510} height={440} unoptimized className="mt-2 h-auto max-h-44 w-auto max-w-full" />}<p lang="vi" className="mt-1 text-sm leading-6 text-[var(--muted)]">{options?.[choiceIndex] || t("Chưa có bản dịch cho lựa chọn này.")}</p></div>
          {(correct || wrong) && <span className={["shrink-0 self-start text-xs font-semibold", correct ? "text-[var(--brand)]" : "text-[var(--error)]"].join(" ")}>{t(correct ? "Đúng" : "Bạn chọn")}</span>}
        </div>;
      })}</div>
    </div>}
    {review?.explanation && <div><h3 className="text-sm font-bold text-[var(--brand)]">{t("Giải thích")}</h3><p lang="vi" className="mt-2 text-sm leading-7 text-[var(--text)]">{review.explanation}</p></div>}
    {evidenceText && evidencePhrase && evidenceText.includes(evidencePhrase) && <div><h3 className="text-sm font-bold text-[var(--brand)]">{t(detailed && !bandA ? "Từ khóa / Dấu hiệu trong bài" : "Dấu hiệu trong bài")}</h3><p lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 whitespace-pre-line text-base leading-8 text-[var(--text)]"><HighlightedChinese line={{ chinese: evidenceText, highlight: evidencePhrase }} reading /></p></div>}
  </section>;
}

export default function ReviewClient({ test, reviewContent }: { test: MockTest; reviewContent: ReviewContent }) {
  const t = useT();
  const router = useRouter();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [index, setIndex] = useState(0);
  const [minimumReviewHeight, setMinimumReviewHeight] = useState(0);
  const scrollPositionRef = useRef<number | null>(null);
  const reviewShellRef = useRef<HTMLDivElement | null>(null);
  const basePath = "/tocfl/" + test.id;
  const suffix = scriptQuery(test);
  const scope = test.scope ?? "full";
  const script = test.script;
  const bandA = test.id.startsWith("band-a-test-");
  const detailed = bandA || test.id.startsWith("band-b-test-") || test.id.startsWith("band-c-test-");

  useEffect(() => {
    const saved = readSession(test.id);
    if (!saved) { router.replace(basePath + "/instructions"); return; }
    if ((saved.scope ?? "full") !== scope || saved.script !== script) { router.replace(basePath + "/review" + scriptQuery({ script: saved.script, scope: saved.scope ?? "full" })); return; }
    if (saved.status !== "submitted") { router.replace(basePath + "/exam" + suffix); return; }
    const timeout = window.setTimeout(() => setSession(saved), 0);
    return () => window.clearTimeout(timeout);
  }, [router, test.id, basePath, suffix, scope, script]);

  useLayoutEffect(() => {
    if (scrollPositionRef.current === null) return;
    window.scrollTo(0, scrollPositionRef.current);
    scrollPositionRef.current = null;
  }, [index]);

  if (!session) return <div className="report-shell"><main className="mx-auto max-w-7xl px-5 py-12">{t("Đang tải phần xem lại…")}</main></div>;

  const question = test.questions[index];
  const listeningReview = reviewContent.listening[question.id];
  const readingReview = reviewContent.reading[question.id];
  const selected = session.answers[question.id];
  const state = selected === undefined ? "Chưa trả lời" : selected === question.correctAnswer ? "Đúng" : "Sai";
  const mascot = state === "Đúng" ? "boba" : "puzzled";
  const statusStyle = state === "Đúng" ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : state === "Sai" ? "border-[var(--error)] bg-[var(--error-soft)] text-[var(--error)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]";
  const jump = (next: number) => {
    if (next === index || next < 0 || next >= test.questions.length) return;
    scrollPositionRef.current = window.scrollY;
    setMinimumReviewHeight((height) => Math.max(height, Math.ceil(reviewShellRef.current?.getBoundingClientRect().height ?? 0)));
    setIndex(next);
  };

  return <div className="report-shell" ref={reviewShellRef} style={minimumReviewHeight ? { minHeight: minimumReviewHeight } : undefined}>
    
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="report-surface px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
        <div data-section={question.section} className="review-report-heading mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[var(--border)] pb-7">
          <div>
            <Link href={basePath + "/result" + suffix} className="report-text-link text-sm">← {t("Về kết quả")}</Link>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[var(--brand)] sm:text-4xl">{t("Xem lại đáp án")}</h1>
            <p className="mt-2 text-sm text-[var(--muted)] sm:text-base">{t(test.title)} · {t(question.section === "listening" ? "Nghe" : "Đọc")}, {t("câu")} {question.number} / {test.questions.filter((item) => item.section === question.section).length}</p>
          </div>
          <div className="flex items-center gap-2"><MascotSticker key={question.id} variant={mascot} decorative className="review-mascot" /><span className={["rounded-full border px-4 py-2 text-sm font-bold", statusStyle].join(" ")}>{t(state)}</span></div>
        </div>


        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_282px]">
          <article className="min-w-0">
            <p className="report-eyebrow mb-6">{t(question.section === "listening" ? "Nghe" : "Đọc")} · {t("Câu")} {question.number}</p>
            <QuestionContent question={question} review afterAudio={<ReviewTranscriptPanel transcript={listeningReview} script={test.script} bandA={bandA} />} />
            {question.section === "listening" || !(readingReview?.optionChinese ?? question.choices).some((choice) => Boolean(choice.trim())) ? <ChoiceList question={question} selected={selected} review /> : null}

            <div className="review-answer-summary mt-8 grid gap-5 rounded-xl border border-[var(--border)] bg-[var(--brand-soft)] p-5 sm:grid-cols-2 sm:p-6">
              <div><p className="text-sm font-medium text-[var(--muted)]">{t("Đáp án của bạn")}</p><AnswerSummary question={question} choice={selected} transcript={listeningReview} readingReview={readingReview} bandA={bandA} /></div>
              <div><p className="text-sm font-medium text-[var(--muted)]">{t("Đáp án đúng")}</p><AnswerSummary question={question} choice={question.correctAnswer} transcript={listeningReview} readingReview={readingReview} bandA={bandA} /></div>
            </div>

            {question.section === "reading" && <ReadingReviewPanel question={question} review={readingReview} selected={selected} bandA={bandA} detailed={detailed} />}

            <div className="mt-8 flex justify-between gap-3 border-t border-[var(--border)] pt-6">
              <button type="button" className="report-secondary-button disabled:cursor-not-allowed disabled:opacity-40" disabled={index === 0} onClick={() => jump(index - 1)}>← {t("Câu trước")}</button>
              <button type="button" className="report-primary-button disabled:cursor-not-allowed disabled:opacity-40" disabled={index === test.questions.length - 1} onClick={() => jump(index + 1)}>{t("Câu sau")} →</button>
            </div>
          </article>

          <aside className="hidden lg:block"><div className="sticky top-6 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5"><QuestionNavigator questions={test.questions} currentIndex={index} answers={session.answers} onJump={jump} review /></div></aside>
        </div>
        <details className="mt-7 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5 lg:hidden"><summary className="cursor-pointer font-bold text-[var(--brand)]">{t("Điều hướng câu hỏi")}</summary><div className="mt-5"><QuestionNavigator questions={test.questions} currentIndex={index} answers={session.answers} onJump={jump} review /></div></details>
      </div>
    </main>
  </div>;
}

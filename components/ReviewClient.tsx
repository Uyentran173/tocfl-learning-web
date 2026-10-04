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

function HighlightedChinese({ line, reading = false }: { line: ReviewLine; reading?: boolean }) {
  const position = line.highlight ? line.chinese.indexOf(line.highlight) : -1;
  if (position < 0 || !line.highlight) return <>{line.chinese}</>;
  return <>{line.chinese.slice(0, position)}<mark className={reading ? "rounded bg-[#fff0a8] px-0.5 font-semibold text-[#1C1C1C]" : "review-evidence"}>{line.highlight}</mark>{line.chinese.slice(position + line.highlight.length)}</>;
}

function ReviewTranscriptPanel({ transcript, script, question, selected, bandA }: { transcript?: ListeningReview; script?: "traditional" | "simplified"; question: Question; selected?: number; bandA: boolean }) {
  if (transcript?.options && transcript.lines[0]?.vietnamese) {
    const line = transcript.lines[0];
    return <section className="transcript-panel review-transcript space-y-5" aria-label="Giải thích câu Nghe">
      <div><h2 className="transcript-label">Transcript</h2><p lang={script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 whitespace-pre-line text-base leading-8 text-[#1C1C1C]"><HighlightedChinese line={line} /></p></div>
      <div><h3 className="text-sm font-bold text-[var(--brand)]">Dịch transcript</h3><p lang="vi" className="mt-2 whitespace-pre-line text-sm leading-7 text-[#1C1C1C]">{line.vietnamese}</p></div>
      {transcript.question && <div><h3 className="text-sm font-bold text-[var(--brand)]">Câu hỏi</h3><p lang={script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 text-base leading-7 text-[#1C1C1C]">{transcript.question.chinese}</p><p lang="vi" className="mt-1 text-sm text-[#5e6674]">→ {transcript.question.vietnamese}</p></div>}
      <div><h3 className="text-sm font-bold text-[var(--brand)]">Các lựa chọn</h3><div className="mt-2 space-y-2">{transcript.options.map((option, index) => <div key={index} className="rounded-lg border border-[var(--border)] bg-white px-3 py-2"><p lang={script === "simplified" ? "zh-Hans" : "zh-Hant"} className="text-base text-[#1C1C1C]">{option.label}. {option.chinese}</p>{bandA && option.imageUrl && <Image src={option.imageUrl} alt={`Hình lựa chọn ${option.label}`} width={510} height={440} unoptimized className="mt-2 h-auto max-h-44 w-auto max-w-full" />}<p lang="vi" className="mt-1 text-sm text-[#5e6674]">→ {option.vietnamese}</p></div>)}</div></div>
      {line.highlight && <div><h3 className="text-sm font-bold text-[var(--brand)]">Từ khóa / Dấu hiệu</h3><p lang={script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 text-base leading-7"><mark className="rounded bg-[#fff0a8] px-1 text-[#1C1C1C]">{line.highlight}</mark></p></div>}
      {transcript.explanation && <div><h3 className="text-sm font-bold text-[var(--brand)]">Giải thích</h3><p lang="vi" className="mt-2 text-sm leading-7 text-[#1C1C1C]">{transcript.explanation}</p></div>}
      {bandA && selected !== undefined && selected !== question.correctAnswer && transcript.options[selected]?.vietnamese && <p lang="vi" className="text-sm text-[#5e6674]">Bạn chọn {letters[selected]} ({transcript.options[selected].vietnamese}); lời thoại{line.highlight ? " và dấu hiệu trên" : " và hình minh họa"} phù hợp với đáp án {letters[question.correctAnswer]}.</p>}
      {!bandA && selected !== undefined && selected !== question.correctAnswer && transcript.options[selected]?.vietnamese && <p lang="vi" className="text-sm text-[#5e6674]">Bạn chọn {letters[selected]} ({transcript.options[selected].vietnamese}); hãy đối chiếu với chi tiết trong transcript để thấy vì sao đáp án đúng là {letters[question.correctAnswer]}.</p>}
      {transcript.note && <p className="text-sm text-[#5e6674]">{transcript.note}</p>}
    </section>;
  }
  const hasTranslation = transcript?.lines.some((line) => Boolean(line.vietnamese));
  const hasEvidence = transcript?.lines.some((line) => Boolean(line.highlight));
  return <section className="transcript-panel review-transcript" aria-label={hasTranslation ? "Lời thoại và bản dịch câu Nghe" : "Lời thoại câu Nghe"}>
    <h2 className="transcript-label">{hasTranslation ? "Nội dung bài nghe và dịch nghĩa" : "Nội dung bài nghe"}</h2>
    {!transcript ? <p className="mt-3 text-sm muted">Chưa có bản ghi lời thoại cho câu này.</p> : <div className="mt-3 space-y-3">
      {transcript.lines.map((line, index) => <div key={index} className="review-transcript-line">
        <span className="review-transcript-label" aria-hidden={!line.label}>{line.label ?? ""}</span>
        <div><p lang={script === "simplified" ? "zh-Hans" : "zh-Hant"} className="transcript-chinese whitespace-pre-line"><HighlightedChinese line={line}/></p>{line.vietnamese && <p className="transcript-vietnamese">{line.vietnamese}</p>}</div>
      </div>)}
      {hasEvidence && <p className="review-evidence-note">Phần được tô màu là chi tiết liên quan đến đáp án đúng.</p>}
      {!hasTranslation && <p className="text-sm muted">Chưa có bản dịch tiếng Việt cho câu này.</p>}
    </div>}
  </section>;
}

function AnswerSummary({ question, choice, transcript, readingReview, bandA }: { question: Question; choice?: number; transcript?: ListeningReview; readingReview?: ReadingReview; bandA: boolean }) {
  if (choice === undefined) return <p className="mt-2 font-semibold text-[#1C1C1C]">Chưa trả lời</p>;
  const spokenChoice = transcript?.lines.find((line) => line.label === letters[choice]);
  return <div className="mt-2 flex items-start gap-3"><span className="font-bold text-[var(--brand)]">{letters[choice]}.</span><div lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className="min-w-0 flex-1 font-semibold text-[#1C1C1C]">{bandA ? readingReview?.optionChinese?.[choice] || question.choices[choice] || spokenChoice?.chinese : question.choices[choice] || readingReview?.optionChinese?.[choice] || spokenChoice?.chinese}{question.sourceVisual?.choices[choice] && <CroppedSource question={question} crop={question.sourceVisual.choices[choice]} label={`Nội dung đáp án ${letters[choice]}`} />}{spokenChoice?.vietnamese && <p lang="vi" className="mt-1 text-sm font-normal text-[#5e6674]">{spokenChoice.vietnamese}</p>}{question.choiceImages?.[choice] && <Image src={question.choiceImages[choice]!} alt={`Hình lựa chọn ${letters[choice]}`} width={510} height={440} unoptimized className="mt-2 h-auto max-h-40 w-auto max-w-full rounded-lg border border-[var(--border)] bg-white object-contain" />}</div></div>;
}

function ReadingReviewPanel({ question, review, selected, bandA, detailed }: { question: Question; review?: ReadingReview; selected?: number; bandA: boolean; detailed: boolean }) {
  const chineseOptions = review?.optionChinese ?? question.choices;
  const hasTextOptions = chineseOptions.some((choice) => Boolean(choice.trim()));
  const options = review?.optionVietnamese;
  const hasReviewOptions = hasTextOptions || (bandA && Boolean(options?.length));
  const passage = review?.passageVietnamese;
  const questionMeaning = review?.questionVietnamese ?? (review?.kind === "question" ? review.vietnamese : undefined);
  const evidenceText = review?.evidenceText;
  const evidencePhrase = review?.evidencePhrase;
  return <section className="mt-5 space-y-6 rounded-xl border border-[var(--border)] bg-[#fbfcff] px-5 py-6 sm:px-6" aria-label="Giải thích câu Đọc">
    <div>
      <h2 className="text-base font-bold text-[var(--brand)]">{detailed ? "Dịch bài đọc" : "Dịch bài / câu hỏi"}</h2>
      {review?.completedPassageChinese && <p lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base leading-8 text-[#1C1C1C]">{review.completedPassageChinese}</p>}
      {passage && <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#1C1C1C]">{passage}</p>}
      {questionMeaning && (!passage || !passage.includes(questionMeaning)) && <p className="mt-2 text-sm leading-7 text-[#1C1C1C]">{questionMeaning}</p>}
      {!passage && !questionMeaning && <p className="mt-2 text-sm leading-6 text-[#5e6674]">{hasTextOptions ? "Nội dung câu hỏi nằm trong hình phía trên; xem nghĩa từng lựa chọn bên dưới." : "Chưa có bản dịch cho câu này."}</p>}
      {review?.note && <p className="mt-3 rounded-lg bg-[var(--brand-soft)] px-3 py-2 text-sm text-[var(--brand)]">{review.note}</p>}
    </div>
    {detailed && (review?.questionChinese || questionMeaning) && <div><h3 className="text-sm font-bold text-[var(--brand)]">Câu hỏi</h3>{review?.questionChinese && <p lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 text-base leading-7 text-[#1C1C1C]">{review.questionChinese}</p>}{questionMeaning && <p lang="vi" className="mt-1 text-sm leading-7 text-[#5e6674]">→ {questionMeaning}</p>}</div>}
    {hasReviewOptions && <div>
      <h3 className="text-sm font-bold text-[var(--brand)]">Các lựa chọn</h3>
      <div className="mt-3 space-y-2">{chineseOptions.map((choice, choiceIndex) => {
        const correct = choiceIndex === question.correctAnswer;
        const wrong = choiceIndex === selected && !correct;
        return <div key={choiceIndex} className={["flex gap-3 rounded-xl border px-4 py-3", correct ? "border-[var(--brand)] bg-[var(--brand-soft)]" : wrong ? "border-[#b36a6a] bg-[#fff2f2]" : "border-[var(--border)] bg-white"].join(" ")}>
          <span className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold", correct ? "border-[var(--brand)] bg-[var(--brand)] text-white" : wrong ? "border-[#a23d3d] bg-[#a23d3d] text-white" : "border-[#aab5c5] text-[#344054]"].join(" ")}>{letters[choiceIndex]}</span>
          <div className="min-w-0 flex-1">{(choice || !bandA) && <p lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className="break-words text-base leading-7 text-[#1C1C1C]">{choice}</p>}{bandA && question.choiceImages?.[choiceIndex] && <Image src={question.choiceImages[choiceIndex]!} alt={`Hình lựa chọn ${letters[choiceIndex]}`} width={510} height={440} unoptimized className="mt-2 h-auto max-h-44 w-auto max-w-full" />}<p lang="vi" className="mt-1 text-sm leading-6 text-[#5e6674]">{options?.[choiceIndex] || "Chưa có bản dịch cho lựa chọn này."}</p></div>
          {(correct || wrong) && <span className={["shrink-0 self-start text-xs font-semibold", correct ? "text-[var(--brand)]" : "text-[#922f2f]"].join(" ")}>{correct ? "Đúng" : "Bạn chọn"}</span>}
        </div>;
      })}</div>
    </div>}
    {review?.explanation && <div><h3 className="text-sm font-bold text-[var(--brand)]">Giải thích</h3><p className="mt-2 text-sm leading-7 text-[#1C1C1C]">{review.explanation}</p>{bandA && selected !== undefined && selected !== question.correctAnswer && options?.[selected] && <p lang="vi" className="mt-2 text-sm leading-7 text-[#5e6674]">Bạn chọn {letters[selected]} ({options[selected]}); {evidencePhrase ? "dấu hiệu trong bài" : "ngữ cảnh và hình minh họa"} phù hợp với đáp án {letters[question.correctAnswer]}.</p>}{detailed && !bandA && selected !== undefined && selected !== question.correctAnswer && options?.[selected] && <p lang="vi" className="mt-2 text-sm leading-7 text-[#5e6674]">Bạn chọn {letters[selected]} ({options[selected]}); hãy đối chiếu dấu hiệu và ngữ cảnh trong bài với đáp án {letters[question.correctAnswer]}.</p>}</div>}
    {evidenceText && evidencePhrase && evidenceText.includes(evidencePhrase) && <div><h3 className="text-sm font-bold text-[var(--brand)]">{detailed && !bandA ? "Từ khóa / Dấu hiệu trong bài" : "Dấu hiệu trong bài"}</h3><p lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className="mt-2 whitespace-pre-line text-base leading-8 text-[#1C1C1C]"><HighlightedChinese line={{ chinese: evidenceText, highlight: evidencePhrase }} reading /></p></div>}
  </section>;
}

export default function ReviewClient({ test, reviewContent }: { test: MockTest; reviewContent: ReviewContent }) {
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
  const detailed = bandA || test.id.startsWith("band-b-test-");

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

  if (!session) return <div className="report-shell"><main className="mx-auto max-w-7xl px-5 py-12">Đang tải phần xem lại…</main></div>;

  const question = test.questions[index];
  const listeningReview = reviewContent.listening[question.id];
  const readingReview = reviewContent.reading[question.id];
  const selected = session.answers[question.id];
  const state = selected === undefined ? "Chưa trả lời" : selected === question.correctAnswer ? "Đúng" : "Sai";
  const mascot = state === "Đúng"
    ? { variant: "boba" as const, text: "Đúng rồi! Xem lại nội dung câu để ghi nhớ nhé." }
    : state === "Sai"
      ? { variant: "puzzled" as const, text: "Câu này chưa đúng. Bạn có thể xem lại nội dung và đáp án bên dưới." }
      : { variant: "puzzled" as const, text: "Bạn chưa trả lời câu này. Hãy xem đáp án để ôn lại nhé." };
  const statusStyle = state === "Đúng" ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]" : state === "Sai" ? "border-[#b36a6a] bg-[#fff2f2] text-[#922f2f]" : "border-[var(--border)] bg-white text-[#4d5665]";
  const jump = (next: number) => {
    if (next === index || next < 0 || next >= test.questions.length) return;
    scrollPositionRef.current = window.scrollY;
    setMinimumReviewHeight((height) => Math.max(height, Math.ceil(reviewShellRef.current?.getBoundingClientRect().height ?? 0)));
    setIndex(next);
  };

  return <div className="report-shell" ref={reviewShellRef} style={minimumReviewHeight ? { minHeight: minimumReviewHeight } : undefined}>
    
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="report-surface px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-[var(--border)] pb-7">
          <div>
            <Link href={basePath + "/result" + suffix} className="report-text-link text-sm">← Về kết quả</Link>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-[var(--brand)] sm:text-4xl">Xem lại đáp án</h1>
            <p className="mt-2 text-sm text-[#5e6674] sm:text-base">{test.title} · {question.section === "listening" ? "Nghe" : "Đọc"}, câu {question.number} / {test.questions.filter((item) => item.section === question.section).length}</p>
          </div>
          <span className={["rounded-full border px-4 py-2 text-sm font-bold", statusStyle].join(" ")}>{state}</span>
        </div>

        <div className="review-mascot-note mb-7" role="note"><MascotSticker key={question.id} variant={mascot.variant} decorative className="review-mascot mascot-pop" /><p className="text-sm leading-6 text-[var(--brand)]">{mascot.text}</p></div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_282px]">
          <article className="min-w-0">
            <p className="report-eyebrow mb-6">{question.section === "listening" ? "Nghe" : "Đọc"} · Câu {question.number}</p>
            <QuestionContent question={question} review afterAudio={<ReviewTranscriptPanel transcript={listeningReview} script={test.script} question={question} selected={selected} bandA={bandA} />} />
            {question.section === "listening" || !(readingReview?.optionChinese ?? question.choices).some((choice) => Boolean(choice.trim())) ? <ChoiceList question={question} selected={selected} review /> : null}

            <div className="mt-8 grid gap-5 rounded-xl border border-[var(--border)] bg-[var(--brand-soft)] p-5 sm:grid-cols-2 sm:p-6">
              <div><p className="text-sm font-medium text-[#5e6674]">Đáp án của bạn</p><AnswerSummary question={question} choice={selected} transcript={listeningReview} readingReview={readingReview} bandA={bandA} /></div>
              <div><p className="text-sm font-medium text-[#5e6674]">Đáp án đúng</p><AnswerSummary question={question} choice={question.correctAnswer} transcript={listeningReview} readingReview={readingReview} bandA={bandA} /></div>
            </div>

            {question.section === "reading" && <ReadingReviewPanel question={question} review={readingReview} selected={selected} bandA={bandA} detailed={detailed} />}

            <div className="mt-8 flex justify-between gap-3 border-t border-[var(--border)] pt-6">
              <button type="button" className="report-secondary-button disabled:cursor-not-allowed disabled:opacity-40" disabled={index === 0} onClick={() => jump(index - 1)}>← Câu trước</button>
              <button type="button" className="report-primary-button disabled:cursor-not-allowed disabled:opacity-40" disabled={index === test.questions.length - 1} onClick={() => jump(index + 1)}>Câu sau →</button>
            </div>
          </article>

          <aside className="hidden lg:block"><div className="sticky top-6 rounded-xl border border-[var(--border)] bg-[#fbfcff] p-5"><QuestionNavigator questions={test.questions} currentIndex={index} answers={session.answers} onJump={jump} review /></div></aside>
        </div>
        <details className="mt-7 rounded-xl border border-[var(--border)] bg-[#fbfcff] p-5 lg:hidden"><summary className="cursor-pointer font-bold text-[var(--brand)]">Điều hướng câu hỏi</summary><div className="mt-5"><QuestionNavigator questions={test.questions} currentIndex={index} answers={session.answers} onJump={jump} review /></div></details>
      </div>
    </main>
  </div>;
}

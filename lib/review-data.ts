import transcriptFile from "@/data/review/listening-transcripts-201811.json";
import listeningTranslations from "@/data/review/listening-translations-vi.json";
import readingTranslations from "@/data/review/reading-translations-vi.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { MockTest } from "./tests";
import { buildReviewContent, type ReviewContent, type ReviewLine, type SourceEvidence } from "./review-content";
import { enrichReadingReview } from "./reading-review-details";

type BandAReviewFile = {
  testId: string;
  listening: Record<string, { number: number; correctAnswer: string; vi: string; evidence: { traditional: string; simplified: string } }>;
  reading: Record<string, { number: number; correctAnswer: string; kind: "question" | "answer"; vi: string; evidence: { traditional: SourceEvidence; simplified: SourceEvidence } }>;
};

type BandBTranscript = {
  examId: string; componentId: string;
  groups: { id: string; questions: number[]; traditional: string; simplified: string }[];
};
type BandBReviewFile = {
  testId: string;
  listening: Record<string, { evidenceTraditional: string; vi: string }>;
  reading: BandAReviewFile["reading"];
};

type BandCReviewEntry = {
  number: number; correctAnswer: string; groupId: string;
  questionChinese?: { traditional: string; simplified: string };
  questionVietnamese: string; optionVietnamese: string[];
  transcriptVietnamese?: string; passageVietnamese?: string;
  evidence: { traditional: string; simplified: string };
  explanation: string;
};
type BandCReviewFile = {
  testId: string;
  listening: Record<string, BandCReviewEntry>;
  reading: Record<string, BandCReviewEntry>;
};

type CompleteBandAEntry = {
  number: number;
  correctAnswer: string;
  transcriptChinese?: { traditional: string; simplified: string };
  transcriptVi?: string;
  questionChinese?: { traditional: string; simplified: string };
  questionVi: string;
  optionChinese?: { traditional: string[]; simplified: string[] };
  optionTranslations: string[];
  passageChinese?: { traditional: string; simplified: string } | null;
  passageVi?: string;
  evidence?: { traditional: string; simplified: string } | null;
  explanationVi: string;
  note?: string;
  sourceLimitation?: string;
};
type CompleteBandAReviewFile = {
  testId: string;
  listening: Record<string, CompleteBandAEntry>;
  reading: Record<string, CompleteBandAEntry>;
};

function completeBandAReadingPassage(test: MockTest, question: MockTest["questions"][number], review: CompleteBandAReviewFile): string | undefined {
  const number = question.number ?? 0;
  const script = test.script === "simplified" ? "simplified" : "traditional";
  const first = number <= 40 ? 36 : 41;
  if (number >= 36 && number <= 45 && question.passage && review.reading[question.id]?.passageChinese?.[script]?.includes(`（${first}）`)) {
    let passage = (review.reading[question.id]?.passageChinese?.[script] || question.passage).replace(/\s+/g, "");
    for (let blank = first; blank < first + 5; blank++) {
      const item = test.questions.find((candidate) => candidate.section === "reading" && candidate.number === blank);
      const answer = item && (review.reading[item.id]?.optionChinese?.[script]?.[item.correctAnswer] || item.choices[item.correctAnswer]);
      if (!answer) return undefined;
      passage = passage.replace(`（${blank}）`, answer);
    }
    return passage;
  }
  if (number === 35 || number === 40) {
    const first = number - 4;
    const lines = [];
    for (let blank = first; blank <= number; blank++) {
      const item = test.questions.find((candidate) => candidate.section === "reading" && candidate.number === blank);
      const answer = item && (review.reading[item.id]?.optionChinese?.[script]?.[item.correctAnswer] || item.choices[item.correctAnswer]);
      const source = item && (review.reading[item.id]?.questionChinese?.[script] || item.question);
      if (!source || !answer) return undefined;
      const blanks = /_{2,}|\s{2,}|\n/g;
      const parts = answer.split("…").filter(Boolean);
      if (parts.length > 1) {
        let index = 0;
        lines.push(source.replace(blanks, () => parts[index++] || ""));
      } else {
        lines.push(source.replace(blanks, answer));
      }
    }
    return lines.join("");
  }
  return undefined;
}

function getCompleteBandAReviewContent(test: MockTest): ReviewContent {
  const result: ReviewContent = { listening: {}, reading: {} };
  const folder = join(process.cwd(), "data", "test-supplements", test.id);
  const review = JSON.parse(readFileSync(join(folder, test.id === "band-a-test-01" ? "review-complete-vi.json" : "review-vi.json"), "utf8")) as CompleteBandAReviewFile;
  if (review.testId !== test.id) return result;
  const script = test.script === "simplified" ? "simplified" : "traditional";
  for (const question of test.questions) {
    const entry = review[question.section][question.id];
    if (!entry || entry.number !== question.number || entry.correctAnswer !== question.choiceIds?.[question.correctAnswer] ||
        !entry.explanationVi?.trim() || (!entry.questionVi && Boolean(question.question)) ||
        (entry.optionTranslations.length !== question.choices.length && question.choices.some(Boolean))) continue;
    if (question.section === "listening") {
      const chinese = entry.transcriptChinese?.[script];
      const evidence = entry.evidence?.[script];
      if (!chinese || !entry.transcriptVi || (evidence ? !chinese.includes(evidence) : !entry.sourceLimitation)) continue;
      result.listening[question.id] = {
        lines: [{ chinese, vietnamese: entry.transcriptVi, highlight: evidence }],
        question: entry.questionChinese?.[script] ? { chinese: entry.questionChinese[script], vietnamese: entry.questionVi } : undefined,
        options: entry.optionTranslations.map((vietnamese, index) => ({
          label: question.choiceIds?.[index], chinese: entry.optionChinese?.[script]?.[index] ?? "", vietnamese,
          imageUrl: question.choiceImages?.[index] ?? undefined,
        })),
        explanation: entry.explanationVi,
        note: entry.sourceLimitation,
      };
      continue;
    }
    const chinese = (entry.passageChinese?.[script] || question.passage || question.question || entry.questionChinese?.[script] || "").replace(/\s+/g, "");
    const evidence = entry.evidence?.[script];
    if (evidence && !chinese.includes(evidence)) continue;
    result.reading[question.id] = {
      kind: question.number && question.number <= 15 ? "question" : "answer",
      vietnamese: entry.questionVi,
      questionChinese: entry.questionChinese?.[script] || question.question || undefined,
      questionVietnamese: entry.questionVi,
      passageVietnamese: entry.passageVi,
      completedPassageChinese: [35, 40, 45].includes(question.number ?? 0) ? completeBandAReadingPassage(test, question, review) : undefined,
      optionChinese: entry.optionChinese?.[script] ?? question.choices,
      optionVietnamese: entry.optionTranslations,
      explanation: entry.explanationVi,
      evidenceText: evidence ? chinese : undefined,
      evidencePhrase: evidence ?? undefined,
      note: entry.note || entry.sourceLimitation,
    };
  }
  return result;
}

function bandCTranscriptBody(source: string): string {
  const lines = source.split("\n");
  let first = lines.findIndex((line) => /^[男女]：/.test(line));
  if (first < 0) {
    const instruction = lines.findIndex((line) => /^(?:現在請聽|现在请听)/.test(line));
    first = instruction >= 0 ? instruction + 1 : Math.max(0, lines.findIndex((line) => /^(?:這年頭|这年头)/.test(line)));
  }
  return lines.slice(first).filter((line) => !/^\d{1,2}\.\s/.test(line))
    .map((line) => line.trim()).join("").replace(/([男女]：)/g, "\n$1").trim();
}

function completedBandCGap(test: MockTest, question: MockTest["questions"][number]): string | undefined {
  if (question.section !== "reading" || !question.number || question.number > 15 || !question.passage) return undefined;
  const start = question.number <= 5 ? 1 : question.number <= 10 ? 6 : 11;
  let passage = question.passage;
  for (let number = start; number < start + 5; number++) {
    const item = test.questions.find((candidate) => candidate.section === "reading" && candidate.number === number);
    const answer = item?.choices[item.correctAnswer];
    if (!answer) return undefined;
    const parts = answer.split("⋯").filter(Boolean);
    if (parts.length === 2 && passage.split(`【${number}】`).length === 3) {
      passage = passage.replace(`【${number}】`, parts[0]).replace(`【${number}】`, parts[1]);
    } else {
      passage = passage.replace(`【${number}】`, answer);
    }
  }
  return passage;
}

function getBandCReviewContent(test: MockTest): ReviewContent {
  const result: ReviewContent = { listening: {}, reading: {} };
  try {
    const folder = join(process.cwd(), "data", "test-supplements", test.id);
    const data = JSON.parse(readFileSync(join(folder, "listening-transcripts.json"), "utf8")) as BandBTranscript;
    const review = JSON.parse(readFileSync(join(folder, "review-vi.json"), "utf8")) as BandCReviewFile;
    if (data.examId !== test.id || data.componentId !== "listening" || review.testId !== test.id) return result;
    const script = test.script === "simplified" ? "simplified" : "traditional";
    const questions = new Map(test.questions.map((question) => [question.id, question]));
    for (const group of data.groups) for (const number of group.questions) {
      const id = `listening-q${String(number).padStart(2, "0")}`;
      const question = questions.get(id);
      if (question?.section !== "listening" || question.number !== number) continue;
      const chinese = bandCTranscriptBody(group[script]);
      if (!chinese) continue;
      const note = review.listening[id];
      const evidence = note?.evidence?.[script];
      const validNote = note?.number === number && note.correctAnswer === question.choiceIds?.[question.correctAnswer] &&
        note.groupId === group.id && note.optionVietnamese?.length === question.choices.length &&
        Boolean(note.questionChinese?.[script]) && Boolean(note.transcriptVietnamese?.trim()) &&
        Boolean(evidence && chinese.replace(/\s+/g, "").includes(evidence.replace(/\s+/g, "")));
      result.listening[id] = validNote ? {
        lines: [{ chinese, vietnamese: note.transcriptVietnamese, highlight: evidence }],
        question: { chinese: note.questionChinese![script], vietnamese: note.questionVietnamese },
        options: question.choices.map((choice, index) => ({ label: question.choiceIds?.[index], chinese: choice, vietnamese: note.optionVietnamese[index] })),
        explanation: note.explanation,
      } : { lines: [{ chinese }] };
    }
    for (const [id, note] of Object.entries(review.reading)) {
      const question = questions.get(id);
      const evidence = note.evidence?.[script];
      if (!question || question.section !== "reading" || question.number !== note.number ||
        note.correctAnswer !== question.choiceIds?.[question.correctAnswer] ||
        note.optionVietnamese?.length !== question.choices.length ||
        !question.passage || !evidence || !question.passage.includes(evidence) ||
        !note.passageVietnamese?.trim() || !note.questionVietnamese?.trim()) continue;
      result.reading[id] = {
        kind: question.number && question.number <= 15 ? "answer" : "question",
        vietnamese: note.questionVietnamese,
        passageVietnamese: note.passageVietnamese,
        completedPassageChinese: completedBandCGap(test, question),
        questionVietnamese: note.questionVietnamese,
        optionChinese: question.choices,
        optionVietnamese: note.optionVietnamese,
        explanation: note.explanation,
        evidenceText: question.passage,
        evidencePhrase: evidence,
      };
    }
  } catch { /* The review keeps its neutral fallback when a transcript is absent. */ }
  return result;
}

function getBandBReviewContent(test: MockTest): ReviewContent {
  const result: ReviewContent = { listening: {}, reading: {} };
  try {
    const folder = join(process.cwd(), "data", "test-supplements", test.id);
    const transcripts = JSON.parse(readFileSync(join(folder, "listening-transcripts.json"), "utf8")) as BandBTranscript;
    const translations = JSON.parse(readFileSync(join(folder, "review-vi.json"), "utf8")) as BandBReviewFile;
    if (transcripts.examId !== test.id || transcripts.componentId !== "listening" || translations.testId !== test.id) return result;
    const script = test.script === "simplified" ? "simplified" : "traditional";
    const questions = new Map(test.questions.map((question) => [question.id, question]));
    const visibleTranscript = (source: string, number: number) => source.split("\n").filter((line) => {
      const match = line.match(/^(\d{1,2})\.\s/);
      return !match || Number(match[1]) === number;
    }).join("\n").trim();
    for (const group of transcripts.groups) {
      for (const number of group.questions) {
        const id = `listening-q${String(number).padStart(2, "0")}`;
        const question = questions.get(id);
        const translation = translations.listening[id];
        if (!question || question.section !== "listening" || question.number !== number) continue;
        const traditional = visibleTranscript(group.traditional, number);
        const chinese = visibleTranscript(group[script], number);
        if (!chinese) continue;
        const evidence = translation?.evidenceTraditional;
        const position = evidence ? traditional.indexOf(evidence) : -1;
        const highlighted = position >= 0 && traditional.length === chinese.length ? chinese.slice(position, position + evidence.length) : undefined;
        result.listening[id] = { lines: [{ chinese, vietnamese: highlighted && translation.vi ? `Dịch đoạn được tô: ${translation.vi}` : undefined, highlight: highlighted }] };
      }
    }
    for (const [id, translation] of Object.entries(translations.reading)) {
      const question = questions.get(id);
      const evidence = translation.evidence[script];
      if (!question || question.section !== "reading" || question.number !== translation.number ||
          question.choiceIds?.[question.correctAnswer] !== translation.correctAnswer || !translation.vi.trim() ||
          !question.imageUrl?.startsWith(`/tests/${test.id}/reading/assets/${script}/`) ||
          !evidence?.chinese || question.choices[question.correctAnswer] !== evidence.chinese ||
          evidence.width <= 0 || evidence.height <= 0 || evidence.x < 0 || evidence.y < 0 ||
          evidence.x + evidence.width > evidence.sourceWidth + 1 ||
          evidence.y + evidence.height > evidence.sourceHeight + 1) continue;
      result.reading[id] = { kind: translation.kind, vietnamese: translation.vi, evidence };
    }
  } catch { /* Missing review data has a neutral fallback. */ }
  return result;
}

function getBandAReviewContent(test: MockTest): ReviewContent {
  const result: ReviewContent = { listening: {}, reading: {} };
  try {
    const folder = join(process.cwd(), "data", "test-supplements", test.id);
    const transcripts = JSON.parse(readFileSync(join(folder, "listening-transcripts.json"), "utf8")) as {
      examId: string; componentId: string; questions: { questionId: string; number: number; traditional?: string; simplified?: string }[];
    };
    const translations = JSON.parse(readFileSync(join(folder, "review-vi.json"), "utf8")) as BandAReviewFile;
    if (transcripts.examId !== test.id || transcripts.componentId !== "listening" || translations.testId !== test.id) return result;
    const script = test.script === "simplified" ? "simplified" : "traditional";
    const questions = new Map(test.questions.map((question) => [question.id, question]));
    for (const entry of transcripts.questions) {
      const question = questions.get(entry.questionId);
      const translation = translations.listening[entry.questionId];
      const chinese = entry[script]?.trim();
      if (!question || question.section !== "listening" || question.number !== entry.number ||
          !translation || translation.number !== entry.number ||
          question.choiceIds?.[question.correctAnswer] !== translation.correctAnswer || !chinese || !translation.vi.trim()) continue;
      const highlight = translation.evidence[script];
      if (!highlight || !chinese.includes(highlight)) continue;
      const segments = chinese.split(/\n\(([A-Z])\)\n/);
      const translatedChoices = segments.length > 1 ? translation.vi.split(/\s+[A-C]\.\s+/) : [];
      const hasChoiceTranslations = translatedChoices.length === (segments.length + 1) / 2;
      const lines: ReviewLine[] = [{ chinese: segments[0], vietnamese: hasChoiceTranslations ? translatedChoices[0] : translation.vi, highlight: segments[0].includes(highlight) ? highlight : undefined }];
      for (let index = 1; index < segments.length; index += 2) {
        const choice = segments[index];
        const content = segments[index + 1]?.trim();
        if (question.choiceIds?.includes(choice) && content) lines.push({ label: choice, chinese: content, vietnamese: hasChoiceTranslations ? translatedChoices[(index + 1) / 2] : undefined, highlight: content.includes(highlight) ? highlight : undefined });
      }
      result.listening[entry.questionId] = { lines };
    }
    for (const [id, translation] of Object.entries(translations.reading)) {
      const question = questions.get(id);
      const evidence = translation.evidence[script];
      if (!question || question.section !== "reading" || question.number !== translation.number ||
          question.choiceIds?.[question.correctAnswer] !== translation.correctAnswer || !translation.vi.trim() ||
          !question.imageUrl?.startsWith(`/tests/${test.id}/reading/assets/${script}/`) ||
          !evidence?.chinese || evidence.width <= 0 || evidence.height <= 0 ||
          evidence.x < 0 || evidence.y < 0 || evidence.x + evidence.width > evidence.sourceWidth + 1 ||
          evidence.y + evidence.height > evidence.sourceHeight + 1) continue;
      result.reading[id] = { kind: translation.kind, vietnamese: translation.vi, evidence };
    }
  } catch { /* Missing review data has a neutral fallback. */ }
  return result;
}

export function getReviewContent(test: MockTest) {
  if (["band-a-test-02", "band-a-test-03", "band-a-test-04", "band-a-test-05"].includes(test.id)) return getCompleteBandAReviewContent(test);
  if (test.id === "band-c-test-01") return getBandCReviewContent(test);
  if (test.id === "band-b-test-01") return enrichReadingReview(getBandBReviewContent(test), test);
  if (test.id === "band-a-test-01") {
    const base = enrichReadingReview(getBandAReviewContent(test), test);
    const complete = getCompleteBandAReviewContent(test);
    return { listening: { ...base.listening, ...complete.listening }, reading: { ...base.reading, ...complete.reading } };
  }
  if (test.id !== "novice-reading-2018-11") {
    const result: ReviewContent = { listening: {}, reading: {} };
    try {
      const data = JSON.parse(readFileSync(join(process.cwd(), "data", "test-supplements", test.id, "listening-transcripts.json"), "utf8")) as {
        examId: string; componentId: string; questions: { questionId: string; number: number; traditional?: string; simplified?: string }[];
      };
      if (data.examId !== test.id || data.componentId !== "listening") return result;
      const questions = new Map(test.questions.filter((question) => question.section === "listening").map((question) => [question.id, question]));
      const script = test.script === "simplified" ? "simplified" : "traditional";
      for (const entry of data.questions) {
        const question = questions.get(entry.questionId);
        const chinese = entry[script]?.trim();
        if (question?.number !== entry.number || !chinese) continue;
        const segments = chinese.split(/\n\(([A-Z])\)\n/);
        const lines: ReviewLine[] = [{ chinese: segments[0] }];
        for (let index = 1; index < segments.length; index += 2) {
          if (question.choiceIds?.includes(segments[index]) && segments[index + 1]?.trim()) {
            lines.push({ label: segments[index], chinese: segments[index + 1].trim() });
          }
        }
        result.listening[entry.questionId] = { lines };
      }
    } catch { /* Missing review supplement has a neutral fallback. */ }
    return result;
  }
  return enrichReadingReview(buildReviewContent(test, transcriptFile as Parameters<typeof buildReviewContent>[1], listeningTranslations, readingTranslations as Parameters<typeof buildReviewContent>[3]), test);
}

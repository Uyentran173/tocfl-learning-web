import type { MockTest, ScriptVariant } from "./tests";

export type ReviewLine = { label?: string; chinese: string; vietnamese?: string; highlight?: string };
export type ListeningReview = { lines: ReviewLine[]; question?: ReviewLine; options?: ReviewLine[]; explanation?: string };
export type SourceEvidence = { chinese: string; x: number; y: number; width: number; height: number; sourceWidth: number; sourceHeight: number };
export type ReadingReview = {
  kind: "question" | "answer";
  vietnamese: string;
  evidence?: SourceEvidence;
  passageVietnamese?: string;
  completedPassageChinese?: string;
  questionVietnamese?: string;
  optionVietnamese?: string[];
  optionChinese?: string[];
  explanation?: string;
  evidenceText?: string;
  evidencePhrase?: string;
  note?: string;
};
export type ReviewContent = { listening: Record<string, ListeningReview>; reading: Record<string, ReadingReview> };

type TranscriptVariant = {
  sentence?: string;
  choices?: Record<string, string>;
  dialogue?: { speaker: string; text: string }[];
  question?: string;
};
type TranscriptQuestion = {
  questionId: string; number: number; correctAnswer: string;
  scriptType: "sentence" | "spoken_choices" | "dialogue_question_choices";
  script: Record<ScriptVariant, TranscriptVariant>;
};
type TranscriptFile = { examId: string; componentId: string; questions: TranscriptQuestion[] };
type VietnameseTranscript = {
  sentence?: string; choices?: Record<string, string>; dialogue?: string[]; question?: string;
  evidence?: Partial<Record<ScriptVariant, string>>;
};
type VietnameseReading = { kind: "question" | "answer"; vi: string; correctAnswer?: string };

export function buildReviewContent(
  test: MockTest,
  transcriptFile: TranscriptFile,
  translations: Record<string, VietnameseTranscript>,
  readingTranslations: Record<string, VietnameseReading>,
): ReviewContent {
  const result: ReviewContent = { listening: {}, reading: {} };
  if (test.id !== "novice-reading-2018-11") return result;
  const questions = new Map(test.questions.map((question) => [question.id, question]));
  const script = test.script === "simplified" ? "simplified" : "traditional";

  if (transcriptFile.examId === "tocfl-novice-mock-201811" && transcriptFile.componentId === "listening") {
    for (const entry of transcriptFile.questions ?? []) {
      const question = questions.get(entry.questionId);
      if (!question || question.section !== "listening" || question.number !== entry.number || question.choiceIds?.[question.correctAnswer] !== entry.correctAnswer) continue;
      const content = entry.script?.[script];
      const vi = translations[entry.questionId];
      if (!content || !vi) continue;
      const evidence = vi.evidence?.[script];
      const lines: ReviewLine[] = [];
      if (entry.scriptType === "sentence" && content.sentence) {
        lines.push({ chinese: content.sentence, vietnamese: vi.sentence, highlight: evidence && content.sentence.includes(evidence) ? evidence : undefined });
      } else if (entry.scriptType === "spoken_choices" && content.choices) {
        for (const choice of question.choiceIds ?? []) {
          const chinese = content.choices[choice];
          if (chinese) lines.push({ label: choice, chinese, vietnamese: vi.choices?.[choice], highlight: choice === entry.correctAnswer ? chinese : undefined });
        }
      } else if (entry.scriptType === "dialogue_question_choices") {
        content.dialogue?.forEach((line, index) => lines.push({ label: line.speaker === "男" ? "Nam" : line.speaker === "女" ? "Nữ" : line.speaker, chinese: line.text, vietnamese: vi.dialogue?.[index], highlight: evidence && line.text.includes(evidence) ? evidence : undefined }));
        if (content.question) lines.push({ label: "Câu hỏi", chinese: content.question, vietnamese: vi.question });
        for (const choice of question.choiceIds ?? []) {
          const chinese = content.choices?.[choice];
          if (chinese) lines.push({ label: choice, chinese, vietnamese: vi.choices?.[choice] });
        }
      }
      if (lines.length && lines.some((line) => line.highlight)) {
        result.listening[entry.questionId] = { lines };
      }
    }
  }

  for (const [id, entry] of Object.entries(readingTranslations)) {
    const question = questions.get(id);
    if (!question || question.section !== "reading" || !entry.vi?.trim()) continue;
    if (entry.kind === "answer" && question.choiceIds?.[question.correctAnswer] !== entry.correctAnswer) continue;
    result.reading[id] = { kind: entry.kind, vietnamese: entry.vi };
  }
  return result;
}

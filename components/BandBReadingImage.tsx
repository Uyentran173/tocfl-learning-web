import type { Question } from "@/lib/tests";
import type { SourceEvidence } from "@/lib/review-content";
import { getBandBReadingVisual, isBandBDocumentQuestion } from "@/lib/band-b-reading-visual";
import { CroppedSource } from "./BandAReadingImage";

export default function BandBReadingImage({ question, simulation = false, evidence }: { question: Question; simulation?: boolean; evidence?: SourceEvidence }) {
  const visual = getBandBReadingVisual(question);
  if (!visual) return null;
  return <div className={simulation ? "sim-image-area flex-col gap-4" : "space-y-4 rounded-xl border border-[var(--border)] bg-white p-4"}>
    {visual.crops.map((item, index) => <CroppedSource key={index} question={question} crop={item} evidence={evidence} label={isBandBDocumentQuestion(question) ? `Tài liệu chung cho câu ${visual.sharedContextId}` : index === 0 ? `Nội dung chung cho câu ${visual.sharedContextId}` : `Nội dung câu ${question.number}, chữ ${question.script === "simplified" ? "Giản thể" : "Phồn thể"}`} />)}
  </div>;
}

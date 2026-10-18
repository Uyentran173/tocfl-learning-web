"use client";
import type { Question } from "@/lib/tests";
import type { SourceEvidence } from "@/lib/review-content";
import { getBandBReadingVisual, isBandBDocumentQuestion } from "@/lib/band-b-reading-visual";
import { CroppedSource } from "./BandAReadingImage";
import { useT } from "./PreferencesProvider";

export default function BandBReadingImage({ question, simulation = false, evidence }: { question: Question; simulation?: boolean; evidence?: SourceEvidence }) {
  const t = useT();
  const visual = getBandBReadingVisual(question);
  if (!visual) return null;
  return <div className={simulation ? "sim-image-area flex-col gap-4" : "space-y-4 rounded-xl border border-[var(--border)] bg-white p-4"}>
    {visual.crops.map((item, index) => <CroppedSource key={index} question={question} crop={item} evidence={evidence} label={isBandBDocumentQuestion(question) ? `${t("Tài liệu chung cho câu")} ${visual.sharedContextId}` : index === 0 ? `${t("Nội dung chung cho câu")} ${visual.sharedContextId}` : `${t("Nội dung câu")} ${question.number}, ${t(question.script === "simplified" ? "Chữ Giản thể" : "Chữ Phồn thể")}`} />)}
  </div>;
}

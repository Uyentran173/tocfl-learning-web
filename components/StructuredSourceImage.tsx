import type { Question } from "@/lib/tests";
import { CroppedSource } from "./BandAReadingImage";

/** Display the original printed passage and current prompt without printed answer rows. */
export default function StructuredSourceImage({ question, simulation = false }: { question: Question; simulation?: boolean }) {
  const visual = question.sourceVisual;
  if (!visual?.context && !visual?.prompt) return null;
  return <div className={simulation ? "sim-image-area flex-col gap-4" : "space-y-4 rounded-xl border border-[var(--border)] bg-white p-4"}>
    {visual.context && <CroppedSource question={question} crop={visual.context} label={`Nội dung đọc chung của câu ${question.number}`} />}
    {visual.prompt && <CroppedSource question={question} crop={visual.prompt} label={`Câu hỏi ${question.number}`} />}
  </div>;
}

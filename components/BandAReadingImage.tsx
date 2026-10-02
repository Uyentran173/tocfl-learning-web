import Image from "next/image";
import type { CSSProperties } from "react";
import type { Question } from "@/lib/tests";
import { getBandAReadingVisual, type ImageCrop } from "@/lib/band-a-reading-visual";
import type { SourceEvidence } from "@/lib/review-content";

export function CroppedSource({ question, crop, label, evidence }: { question: Question; crop: ImageCrop; label: string; evidence?: SourceEvidence }) {
  const style: CSSProperties = { aspectRatio: `${crop.width} / ${crop.height}`, maxWidth: crop.maxWidth };
  const imageStyle: CSSProperties = {
    width: `${crop.sourceWidth / crop.width * 100}%`,
    height: "auto",
    maxWidth: "none",
    transform: `translate(-${crop.x / crop.sourceWidth * 100}%, -${crop.y / crop.sourceHeight * 100}%)`,
  };
  const showEvidence = evidence && evidence.x >= crop.x && evidence.y >= crop.y && evidence.x + evidence.width <= crop.x + crop.width && evidence.y + evidence.height <= crop.y + crop.height;
  const evidenceStyle: CSSProperties | undefined = showEvidence ? {
    left: `${(evidence.x - crop.x) / crop.width * 100}%`,
    top: `${(evidence.y - crop.y) / crop.height * 100}%`,
    width: `${evidence.width / crop.width * 100}%`,
    height: `${evidence.height / crop.height * 100}%`,
  } : undefined;
  return <div role="img" aria-label={label} className="relative mx-auto w-full overflow-hidden rounded-lg bg-white" style={style}>
    <Image src={question.imageUrl!} alt="" width={crop.sourceWidth} height={crop.sourceHeight} unoptimized className="absolute left-0 top-0 block" style={imageStyle} />
    {evidenceStyle && <span aria-hidden="true" className="review-image-evidence" style={evidenceStyle} />}
  </div>;
}

export default function BandAReadingImage({ question, simulation = false, evidence }: { question: Question; simulation?: boolean; evidence?: SourceEvidence }) {
  const visual = getBandAReadingVisual(question);
  if (!visual) return null;
  const label = question.number ? `Câu ${question.number}` : "Câu hỏi";
  return <div className={simulation ? "sim-image-area flex-col gap-4" : "space-y-4 rounded-xl border border-[var(--border)] bg-white p-4"}>
    {visual.crops.map((crop, index) => <CroppedSource key={index} question={question} crop={crop} evidence={evidence} label={visual.sharedContextId && index === 0 ? `Hình chung cho các câu ${visual.sharedContextId}` : `Nội dung ${label}, chữ ${question.script === "simplified" ? "Giản thể" : "Phồn thể"}`} />)}
  </div>;
}

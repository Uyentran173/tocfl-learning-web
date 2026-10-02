import type { Question } from "./tests";

export type ImageCrop = {
  x: number; y: number; width: number; height: number;
  sourceWidth: number; sourceHeight: number; maxWidth: number;
};
export type ReadingVisual = { sharedContextId?: string; crops: ImageCrop[] };

const groupedQuestionY = [665, 875, 1085, 1295, 1505];
const sourceWidth = 1193;
const groupedSourceHeight = 1784;

/** Display crops from the original files. No new question or image asset is created. */
export function getBandAReadingVisual(question: Question): ReadingVisual | null {
  if (question.section !== "reading" || !question.imageUrl?.startsWith("/tests/band-a-test-01/reading/")) return null;
  const number = question.number ?? 0;
  if (number >= 31 && number <= 40) {
    const groupStart = number <= 35 ? 31 : 36;
    return {
      sharedContextId: groupStart === 31 ? "31-35" : "36-40",
      crops: [
        { x: 205, y: 20, width: 780, height: 640, sourceWidth, sourceHeight: groupedSourceHeight, maxWidth: 760 },
        { x: 65, y: groupedQuestionY[number - groupStart], width: 740, height: 225, sourceWidth, sourceHeight: groupedSourceHeight, maxWidth: 740 },
      ],
    };
  }
  if (number >= 41 && number <= 45) {
    return { crops: [{ x: 90, y: 90, width: 1000, height: 720, sourceWidth, sourceHeight: 1784, maxWidth: 1000 }] };
  }
  if (number === 50) {
    return { crops: [{ x: 0, y: 0, width: 1193, height: 680, sourceWidth, sourceHeight: 1753, maxWidth: 780 }] };
  }
  return null;
}

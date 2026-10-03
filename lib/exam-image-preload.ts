import type { Question } from "./tests";
import { isBandBDocumentQuestion } from "./band-b-reading-visual";

const imageLoads = new Map<string, Promise<void>>();
const settledImages = new Set<string>();

export function questionImageUrls(question: Question): string[] {
  const showSourceImage = !question.sourceImageReviewOnly || isBandBDocumentQuestion(question);
  return [...new Set([
    ...(showSourceImage && question.imageUrl ? [question.imageUrl] : []),
    ...(question.choiceImages ?? []).filter((url): url is string => Boolean(url)),
  ])];
}

export function questionImagesReady(question: Question): boolean {
  return questionImageUrls(question).every((url) => settledImages.has(url));
}

export function preloadQuestionImages(question: Question): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  return Promise.all(questionImageUrls(question).map((url) => {
    const cached = imageLoads.get(url);
    if (cached) return cached;
    const image = new window.Image();
    const load = new Promise<void>((resolve) => {
      image.onload = () => {
        if (typeof image.decode === "function") void image.decode().catch(() => {}).finally(resolve);
        else resolve();
      };
      // A missing asset should not leave the question behind a loading placeholder.
      image.onerror = () => resolve();
      image.src = url;
    }).then(() => { settledImages.add(url); });
    imageLoads.set(url, load);
    return load;
  })).then(() => {});
}

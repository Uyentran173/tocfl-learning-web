import type { MockTest } from "./tests";

export type ExamStartData = Pick<MockTest, "id" | "script" | "scope" | "questions" | "listeningIntroAudio">;

const preparedAudio = new Map<string, HTMLAudioElement>();

export function preloadStartAudio(test: ExamStartData) {
  if (typeof window === "undefined" || test.questions[0]?.section !== "listening") return;
  const first = test.questions[0];
  const paths = [
    ...(test.listeningIntroAudio ?? []),
    ...(first.simulationAudioSequence ?? []),
    first.audioUrl,
  ].filter((path): path is string => Boolean(path));
  for (const path of new Set(paths)) {
    if (preparedAudio.has(path)) continue;
    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = path;
    preparedAudio.set(path, audio);
    audio.load();
  }
}

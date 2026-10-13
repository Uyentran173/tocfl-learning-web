import { progressStorage } from "./progress-storage";

export type ActivitySummary = { correct: number; wrong: number; origin: "lesson" | "exercise" | "game" | "review" };
export type ActivityProgress = { rounds: number; correct: number; wrong: number; lastAt: string; lastOrigin: ActivitySummary["origin"] };

export function recordActivityProgress(context: string, summary: ActivitySummary) {
  const key = `taiwen-activity:v1:${encodeURIComponent(context)}`;
  const storage = progressStorage();
  let previous: Partial<ActivityProgress> = {};
  try { previous = JSON.parse(storage.getItem(key) ?? "{}") as Partial<ActivityProgress>; } catch { /* Start a fresh summary. */ }
  const current: ActivityProgress = {
    rounds: Math.max(0, previous.rounds ?? 0) + 1,
    correct: Math.max(0, previous.correct ?? 0) + summary.correct,
    wrong: Math.max(0, previous.wrong ?? 0) + summary.wrong,
    lastAt: new Date().toISOString(),
    lastOrigin: summary.origin,
  };
  storage.setItem(key, JSON.stringify(current));
}

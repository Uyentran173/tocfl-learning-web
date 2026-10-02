import type { MockTest, ScriptVariant, Section, TestScope } from "./tests";
export type ExamMode = "practice" | "simulation";
export type ExamResult = { correct: number; incorrect: number; unanswered: number; earnedPoints: number; maxPoints: number; sections: Record<Section, { correct: number; incorrect: number; unanswered: number; total: number }> };
export type ExamSession = {
  testId: string;
  startedAt: number;
  deadlineAt: number;
  remainingSeconds: number;
  currentIndex: number;
  answers: Record<string, number>;
  status: "in-progress" | "submitted";
  mode?: ExamMode; // Older saved sessions remain Practice Mode.
  script?: ScriptVariant;
  scope?: TestScope;
  readingStarted?: boolean;
  listeningIntroCompleted?: boolean;
  practiceRemaining?: Record<Section, number>;
  activeSection?: Section;
  sectionCompleted: Record<Section, boolean>;
  result?: ExamResult;
};
export const PRACTICE_SECTION_SECONDS = 60 * 60;
const key = (id: string) => `tocfl-exam-v3:${id}`;
export function readSession(id: string): ExamSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(id));
    if (!raw) return null;
    const value = JSON.parse(raw) as ExamSession;
    if (value.testId !== id || !value.answers || !Number.isFinite(value.deadlineAt) || !Number.isFinite(value.currentIndex)) return null;
    return value;
  } catch { return null; }
}
export function saveSession(session: ExamSession) { window.localStorage.setItem(key(session.testId), JSON.stringify(session)); }
export function clearSession(id: string) { window.localStorage.removeItem(key(id)); }
export function startSession(test: MockTest, mode: ExamMode = "practice"): ExamSession {
  const startedAt = Date.now();
  const activeSection = test.questions[0]?.section ?? "listening";
  const startsWithReading = mode === "simulation" && activeSection === "reading";
  const listeningIntroCompleted = activeSection !== "listening" || !test.listeningIntroAudio?.length;
  const practiceIntroPending = mode === "practice" && !listeningIntroCompleted;
  const initialSeconds = mode === "simulation" && !startsWithReading ? 0 : PRACTICE_SECTION_SECONDS;
  const session: ExamSession = { testId: test.id, startedAt, deadlineAt: initialSeconds && !practiceIntroPending ? startedAt + initialSeconds * 1000 : 0, remainingSeconds: initialSeconds, currentIndex: 0, answers: {}, status: "in-progress", mode, script: test.script, scope: test.scope ?? "full", readingStarted: startsWithReading, listeningIntroCompleted, sectionCompleted: { listening: false, reading: false }, ...(mode === "practice" ? { activeSection, practiceRemaining: { listening: PRACTICE_SECTION_SECONDS, reading: PRACTICE_SECTION_SECONDS } } : {}) };
  saveSession(session);
  return session;
}
export function isPracticeListeningIntroPending(session: ExamSession) {
  return session.mode !== "simulation" && session.currentIndex === 0 && session.listeningIntroCompleted === false;
}
export function secondsLeft(session: ExamSession) {
  if (isPracticeListeningIntroPending(session)) return session.remainingSeconds;
  return Math.max(0, Math.ceil((session.deadlineAt - Date.now()) / 1000));
}
export function ensurePracticeTiming(test: MockTest, session: ExamSession): ExamSession {
  if (session.mode === "simulation") return session;
  if (isPracticeListeningIntroPending(session)) {
    if (session.deadlineAt === 0 && session.remainingSeconds === PRACTICE_SECTION_SECONDS && session.practiceRemaining?.listening === PRACTICE_SECTION_SECONDS) return session;
    const paused: ExamSession = { ...session, mode: "practice", activeSection: "listening", deadlineAt: 0, remainingSeconds: PRACTICE_SECTION_SECONDS, practiceRemaining: { listening: PRACTICE_SECTION_SECONDS, reading: session.practiceRemaining?.reading ?? PRACTICE_SECTION_SECONDS } };
    saveSession(paused);
    return paused;
  }
  if (session.practiceRemaining) return session;
  const activeSection = test.questions[session.currentIndex]?.section ?? "listening";
  const migrated = { ...session, mode: "practice" as const, activeSection, practiceRemaining: { listening: PRACTICE_SECTION_SECONDS, reading: PRACTICE_SECTION_SECONDS }, deadlineAt: Date.now() + PRACTICE_SECTION_SECONDS * 1000, remainingSeconds: PRACTICE_SECTION_SECONDS };
  saveSession(migrated);
  return migrated;
}
export function completeListeningIntro(session: ExamSession): ExamSession {
  if (session.listeningIntroCompleted !== false) return session;
  if (session.mode === "simulation") return { ...session, listeningIntroCompleted: true };
  const startedAt = Date.now();
  return { ...session, listeningIntroCompleted: true, deadlineAt: startedAt + PRACTICE_SECTION_SECONDS * 1000, remainingSeconds: PRACTICE_SECTION_SECONDS, practiceRemaining: { listening: PRACTICE_SECTION_SECONDS, reading: session.practiceRemaining?.reading ?? PRACTICE_SECTION_SECONDS } };
}
export function enterPracticeSection(test: MockTest, session: ExamSession, nextIndex: number): ExamSession {
  const currentSection = session.activeSection ?? test.questions[session.currentIndex]?.section ?? "listening";
  const nextSection = test.questions[nextIndex]?.section ?? currentSection;
  if (currentSection === nextSection) return { ...session, currentIndex: nextIndex };
  const practiceRemaining = { listening: PRACTICE_SECTION_SECONDS, reading: PRACTICE_SECTION_SECONDS, ...session.practiceRemaining, [currentSection]: secondsLeft(session) };
  const nextRemaining = practiceRemaining[nextSection];
  if (nextRemaining <= 0) return session;
  return { ...session, currentIndex: nextIndex, activeSection: nextSection, sectionCompleted: { ...session.sectionCompleted, [currentSection]: true }, practiceRemaining, deadlineAt: Date.now() + nextRemaining * 1000, remainingSeconds: nextRemaining };
}
export function nextAvailablePracticeSection(test: MockTest, session: ExamSession): ExamSession | null {
  const otherSection = session.activeSection === "reading" ? "listening" : "reading";
  const nextIndex = test.questions.findIndex((item) => item.section === otherSection);
  if (nextIndex < 0 || (session.practiceRemaining?.[otherSection] ?? PRACTICE_SECTION_SECONDS) <= 0) return null;
  return enterPracticeSection(test, session, nextIndex);
}
export function calculateResult(test: MockTest, answers: Record<string, number>): ExamResult {
  const sections: ExamResult["sections"] = { listening: { correct: 0, incorrect: 0, unanswered: 0, total: 0 }, reading: { correct: 0, incorrect: 0, unanswered: 0, total: 0 } };
  let correct = 0, incorrect = 0, unanswered = 0, earnedPoints = 0, maxPoints = 0;
  for (const question of test.questions) {
    const configuredPoints = question.metadata?.points;
    const points = typeof configuredPoints === "number" && Number.isFinite(configuredPoints) && configuredPoints > 0 ? configuredPoints : 1;
    maxPoints += points;
    sections[question.section].total++;
    if (answers[question.id] === undefined) { unanswered++; sections[question.section].unanswered++; }
    else if (answers[question.id] === question.correctAnswer) { correct++; earnedPoints += points; sections[question.section].correct++; }
    else { incorrect++; sections[question.section].incorrect++; }
  }
  return { correct, incorrect, unanswered, earnedPoints, maxPoints, sections };
}
export function submitSession(test: MockTest, session: ExamSession): ExamSession {
  if (session.status === "submitted") return session;
  const activeSection = test.questions[session.currentIndex]?.section;
  const submitted: ExamSession = { ...session, remainingSeconds: session.deadlineAt ? secondsLeft(session) : session.remainingSeconds, sectionCompleted: { ...session.sectionCompleted, ...(activeSection ? { [activeSection]: true } : {}) }, status: "submitted", result: calculateResult(test, session.answers) };
  saveSession(submitted);
  return submitted;
}

import test from "node:test";
import assert from "node:assert/strict";
import { calculateResult, completeListeningIntro, ensurePracticeTiming, enterPracticeSection, nextAvailablePracticeSection, PRACTICE_SECTION_SECONDS, secondsLeft, startSession, submitSession } from "../lib/session.ts";
import { selectTestScope } from "../lib/tests.ts";

const mockTest = { questions: [{ section: "listening" }, { section: "reading" }] };

test("simulation Listening starts without a countdown and Reading always gets 60 minutes", () => {
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: { setItem() {} } };
  try {
    const sample = { id: "timing-test", script: "traditional", durationMinutes: 25, questions: [{ section: "listening", id: "listening-q01" }, { section: "reading", id: "reading-q01" }] };
    const simulation = startSession(sample, "simulation");
    assert.equal(simulation.deadlineAt, 0);
    assert.equal(simulation.remainingSeconds, 0);
    assert.deepEqual(simulation.sectionCompleted, { listening: false, reading: false });
    const practice = startSession(sample, "practice");
    assert.equal(practice.remainingSeconds, PRACTICE_SECTION_SECONDS);
    assert.equal(practice.practiceRemaining.reading, PRACTICE_SECTION_SECONDS);
  } finally { globalThis.window = originalWindow; }
});

test("a new Listening session starts with its own intro step when audio is available", () => {
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: { setItem() {} } };
  try {
    const sample = { id: "intro-test", script: "traditional", listeningIntroAudio: ["/intro.mp3"], questions: [{ section: "listening", id: "listening-q01" }] };
    for (const mode of ["practice", "simulation"]) {
      const session = startSession(sample, mode);
      assert.equal(session.currentIndex, 0);
      assert.equal(session.listeningIntroCompleted, false);
    }
    assert.equal(startSession(selectTestScope({ ...sample, sections: ["listening", "reading"], questions: [...sample.questions, { section: "reading", id: "reading-q01" }] }, "reading"), "practice").listeningIntroCompleted, true);
  } finally { globalThis.window = originalWindow; }
});

test("Practice Listening starts its 60-minute timer only after the intro ends", () => {
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: { setItem() {} } };
  try {
    const sample = { id: "intro-timing-test", script: "traditional", listeningIntroAudio: ["/intro.mp3"], questions: [
      { section: "listening", id: "listening-q01" },
      { section: "reading", id: "reading-q01" },
    ] };
    const intro = startSession(sample, "practice");
    assert.equal(intro.deadlineAt, 0);
    assert.equal(secondsLeft(intro), PRACTICE_SECTION_SECONDS);

    const resumed = ensurePracticeTiming(sample, {
      ...intro,
      startedAt: Date.now() - 120_000,
      deadlineAt: Date.now() - 60_000,
      remainingSeconds: PRACTICE_SECTION_SECONDS - 120,
      practiceRemaining: { listening: PRACTICE_SECTION_SECONDS - 120, reading: PRACTICE_SECTION_SECONDS },
    });
    assert.equal(resumed.deadlineAt, 0);
    assert.equal(secondsLeft(resumed), PRACTICE_SECTION_SECONDS);

    const enteredAt = Date.now();
    const questionOne = completeListeningIntro(resumed);
    assert.equal(questionOne.listeningIntroCompleted, true);
    assert.ok(questionOne.deadlineAt >= enteredAt + PRACTICE_SECTION_SECONDS * 1000);
    assert.ok(questionOne.deadlineAt <= Date.now() + PRACTICE_SECTION_SECONDS * 1000);
    assert.equal(secondsLeft(questionOne), PRACTICE_SECTION_SECONDS);
    assert.equal(enterPracticeSection(sample, questionOne, 1).remainingSeconds, PRACTICE_SECTION_SECONDS);

    const withoutIntro = startSession({ ...sample, listeningIntroAudio: [] }, "practice");
    assert.ok(withoutIntro.deadlineAt > Date.now());
    const simulation = startSession(sample, "simulation");
    assert.equal(completeListeningIntro(simulation).deadlineAt, 0);
  } finally { globalThis.window = originalWindow; }
});

test("results count both skills separately while combining correct answers", () => {
  const sample = { questions: [
    { id: "listening-q01", section: "listening", correctAnswer: 1 },
    { id: "reading-q01", section: "reading", correctAnswer: 0 },
    { id: "reading-q02", section: "reading", correctAnswer: 2 },
  ] };
  const result = calculateResult(sample, { "listening-q01": 1, "reading-q01": 2 });
  assert.equal(result.correct, 1);
  assert.deepEqual(result.sections.listening, { correct: 1, incorrect: 0, unanswered: 0, total: 1 });
  assert.deepEqual(result.sections.reading, { correct: 0, incorrect: 1, unanswered: 1, total: 2 });
});

test("submitting early marks only the section actually reached", () => {
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: { setItem() {} } };
  try {
    const sample = { id: "completion-test", script: "traditional", sections: ["listening", "reading"], questions: [
      { section: "listening", id: "listening-q01", correctAnswer: 0 },
      { section: "reading", id: "reading-q01", correctAnswer: 1 },
    ] };
    const submitted = submitSession(sample, startSession(sample, "practice"));
    assert.deepEqual(submitted.sectionCompleted, { listening: true, reading: false });
  } finally { globalThis.window = originalWindow; }
});

function session(activeSection, seconds, otherSeconds = PRACTICE_SECTION_SECONDS) {
  return {
    testId: "test", startedAt: Date.now(), deadlineAt: Date.now() + seconds * 1000,
    remainingSeconds: seconds, currentIndex: activeSection === "listening" ? 0 : 1,
    answers: {}, status: "in-progress", mode: "practice", activeSection, sectionCompleted: { listening: false, reading: false },
    practiceRemaining: {
      listening: activeSection === "listening" ? seconds : otherSeconds,
      reading: activeSection === "reading" ? seconds : otherSeconds,
    },
  };
}

test("each section starts with its own 60 minutes and keeps its balance", () => {
  const listening = session("listening", 3500);
  const reading = enterPracticeSection(mockTest, listening, 1);
  assert.equal(reading.activeSection, "reading");
  assert.equal(reading.remainingSeconds, PRACTICE_SECTION_SECONDS);
  assert.ok(reading.practiceRemaining.listening >= 3499 && reading.practiceRemaining.listening <= 3500);

  const resumedListening = enterPracticeSection(mockTest, reading, 0);
  assert.equal(resumedListening.activeSection, "listening");
  assert.equal(resumedListening.remainingSeconds, reading.practiceRemaining.listening);
});

test("an expired section moves to the other section when it still has time", () => {
  const readingExpired = session("reading", 0, 420);
  readingExpired.deadlineAt = Date.now() - 1000;
  const next = nextAvailablePracticeSection(mockTest, readingExpired);
  assert.equal(next?.activeSection, "listening");
  assert.equal(next?.remainingSeconds, 420);
  assert.equal(next?.practiceRemaining.reading, 0);
});

test("the test has no next section when both balances are exhausted", () => {
  const readingExpired = session("reading", 0, 0);
  readingExpired.deadlineAt = Date.now() - 1000;
  assert.equal(nextAvailablePracticeSection(mockTest, readingExpired), null);
});

test("Listening-only and Reading-only results exclude the unselected section", () => {
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: { setItem() {} } };
  try {
    const full = { id: "scope-test", script: "traditional", sections: ["listening", "reading"], questions: [
      { id: "listening-q01", section: "listening", correctAnswer: 0 },
      { id: "reading-q01", section: "reading", correctAnswer: 1 },
    ] };
    const listening = selectTestScope(full, "listening");
    const reading = selectTestScope(full, "reading");
    const listenSession = startSession(listening, "simulation");
    const readSession = startSession(reading, "simulation");
    assert.equal(listenSession.remainingSeconds, 0);
    assert.equal(readSession.remainingSeconds, PRACTICE_SECTION_SECONDS);
    assert.equal(listenSession.scope, "listening");
    assert.equal(readSession.scope, "reading");
    assert.equal(calculateResult(listening, {}).sections.reading.total, 0);
    assert.equal(calculateResult(reading, {}).sections.listening.total, 0);
    assert.equal(submitSession(listening, listenSession).result.sections.listening.total, 1);
  } finally { globalThis.window = originalWindow; }
});

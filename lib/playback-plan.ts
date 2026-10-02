export type PlaybackStep =
  | { type: "track"; role: string; path: string }
  | { type: "question"; questionId: string; path: string }
  | { type: "question_group"; id: string; sharedAudio: string; questionTracks: { questionId: string; path: string }[] };

/** Preserve the package's track order; a group introduction belongs only to its first question. */
export function buildPlaybackSequences(plan: PlaybackStep[]): Record<string, string[]> {
  const sequences: Record<string, string[]> = {};
  let pending: string[] = [];
  let lastQuestionId: string | undefined;
  for (const step of plan) {
    if (step.type === "track") { pending.push(step.path); continue; }
    if (step.type === "question") {
      sequences[step.questionId] = [...pending, step.path];
      pending = [];
      lastQuestionId = step.questionId;
      continue;
    }
    for (const [index, track] of step.questionTracks.entries()) {
      sequences[track.questionId] = [...(index === 0 ? [...pending, step.sharedAudio] : []), track.path];
      pending = [];
      lastQuestionId = track.questionId;
    }
  }
  if (lastQuestionId && pending.length) sequences[lastQuestionId].push(...pending);
  return sequences;
}

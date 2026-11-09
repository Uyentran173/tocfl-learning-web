import { academyActivityId, academyActivityKinds, academyLesson01, type AcademyActivityKind } from "./academy-catalog.ts";

export const academyLessonProgressKey = `taiwen-activity:v1:academy:${academyLesson01.id}`;
export type AcademyLessonProgress = {
  version: 1;
  currentActivityId: string;
  completedActivityIds: string[];
  answers: Record<string, string>;
  guestAnswers: Record<string, string>;
  writingResponses: Record<string, string>;
  guestWritingResponses: Record<string, string>;
  assessmentSubmitted: boolean;
  script: "traditional" | "simplified";
};
export const emptyAcademyLessonProgress: AcademyLessonProgress = {
  version: 1,
  currentActivityId: academyActivityId(academyLesson01.id, "lecture"),
  completedActivityIds: [],
  answers: {},
  guestAnswers: {},
  writingResponses: {},
  guestWritingResponses: {},
  assessmentSubmitted: false,
  script: "traditional",
};
export function academyActivityKindFromId(id: string): AcademyActivityKind | null {
  const kind = academyActivityKinds.find((item) => academyActivityId(academyLesson01.id, item) === id);
  return kind ?? null;
}
export function parseAcademyLessonProgress(raw: string | null): AcademyLessonProgress {
  try {
    const value = JSON.parse(raw ?? "null") as Partial<AcademyLessonProgress> | null;
    if (!value || value.version !== 1) return emptyAcademyLessonProgress;
    return {
      version: 1,
      currentActivityId: typeof value.currentActivityId === "string" && academyActivityKindFromId(value.currentActivityId) ? value.currentActivityId : emptyAcademyLessonProgress.currentActivityId,
      completedActivityIds: Array.isArray(value.completedActivityIds) ? [...new Set(value.completedActivityIds.filter((id): id is string => typeof id === "string" && Boolean(academyActivityKindFromId(id))))] : [],
      answers: value.answers && typeof value.answers === "object" && !Array.isArray(value.answers)
        ? Object.fromEntries(Object.entries(value.answers).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : {},
      guestAnswers: value.guestAnswers && typeof value.guestAnswers === "object" && !Array.isArray(value.guestAnswers)
        ? Object.fromEntries(Object.entries(value.guestAnswers).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : {},
      writingResponses: value.writingResponses && typeof value.writingResponses === "object" && !Array.isArray(value.writingResponses)
        ? Object.fromEntries(Object.entries(value.writingResponses).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : {},
      guestWritingResponses: value.guestWritingResponses && typeof value.guestWritingResponses === "object" && !Array.isArray(value.guestWritingResponses)
        ? Object.fromEntries(Object.entries(value.guestWritingResponses).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : {},
      assessmentSubmitted: value.assessmentSubmitted === true,
      script: value.script === "simplified" ? "simplified" : "traditional",
    };
  } catch { return emptyAcademyLessonProgress; }
}

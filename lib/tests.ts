export type Section = "listening" | "reading";
export type ScriptVariant = "traditional" | "simplified";
export type TestScope = "listening" | "reading" | "full";
export type SourceCrop = { x: number; y: number; width: number; height: number; sourceWidth: number; sourceHeight: number; maxWidth: number };
export type SourceVisual = { context?: SourceCrop; prompt?: SourceCrop; choices: SourceCrop[] };
export function parseTestScope(value?: string): TestScope {
  return value === "listening" || value === "reading" ? value : "full";
}
export type Question = {
  id: string;
  section: Section;
  sectionId?: string;
  sectionTitle?: string;
  type: "multiple-choice" | "passage";
  passage?: string;
  imageUrl?: string;
  imageAlt?: string;
  sourceImageReviewOnly?: boolean;
  question: string;
  audioUrl?: string;
  simulationAudioSequence?: string[];
  reviewAudioSequence?: string[];
  introAudioUrl?: string;
  transcript?: string;
  transcriptVi?: string;
  choices: string[];
  choiceIds?: string[];
  choiceImages?: (string | null)[];
  sourceVisual?: SourceVisual;
  correctAnswer: number;
  explanation?: string;
  explanationVi?: string;
  translationVi?: string;
  metadata?: Record<string, unknown>;
  number?: number;
  part?: number;
  formatType?: string;
  script?: ScriptVariant;
};
export type MockTest = {
  id: string;
  title: string;
  level: string;
  levelId?: string;
  durationMinutes: number;
  sections: Section[];
  sectionDetails?: { id: string; title: string; skill: Section; metadata?: Record<string, unknown> }[];
  questions: Question[];
  listeningIntroAudio?: string[];
  metadata?: Record<string, unknown>;
  script?: ScriptVariant;
  logicalTest?: boolean;
  scope?: TestScope;
  scoreProfile?: { id: string; scores: Record<string, number> };
  scoreProfiles?: Partial<Record<Section, { scores: Record<string, number>; maxScore: number }>>;
};
export function sectionCount(test: MockTest, section: Section) {
  return test.questions.filter((question) => question.section === section).length;
}
export function scriptQuery(test: Pick<MockTest, "script" | "scope">) {
  const query = new URLSearchParams();
  if (test.script) query.set("script", test.script);
  if (test.scope && test.scope !== "full") query.set("scope", test.scope);
  return query.size ? `?${query}` : "";
}

export function selectTestScope(test: MockTest, scope: TestScope = "full"): MockTest {
  if (scope === "full") return { ...test, scope };
  return {
    ...test, scope,
    sections: test.sections.filter((section) => section === scope),
    sectionDetails: test.sectionDetails?.filter((section) => section.skill === scope),
    questions: test.questions.filter((question) => question.section === scope),
  };
}

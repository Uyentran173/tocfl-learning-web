import type { MockTest, Question, ScriptVariant, Section, SourceVisual } from "./tests";
import { buildPlaybackSequences, type PlaybackStep } from "./playback-plan.ts";

type PackageAudio = string | { mode: "self_contained" | "shared_group"; path?: string; groupId?: string; questionTrack?: string; reviewSequence: string[] };

type PackageQuestion = {
  id: string; number: number; sectionId: string; type: string;
  assets?: Record<ScriptVariant, string>; audio?: PackageAudio;
  choices: string[]; correctAnswer: string; variantInvariant?: boolean;
  choiceText?: Record<ScriptVariant, string[]>;
  choiceImages?: Record<ScriptVariant, string[]>;
  stimulusGroupId?: string;
  questionText?: Record<ScriptVariant, string>;
  visual?: Record<ScriptVariant, SourceVisual>;
};
type PackageComponent = {
  id: Section; totalQuestions: number;
  sections: { id: string; startQuestion: number; endQuestion: number; introAudio?: string; sharedChoicePool?: string[]; uniqueChoiceUsageWithinSection?: boolean }[];
  scoring: { maxScore: number; scoreByCorrectCount: Record<string, number> };
  questions: PackageQuestion[];
  displayContexts?: Record<string, Record<ScriptVariant, string>>;
  audio?: { examIntro?: string; endingTrack?: string; examPlaybackPlan?: PlaybackStep[] };
};
export type StructuredPackage = {
  schemaVersion: string;
  exam: { id: string; title: string; level: string; variants: ScriptVariant[]; componentOrder: Section[]; totalQuestions: number; choiceLabels?: string[] };
  components: Partial<Record<Section, PackageComponent>>;
};

export function validateStructuredPackage(data: StructuredPackage, assetExists: (path: string) => boolean): string[] {
  const errors: string[] = [];
  if (!data?.exam || !data.components) return ["Đề chưa đủ nội dung để làm bài."];
  const { exam, components } = data;
  if (!exam.id || !exam.title || !exam.level || exam.variants?.join() !== "traditional,simplified") errors.push("Thiếu thông tin đề hoặc bản chữ.");
  if (!Array.isArray(exam.componentOrder) || exam.componentOrder.join() !== "listening,reading") errors.push("Thứ tự phần Nghe và Đọc không hợp lệ.");
  const seen = new Set<string>();
  let total = 0;
  for (const skill of ["listening", "reading"] as const) {
    const component = components[skill];
    if (!component || !Array.isArray(component.questions) || !Array.isArray(component.sections)) { errors.push(`Thiếu phần ${skill}.`); continue; }
    total += component.questions.length;
    if (component.id !== skill || component.questions.length !== component.totalQuestions || !component.questions.length) errors.push(`Số câu phần ${skill} không hợp lệ.`);
    if (!component.scoring || component.scoring.maxScore <= 0 || !Object.keys(component.scoring.scoreByCorrectCount ?? {}).length || Object.values(component.scoring.scoreByCorrectCount ?? {}).some((score) => !Number.isFinite(score))) errors.push(`Bảng điểm phần ${skill} không hợp lệ.`);
    for (const section of component.sections) if (section.introAudio && !assetExists(section.introAudio)) errors.push(`Thiếu âm thanh giới thiệu phần ${section.id}.`);
    if (component.audio?.endingTrack && !assetExists(component.audio.endingTrack)) errors.push("Thiếu âm thanh kết thúc phần Nghe.");
    for (const [index, question] of component.questions.entries()) {
      if (!question.id || seen.has(question.id) || question.number !== index + 1) errors.push(`Mã hoặc thứ tự câu ${skill} ${index + 1} không hợp lệ.`);
      seen.add(question.id);
      const section = component.sections.find((item) => item.id === question.sectionId);
      if (!section || question.number < section.startQuestion || question.number > section.endQuestion) errors.push(`Câu ${question.id} không thuộc phần thi hợp lệ.`);
      if (!Array.isArray(question.choices) || question.choices.length < 2 || new Set(question.choices).size !== question.choices.length || question.choices.some((choice, choiceIndex) => choice !== String.fromCharCode(65 + choiceIndex)) || !question.choices.includes(question.correctAnswer)) errors.push(`Đáp án câu ${question.id} không hợp lệ.`);
      if (question.choiceText && (["traditional", "simplified"] as const).some((script) =>
        question.choiceText?.[script]?.length !== question.choices.length ||
        question.choiceText[script].some((choice, index) => !choice.trim() && skill === "reading" && !question.choiceImages?.[script]?.[index] && !question.visual?.[script]?.prompt))) errors.push(`Thiếu nội dung đáp án câu ${question.id}.`);
      if (skill === "listening") {
        const audio = question.audio;
        if (!audio || (typeof audio === "string" ? !assetExists(audio) :
          !((audio.mode === "self_contained" ? audio.path : audio.questionTrack) &&
            assetExists((audio.mode === "self_contained" ? audio.path : audio.questionTrack)!) &&
            Array.isArray(audio.reviewSequence) && audio.reviewSequence.length > 0 &&
            audio.reviewSequence.every(assetExists)))) errors.push(`Thiếu âm thanh câu ${question.id}.`);
      }
      for (const script of ["traditional", "simplified"] as const) {
        const path = question.assets?.[script];
        if (path && !assetExists(path)) errors.push(`Thiếu ảnh ${script} của câu ${question.id}.`);
        const optionImages = question.choiceImages?.[script];
        if (optionImages && (optionImages.length !== question.choices.length || optionImages.some((image) => !image || !assetExists(image) || !image.includes(`/${script}/`)))) errors.push(`Thiếu ảnh đáp án ${script} của câu ${question.id}.`);
        if (skill === "reading" && !path && !question.questionText?.[script] && !component.displayContexts?.[question.stimulusGroupId ?? ""]?.[script]) errors.push(`Thiếu nội dung hoặc ảnh ${script} của câu ${question.id}.`);
        if (path && !question.variantInvariant && !path.includes(`/${script}/`)) errors.push(`Sai bản chữ ${script} của câu ${question.id}.`);
        const visual = question.visual?.[script];
        if (exam.id === "band-c-test-01" && (!visual || visual.choices?.length !== question.choices.length || (skill === "reading" && !visual.context))) errors.push(`Thiếu vùng hiển thị câu ${question.id} (${script}).`);
        for (const viewport of [visual?.context, visual?.prompt, ...(visual?.choices ?? [])]) {
          if (!viewport) continue;
          if (viewport.x < 0 || viewport.y < 0 || viewport.width <= 0 || viewport.height <= 0 || viewport.sourceWidth <= 0 || viewport.sourceHeight <= 0 || viewport.x + viewport.width > viewport.sourceWidth || viewport.y + viewport.height > viewport.sourceHeight) errors.push(`Vùng ảnh câu ${question.id} (${script}) không hợp lệ.`);
        }
      }
      if (question.variantInvariant && question.assets?.traditional !== question.assets?.simplified) errors.push(`Ảnh dùng chung câu ${question.id} không khớp.`);
      if (!question.variantInvariant && question.assets?.traditional && question.assets.traditional === question.assets.simplified) errors.push(`Hai bản chữ câu ${question.id} bị trùng.`);
    }
  }
  const listening = components.listening;
  const plan = listening?.audio?.examPlaybackPlan;
  if (plan) {
    const questionIds = listening!.questions.map((question) => question.id);
    const order = plan.flatMap((step) => step.type === "question" ? [step.questionId] : step.type === "question_group" ? step.questionTracks.map((track) => track.questionId) : []);
    if (order.join("|") !== questionIds.join("|")) errors.push("Thứ tự câu trong kế hoạch phát âm thanh không khớp 50 câu Nghe.");
    const groups = new Map((listening!.audio as { groups?: { id: string; questions: number[]; sharedAudio: string; questionTracks: Record<string, string> }[] }).groups?.map((group) => [group.id, group]) ?? []);
    for (const step of plan) {
      if (step.type === "track") { if (!assetExists(step.path)) errors.push(`Thiếu tệp phát ${step.path}.`); continue; }
      if (step.type === "question") {
        const question = listening!.questions.find((item) => item.id === step.questionId);
        if (!assetExists(step.path) || !question || typeof question.audio === "string" || question.audio?.mode !== "self_contained" || question.audio.path !== step.path) errors.push(`Sai tệp phát câu ${step.questionId}.`);
        continue;
      }
      const group = groups.get(step.id);
      if (!assetExists(step.sharedAudio) || !group || group.sharedAudio !== step.sharedAudio ||
        step.questionTracks.map((track) => Number(track.questionId.match(/q(\d+)$/)?.[1])).join() !== group.questions.join() ||
        step.questionTracks.length < 2) errors.push(`Nhóm âm thanh ${step.id} không khớp.`);
      for (const track of step.questionTracks) {
        const question = listening!.questions.find((item) => item.id === track.questionId);
        if (!assetExists(track.path) || !question || typeof question.audio === "string" || question.audio?.mode !== "shared_group" ||
          question.audio.groupId !== step.id || question.audio.questionTrack !== track.path || group?.questionTracks[String(question.number)] !== track.path) errors.push(`Sai tệp phát câu ${track.questionId}.`);
      }
    }
  }
  if (total !== exam.totalQuestions) errors.push("Tổng số câu hỏi không khớp.");
  return errors;
}

export function materializeStructuredTest(data: StructuredPackage, script: ScriptVariant): MockTest {
  const { exam, components } = data;
  const sections = exam.componentOrder;
  const listening = components.listening;
  const plan = listening?.audio?.examPlaybackPlan;
  const firstQuestionStep = plan?.findIndex((step) => step.type !== "track") ?? -1;
  const introSteps = plan && firstQuestionStep > 0 ? plan.slice(0, firstQuestionStep) : [];
  const listeningIntroAudio = introSteps.length
    ? introSteps.flatMap((step) => step.type === "track" ? [step.path] : [])
    : [listening?.audio?.examIntro, listening?.sections.find((part) => part.startQuestion === 1)?.introAudio].filter((path): path is string => Boolean(path));
  const playback = plan ? buildPlaybackSequences(plan.slice(introSteps.length)) : {};
  const questions: Question[] = sections.flatMap((skill) => {
    const component = components[skill];
    if (!component) return [];
    return component.questions.map((item) => {
      const bandCText = exam.id === "band-c-test-01" && Boolean(item.choiceText?.[script]?.every((choice) => choice.trim())) &&
        (skill === "listening" || Boolean(item.stimulusGroupId && component.displayContexts?.[item.stimulusGroupId]?.[script] && (item.number <= 15 || item.questionText?.[script])));
      return ({
      id: item.id, number: item.number, section: skill, sectionId: item.sectionId,
      sectionTitle: `Phần ${component.sections.findIndex((part) => part.id === item.sectionId) + 1}`,
      type: "multiple-choice" as const,
      question: skill === "reading" ? item.questionText?.[script] ?? "" : "",
      passage: skill === "reading" && item.stimulusGroupId ? component.displayContexts?.[item.stimulusGroupId]?.[script] : undefined,
      imageUrl: bandCText ? undefined : item.assets?.[script],
      sourceVisual: bandCText ? undefined : item.visual?.[script],
      sourceImageReviewOnly: exam.id === "band-b-test-01",
      imageAlt: `Nội dung câu ${item.number}, chữ ${script === "traditional" ? "Phồn thể" : "Giản thể"}`,
      audioUrl: typeof item.audio === "string" ? item.audio : item.audio?.mode === "self_contained" ? item.audio.path : item.audio?.questionTrack,
      simulationAudioSequence: playback[item.id],
      reviewAudioSequence: typeof item.audio === "object" ? item.audio.reviewSequence : undefined,
      introAudioUrl: item.number === 1 && skill === "listening" ? undefined : component.sections.find((part) => part.id === item.sectionId && part.startQuestion === item.number)?.introAudio,
      choices: item.choiceText?.[script] ?? item.choices.map(() => ""), choiceIds: item.choices,
      choiceImages: item.choiceImages?.[script],
      correctAnswer: item.choices.indexOf(item.correctAnswer), script,
      metadata: component.sections.find((part) => part.id === item.sectionId)?.uniqueChoiceUsageWithinSection ? { uniqueChoiceUsageWithinSection: true } : undefined,
      });
    });
  });
  return {
    id: exam.id, title: exam.title, level: exam.level === "Novice" ? "Band Novice" : exam.level, levelId: exam.level === "Novice" ? "novice" : exam.level.toLowerCase().replace(/\s+/g, "-"), script, logicalTest: true,
    durationMinutes: 60, sections, questions, listeningIntroAudio,
    sectionDetails: sections.flatMap((skill) => components[skill]?.sections.map((part, index) => ({ id: part.id, title: `Phần ${index + 1}`, skill })) ?? []),
    scoreProfiles: {
      listening: components.listening ? { scores: components.listening.scoring.scoreByCorrectCount, maxScore: components.listening.scoring.maxScore } : undefined,
      reading: components.reading ? { scores: components.reading.scoring.scoreByCorrectCount, maxScore: components.reading.scoring.maxScore } : undefined,
    },
  };
}

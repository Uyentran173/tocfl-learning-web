import { notFound } from "next/navigation";
import { getTest } from "@/lib/test-catalog";
import { selectTestScope, type MockTest, type ScriptVariant, type TestScope } from "@/lib/tests";
import type { ExamStartData } from "@/lib/exam-start-preload";
import TestSetup from "@/components/TestSetup";

export default async function InstructionsPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = getTest(testId);
  if (!test) notFound();
  const simplified = getTest(testId, "simplified") ?? test;
  const scripts: Record<ScriptVariant, MockTest> = { traditional: test, simplified };
  const scopes: TestScope[] = ["listening", "reading", "full"];
  const starts = Object.fromEntries((Object.keys(scripts) as ScriptVariant[]).map((script) => [script,
    Object.fromEntries(scopes.map((scope) => {
      const selected = selectTestScope(scripts[script], scope);
      const data: ExamStartData = { id: selected.id, script: selected.script, scope: selected.scope, listeningIntroAudio: selected.listeningIntroAudio, questions: selected.questions.slice(0, 2) };
      return [scope, data];
    })) as Record<TestScope, ExamStartData>,
  ])) as Record<ScriptVariant, Record<TestScope, ExamStartData>>;
  return <TestSetup test={{ id: test.id, title: test.title, level: test.level, sections: test.sections, questionCount: test.questions.length, sectionCounts: { listening: test.questions.filter((item) => item.section === "listening").length, reading: test.questions.filter((item) => item.section === "reading").length } }} starts={starts} />;
}

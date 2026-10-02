import { notFound } from "next/navigation";
import { getTest } from "@/lib/test-catalog";
import TestSetup from "@/components/TestSetup";

export default async function InstructionsPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = getTest(testId);
  if (!test) notFound();
  return <TestSetup test={test} variants={test.logicalTest ? { traditional: test, simplified: getTest(testId, "simplified")! } : undefined} />;
}

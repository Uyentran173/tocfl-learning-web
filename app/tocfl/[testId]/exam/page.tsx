import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getImportedTests, getTest } from "@/lib/test-catalog";
import ExamPageClient from "@/components/ExamPageClient";

export function generateStaticParams() {
  return getImportedTests().map((test) => ({ testId: test.id }));
}

export default async function ExamPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const traditional = getTest(testId, "traditional");
  if (!traditional) notFound();
  const simplified = getTest(testId, "simplified") ?? traditional;
  return (
    <Suspense fallback={<div className="sim-loading-screen">Đang chuẩn bị đề thi…</div>}>
      <ExamPageClient traditional={traditional} simplified={simplified} />
    </Suspense>
  );
}

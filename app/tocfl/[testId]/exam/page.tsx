import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getImportedTests, getTest } from "@/lib/test-catalog";
import ExamPageClient from "@/components/ExamPageClient";
import { createPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getImportedTests().map((test) => ({ testId: test.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = getTest(testId);
  if (!test) notFound();
  return createPageMetadata(`Làm bài ${test.title}`, `Giao diện làm bài ${test.title}.`, `/tocfl/${testId}/exam`, { noIndex: true });
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

import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getImportedTests, getTest } from "@/lib/test-catalog";
import ResultPageClient from "@/components/ResultPageClient";
import { createPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getImportedTests().map((test) => ({ testId: test.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = getTest(testId);
  if (!test) notFound();
  return createPageMetadata(`Kết quả ${test.title}`, `Xem kết quả và tiến độ làm bài ${test.title}.`, `/tocfl/${testId}/result`, { noIndex: true });
}

export default async function ResultPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const traditional = getTest(testId, "traditional");
  if (!traditional) notFound();
  const simplified = getTest(testId, "simplified") ?? traditional;
  return (
    <Suspense fallback={<div className="report-shell"><main className="mx-auto max-w-5xl px-5 py-12">Đang tải kết quả…</main></div>}>
      <ResultPageClient traditional={traditional} simplified={simplified} />
    </Suspense>
  );
}

import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getImportedTests, getTest } from "@/lib/test-catalog";
import { getReviewContent } from "@/lib/review-data";
import ReviewPageClient from "@/components/ReviewPageClient";
import { createPageMetadata } from "@/lib/seo";
import T from "@/components/T";

export function generateStaticParams() {
  return getImportedTests().map((test) => ({ testId: test.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const test = getTest(testId);
  if (!test) notFound();
  return createPageMetadata(`Xem lại ${test.title}`, `Xem lại đáp án sau khi hoàn thành ${test.title}.`, `/tocfl/${testId}/review`, { noIndex: true });
}

export default async function ReviewPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const traditional = getTest(testId, "traditional");
  if (!traditional) notFound();
  const simplified = getTest(testId, "simplified") ?? traditional;
  const reviewTraditional = getReviewContent(traditional);
  const reviewSimplified = getReviewContent(simplified);
  return (
    <Suspense fallback={<div className="report-shell"><main className="mx-auto max-w-5xl px-5 py-12"><T>Đang tải xem lại…</T></main></div>}>
      <ReviewPageClient
        traditional={traditional}
        simplified={simplified}
        reviewTraditional={reviewTraditional}
        reviewSimplified={reviewSimplified}
      />
    </Suspense>
  );
}

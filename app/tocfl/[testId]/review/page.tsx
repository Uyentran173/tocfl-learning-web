import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getImportedTests, getTest } from "@/lib/test-catalog";
import { getReviewContent } from "@/lib/review-data";
import ReviewPageClient from "@/components/ReviewPageClient";

export function generateStaticParams() {
  return getImportedTests().map((test) => ({ testId: test.id }));
}

export default async function ReviewPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const traditional = getTest(testId, "traditional");
  if (!traditional) notFound();
  const simplified = getTest(testId, "simplified") ?? traditional;
  const reviewTraditional = getReviewContent(traditional);
  const reviewSimplified = getReviewContent(simplified);
  return (
    <Suspense fallback={<div className="report-shell"><main className="mx-auto max-w-5xl px-5 py-12">Đang tải xem lại…</main></div>}>
      <ReviewPageClient
        traditional={traditional}
        simplified={simplified}
        reviewTraditional={reviewTraditional}
        reviewSimplified={reviewSimplified}
      />
    </Suspense>
  );
}

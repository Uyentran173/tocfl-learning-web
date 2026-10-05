"use client";

import { useSearchParams } from "next/navigation";
import { parseTestScope, selectTestScope, type MockTest } from "@/lib/tests";
import type { ReviewContent } from "@/lib/review-content";
import ReviewClient from "@/components/ReviewClient";

export default function ReviewPageClient({
  traditional,
  simplified,
  reviewTraditional,
  reviewSimplified,
}: {
  traditional: MockTest;
  simplified: MockTest;
  reviewTraditional: ReviewContent;
  reviewSimplified: ReviewContent;
}) {
  const searchParams = useSearchParams();
  const script = searchParams.get("script") === "simplified" ? "simplified" : "traditional";
  const scope = parseTestScope(searchParams.get("scope") ?? undefined);
  const baseTest = script === "simplified" ? simplified : traditional;
  const test = selectTestScope(baseTest, scope);
  const reviewContent = script === "simplified" ? reviewSimplified : reviewTraditional;
  return <ReviewClient test={test} reviewContent={reviewContent} />;
}

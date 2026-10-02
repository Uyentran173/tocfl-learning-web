import { notFound } from "next/navigation";
import { getTest } from "@/lib/test-catalog";
import { getReviewContent } from "@/lib/review-data";
import { parseTestScope } from "@/lib/tests";
import ReviewClient from "@/components/ReviewClient";
export default async function ReviewPage({ params, searchParams }: { params: Promise<{ testId: string }>; searchParams: Promise<{ script?: string; scope?: string }> }) { const { testId } = await params; const { script, scope } = await searchParams; const test = getTest(testId, script === "simplified" ? "simplified" : "traditional", parseTestScope(scope)); if (!test) notFound(); return <ReviewClient test={test} reviewContent={getReviewContent(test)}/>; }

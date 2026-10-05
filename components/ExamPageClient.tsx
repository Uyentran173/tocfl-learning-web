"use client";

import { useSearchParams } from "next/navigation";
import { parseTestScope, selectTestScope, type MockTest } from "@/lib/tests";
import ExamClient from "@/components/ExamClient";

export default function ExamPageClient({ traditional, simplified }: { traditional: MockTest; simplified: MockTest }) {
  const searchParams = useSearchParams();
  const script = searchParams.get("script") === "simplified" ? "simplified" : "traditional";
  const scope = parseTestScope(searchParams.get("scope") ?? undefined);
  const baseTest = script === "simplified" ? simplified : traditional;
  const test = selectTestScope(baseTest, scope);
  return <ExamClient test={test} />;
}

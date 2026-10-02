import { notFound } from "next/navigation";
import { getTest } from "@/lib/test-catalog";
import { parseTestScope } from "@/lib/tests";
import ResultClient from "@/components/ResultClient";
export default async function ResultPage({ params, searchParams }: { params: Promise<{ testId: string }>; searchParams: Promise<{ script?: string; scope?: string }> }) { const { testId } = await params; const { script, scope } = await searchParams; const test = getTest(testId, script === "simplified" ? "simplified" : "traditional", parseTestScope(scope)); if (!test) notFound(); return <ResultClient test={test}/>; }

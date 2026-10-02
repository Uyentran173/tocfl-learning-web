import { notFound } from "next/navigation";
import { getTest } from "@/lib/test-catalog";
import { parseTestScope } from "@/lib/tests";
import ExamClient from "@/components/ExamClient";
export default async function ExamPage({ params, searchParams }: { params: Promise<{ testId: string }>; searchParams: Promise<{ script?: string; scope?: string }> }) { const { testId } = await params; const { script, scope } = await searchParams; const test = getTest(testId, script === "simplified" ? "simplified" : "traditional", parseTestScope(scope)); if (!test) notFound(); return <ExamClient test={test}/>; }

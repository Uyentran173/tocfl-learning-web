"use client";
import { useRouter } from "next/navigation";
import { scriptQuery, type MockTest } from "@/lib/tests";
import { ensurePracticeTiming, readSession, saveSession, startSession, type ExamMode } from "@/lib/session";
import { useT } from "./PreferencesProvider";
export default function StartTestButton({ test, mode = "practice", label, className = "button-primary" }: { test: MockTest; mode?: ExamMode; label?: string; className?: string }) {
  const router = useRouter();
  const t = useT();
  return <button type="button" className={className} onClick={() => {
    window.sessionStorage.removeItem(`tocfl-simulation-intro:${test.id}`);
    const existing = readSession(test.id);
    if (!existing || existing.status === "submitted" || existing.mode !== mode || (existing.scope ?? "full") !== (test.scope ?? "full") || existing.script !== test.script) startSession(test, mode);
    else saveSession(ensurePracticeTiming(test, { ...existing, mode, script: test.script }));
    router.push(`/tocfl/${test.id}/exam${scriptQuery(test)}`);
  }}>{label ? t(label) : <>{t("Bắt đầu làm bài")} <span aria-hidden="true">→</span></>}</button>;
}

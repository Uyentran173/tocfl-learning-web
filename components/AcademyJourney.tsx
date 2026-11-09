"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { academyActivityKinds, academyLessonStatus, academyLessonSummaries, academyVolume } from "@/lib/academy-catalog";
import { academyLessonProgressKey, emptyAcademyLessonProgress, parseAcademyLessonProgress } from "@/lib/academy-progress";
import { progressStorage } from "@/lib/progress-storage";
import { academyLessonLabel } from "@/lib/i18n-academy";
import { usePreferences } from "./PreferencesProvider";

export default function AcademyJourney({ lessonTitle, estimatedMinutes }: { lessonTitle: string; estimatedMinutes: number | null }) {
  const { t, locale } = usePreferences();
  const [progress, setProgress] = useState(emptyAcademyLessonProgress);
  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(parseAcademyLessonProgress(progressStorage().getItem(academyLessonProgressKey))), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const completed = progress.completedActivityIds.length;
  const started = completed > 0 || Object.keys(progress.answers).length > 0 || progress.currentActivityId !== emptyAcademyLessonProgress.currentActivityId;
  const resumeHref = `/academy/cc1/lesson/01?activity=${encodeURIComponent(progress.currentActivityId)}`;
  return <>
    <ol className="academy-route mt-8" aria-label={t("Hành trình 15 bài học")}>
      {academyVolume.lessonIds.map((id, index) => {
        const number = index + 1;
        const published = academyLessonStatus(number) === "published";
        return <li key={id} className={`academy-route-stop ${published ? "is-open" : "is-draft"}`}>
          <span className="academy-route-node" aria-hidden="true">{String(number).padStart(2, "0")}</span>
          {published ? <Link href={resumeHref} className="academy-route-card academy-card-link paper" aria-label={`${t(started ? "Tiếp tục học" : "Bắt đầu bài học")}: ${lessonTitle}`}>
            <p className="page-eyebrow">{academyLessonLabel(locale, number)}</p>
            <h3 className="mt-3 text-lg font-bold" lang="zh-Hant">{lessonTitle}</h3>
            <p className="mt-2 text-sm muted">{academyLessonSummaries[0].vi}{estimatedMinutes ? ` · ${estimatedMinutes} ${t("phút dự kiến")}` : ""}</p>
            {started && <div className="academy-progress-bar mt-4" role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={academyActivityKinds.length} aria-label={t("Tiến độ bài học")}><span style={{ width: `${completed / academyActivityKinds.length * 100}%` }} /></div>}
            <span className="academy-route-card-footer"><span>{t(started ? "Tiếp tục học" : "Bắt đầu bài học")}</span><span className="academy-card-arrow" aria-hidden="true">→</span></span>
          </Link> : <div className="academy-route-card paper academy-route-unpublished"><p className="page-eyebrow">{academyLessonLabel(locale, number)}</p><h3 className="mt-3 text-lg font-bold" lang="zh-Hant">{academyLessonSummaries[index].chinese}</h3><p className="mt-1 text-sm muted">{academyLessonSummaries[index].vi}</p></div>}
        </li>;
      })}
    </ol>
  </>;
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { academyActivityKinds, academyActivityLabels, academyLessonStatus, academyVolume } from "@/lib/academy-catalog";
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
    <section className="paper academy-journey-summary mt-8 p-5 sm:p-7" aria-label={t("Tiến độ học tập")}>
      <div><p className="page-eyebrow">{t("BÀI ĐANG MỞ")}</p><h2 className="mt-2 text-2xl font-bold">{lessonTitle}</h2><p className="mt-2 text-sm muted">{completed}/{academyActivityKinds.length} {t("hoạt động đã hoàn thành")}{estimatedMinutes ? ` · ${estimatedMinutes} ${t("phút dự kiến")}` : ""}</p></div>
      <Link className="button-primary" href={resumeHref}>{t(started ? "Tiếp tục học" : "Bắt đầu bài học")} →</Link>
    </section>
    <ol className="academy-route mt-12" aria-label={t("Hành trình 15 bài học")}>
      {academyVolume.lessonIds.map((id, index) => {
        const number = index + 1;
        const published = academyLessonStatus(number) === "published";
        return <li key={id} className={`academy-route-stop ${published ? "is-open" : "is-draft"}`}>
          <span className="academy-route-node" aria-hidden="true">{String(number).padStart(2, "0")}</span>
          <div className="academy-route-card paper">
            <div className="flex items-start justify-between gap-3"><p className="page-eyebrow">{academyLessonLabel(locale, number)}</p><span className="academy-status">{t(published ? completed === academyActivityKinds.length ? "Đã hoàn thành" : started ? "Đang học" : "Có thể học" : "Đang biên tập")}</span></div>
            <h3 className="mt-3 text-lg font-bold" lang={published ? "vi" : undefined}>{published ? lessonTitle : academyLessonLabel(locale, number)}</h3>
            {published ? <><p className="mt-2 text-sm muted">{academyActivityKinds.map((kind) => t(academyActivityLabels[kind])).join(" · ")}</p><div className="academy-progress-bar mt-4" role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={academyActivityKinds.length} aria-label={t("Tiến độ bài học")}><span style={{ width: `${completed / academyActivityKinds.length * 100}%` }} /></div><Link className="academy-route-link mt-4" href={resumeHref}>{t(started ? "Tiếp tục học" : "Bắt đầu bài học")} ↗</Link></> : <p className="mt-2 text-sm muted">{t("Nội dung chưa xuất bản. Bạn có thể quay lại sau.")}</p>}
          </div>
        </li>;
      })}
    </ol>
  </>;
}

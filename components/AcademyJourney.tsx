"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { academyActivityKindsForLesson, academyLessonStatus, academyLessonSummaries, academyVolume } from "@/lib/academy-catalog";
import { academyProgressKeyForLesson, emptyAcademyProgressForLesson, parseAcademyLessonProgress, type AcademyLessonProgress } from "@/lib/academy-progress";
import { progressStorage } from "@/lib/progress-storage";
import { academyLessonLabel } from "@/lib/i18n-academy";
import { academyScriptText } from "@/lib/academy-script";
import { usePreferences } from "./PreferencesProvider";

type AvailableLesson = { number: number; title: string; estimatedMinutes: number | null };

export default function AcademyJourney({ lessons, volume = academyVolume, summaries = academyLessonSummaries, lessonRoute = "/academy/cc1/lesson" }: { lessons: AvailableLesson[]; volume?: { lessonIds: string[] }; summaries?: readonly { chinese: string; vi: string }[]; lessonRoute?: string }) {
  const { t, locale } = usePreferences();
  const [progressByLesson, setProgressByLesson] = useState<Record<string, AcademyLessonProgress>>({});
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const values: Record<string, AcademyLessonProgress> = {};
      for (const lesson of lessons) {
        const id = volume.lessonIds[lesson.number - 1];
        values[id] = parseAcademyLessonProgress(progressStorage().getItem(academyProgressKeyForLesson(id)), id);
      }
      setProgressByLesson(values);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [lessons, volume]);
  const availableByNumber = new Map(lessons.map((lesson) => [lesson.number, lesson]));
  return <ol className="academy-route mt-8" aria-label={t("Hành trình 15 bài học")}>
    {volume.lessonIds.map((id, index) => {
      const number = index + 1;
      const available = availableByNumber.get(number);
      const published = academyLessonStatus(number) === "published" && Boolean(available);
      const progress = progressByLesson[id] ?? emptyAcademyProgressForLesson(id);
      const completed = progress.completedActivityIds.length;
      const total = academyActivityKindsForLesson(id).length;
      const started = completed > 0 || Object.keys(progress.answers).length > 0 || progress.currentActivityId !== emptyAcademyProgressForLesson(id).currentActivityId;
      const href = `${lessonRoute}/${String(number).padStart(2, "0")}${started ? `?activity=${encodeURIComponent(progress.currentActivityId)}` : ""}`;
      const script = progress.script;
      const title = academyScriptText(available?.title ?? summaries[index].chinese, script);
      return <li key={id} className={`academy-route-stop ${published ? "is-open" : "is-draft"}`}>
        <span className="academy-route-node" aria-hidden="true">{String(number).padStart(2, "0")}</span>
        {published ? <Link href={href} className="academy-route-card academy-card-link paper" aria-label={`${t(started ? "Tiếp tục học" : "Bắt đầu bài học")}: ${title}`}>
          <p className="page-eyebrow">{academyLessonLabel(locale, number)}</p>
          <h3 className="mt-3 text-lg font-bold" lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{title}</h3>
          <p className="mt-2 text-sm muted">{summaries[index].vi}{available?.estimatedMinutes ? ` · ${available.estimatedMinutes} ${t("phút dự kiến")}` : ""}</p>
          {started && <div className="academy-progress-bar mt-4" role="progressbar" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={total} aria-label={t("Tiến độ bài học")}><span style={{ width: `${completed / total * 100}%` }} /></div>}
          <span className="academy-route-card-footer"><span>{t(started ? "Tiếp tục học" : "Bắt đầu bài học")}</span><span className="academy-card-arrow" aria-hidden="true">→</span></span>
        </Link> : <div className="academy-route-card paper academy-route-unpublished"><p className="page-eyebrow">{academyLessonLabel(locale, number)}</p><h3 className="mt-3 text-lg font-bold" lang="zh-Hant">{summaries[index].chinese}</h3><p className="mt-1 text-sm muted">{summaries[index].vi}</p></div>}
      </li>;
    })}
  </ol>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { AcademyTrack } from "@/lib/academy";
import reviewedContent from "@/data/academy/cc1-reviewed-content.json";
import cc2ReviewedContent from "@/data/academy/cc2-reviewed-content.json";
import { progressStorage } from "@/lib/progress-storage";
import { useT } from "./PreferencesProvider";

type LessonProgress = { version: 1; selectedTrackId: string; listenedIds: string[]; completedIds: string[]; responses: Record<string, string>; guestResponses: Record<string, string> };
function TrackList({ items, heading, activeId, progress, onSelect, t }: { items: AcademyTrack[]; heading: string; activeId: string; progress: LessonProgress; onSelect: (id: string) => void; t: (value: string) => string }) {
  return <section className="paper p-4 sm:p-5"><h2 className="text-lg font-bold">{t(heading)}</h2><div className="mt-4 grid gap-2">{items.map((track) => <button type="button" key={track.id} className="academy-track" aria-current={activeId === track.id ? "true" : undefined} onClick={() => onSelect(track.id)}><span className="academy-track-number">{String(track.number).padStart(2, "0")}</span><span className="min-w-0 flex-1 text-left"><strong>{t(track.activity?.labelVi ?? "Bản ghi âm")}</strong><small>{track.activity?.referenceCode}</small></span><span className="text-sm text-[var(--brand)]" aria-label={progress.completedIds.includes(track.id) ? t("Đã hoàn thành") : progress.listenedIds.includes(track.id) ? t("Đã nghe") : undefined}>{progress.completedIds.includes(track.id) ? "✓" : progress.listenedIds.includes(track.id) ? "◌" : "▶"}</span></button>)}</div></section>;
}
const progressKeyForLesson = (lesson: number, courseId: string) => `taiwen-academy:v1:${courseId}:l${String(lesson).padStart(2, "0")}`;
const speeds = [0.75, 1, 1.25, 1.5];

function readProgress(firstTrackId: string, progressKey: string): LessonProgress {
  const empty: LessonProgress = { version: 1, selectedTrackId: firstTrackId, listenedIds: [], completedIds: [], responses: {}, guestResponses: {} };
  try {
    const parsed = JSON.parse(progressStorage().getItem(progressKey) ?? "null") as Partial<LessonProgress> | null;
    if (!parsed || parsed.version !== 1) return empty;
    return {
      version: 1,
      selectedTrackId: typeof parsed.selectedTrackId === "string" ? parsed.selectedTrackId : firstTrackId,
      listenedIds: Array.isArray(parsed.listenedIds) ? parsed.listenedIds.filter((item): item is string => typeof item === "string") : [],
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds.filter((item): item is string => typeof item === "string") : [],
      responses: parsed.responses && typeof parsed.responses === "object" ? parsed.responses : {},
      guestResponses: parsed.guestResponses && typeof parsed.guestResponses === "object" ? parsed.guestResponses : {},
    };
  } catch { return empty; }
}

export default function AcademyAudioLesson({ tracks, availableTrackIds, embedded = false, lessonNumber = 1, script = "traditional", courseId = "cc1" }: { tracks: AcademyTrack[]; availableTrackIds: string[]; embedded?: boolean; lessonNumber?: number; script?: "traditional" | "simplified"; courseId?: "cc1" | "cc2" }) {
  const t = useT();
  const progressKey = progressKeyForLesson(lessonNumber, courseId);
  const textbook = tracks.filter((track) => track.source === "textbook");
  const workbook = tracks.filter((track) => track.source === "workbook");
  const [progress, setProgress] = useState<LessonProgress>({ version: 1, selectedTrackId: tracks[0]?.id ?? "", listenedIds: [], completedIds: [], responses: {}, guestResponses: {} });
  const [hydrated, setHydrated] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [audioError, setAudioError] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const saved = readProgress(tracks[0]?.id ?? "", progressKey);
    const selectedTrackId = tracks.some((track) => track.id === saved.selectedTrackId) ? saved.selectedTrackId : tracks[0]?.id ?? "";
    const timeout = window.setTimeout(() => { setProgress({ ...saved, selectedTrackId }); setHydrated(true); }, 0);
    return () => window.clearTimeout(timeout);
  }, [tracks, progressKey]);

  useEffect(() => {
    if (hydrated && hasChanges) progressStorage().setItem(progressKey, JSON.stringify(progress));
  }, [progress, hydrated, hasChanges, progressKey]);

  const active = tracks.find((track) => track.id === progress.selectedTrackId) ?? tracks[0];
  const available = active && availableTrackIds.includes(active.id);
  const reviewMap: Record<string, { transcriptTraditional?: string; transcriptSimplified?: string; translationVi?: string }> = courseId === "cc2" ? cc2ReviewedContent : reviewedContent;
  const reviewed = reviewMap[active?.id ?? ""];
  function selectTrack(id: string) {
    audioRef.current?.pause();
    setAudioError(false);
    setShowTranscript(false);
    setHasChanges(true);
    setProgress((current) => ({ ...current, selectedTrackId: id }));
  }
  function markListened() {
    if (!active) return;
    setHasChanges(true);
    setProgress((current) => ({ ...current, listenedIds: [...new Set([...current.listenedIds, active.id])] }));
  }
  function markComplete() {
    if (!active) return;
    setHasChanges(true);
    setProgress((current) => ({ ...current, completedIds: current.completedIds.includes(active.id) ? current.completedIds.filter((id) => id !== active.id) : [...current.completedIds, active.id] }));
  }
  function replay() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    void audioRef.current.play().catch(() => setAudioError(true));
  }
  function changeSpeed(value: number) {
    setSpeed(value);
    if (audioRef.current) audioRef.current.playbackRate = value;
  }
  if (!active) return null;
  const guestCopy = Object.entries(progress.guestResponses).filter(([key]) => key === active.id || key.startsWith(`${active.id}:`));
  return <div className={embedded ? "academy-audio-embedded mt-5 grid gap-5" : "mt-9 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,1.2fr)]"}>
    <div className="space-y-5">{textbook.length > 0 && <TrackList items={textbook} heading="Âm thanh giáo trình" activeId={active.id} progress={progress} onSelect={selectTrack} t={t} />}{workbook.length > 0 && <TrackList items={workbook} heading="Âm thanh bài tập" activeId={active.id} progress={progress} onSelect={selectTrack} t={t} />}</div>
    <section className="paper h-fit p-5 sm:p-7">
      <p className="page-eyebrow">{t(active.source === "textbook" ? "Giáo trình" : "Bài tập")} · {active.activity?.referenceCode}</p>
      <h2 className="mt-3 text-2xl font-bold" aria-live="polite">{t(active.activity?.labelVi ?? "Bản ghi âm")}</h2>
      <p className="mt-2 text-sm muted">{t("Trang sách")} {active.activity?.bookPage} · {t("BÀI")} {String(lessonNumber).padStart(2, "0")}</p>
      {available ? <div className="academy-player mt-6">
        <audio key={active.id} ref={audioRef} controls preload="none" src={`/academy/${courseId}/audio/${encodeURIComponent(active.id)}.mp3`} onEnded={markListened} onError={() => setAudioError(true)} onLoadedMetadata={() => { if (audioRef.current) audioRef.current.playbackRate = speed; }} aria-label={`${t("Âm thanh")} ${active.activity?.referenceCode}`} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="button-secondary text-sm" onClick={replay}>{t("Nghe lại từ đầu")}</button>
          <label className="flex items-center gap-2 text-sm font-semibold"><span>{t("Tốc độ")}</span><select className="academy-speed" value={speed} onChange={(event) => changeSpeed(Number(event.target.value))} aria-label={t("Tốc độ phát")}>{speeds.map((value) => <option key={value} value={value}>{value}×</option>)}</select></label>
        </div>
        {audioError && <p role="alert" className="mt-3 text-sm muted">{t("Chưa tải được âm thanh. Hãy thử chọn lại bản ghi âm.")}</p>}
      </div> : <div className="academy-unavailable mt-6" role="status"><strong>{t("Bản ghi âm đang được kiểm tra")}</strong></div>}
      {reviewed?.transcriptTraditional && <div className="mt-5"><button type="button" className="button-secondary text-sm" aria-expanded={showTranscript} onClick={() => setShowTranscript((value) => !value)}>{showTranscript ? t("Ẩn transcript") : t("Xem transcript")}</button>{showTranscript && <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-4"><p lang={script === "traditional" ? "zh-Hant" : "zh-Hans"} className="whitespace-pre-wrap leading-7">{script === "simplified" ? reviewed.transcriptSimplified ?? reviewed.transcriptTraditional : reviewed.transcriptTraditional}</p>{reviewed.translationVi && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 muted">{reviewed.translationVi}</p>}</div>}</div>}
      <div className="mt-6 border-t border-[var(--border)] pt-5">
        <h3 className="font-bold">{t(active.source === "workbook" ? "Bài tập nghe" : "Luyện nghe và ghi lại")}</h3>
        <p className="mt-2 text-sm leading-6 muted">{t(active.source === "workbook" ? "Nghe và trả lời câu hỏi trong sách bài tập. Phần này chưa chấm tự động." : "Nghe rồi ghi lại điều bạn muốn nhớ.")}</p>
        {active.source === "workbook" && active.activity?.itemCount ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{Array.from({ length: active.activity.itemCount }, (_, index) => <label key={index} className="block text-sm font-semibold">{t("Mục")} {index + 1}<input className="academy-response mt-2" value={progress.responses[`${active.id}:${index + 1}`] ?? ""} onChange={(event) => { setHasChanges(true); setProgress((current) => ({ ...current, responses: { ...current.responses, [`${active.id}:${index + 1}`]: event.target.value } })); }} aria-label={`${t("Mục")} ${index + 1}`} /></label>)}</div> : <><label className="mt-4 block text-sm font-semibold" htmlFor="academy-response">{t("Ghi chép của bạn")}</label><textarea id="academy-response" className="academy-response mt-2" rows={5} value={progress.responses[active.id] ?? ""} onChange={(event) => { setHasChanges(true); setProgress((current) => ({ ...current, responses: { ...current.responses, [active.id]: event.target.value } })); }} placeholder={t("Ghi lại câu trả lời hoặc điều bạn muốn ôn tập…")} /></>}
        {guestCopy.length > 0 && <details className="mt-4 rounded-xl border border-[var(--border)] p-3 text-sm"><summary className="cursor-pointer font-semibold">{t("Ghi chép từ chế độ khách")}</summary><ul className="mt-2 space-y-2">{guestCopy.map(([key, value]) => <li key={key}><strong>{key === active.id ? t("Ghi chép") : `${t("Mục")} ${key.split(":").at(-1)}`}: </strong><span className="whitespace-pre-wrap">{value}</span></li>)}</ul></details>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><button type="button" className="button-primary text-sm" aria-pressed={progress.completedIds.includes(active.id)} onClick={markComplete}>{progress.completedIds.includes(active.id) ? t("Đã hoàn thành") : t("Đánh dấu hoàn thành")}</button></div>
      </div>
    </section>
  </div>;
}

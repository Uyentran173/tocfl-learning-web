import manifest from "@/data/academy/cc1-audio-manifest.json";
import volume2Manifest from "@/data/academy/cc2-audio-manifest.json";
import volume3Manifest from "@/data/academy/cc3-audio-manifest.json";

export type AcademyTrack = (typeof manifest.tracks)[number] | (typeof volume2Manifest.tracks)[number] | (typeof volume3Manifest.tracks)[number];
export const academyCourse = {
  id: manifest.courseId,
  title: manifest.title,
  volume: manifest.volume,
  lessonCount: Math.max(...manifest.tracks.map((track) => track.lesson ?? 0)),
  lesson01Title: "歡迎你來臺灣！",
};

export function academyTracksForLesson(lesson: number, verifiedOnly = true, courseId: "cc1" | "cc2" | "cc3" = "cc1"): AcademyTrack[] {
  const source = courseId === "cc3" ? volume3Manifest.tracks : courseId === "cc2" ? volume2Manifest.tracks : manifest.tracks;
  return source.filter((track) => track.lesson === lesson && (!verifiedOnly || track.mappingStatus === "verified"));
}

export function academyTrackById(id: string): AcademyTrack | undefined {
  return [...manifest.tracks, ...volume2Manifest.tracks, ...volume3Manifest.tracks].find((track) => track.id === id);
}

export function academyMappingSummary() {
  return {
    total: manifest.tracks.length,
    textbook: manifest.tracks.filter((track) => track.source === "textbook").length,
    workbook: manifest.tracks.filter((track) => track.source === "workbook").length,
    verifiedLesson01: academyTracksForLesson(1).length,
  };
}

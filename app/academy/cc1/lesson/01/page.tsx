import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import T from "@/components/T";
import AcademyAudioLesson from "@/components/AcademyAudioLesson";
import { academyCourse, academyTracksForLesson } from "@/lib/academy";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Tai Wén Academy · Bài 01", "Luyện nghe Bài 01 của Giáo trình tiếng Hoa đương đại, tập 1.", "/academy/cc1/lesson/01", { noIndex: true });

export default function AcademyLesson01Page() {
  const tracks = academyTracksForLesson(1);
  const availableTrackIds = process.env.NODE_ENV === "development"
    ? tracks.filter((track) => existsSync(path.join(process.cwd(), ".private", "academy", "cc1", track.privatePath))).map((track) => track.id)
    : [];
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/academy" className="button-quiet text-sm">← <T>Tất cả bài học</T></Link>
    <p className="page-eyebrow mt-8">TAI WÉN ACADEMY · <T>BÀI</T> 01</p>
    <h1 className="page-title" lang="zh-Hant">{academyCourse.lesson01Title}</h1>
    <p className="page-lead"><T>Luyện nghe từng bản ghi âm của bài này. Bạn tự chọn lúc phát; âm thanh không tự chạy.</T></p>
    <AcademyAudioLesson tracks={tracks} availableTrackIds={availableTrackIds} />
  </main>;
}

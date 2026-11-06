import Link from "next/link";
import MascotSticker from "@/components/MascotSticker";
import T from "@/components/T";
import { academyCourse, academyMappingSummary } from "@/lib/academy";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Tai Wén Academy · Giáo trình Đương đại 1", "Luyện nghe theo từng bài của Giáo trình tiếng Hoa đương đại, tập 1.", "/academy", { noIndex: true });

export default function AcademyPage() {
  const summary = academyMappingSummary();
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
    <Link href="/vocabulary/textbook" className="button-quiet text-sm">← <T>Học theo giáo trình</T></Link>
    <div className="mt-8 flex items-center justify-between gap-6">
      <div><p className="page-eyebrow">TAI WÉN ACADEMY</p><h1 className="page-title"><T>Nghe theo từng bài học</T></h1>
        <p className="page-lead">{academyCourse.title}. <T>Âm thanh giáo trình và bài tập được sắp xếp riêng để bạn luyện nghe theo nhịp của mình.</T></p>
      </div><MascotSticker variant="study" decorative className="hidden w-28 sm:block" />
    </div>
    <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: academyCourse.lessonCount }, (_, index) => {
        const number = index + 1;
        return <article key={number} className="paper flex min-h-44 flex-col p-5">
          <p className="text-xs font-extrabold tracking-widest text-[var(--brand)]"><T>BÀI</T> {String(number).padStart(2, "0")}</p>
          <h2 className="mt-2 text-xl font-bold" lang={number === 1 ? "zh-Hant" : undefined}>{number === 1 ? academyCourse.lesson01Title : <T>Đang đối chiếu âm thanh</T>}</h2>
          <p className="mt-2 flex-1 text-sm leading-6 muted">{number === 1 ? <><T>Đã xác minh</T> {summary.verifiedLesson01} <T>bản ghi âm với mã trong sách.</T></> : <T>Danh sách âm thanh đã được lưu riêng; hoạt động đang chờ xác minh.</T>}</p>
          {number === 1 ? <Link className="button-primary mt-5 w-fit text-sm" href="/academy/cc1/lesson/01"><T>Mở bài học</T> →</Link> : <span className="mt-5 text-xs font-semibold muted"><T>Chưa mở bài học</T></span>}
        </article>;
      })}
    </div>
  </main>;
}

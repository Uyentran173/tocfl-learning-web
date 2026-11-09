"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import MascotSticker from "./MascotSticker";
import { useT } from "./PreferencesProvider";

const stops = [
  { id: "lecture", title: "Bài giảng", detail: "Hội thoại đời thường", href: "/academy/cc1/lesson/01?activity=cc1-v1-l01-lecture" },
  { id: "vocabulary", title: "Từ vựng", detail: "Từ mới dễ nhớ", href: "/academy/cc1/lesson/01?activity=cc1-v1-l01-vocabulary" },
  { id: "grammar", title: "Ngữ pháp", detail: "Hiểu cách dùng", href: "/academy/cc1/lesson/01?activity=cc1-v1-l01-grammar" },
  { id: "practice", title: "Luyện tập", detail: "Thử sức từng bước", href: "/academy/cc1/lesson/01?activity=cc1-v1-l01-practice" },
  { id: "tocfl", title: "TOCFL", detail: "Sẵn sàng đi thi", href: "/tocfl" },
] as const;

function StopIllustration({ id }: { id: (typeof stops)[number]["id"] }) {
  const shared = { viewBox: "0 0 64 64", fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (id === "lecture") return <svg {...shared}><path d="M9 13h35a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H27l-10 8v-8a8 8 0 0 1-8-8V21a8 8 0 0 1 8-8Z" fill="#fff" fillOpacity=".55"/><path d="M19 25h23M19 33h16"/><circle cx="46" cy="12" r="6" fill="#fff" fillOpacity=".7"/></svg>;
  if (id === "vocabulary") return <svg {...shared}><rect x="12" y="10" width="37" height="43" rx="6" fill="#fff" fillOpacity=".64"/><path d="M19 19h23M19 42h23M22 32h18M31 23v18M51 17l5-5M54 27h7"/><circle cx="51" cy="49" r="5" fill="#fff" fillOpacity=".8"/></svg>;
  if (id === "grammar") return <svg {...shared}><rect x="6" y="19" width="17" height="22" rx="5" fill="#fff" fillOpacity=".67"/><rect x="25" y="12" width="17" height="22" rx="5" fill="#fff" fillOpacity=".8"/><rect x="44" y="23" width="15" height="22" rx="5" fill="#fff" fillOpacity=".67"/><path d="m23 30 3-4m16 0 3 7M11 48h42"/></svg>;
  if (id === "practice") return <svg {...shared}><path d="M15 9h28l8 8v35a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4Z" fill="#fff" fillOpacity=".63"/><path d="M42 9v9h9M20 27l4 4 7-8M36 27h8M20 42l4 4 7-8M36 42h8"/></svg>;
  return <svg {...shared}><path d="M17 9h30v42H17z" fill="#fff" fillOpacity=".72"/><path d="M23 19h18M23 28h10M23 37h18M23 45h12"/><circle cx="49" cy="44" r="11" fill="#ffe7b4"/><path d="m45 44 3 3 6-7M45 54l-2 7m11-9 3 8"/></svg>;
}

export default function HomeLearningWorld() {
  const t = useT();

  return <div className="learning-world" role="group" aria-label={t("Khám phá thế giới học tập Tai Wén")}>
    <div className="learning-world-sun" aria-hidden="true" />
    <svg className="learning-world-scenery" viewBox="0 0 1200 540" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 417C117 339 207 348 293 407c109-132 198-145 308 10 91-96 175-113 259-26 115-86 233-77 340 12v137H0Z" fill="var(--world-hill-back)" />
      <path d="M0 467c111-61 215-56 314 9 108-73 195-68 286 8 102-75 197-75 294-6 96-63 203-75 306-12v74H0Z" fill="var(--world-hill-front)" />
      <path d="M1041 330v-72h7v-15h10v-16h11v-20h12v-21h13v-22h10v-24h12v-17h9v17h11v24h10v22h13v21h11v20h10v16h10v15h7v72" fill="none" stroke="var(--world-tower)" strokeWidth="6" strokeLinejoin="round" opacity=".55" />
      <path d="M1055 271h131m-119-27h108m-94-39h80m-65-42h50" stroke="var(--world-tower)" strokeWidth="5" opacity=".45" />
    </svg>
    <svg className="learning-world-route" viewBox="0 0 1200 540" preserveAspectRatio="none" aria-hidden="true">
      <path d="M171 164C252 183 244 287 174 327s70 112 184 61c125-57 135-240 260-253 129-14 190 78 91 157-95 76-69 145 54 136 138-9 157-126 256-137" />
      {["171,164", "174,327", "618,135", "763,428", "1019,291"].map((point) => {
        const [cx, cy] = point.split(",");
        return <circle key={point} cx={cx} cy={cy} r="8" />;
      })}
    </svg>

    <div className="learning-world-portal" aria-hidden="true">
      <div className="learning-world-portal-glow" />
      <div className="learning-world-book-shadow" />
      <div className="learning-world-book">
        <div className="learning-world-book-page learning-world-book-left">
          <span className="learning-world-book-label">TAI WÉN</span>
          <span className="learning-world-book-character" lang="zh-Hant">學</span>
          <i /><i /><i />
        </div>
        <div className="learning-world-book-page learning-world-book-right">
          <span className="learning-world-book-label">ACADEMY</span>
          <span className="learning-world-book-illustration" lang="zh-Hant">你好<span>✦</span></span>
          <i /><i />
        </div>
      </div>
      <span className="learning-world-portal-caption">{t("Mỗi bài học là một điểm đến mới")}</span>
    </div>

    <div className="learning-world-cards">
      {stops.map((stop, index) => <Link href={stop.href} key={stop.id} className={`learning-world-card learning-world-card-${stop.id}`} style={{ "--card-index": index } as CSSProperties}>
        <span className="learning-world-card-art" aria-hidden="true"><StopIllustration id={stop.id} /><i /><i /></span>
        <span className="learning-world-card-copy"><strong>{stop.id === "tocfl" ? stop.title : t(stop.title)}</strong><small>{t(stop.detail)}</small></span>
        <span className="learning-world-card-arrow" aria-hidden="true">↗</span>
      </Link>)}
    </div>
    <span className="learning-world-mobile-hint">{t("Vuốt để xem thêm hoạt động")} <span aria-hidden="true">→</span></span>

    <MascotSticker variant="study" decorative className="learning-world-bear" />
    <span className="learning-world-spark learning-world-spark-one" aria-hidden="true">✦</span>
    <span className="learning-world-spark learning-world-spark-two" aria-hidden="true">✧</span>
    <span className="learning-world-spark learning-world-spark-three" aria-hidden="true">✦</span>
  </div>;
}

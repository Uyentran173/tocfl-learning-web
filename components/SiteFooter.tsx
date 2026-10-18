"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { BrandMark } from "./SiteBrand";
import { useT } from "./PreferencesProvider";

export default function SiteFooter() {
  const t = useT();
  return <footer className="site-footer">
    <div className="site-footer-inner">
      <div className="site-footer-about">
        <p className="site-footer-title"><BrandMark /></p>
        <p>{t("Học từ vựng, luyện đề và chuẩn bị cho kỳ thi tiếng Hoa theo nhịp độ của bạn.")}</p>
        <p className="site-footer-note">{t("Luyện tập đều đặn và theo dõi tiến bộ của bạn qua từng bài học.")}</p>
      </div>
      <div>
        <h2>{t("Khám phá")}</h2>
        <Link href="/">{t("Trang chủ")}</Link>
        <Link href="/vocabulary">{t("Học từ vựng")}</Link>
        <Link href="/tocfl">{t("Luyện đề")}</Link>
      </div>
      <div>
        <h2>{t("Lộ trình học")}</h2>
        <Link href="/vocabulary/topic">{t("Theo chủ đề")}</Link>
        <Link href="/vocabulary/textbook">{t("Theo giáo trình")}</Link>
        <Link href="/vocabulary/band">{t("Theo Band TOCFL")}</Link>
      </div>
      <div>
        <h2>{t("Kỳ thi và hỗ trợ")}</h2>
        <Link href="/exam-guide">{t("Hướng dẫn dự thi")}</Link>
        <Link href="/exam-guide#test-centers">{t("Chọn điểm thi")}</Link>
      </div>
    </div>
    <div className="site-footer-bottom"><span>© {new Date().getFullYear()} {siteConfig.name}</span><span>{t("Học nhẹ nhàng · Tiến bộ mỗi ngày")}</span></div>
  </footer>;
}

import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { BrandMark } from "./SiteBrand";

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="site-footer-inner">
      <div className="site-footer-about">
        <p className="site-footer-title"><BrandMark /></p>
        <p>Học từ vựng, luyện đề và chuẩn bị cho kỳ thi tiếng Hoa theo nhịp độ của bạn.</p>
        <p className="site-footer-note">Luyện tập đều đặn và theo dõi tiến bộ của bạn qua từng bài học.</p>
      </div>
      <div>
        <h2>Khám phá</h2>
        <Link href="/">Trang chủ</Link>
        <Link href="/vocabulary">Học từ vựng</Link>
        <Link href="/tocfl">Luyện đề</Link>
      </div>
      <div>
        <h2>Lộ trình học</h2>
        <Link href="/vocabulary/topic">Theo chủ đề</Link>
        <Link href="/vocabulary/textbook">Theo giáo trình</Link>
        <Link href="/vocabulary/band">Theo Band TOCFL</Link>
      </div>
      <div>
        <h2>Kỳ thi và hỗ trợ</h2>
        <Link href="/exam-guide">Hướng dẫn dự thi</Link>
        <Link href="/exam-guide#test-centers">Chọn điểm thi</Link>
      </div>
    </div>
    <div className="site-footer-bottom"><span>© {new Date().getFullYear()} {siteConfig.name}</span><span>Học nhẹ nhàng · Tiến bộ mỗi ngày</span></div>
  </footer>;
}

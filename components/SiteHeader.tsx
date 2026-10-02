"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteBrand from "./SiteBrand";

const links = [
  { href: "/", label: "Trang chủ" },
  { href: "/vocabulary", label: "Học từ vựng" },
  { href: "/tocfl", label: "Luyện đề" },
  { href: "/exam-guide", label: "Hướng dẫn kỳ thi" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  return <header className="site-header">
    <div className="site-header-inner">
      <SiteBrand />
      <nav className="site-nav" aria-label="Điều hướng chính">
        {links.map((link) => <Link key={link.href} href={link.href} aria-current={link.href === "/" ? pathname === "/" ? "page" : undefined : pathname.startsWith(link.href) ? "page" : undefined} className="site-nav-link">{link.label}</Link>)}
      </nav>
      <details className="site-mobile-menu" key={pathname}>
        <summary aria-label="Mở menu điều hướng">Danh mục <span aria-hidden="true">☰</span></summary>
        <nav aria-label="Điều hướng trên điện thoại">
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={link.href === "/" ? pathname === "/" ? "page" : undefined : pathname.startsWith(link.href) ? "page" : undefined} className="site-nav-link">{link.label}</Link>)}
        </nav>
      </details>
    </div>
  </header>;
}

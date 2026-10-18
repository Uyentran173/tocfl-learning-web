"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteBrand from "./SiteBrand";
import { useAuth } from "./AuthProvider";
import { useT } from "./PreferencesProvider";
import PreferenceControls from "./PreferenceControls";

const links = [
  { href: "/", label: "Trang chủ" },
  { href: "/vocabulary", label: "Học từ vựng" },
  { href: "/tocfl", label: "Luyện đề" },
  { href: "/exam-guide", label: "Hướng dẫn kỳ thi" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useT();
  return <header className="site-header">
    <div className="site-header-inner">
      <SiteBrand />
      <nav className="site-nav" aria-label={t("Điều hướng chính")}>
        {links.map((link) => <Link key={link.href} href={link.href} aria-current={link.href === "/" ? pathname === "/" ? "page" : undefined : pathname.startsWith(link.href) ? "page" : undefined} className="site-nav-link">{t(link.label)}</Link>)}
      </nav>
      <div className="site-header-actions"><PreferenceControls /><Link href={user ? "/account" : "/login"} aria-current={pathname.startsWith("/account") || pathname === "/login" ? "page" : undefined} className="site-account-link">{t(user ? "Hồ sơ" : "Đăng nhập")}</Link></div>
      <details className="site-mobile-menu" key={pathname}>
        <summary aria-label={t("Mở menu điều hướng")}>{t("Danh mục")} <span aria-hidden="true">☰</span></summary>
        <nav aria-label={t("Điều hướng trên điện thoại")}>
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={link.href === "/" ? pathname === "/" ? "page" : undefined : pathname.startsWith(link.href) ? "page" : undefined} className="site-nav-link">{t(link.label)}</Link>)}
          <Link href={user ? "/account" : "/login"} className="site-nav-link">{t(user ? "Hồ sơ" : "Đăng nhập")}</Link>
          <PreferenceControls compact />
        </nav>
      </details>
    </div>
  </header>;
}

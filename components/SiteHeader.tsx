"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SiteBrand from "./SiteBrand";
import { useAuth } from "./AuthProvider";
import { useT } from "./PreferencesProvider";
import PreferenceControls from "./PreferenceControls";
import { exploreContent, exploreRoutes } from "@/lib/explore-content";
import { usePreferences } from "./PreferencesProvider";

const links = [
  { href: "/", label: "Trang chủ" },
  { href: "/vocabulary", label: "Học từ vựng" },
  { href: "/academy", label: "Academy" },
  { href: "/tocfl", label: "Luyện đề" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useT();
  const { locale } = usePreferences();
  const explore = exploreContent[locale].nav;
  return <header className="site-header">
    <div className="site-header-inner">
      <SiteBrand />
      <nav className="site-nav" aria-label={t("Điều hướng chính")}>
        {links.map((link) => <Link key={link.href} href={link.href} aria-current={link.href === "/" ? pathname === "/" ? "page" : undefined : pathname.startsWith(link.href) ? "page" : undefined} className="site-nav-link">{t(link.label)}</Link>)}
        <details className="site-explore-menu" key={pathname}><summary className="site-nav-link" aria-current={pathname.startsWith("/explore") || pathname === "/exam-guide" ? "page" : undefined}>{explore.explore} <span aria-hidden="true">⌄</span></summary><div className="site-explore-panel"><Link href="/explore">{explore.explore}</Link>{exploreRoutes.map((route) => <Link key={route.id} href={route.href}>{explore[route.id]}</Link>)}<Link href="/exam-guide">{explore.exam}</Link></div></details>
      </nav>
      <div className="site-header-actions"><PreferenceControls /><Link href={user ? "/account" : "/login"} aria-current={pathname.startsWith("/account") || pathname === "/login" ? "page" : undefined} className="site-account-link">{t(user ? "Hồ sơ" : "Đăng nhập")}</Link></div>
      <details className="site-mobile-menu" key={pathname}>
        <summary aria-label={t("Mở menu điều hướng")}>{t("Danh mục")} <span aria-hidden="true">☰</span></summary>
        <nav aria-label={t("Điều hướng trên điện thoại")}>
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={link.href === "/" ? pathname === "/" ? "page" : undefined : pathname.startsWith(link.href) ? "page" : undefined} className="site-nav-link">{t(link.label)}</Link>)}
          <Link href="/explore" className="site-nav-link">{explore.explore}</Link>
          {exploreRoutes.map((route) => <Link href={route.href} key={route.id} className="site-nav-link site-mobile-sub-link">{explore[route.id]}</Link>)}
          <Link href="/exam-guide" className="site-nav-link">{explore.exam}</Link>
          <Link href={user ? "/account" : "/login"} className="site-nav-link">{t(user ? "Hồ sơ" : "Đăng nhập")}</Link>
          <PreferenceControls compact />
        </nav>
      </details>
    </div>
  </header>;
}

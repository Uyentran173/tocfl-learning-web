import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CopyDeterrence from "@/components/CopyDeterrence";
import { siteConfig } from "@/lib/site";
export const metadata: Metadata = { title: siteConfig.name, description: siteConfig.description };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="vi"><body><CopyDeterrence /><SiteHeader /><div className="site-content">{children}</div><SiteFooter /></body></html>; }

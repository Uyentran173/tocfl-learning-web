import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CopyDeterrence from "@/components/CopyDeterrence";
import { siteConfig } from "@/lib/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tocfl-learning-web.vercel.app/";
const siteTitle = `${siteConfig.name} | Học tiếng Hoa Đài Loan & TOCFL`;

export const metadata: Metadata = {
  title: siteTitle,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  metadataBase: new URL(siteUrl),
  keywords: [
    siteConfig.name,
    ...siteConfig.aliases,
    "học tiếng Hoa Đài Loan",
    "học tiếng Trung phồn thể",
    "luyện thi TOCFL",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: siteConfig.name,
    title: siteTitle,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: siteConfig.aliases,
    url: siteUrl,
    inLanguage: "vi",
    description: siteConfig.description,
  };

  return (
    <html lang="vi">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <CopyDeterrence />
        <SiteHeader />
        <div className="site-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

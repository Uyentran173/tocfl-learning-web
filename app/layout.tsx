import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CopyDeterrence from "@/components/CopyDeterrence";
import AuthProvider from "@/components/AuthProvider";
import { siteConfig } from "@/lib/site";

const socialImage = new URL(siteConfig.logo, siteConfig.url).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    siteConfig.name,
    ...siteConfig.searchAliases,
    "học tiếng Hoa Đài Loan",
    "học tiếng Trung phồn thể",
    "luyện thi TOCFL",
    "từ vựng TOCFL",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    images: [{ url: socialImage, width: 1254, height: 1254, alt: `Biểu tượng ${siteConfig.name}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [socialImage],
  },
  icons: { icon: siteConfig.logo, apple: siteConfig.logo },
  manifest: "/manifest.webmanifest",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  alternateName: siteConfig.searchAliases,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: "vi-VN",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }}
        />
        <AuthProvider>
          <CopyDeterrence />
          <SiteHeader />
          <div className="site-content">{children}</div>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}

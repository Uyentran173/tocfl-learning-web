import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CopyDeterrence from "@/components/CopyDeterrence";
import AuthProvider from "@/components/AuthProvider";
import { siteConfig } from "@/lib/site";
import { cookies } from "next/headers";
import { isUiLocale, type ThemePreference } from "@/lib/i18n";
import PreferencesProvider from "@/components/PreferencesProvider";

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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const preferences = await cookies();
  const storedLocale = preferences.get("taiwen-ui-locale")?.value;
  const locale = isUiLocale(storedLocale) ? storedLocale : "vi";
  const storedTheme = preferences.get("taiwen-theme")?.value;
  const theme: ThemePreference = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "system";
  return (
    <html lang={locale} data-theme={theme === "dark" ? "dark" : "light"} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: "try{var c=document.cookie.match(/(?:^|; )taiwen-theme=([^;]+)/),v=c?decodeURIComponent(c[1]):'system';document.documentElement.dataset.theme=v==='system'&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':v==='dark'?'dark':'light'}catch(e){}" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }}
        />
        <PreferencesProvider initialLocale={locale} initialTheme={theme}>
          <AuthProvider>
            <CopyDeterrence />
            <SiteHeader />
            <div className="site-content">{children}</div>
            <SiteFooter />
          </AuthProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}

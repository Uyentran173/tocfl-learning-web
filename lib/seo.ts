import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

const socialImage = new URL(siteConfig.logo, siteConfig.url).toString();

export function createPageMetadata(
  title: string,
  description: string,
  path: string,
  { noIndex = false }: { noIndex?: boolean } = {},
): Metadata {
  const socialTitle = `${title} | ${siteConfig.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      url: path,
      images: [{ url: socialImage, width: 1254, height: 1254, alt: `Biểu tượng ${siteConfig.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

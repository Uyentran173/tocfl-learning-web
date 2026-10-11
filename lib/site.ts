const defaultSiteUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://taiwen.vn";

function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return defaultSiteUrl;

  try {
    const url = new URL(configured);
    if (url.protocol === "https:" || (process.env.NODE_ENV === "development" && url.protocol === "http:")) {
      return url.origin;
    }
  } catch {
    // An invalid environment value should not break the site build.
  }
  return defaultSiteUrl;
}

const searchAliases = ["taiwen", "tai wen"] as const;

export const siteConfig = {
  name: "Tai Wén",
  shortName: "Tai Wén",
  searchName: "Taiwen",
  searchAliases,
  aliases: searchAliases,
  title: "Tai Wén | Học tiếng Hoa Đài Loan & luyện thi TOCFL",
  description: "Tai Wén – Học tiếng Hoa Đài Loan & luyện thi TOCFL",
  url: resolveSiteUrl(),
  logo: "/stickers/formosan-taipei.png",
} as const;

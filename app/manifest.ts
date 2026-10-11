import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "vi",
    background_color: "#ffffff",
    theme_color: "#011F82",
    icons: [{ src: siteConfig.logo, sizes: "1254x1254", type: "image/png", purpose: "any" }],
  };
}

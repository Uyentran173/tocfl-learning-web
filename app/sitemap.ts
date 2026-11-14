import type { MetadataRoute } from "next";
import { getImportedTests } from "@/lib/test-catalog";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/academy", "/academy/contemporary-chinese/cc1-v1", "/academy/contemporary-chinese/cc2-v2", "/vocabulary", "/vocabulary/topic", "/vocabulary/textbook", "/vocabulary/band", "/vocabulary/practice", "/tocfl", "/exam-guide", "/explore", "/explore/about", "/explore/features", "/explore/faq", "/explore/contact"];
  const testPaths = getImportedTests().filter((test) => test.test).map((test) => `/tocfl/${test.id}/instructions`);
  return [...paths, ...testPaths].map((path) => ({ url: new URL(path, siteConfig.url).toString() }));
}

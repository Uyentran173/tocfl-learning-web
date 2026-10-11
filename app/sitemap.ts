import type { MetadataRoute } from "next";
import { getImportedTests } from "@/lib/test-catalog";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/vocabulary", "/vocabulary/topic", "/vocabulary/textbook", "/vocabulary/band", "/vocabulary/practice", "/tocfl", "/exam-guide"];
  const testPaths = getImportedTests().filter((test) => test.test).map((test) => `/tocfl/${test.id}/instructions`);
  return [...paths, ...testPaths].map((path) => ({ url: new URL(path, siteConfig.url).toString() }));
}

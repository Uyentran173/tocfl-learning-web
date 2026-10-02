import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <span className="site-brand-lockup">
    <span className="site-brand-logo" aria-hidden="true"><Image src={siteConfig.logo} alt="" width={48} height={48} unoptimized /></span>
    {!compact && <span className="site-brand-name">{siteConfig.name}</span>}
  </span>;
}

export default function SiteBrand() {
  return <Link href="/" className="site-brand" aria-label={`${siteConfig.name} – Về trang chủ`}>
    <BrandMark />
  </Link>;
}

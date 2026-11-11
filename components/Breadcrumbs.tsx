"use client";

import Link from "next/link";
import { useT } from "./PreferencesProvider";

type Crumb = { label: string; href?: string; translate?: boolean };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useT();
  return <nav className="academy-crumbs" aria-label={t("Đường dẫn học tập")}>
    {items.map((item, index) => <span className="breadcrumb-item" key={`${item.href ?? item.label}:${index}`}>
      {index > 0 && <span className="breadcrumb-separator" aria-hidden="true">›</span>}
      {item.href ? <Link href={item.href}>{item.translate === false ? item.label : t(item.label)}</Link> : <span aria-current="page">{item.translate === false ? item.label : t(item.label)}</span>}
    </span>)}
  </nav>;
}

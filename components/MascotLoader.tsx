"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useT } from "./PreferencesProvider";

export type MascotLoaderVariant = "books" | "reading" | "laptop" | "taipei";

const variants: MascotLoaderVariant[] = ["books", "reading", "laptop", "taipei"];

type Props = {
  variant?: MascotLoaderVariant;
  message?: string;
  compact?: boolean;
  delayMs?: number;
};

export default function MascotLoader({ variant, message = "Đang mở Tai Wén…", compact = false, delayMs = 250 }: Props) {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [randomVariant, setRandomVariant] = useState<MascotLoaderVariant | null>(null);

  useEffect(() => {
    const pickVariant = !variant ? window.setTimeout(() => setRandomVariant(variants[Math.floor(Math.random() * variants.length)]), 0) : undefined;
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => {
      if (pickVariant !== undefined) window.clearTimeout(pickVariant);
      window.clearTimeout(timer);
    };
  }, [variant, delayMs]);

  const selected = variant ?? randomVariant;
  return <div className={`mascot-loader ${compact ? "mascot-loader-compact" : ""}`} role="status" aria-live="polite" aria-label={t(message)}>
    <picture className={`mascot-loader-art ${visible && selected ? "is-visible" : ""}`}>
      {selected && <><source media="(prefers-reduced-motion: reduce)" srcSet={`/mascot-loaders/${selected}-still.webp`} /><Image src={`/mascot-loaders/${selected}.gif`} alt="" width={418} height={627} unoptimized /></>}
    </picture>
    <span className={compact ? "mascot-loader-message" : "sr-only"}>{t(message)}</span>
  </div>;
}

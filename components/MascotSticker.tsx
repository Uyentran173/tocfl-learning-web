import Image from "next/image";

type StickerVariant = "tower" | "faint" | "puzzled" | "study" | "traveler" | "boba" | "graduate";

// View boxes crop the original transparent sticker sheet at display time.
// The source PNGs are copied unchanged; no sticker details are redrawn.
const frames: Record<Exclude<StickerVariant, "tower">, [number, number, number, number]> = {
  faint: [898, 320, 344, 230],
  puzzled: [375, 310, 280, 245],
  study: [994, 565, 257, 205],
  traveler: [643, 318, 262, 230],
  boba: [1254, 565, 282, 215],
  graduate: [1260, 765, 276, 246],
};

export default function MascotSticker({ variant, alt, className = "", decorative = false }: { variant: StickerVariant; alt?: string; className?: string; decorative?: boolean }) {
  const label = alt ?? "Gấu đen Formosan";
  if (variant === "tower") return <Image src="/stickers/formosan-taipei.png" alt={decorative ? "" : label} aria-hidden={decorative || undefined} width={1254} height={1254} unoptimized className={`mascot-sticker ${className}`} />;
  const [x, y, width, height] = frames[variant];
  return <svg viewBox={`${x} ${y} ${width} ${height}`} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : label} aria-hidden={decorative || undefined} className={`mascot-sticker ${className}`} xmlns="http://www.w3.org/2000/svg">
    <image href="/stickers/formosan-sheet.png" x="0" y="0" width="1536" height="1024" />
  </svg>;
}

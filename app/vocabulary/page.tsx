import Link from "next/link";
import MascotSticker from "@/components/MascotSticker";

const paths = [
  { href: "/vocabulary/topic", icon: "✦", eyebrow: "CHẾ ĐỘ 01", title: "Học theo ngữ cảnh & chủ đề tùy chọn", description: "Chọn chủ đề hoặc tình huống gần bạn: du lịch, đại học, công việc, đời sống, ăn uống hay mua sắm.", action: "Chọn ngữ cảnh" },
  { href: "/vocabulary/textbook", icon: "冊", eyebrow: "CHẾ ĐỘ 02", title: "Học theo giáo trình", description: "Học theo giáo trình, chương và từng bài. Đánh dấu từ đã thuộc để tiếp tục từ đúng chỗ.", action: "Xem giáo trình" },
  { href: "/vocabulary/band", icon: "級", eyebrow: "CHẾ ĐỘ 03 · TOCFL", title: "Học theo Band TOCFL", description: "Chọn cấp độ từ Band Novice đến Band C, học bộ từ có sẵn và theo dõi tiến độ riêng cho từng cấp.", action: "Khám phá các Band" },
];

export default function VocabularyPage() {
  return <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
    <div className="flex items-end justify-between gap-4"><div className="max-w-3xl">
      <p className="page-eyebrow">HỌC TỪ VỰNG</p>
      <h1 className="page-title">Học vài từ mới mỗi ngày, tự tin hơn khi sử dụng tiếng Hoa.</h1>
      <p className="page-lead">Chọn một trong ba cách học phù hợp với mục tiêu của bạn. Tiến độ từ vựng được lưu trên thiết bị này.</p>
    </div><MascotSticker variant="boba" decorative className="vocabulary-header-sticker mascot-float" /></div>
    <div className="mt-10 grid gap-5 lg:grid-cols-3">
      {paths.map((path) => <article key={path.href} className="paper vocabulary-path-card flex flex-col p-7 sm:p-8">
        <span className="feature-icon" aria-hidden="true">{path.icon}</span>
        <p className="mt-7 text-xs font-bold tracking-[.17em] text-[var(--brand)]">{path.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold">{path.title}</h2>
        <p className="mt-3 flex-1 leading-7 muted">{path.description}</p>
        <Link href={path.href} className="button-primary mt-7 inline-flex w-fit items-center gap-2">{path.action} <span aria-hidden="true">→</span></Link>
      </article>)}
    </div>
    <div className="vocabulary-tip mt-8 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)] px-6 py-5 text-sm leading-7 text-[var(--brand)]"><MascotSticker variant="study" decorative className="vocabulary-tip-sticker" /><p><strong>Mẹo học nhỏ:</strong> Mỗi ngày học vài từ, sau đó thử một đề để nhận ra chúng trong ngữ cảnh mới.</p></div>
  </main>;
}

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { siteConfig } from "@/lib/site";
import { TaiwanLandscape } from "@/components/Illustrations";
import MascotSticker from "@/components/MascotSticker";
import { useT } from "@/components/PreferencesProvider";

const features = [
  { icon: "字", title: "Học từ vựng", description: "Ghi nhớ từ mới bằng thẻ học ngắn, ví dụ gần gũi và tiến độ rõ ràng.", href: "/vocabulary" },
  { icon: "✎", title: "Luyện đề", description: "Làm đề, xem lại đáp án và theo dõi kết quả theo nhịp học của bạn.", href: "/tocfl" },
  { icon: "⌁", title: "Hướng dẫn kỳ thi", description: "Tìm hiểu cách đăng ký, chuẩn bị giấy tờ và chọn điểm thi phù hợp.", href: "/exam-guide" },
];

export default function Home() {
  const t = useT();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const sections = document.querySelectorAll<HTMLElement>(".home-section, .home-bottom-cta");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.visible = "true";
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -30px 0px", threshold: 0.08 });
    sections.forEach((section) => observer.observe(section));
    document.documentElement.classList.add("home-motion-ready");
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("home-motion-ready");
    };
  }, []);
  return <main className="home-page">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-copy">
        <p className="home-kicker"><span aria-hidden="true">✦</span> {t("Học tiếng Hoa theo cách của bạn")}</p>
        <h1 id="home-title">{t("Mỗi ngày một chút,")}<br/><span>{t("tiếng Hoa gần hơn.")}</span></h1>
        <p className="home-hero-lead">{siteConfig.name} {t("giúp bạn học từ vựng, luyện nghe và đọc, rồi chuẩn bị cho kỳ thi trong một không gian rõ ràng, dễ theo dõi.")}</p>
        <div className="home-actions">
          <Link href="/vocabulary" className="button-primary">{t("Bắt đầu học")} <span aria-hidden="true">→</span></Link>
          <Link href="/tocfl" className="button-secondary">{t("Luyện đề")} <span aria-hidden="true">↗</span></Link>
        </div>
        <p className="home-hero-note">{t("Học từng bước nhỏ · Luyện tập theo nhịp riêng")}</p>
      </div>
      <div className="home-hero-art" aria-label={t("Minh họa thẻ học tiếng Hoa")}>
        <TaiwanLandscape className="home-landscape" />
        <span className="home-sparkle home-sparkle-one" aria-hidden="true">✦</span>
        <span className="home-sparkle home-sparkle-two" aria-hidden="true">✧</span>
        <div className="home-word-card">
          <div className="home-word-card-top"><span>{t("THẺ TỪ HÔM NAY")}</span><span aria-hidden="true">✿</span></div>
          <span className="home-word" lang="zh-Hant">加油</span>
          <span className="home-word-pronunciation">jiā yóu</span>
          <span className="home-word-meaning">{t("Cố lên nhé!")}</span>
          <span className="home-word-rule" aria-hidden="true" />
          <span className="home-word-example" lang="zh-Hant">一起慢慢進步。</span>
          <span className="home-word-translation">{t("Cùng nhau tiến bộ từng chút một.")}</span>
        </div>
        <MascotSticker variant="tower" decorative className="home-hero-sticker mascot-float" />
        <span className="home-small-note">{t("Một từ mới cũng là một bước tiến ✨")}</span>
      </div>
    </section>

    <section className="home-section" aria-labelledby="home-features-title">
      <div className="home-section-heading"><p className="page-eyebrow">{t("ĐỒNG HÀNH CÙNG BẠN")}</p><h2 id="home-features-title">{t("Học từng bước, ôn tập vững vàng.")}</h2><p>{t("Từ vài từ mới mỗi ngày đến những buổi luyện đề tập trung.")}</p></div>
      <div className="home-feature-grid">
        {features.map((feature) => <Link href={feature.href} key={feature.title} className="home-feature paper">
          <span className="feature-icon" aria-hidden="true">{feature.icon}</span>
          <h3>{t(feature.title)}</h3><p>{t(feature.description)}</p><span className="home-card-link">{t("Khám phá")} <span aria-hidden="true">→</span></span>
        </Link>)}
      </div>
    </section>

    <section className="home-section home-product-scene" aria-labelledby="home-product-title">
      <div className="home-scene-copy"><p className="page-eyebrow">{t("HỌC THỬ MỘT CHÚT")}</p><h2 id="home-product-title">{t("Một từ mới. Một bước tiến thật.")}</h2><p>{t("Lật thẻ để xem nghĩa, đọc ví dụ và lưu từ cần ôn. Mỗi buổi học ngắn đều đưa bạn gần hơn tới mục tiêu của mình.")}</p><Link href="/vocabulary/band" className="button-quiet">{t("Xem thẻ từ vựng")} →</Link></div>
      <div className="home-preview" aria-label={t("Xem trước thẻ học từ vựng")}><div className="home-preview-top"><span>{t("HỌC TỪ VỰNG · BAND A")}</span><span className="home-preview-dots" aria-hidden="true"><i/><i/><i/></span></div><div className="home-preview-main"><div className="home-preview-word"><small>{t("TỪ HÔM NAY")}</small><strong lang="zh-Hant">旅行</strong><span>lǚ xíng</span></div><div className="home-preview-answer"><small>{t("Chọn nghĩa phù hợp")}</small><span>{t("Du lịch")}</span><span>{t("Làm việc")}</span><span>{t("Mua sắm")}</span></div></div><div className="home-preview-progress"><span/></div></div>
    </section>

    <section className="home-section home-paths" aria-labelledby="home-paths-title">
      <div className="home-section-heading"><p className="page-eyebrow">{t("LỘ TRÌNH CỦA BẠN")}</p><h2 id="home-paths-title">{t("Chọn cách học phù hợp với bạn.")}</h2><p>{t("Học theo ngữ cảnh, giáo trình hoặc cấp độ TOCFL.")}</p></div>
      <div className="home-path-grid">
        <Link href="/vocabulary/topic" className="home-path-card home-path-topic"><span className="home-path-number">01 · {t("HỌC THEO NGỮ CẢNH")}</span><MascotSticker variant="traveler" decorative className="home-path-art-sticker" /><h3>{t("Học theo chủ đề và ngữ cảnh bạn chọn")}</h3><p>{t("Chọn tình huống gần gũi để học những từ có thể dùng ngay.")}</p><span className="home-path-action">{t("Khám phá chủ đề")} →</span></Link>
        <Link href="/vocabulary/textbook" className="home-path-card home-path-book"><span className="home-path-number">02 · {t("HỌC THEO BÀI")}</span><MascotSticker variant="study" decorative className="home-path-art-sticker" /><h3>{t("Học theo giáo trình")}</h3><p>{t("Học tuần tự từ nền tảng, đánh dấu từ đã thuộc và quay lại ôn dễ dàng.")}</p><span className="home-path-action">{t("Xem bài học")} →</span></Link>
        <Link href="/vocabulary/band" className="home-path-card home-path-band"><span className="home-path-number">03 · {t("HỌC THEO BAND")}</span><MascotSticker variant="graduate" decorative className="home-path-art-sticker" /><h3>{t("Học theo Band TOCFL")}</h3><p>{t("Chọn cấp độ và theo dõi tiến độ học từ vựng của riêng bạn.")}</p><span className="home-path-action">{t("Khám phá các Band")} →</span></Link>
      </div>
    </section>

    <section className="home-section home-product-scene home-exam-scene" aria-labelledby="home-exam-title">
      <div className="home-scene-copy"><p className="page-eyebrow">{t("LUYỆN ĐỀ TOCFL")}</p><h2 id="home-exam-title">{t("Luyện đúng cách, tự tin vào phòng thi.")}</h2><p>{t("Chọn Band, làm phần Nghe hoặc Đọc, rồi xem lại từng đáp án. Chế độ Luyện tập và Mô phỏng cùng nằm trong một đề.")}</p><Link href="/tocfl" className="button-quiet">{t("Đến thư viện đề")} →</Link></div>
      <div className="home-preview home-exam-preview" aria-label={t("Xem trước trải nghiệm luyện đề")}><div className="home-preview-top"><span>TOCFL · BAND NOVICE</span><span>01 / 50</span></div><div className="home-preview-main"><h3>{t("Luyện Đọc theo nhịp của bạn")}</h3><p>{t("Câu trả lời được lưu tự động trong khi làm bài.")}</p><div className="home-preview-answer"><span>A · <span lang="zh-Hant">學校</span></span><span>B · <span lang="zh-Hant">書店</span></span><span>C · <span lang="zh-Hant">醫院</span></span><span>D · <span lang="zh-Hant">餐廳</span></span></div></div></div>
    </section>

    <section className="home-section home-story" aria-labelledby="home-about-title">
      <div className="home-about-copy"><p className="page-eyebrow">{t("VỀ NỀN TẢNG")}</p><h2 id="home-about-title">{t("Một nơi để học, luyện tập và chuẩn bị cho kỳ thi.")}</h2><p>{t("Nền tảng tập hợp bài học từ vựng, đề luyện tập và hướng dẫn dự thi để bạn dễ theo dõi tiến độ. Bạn có thể bắt đầu với vài từ mới hôm nay, rồi luyện đề khi đã sẵn sàng.")}</p><Link href="/exam-guide" className="button-quiet">{t("Tìm hiểu về kỳ thi")} →</Link></div>
      <div className="home-developer paper"><div className="home-avatar" aria-label={t("Ảnh đại diện mẫu")}>{t("Ảnh")}</div><div><p className="page-eyebrow">{t("VỀ NGƯỜI PHÁT TRIỂN")}</p><h3>{t("Chào bạn, mình là Uyên Trần")}</h3><p>{t("Mình là")} <strong>Uyên Trần</strong>, {t("hiện đang tự học tiếng Trung phồn thể tại Việt Nam và hướng tới việc du học Đài Loan. Trong quá trình học, mình nhận ra tài liệu dành cho người Việt, đặc biệt là tài liệu luyện TOCFL, thường nằm rải rác ở nhiều nơi.")}</p><p>{t("Vì vậy, mình xây dựng")} <strong>{siteConfig.name}</strong> {t("như một nơi để học, luyện tập và chuẩn bị cho TOCFL theo cách gọn gàng và dễ dùng hơn. Mình vẫn đang trên hành trình học tiếng Trung, và website này cũng sẽ tiếp tục được hoàn thiện cùng hành trình đó.")}</p></div></div>
    </section>

    <section className="home-bottom-cta" aria-labelledby="home-cta-title"><span aria-hidden="true">✦</span><h2 id="home-cta-title">{t("Bắt đầu với một bước nhỏ hôm nay.")}</h2><p>{t("Chọn một bài học từ vựng hoặc thử làm đề đầu tiên của bạn.")}</p><div className="home-actions"><Link href="/vocabulary" className="button-primary">{t("Bắt đầu học")} →</Link><Link href="/tocfl" className="button-secondary">{t("Đến thư viện đề")} →</Link></div></section>
  </main>;
}

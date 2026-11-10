"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { academyLessonProgressKey, emptyAcademyLessonProgress, parseAcademyLessonProgress } from "@/lib/academy-progress";
import { progressStorage } from "@/lib/progress-storage";
import { siteConfig } from "@/lib/site";
import MascotSticker from "@/components/MascotSticker";
import HomeLearningWorld from "@/components/HomeLearningWorld";
import profilePhotoStyles from "./profile-photo.module.css";
import { useT } from "@/components/PreferencesProvider";

const features = [
  { icon: "字", title: "Học từ vựng", description: "Ghi nhớ từ mới bằng thẻ học ngắn, ví dụ gần gũi và tiến độ rõ ràng.", href: "/vocabulary", theme: "words" },
  { icon: "題", title: "Luyện đề TOCFL", description: "Làm đề, xem lại đáp án và theo dõi kết quả theo nhịp học của bạn.", href: "/tocfl", theme: "exam" },
  { icon: "台", title: "Hướng dẫn kỳ thi", description: "Tìm hiểu cách đăng ký, chuẩn bị giấy tờ và chọn điểm thi phù hợp.", href: "/exam-guide", theme: "guide" },
];

export default function Home() {
  const t = useT();
  const [academyResume, setAcademyResume] = useState<string | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = parseAcademyLessonProgress(progressStorage().getItem(academyLessonProgressKey));
      if (saved.completedActivityIds.length || Object.keys(saved.answers).length || saved.currentActivityId !== emptyAcademyLessonProgress.currentActivityId) {
        setAcademyResume(`/academy/cc1/lesson/01?activity=${encodeURIComponent(saved.currentActivityId)}`);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
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
    <section className="home-hero home-hero-world" aria-labelledby="home-title">
      <div className="home-hero-copy">
        <p className="home-kicker"><span aria-hidden="true">✦</span> TAI WÉN ACADEMY</p>
        <h1 id="home-title">{t("Học tiếng Hoa,")} <span>{t("mở ra thế giới mới.")}</span></h1>
        <p className="home-hero-lead">{t("Học theo lộ trình, luyện tập thông minh và tự tin chinh phục TOCFL cùng Tai Wén.")}</p>
        <Link href="/academy" className="button-primary home-hero-cta">{t("Khám phá Tai Wén Academy")} <span aria-hidden="true">↗</span></Link>
        {academyResume && <Link href={academyResume} className="home-hero-resume">{t("Tiếp tục học")} <span aria-hidden="true">→</span></Link>}
      </div>
      <HomeLearningWorld />
    </section>

    <section className="home-section home-discover" aria-labelledby="home-features-title">
      <div className="home-section-heading"><p className="page-eyebrow">{t("CÒN NHIỀU ĐIỀU ĐỂ KHÁM PHÁ")}</p><h2 id="home-features-title">{t("Học theo cách của bạn, tiến xa hơn mỗi ngày.")}</h2><p>{t("Bên cạnh Academy, bạn có thể học từ vựng, luyện đề hoặc chuẩn bị cho kỳ thi TOCFL.")}</p></div>
      <div className="home-feature-grid">
        {features.map((feature, index) => <Link href={feature.href} key={feature.title} className={`home-feature home-feature-${feature.theme}`}>
          <span className="home-feature-top"><span className="home-feature-number">0{index + 1} / 03</span><span className="home-feature-arrow" aria-hidden="true">↗</span></span>
          <span className="home-feature-illustration" aria-hidden="true"><span>{feature.icon}</span><i/><i/></span>
          <span className="home-feature-content"><h3>{t(feature.title)}</h3><p>{t(feature.description)}</p></span>
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
      <div className="home-developer paper"><div className={profilePhotoStyles.portrait}><Image src="/images/uyen-tran-profile.png" alt="Uyên Trần" width={1254} height={1254} sizes="(max-width: 600px) 300px, 340px" quality={90} className={profilePhotoStyles.photo} /></div><div><p className="page-eyebrow">{t("VỀ NGƯỜI PHÁT TRIỂN")}</p><h3>{t("Chào bạn, mình là Uyên Trần")}</h3><p>{t("Mình là")} <strong>Uyên Trần</strong>, {t("hiện đang tự học tiếng Trung phồn thể tại Việt Nam và hướng tới việc du học Đài Loan. Trong quá trình học, mình nhận ra tài liệu dành cho người Việt, đặc biệt là tài liệu luyện TOCFL, thường nằm rải rác ở nhiều nơi.")}</p><p>{t("Vì vậy, mình xây dựng")} <strong>{siteConfig.name}</strong> {t("như một nơi để học, luyện tập và chuẩn bị cho TOCFL theo cách gọn gàng và dễ dùng hơn. Mình vẫn đang trên hành trình học tiếng Trung, và website này cũng sẽ tiếp tục được hoàn thiện cùng hành trình đó.")}</p></div></div>
    </section>

    <section className="home-bottom-cta" aria-labelledby="home-cta-title"><span aria-hidden="true">✦</span><h2 id="home-cta-title">{t("Bắt đầu với một bước nhỏ hôm nay.")}</h2><p>{t("Chọn một bài học từ vựng hoặc thử làm đề đầu tiên của bạn.")}</p><div className="home-actions"><Link href="/vocabulary" className="button-primary">{t("Bắt đầu học")} →</Link><Link href="/tocfl" className="button-secondary">{t("Đến thư viện đề")} →</Link></div></section>
  </main>;
}

import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { TaiwanLandscape } from "@/components/Illustrations";
import MascotSticker from "@/components/MascotSticker";

const features = [
  { icon: "字", title: "Học từ vựng", description: "Ghi nhớ từ mới bằng thẻ học ngắn, ví dụ gần gũi và tiến độ rõ ràng.", href: "/vocabulary" },
  { icon: "✎", title: "Luyện đề", description: "Làm đề, xem lại đáp án và theo dõi kết quả theo nhịp học của bạn.", href: "/tocfl" },
  { icon: "⌁", title: "Hướng dẫn kỳ thi", description: "Tìm hiểu cách đăng ký, chuẩn bị giấy tờ và chọn điểm thi phù hợp.", href: "/exam-guide" },
];

export default function Home() {
  return <main className="home-page">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero-copy">
        <p className="home-kicker"><span aria-hidden="true">✦</span> Học tiếng Hoa theo cách của bạn</p>
        <h1 id="home-title">Mỗi ngày một chút,<br/><span>tiếng Hoa gần hơn.</span></h1>
        <p className="home-hero-lead">{siteConfig.name} giúp bạn học từ vựng, luyện nghe và đọc, rồi chuẩn bị cho kỳ thi trong một không gian rõ ràng, dễ theo dõi.</p>
        <div className="home-actions">
          <Link href="/vocabulary" className="button-primary">Bắt đầu học <span aria-hidden="true">→</span></Link>
          <Link href="/tocfl" className="button-secondary">Luyện đề <span aria-hidden="true">↗</span></Link>
        </div>
        <p className="home-hero-note">Học từng bước nhỏ · Luyện tập theo nhịp riêng</p>
      </div>
      <div className="home-hero-art" aria-label="Minh họa thẻ học tiếng Hoa">
        <TaiwanLandscape className="home-landscape" />
        <span className="home-sparkle home-sparkle-one" aria-hidden="true">✦</span>
        <span className="home-sparkle home-sparkle-two" aria-hidden="true">✧</span>
        <div className="home-word-card">
          <div className="home-word-card-top"><span>THẺ TỪ HÔM NAY</span><span aria-hidden="true">✿</span></div>
          <span className="home-word" lang="zh-Hant">加油</span>
          <span className="home-word-pronunciation">jiā yóu</span>
          <span className="home-word-meaning">Cố lên nhé!</span>
          <span className="home-word-rule" aria-hidden="true" />
          <span className="home-word-example" lang="zh-Hant">一起慢慢進步。</span>
          <span className="home-word-translation">Cùng nhau tiến bộ từng chút một.</span>
        </div>
        <MascotSticker variant="tower" decorative className="home-hero-sticker mascot-float" />
        <span className="home-small-note">Một từ mới cũng là một bước tiến ✨</span>
      </div>
    </section>

    <section className="home-section" aria-labelledby="home-features-title">
      <div className="home-section-heading"><p className="page-eyebrow">ĐỒNG HÀNH CÙNG BẠN</p><h2 id="home-features-title">Học từng bước, ôn tập vững vàng.</h2><p>Từ vài từ mới mỗi ngày đến những buổi luyện đề tập trung.</p></div>
      <div className="home-feature-grid">
        {features.map((feature) => <Link href={feature.href} key={feature.title} className="home-feature paper">
          <span className="feature-icon" aria-hidden="true">{feature.icon}</span>
          <h3>{feature.title}</h3><p>{feature.description}</p><span className="home-card-link">Khám phá <span aria-hidden="true">→</span></span>
        </Link>)}
      </div>
    </section>

    <section className="home-section home-paths" aria-labelledby="home-paths-title">
      <div className="home-section-heading"><p className="page-eyebrow">LỘ TRÌNH CỦA BẠN</p><h2 id="home-paths-title">Chọn cách học phù hợp với bạn.</h2><p>Học theo ngữ cảnh, giáo trình hoặc cấp độ TOCFL.</p></div>
      <div className="home-path-grid">
        <Link href="/vocabulary/topic" className="home-path-card home-path-topic"><span className="home-path-number">01 · HỌC THEO NGỮ CẢNH</span><MascotSticker variant="traveler" decorative className="home-path-art-sticker" /><h3>Học theo chủ đề và ngữ cảnh bạn chọn</h3><p>Chọn tình huống gần gũi để học những từ có thể dùng ngay.</p><span className="home-path-action">Khám phá chủ đề →</span></Link>
        <Link href="/vocabulary/textbook" className="home-path-card home-path-book"><span className="home-path-number">02 · HỌC THEO BÀI</span><MascotSticker variant="study" decorative className="home-path-art-sticker" /><h3>Học theo giáo trình</h3><p>Học tuần tự từ nền tảng, đánh dấu từ đã thuộc và quay lại ôn dễ dàng.</p><span className="home-path-action">Xem bài học →</span></Link>
        <Link href="/vocabulary/band" className="home-path-card home-path-band"><span className="home-path-number">03 · HỌC THEO BAND</span><MascotSticker variant="graduate" decorative className="home-path-art-sticker" /><h3>Học theo Band TOCFL</h3><p>Chọn cấp độ và theo dõi tiến độ học từ vựng của riêng bạn.</p><span className="home-path-action">Khám phá các Band →</span></Link>
      </div>
    </section>

    <section className="home-section home-story" aria-labelledby="home-about-title">
      <div className="home-about-copy"><p className="page-eyebrow">VỀ NỀN TẢNG</p><h2 id="home-about-title">Một nơi để học, luyện tập và chuẩn bị cho kỳ thi.</h2><p>Nền tảng tập hợp bài học từ vựng, đề luyện tập và hướng dẫn dự thi để bạn dễ theo dõi tiến độ. Bạn có thể bắt đầu với vài từ mới hôm nay, rồi luyện đề khi đã sẵn sàng.</p><Link href="/exam-guide" className="button-quiet">Tìm hiểu về kỳ thi →</Link></div>
      <div className="home-developer paper"><div className="home-avatar" aria-label="Ảnh đại diện mẫu">Ảnh</div><div><p className="page-eyebrow">VỀ NGƯỜI PHÁT TRIỂN</p><h3>Chào bạn, mình là Uyên Trần</h3><p>Mình là <strong>Uyên Trần</strong>, hiện đang tự học tiếng Trung phồn thể tại Việt Nam và hướng tới việc du học Đài Loan. Trong quá trình học, mình nhận ra tài liệu dành cho người Việt, đặc biệt là tài liệu luyện TOCFL, thường nằm rải rác ở nhiều nơi.</p><p>Vì vậy, mình xây dựng <strong>{siteConfig.name === "Tên website" ? `[${siteConfig.name}]` : siteConfig.name}</strong> như một nơi để học, luyện tập và chuẩn bị cho TOCFL theo cách gọn gàng và dễ dùng hơn. Mình vẫn đang trên hành trình học tiếng Trung, và website này cũng sẽ tiếp tục được hoàn thiện cùng hành trình đó.</p></div></div>
    </section>

    <section className="home-bottom-cta" aria-labelledby="home-cta-title"><span aria-hidden="true">✦</span><h2 id="home-cta-title">Bắt đầu với một bước nhỏ hôm nay.</h2><p>Chọn một bài học từ vựng hoặc thử làm đề đầu tiên của bạn.</p><div className="home-actions"><Link href="/vocabulary" className="button-primary">Bắt đầu học →</Link><Link href="/tocfl" className="button-secondary">Đến thư viện đề →</Link></div></section>
  </main>;
}

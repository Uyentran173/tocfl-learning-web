import CenterChooser from "@/components/CenterChooser";
import { TaiwanLandscape } from "@/components/Illustrations";
import MascotSticker from "@/components/MascotSticker";

const registrationSteps = [
  { number: "01", title: "Chọn kỳ thi phù hợp", description: "Tra cứu lịch thi chính thức, chọn địa điểm và buổi thi. Kiểm tra hình thức thi, hạn đăng ký và đơn vị tổ chức trước khi đăng ký." },
  { number: "02", title: "Hoàn tất đăng ký", description: "Nếu thi tại Đài Loan, đăng nhập hệ thống TOCFL để chọn buổi thi và trung tâm. Ở khu vực khác, làm theo hướng dẫn của đơn vị tổ chức ghi trong lịch thi." },
  { number: "03", title: "Kiểm tra thông tin dự thi", description: "Đối chiếu họ tên với giấy tờ tùy thân, nộp lệ phí đúng hạn và đọc thông báo dự thi để biết giờ có mặt cùng quy định tại điểm thi." },
];

export default function ExamGuidePage() {
  return <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
    <div className="max-w-3xl">
      <p className="page-eyebrow">HƯỚNG DẪN KỲ THI VÀ ĐĂNG KÝ</p>
      <h1 className="page-title">Chuẩn bị kỹ lưỡng để dự thi tự tin hơn.</h1>
      <p className="page-lead">Các bước chính để tra cứu lịch thi, đăng ký và chuẩn bị trước ngày thi.</p>
    </div>

    <section className="mt-12" id="registration" aria-labelledby="registration-title">
      <div className="section-heading"><div><p className="page-eyebrow">BẮT ĐẦU TỪ ĐÂY</p><h2 id="registration-title">Đăng ký dự thi</h2></div><a href="https://tocfl.edu.tw/OS/register.php" target="_blank" rel="noreferrer" className="button-secondary">Hệ thống đăng ký TOCFL ↗</a></div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {registrationSteps.map((step) => <article key={step.number} className="paper p-6">
          <span className="step-number">{step.number}</span>
          <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
          <p className="mt-3 text-sm leading-7 muted">{step.description}</p>
        </article>)}
      </div>
    </section>

    <section className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_.85fr]" id="prepare" aria-labelledby="prepare-title">
      <div className="paper p-6 sm:p-8">
        <p className="page-eyebrow">TRƯỚC NGÀY THI</p>
        <h2 id="prepare-title" className="mt-2 text-2xl font-bold">Giấy tờ và vật dụng cần chuẩn bị</h2>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-7">
          <li>Đọc thông báo dự thi để xác nhận địa chỉ, giờ có mặt và phòng thi.</li>
          <li>Mang giấy tờ tùy thân bản gốc khớp với thông tin đã đăng ký.</li>
          <li>Kiểm tra quy định về vật dụng được phép mang vào phòng thi và nơi cất thiết bị điện tử.</li>
          <li>Đến trước giờ quy định để tìm phòng và làm theo hướng dẫn của giám thị.</li>
        </ul>
        <a href="https://tocfl.edu.tw/tocfl/index.php/sign_up/faq" target="_blank" rel="noreferrer" className="button-quiet mt-6 inline-block text-sm">Xem câu hỏi thường gặp của TOCFL ↗</a>
      </div>
      <div className="exam-guide-tip rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-6 sm:p-8">
        <TaiwanLandscape className="exam-guide-landscape" />
        <MascotSticker variant="traveler" decorative className="exam-guide-sticker mascot-hover" />
        <h3 className="mt-6 text-xl font-bold text-[var(--brand)]">Kiểm tra lại trước ngày thi</h3>
        <p className="mt-3 text-sm leading-7">Lịch thi và quy định có thể khác nhau theo địa điểm. Hãy xem lại thông báo dành cho buổi thi của bạn trước khi lên đường.</p>
        <a href="https://tocfl.edu.tw/tocfl/index.php/sign_up/rule/list/2" target="_blank" rel="noreferrer" className="button-quiet mt-5 inline-block text-sm">Đọc quy định thi chính thức ↗</a>
      </div>
    </section>

    <section className="mt-14" id="test-centers" aria-labelledby="centers-title">
      <div className="mb-6 max-w-2xl"><p className="page-eyebrow">CHỌN ĐỊA ĐIỂM DỰ THI</p><h2 id="centers-title" className="mt-2 text-2xl font-bold">Tìm điểm thi thuận tiện</h2><p className="mt-2 leading-7 muted">Chọn khu vực, sau đó đối chiếu địa điểm, ngày thi và hạn đăng ký trên danh sách chính thức.</p></div>
      <CenterChooser />
    </section>
    <p className="mt-8 text-xs leading-6 muted">Đây là hướng dẫn tham khảo độc lập. Lịch thi và quy định của buổi thi cụ thể được công bố trên website TOCFL hoặc bởi đơn vị tổ chức.</p>
  </main>;
}

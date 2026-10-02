"use client";

import { useState } from "react";

const regions = {
  vietnam: {
    label: "Việt Nam",
    title: "Tìm buổi thi tại Việt Nam",
    description: "Mở lịch thi toàn cầu, chọn Việt Nam và kiểm tra địa điểm, ngày thi cùng hạn đăng ký. Thông tin đơn vị tổ chức được ghi trong từng buổi thi.",
    href: "https://tocfl.edu.tw/tocfl/index.php/sign_up/entire/list/2",
    action: "Xem lịch thi tại Việt Nam",
  },
  taiwan: {
    label: "Đài Loan",
    title: "Tìm trung tâm tại Đài Loan",
    description: "Xem danh sách trung tâm theo khu vực tại Đài Loan, sau đó kiểm tra buổi thi phù hợp trên hệ thống đăng ký chính thức.",
    href: "https://tocfl.edu.tw/tocfl/index.php/sign_up/tw/list/3",
    action: "Xem trung tâm tại Đài Loan",
  },
  elsewhere: {
    label: "Khu vực khác",
    title: "Tìm buổi thi phù hợp",
    description: "Mở lịch thi toàn cầu, chọn quốc gia hoặc khu vực của bạn, rồi kiểm tra địa điểm và hạn đăng ký của từng buổi thi.",
    href: "https://tocfl.edu.tw/tocfl/index.php/sign_up/entire/list/2",
    action: "Xem kỳ thi toàn cầu",
  },
} as const;

type Region = keyof typeof regions;

export default function CenterChooser() {
  const [region, setRegion] = useState<Region | "">("");
  const selected = region ? regions[region] : null;
  return <div className="paper p-6 sm:p-8">
    <label htmlFor="exam-region" className="block text-sm font-bold">Bạn muốn dự thi ở khu vực nào?</label>
    <p className="mt-1 text-sm muted">Chọn khu vực để xem lịch thi và danh sách điểm thi chính thức.</p>
    <select id="exam-region" value={region} onChange={(event) => setRegion(event.target.value as Region | "")} className="site-select mt-4">
      <option value="">Chọn khu vực</option>
      {Object.entries(regions).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
    </select>
    {selected && <div className="mt-6 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5">
      <h3 className="text-lg font-bold text-[var(--brand)]">{selected.title}</h3>
      <p className="mt-2 text-sm leading-7">{selected.description}</p>
      <a className="button-primary mt-5 inline-flex items-center gap-2" href={selected.href} target="_blank" rel="noreferrer">{selected.action} <span aria-hidden="true">↗</span></a>
    </div>}
  </div>;
}

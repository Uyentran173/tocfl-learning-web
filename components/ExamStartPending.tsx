"use client";
import MascotLoader from "./MascotLoader";

export default function ExamStartPending() {
  return <main className="mascot-loading-screen" aria-busy="true">
    <MascotLoader variant="taipei" message="Đang mở bài thi của bạn…" />
  </main>;
}

"use client";

import { useEffect, useRef, useState } from "react";

export default function ListeningIntroStep({ audioPaths, onComplete }: { audioPaths: string[]; onComplete: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const completedRef = useRef(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const timer = window.setTimeout(() => {
      if (audio.paused) void audio.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
    }, trackIndex === 0 ? 1800 : 0);
    return () => { window.clearTimeout(timer); audio.pause(); };
  }, [audioPaths, trackIndex]);

  function finishTrack() {
    if (trackIndex + 1 < audioPaths.length) {
      setBlocked(false);
      setTrackIndex(trackIndex + 1);
    } else if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }

  return <section className="mx-auto max-w-2xl rounded-2xl border border-[var(--brand-border)] bg-white px-6 py-9 text-center shadow-sm sm:px-10 sm:py-12" aria-label="Hướng dẫn phần Nghe">
    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-soft)] text-4xl text-[var(--brand)]" aria-hidden="true">♫</div>
    <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--brand)]">Phần Nghe</p>
    <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Hướng dẫn trước khi làm bài</h1>
    <p className="mx-auto mt-4 max-w-lg text-sm leading-7 muted">Hãy nghe hết phần hướng dẫn. Câu 1 và các lựa chọn sẽ xuất hiện ngay sau đó.</p>
    <div className="mx-auto mt-8 max-w-md rounded-xl border border-[var(--border)] bg-[var(--brand-soft)] p-4">
      {audioPaths.length > 1 && <p className="mb-3 text-xs font-medium text-[var(--brand)]">Đoạn {trackIndex + 1}/{audioPaths.length}</p>}
      <audio ref={audioRef} src={audioPaths[trackIndex]} controls preload="auto" onEnded={finishTrack} onError={() => setBlocked(true)} className="w-full" aria-label="Âm thanh hướng dẫn phần Nghe">Trình duyệt không hỗ trợ phát âm thanh.</audio>
    </div>
    {blocked && <div role="status" className="mt-5 text-sm"><p>Trình duyệt chưa phát được âm thanh tự động.</p><button type="button" className="button-secondary mt-3" onClick={() => { const audio = audioRef.current; if (audio) void audio.play().then(() => setBlocked(false)).catch(() => setBlocked(true)); }}>Phát hướng dẫn</button></div>}
  </section>;
}

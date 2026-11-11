"use client";

import Link from "next/link";
import { useState } from "react";
import MascotSticker from "@/components/MascotSticker";
import { usePreferences } from "@/components/PreferencesProvider";
import { homeDemoWords, shuffledDemoChoices } from "@/lib/home-vocabulary-demo";
import styles from "./HomeVocabularyDemo.module.css";

type Mode = "flashcard" | "example" | "quiz";
type Script = "traditional" | "simplified";
const modes: { id: Mode; label: string; symbol: string; description: string }[] = [
  { id: "flashcard", label: "Thẻ từ", symbol: "▧", description: "Nhớ nghĩa trước khi lật thẻ." },
  { id: "example", label: "Câu ví dụ", symbol: "文", description: "Đọc từ trong một câu hoàn chỉnh." },
  { id: "quiz", label: "Câu hỏi nhanh", symbol: "✦", description: "Chọn nghĩa và nhận phản hồi ngay." },
];

export default function HomeVocabularyDemo() {
  const { t } = usePreferences();
  const [mode, setMode] = useState<Mode>("flashcard");
  const [script, setScript] = useState<Script>("traditional");
  const [wordIndex, setWordIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [choiceIds, setChoiceIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const word = homeDemoWords[wordIndex];
  const completed = Object.keys(answers).length;
  const correct = homeDemoWords.filter((entry) => answers[entry.id] === entry.id).length;
  const chinese = script === "traditional" ? word.traditional : word.simplified;
  const example = script === "traditional" ? word.exampleTraditional : word.exampleSimplified;
  const exampleIndex = example.indexOf(chinese);
  const selectedId = answers[word.id];

  function switchMode(next: Mode) {
    if (finished) return;
    setMode(next);
    if (next === "quiz" && !selectedId) setChoiceIds(shuffledDemoChoices(word.id));
  }

  function nextWord() {
    if (wordIndex + 1 === homeDemoWords.length) { setFinished(true); return; }
    setWordIndex((index) => index + 1);
    setMode("flashcard");
    setFlipped(false);
    setShowPinyin(false);
    setShowTranslation(false);
    setChoiceIds([]);
  }

  function restart() {
    setMode("flashcard"); setWordIndex(0); setFlipped(false);
    setShowPinyin(false); setShowTranslation(false);
    setChoiceIds([]); setAnswers({}); setFinished(false);
  }

  return <section className={`home-section ${styles.section}`} aria-labelledby="home-product-title">
    <div className={styles.heading}>
      <div><p className="page-eyebrow">{t("ÔN TẬP NHANH")}</p><h2 id="home-product-title">{t("Một từ mới. Một bước tiến thật.")}</h2><p>{t("Thử một lượt ôn tập ngắn với ba từ thật trong kho TOCFL Band A. Lật thẻ, đọc ví dụ rồi chọn nghĩa đúng.")}</p></div>
      <span className={styles.flower} aria-hidden="true">✽</span>
    </div>

    <div className={styles.modeBar} role="tablist" aria-label={t("ÔN TẬP NHANH")} onKeyDown={(event) => {
      if (finished || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const current = modes.findIndex((item) => item.id === mode);
      const next = event.key === "Home" ? 0 : event.key === "End" ? modes.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + modes.length) % modes.length;
      switchMode(modes[next].id);
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next].focus();
    }}>
      {modes.map((item) => <button key={item.id} type="button" role="tab" aria-selected={!finished && mode === item.id} aria-controls="home-demo-panel" tabIndex={!finished && mode === item.id ? 0 : -1} className={`${styles.modeButton} ${!finished && mode === item.id ? styles.modeActive : ""}`} onClick={() => switchMode(item.id)} disabled={finished}><span aria-hidden="true">{item.symbol}</span>{t(item.label)}</button>)}
    </div>

    <div className={styles.stage}>
      <div className={styles.stageTop}>
        <span>TOCFL · BAND A</span>
        <span>{finished ? `${homeDemoWords.length} / ${homeDemoWords.length}` : `${wordIndex + 1} / ${homeDemoWords.length}`}</span>
      </div>
      <div className={styles.progress} role="progressbar" aria-label={t("Tiến độ bản thử")} aria-valuenow={completed} aria-valuemin={0} aria-valuemax={homeDemoWords.length}><span style={{ width: `${completed / homeDemoWords.length * 100}%` }} /></div>
      <div className={styles.stageGrid}>
        <div id="home-demo-panel" role="tabpanel" className={styles.interaction} key={finished ? "finished" : `${word.id}-${mode}`}>
          {finished ? <div className={styles.finished}>
            <span className={styles.completionIcon} aria-hidden="true">✦</span>
            <h3>{t("Hoàn thành lượt ôn tập")}</h3>
            <p>{t("Bạn đã trả lời")} <strong>{correct}</strong> {t("câu đúng")} {t("trong 3 câu")}.</p>
            <div className={styles.finishActions}><Link href="/vocabulary/band" className={styles.primaryAction}>{t("Bắt đầu học thật")} <span aria-hidden="true">↗</span></Link><button type="button" className={styles.textAction} onClick={restart}>{t("Làm lại bản thử")}</button></div>
          </div> : mode === "flashcard" ? <div className={styles.flashcardScene}>
            <button type="button" className={`${styles.flashcard} ${flipped ? styles.flipped : ""}`} onClick={() => setFlipped((current) => !current)} aria-label={flipped ? `${chinese}, ${word.pinyin}, ${word.meaningVi}. ${example} ${word.exampleVi}. ${t("Nhấn để xem lại mặt trước")}` : `${chinese}. ${t("Nhấn vào thẻ để xem nghĩa")}`} aria-pressed={flipped}>
              <span className={styles.cardInner}>
                <span className={`${styles.cardFace} ${styles.cardFront}`} aria-hidden={flipped}><small>TOCFL · BAND A</small><strong lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{chinese}</strong><span>{t("Nhấn vào thẻ để xem nghĩa")} <i aria-hidden="true">↻</i></span></span>
                <span className={`${styles.cardFace} ${styles.cardBack}`} aria-hidden={!flipped}><small>{t("Nghĩa tiếng Việt")}</small><strong lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{chinese}</strong><span className={styles.pinyin}>{word.pinyin}</span><b>{word.meaningVi}</b><span className={styles.backExample} lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{example}</span><span className={styles.backTranslation}>{word.exampleVi}</span><span className={styles.cardHint}>{t("Nhấn để xem lại mặt trước")} ↻</span></span>
              </span>
            </button>
            {flipped && <button type="button" className={styles.primaryAction} onClick={() => switchMode("example")}>{t("Xem ví dụ")} <span aria-hidden="true">→</span></button>}
          </div> : mode === "example" ? <div className={styles.exampleScene}>
            <span className={styles.smallLabel}>{t("Câu ví dụ")}</span>
            <p className={styles.chineseSentence} lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{exampleIndex < 0 ? example : <>{example.slice(0, exampleIndex)}<mark>{chinese}</mark>{example.slice(exampleIndex + chinese.length)}</>}</p>
            <div className={styles.revealRow}><button type="button" onClick={() => setShowPinyin((current) => !current)} aria-pressed={showPinyin}>{t(showPinyin ? "Ẩn phiên âm" : "Hiện phiên âm")}</button><button type="button" onClick={() => setShowTranslation((current) => !current)} aria-pressed={showTranslation}>{t(showTranslation ? "Ẩn bản dịch" : "Hiện bản dịch")}</button></div>
            {showPinyin && <p className={styles.revealed}><span>{chinese}</span> · {word.pinyin}</p>}
            {showTranslation && <p className={styles.revealed}>{word.exampleVi}</p>}
            <button type="button" className={styles.primaryAction} onClick={() => switchMode("quiz")}>{t("Thử trả lời")} <span aria-hidden="true">→</span></button>
          </div> : <div className={styles.quizScene}>
            <span className={styles.smallLabel}>{t("Câu hỏi nhanh")}</span>
            <h3>{t("Nghĩa tiếng Việt của từ này là gì?")}</h3>
            <p className={styles.quizWord} lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{chinese}</p>
            <div className={styles.choices}>{choiceIds.map((id) => {
              const option = homeDemoWords.find((entry) => entry.id === id)!;
              const state = selectedId ? id === word.id ? styles.choiceCorrect : id === selectedId ? styles.choiceWrong : styles.choiceDim : "";
              return <button key={id} type="button" className={`${styles.choice} ${state}`} disabled={Boolean(selectedId)} onClick={() => setAnswers((current) => current[word.id] ? current : { ...current, [word.id]: id })}>{option.meaningVi}<span aria-hidden="true">{selectedId && id === word.id ? "✓" : selectedId && id === selectedId ? "×" : "↗"}</span></button>;
            })}</div>
            {selectedId && <div className={styles.feedback} role="status"><strong>{selectedId === word.id ? t("Chính xác!") : t("Chưa đúng rồi")}</strong><span>{t("Đáp án đúng là")} “{word.meaningVi}”. {example} — {word.exampleVi}</span></div>}
            {selectedId && <button type="button" className={styles.primaryAction} onClick={nextWord}>{wordIndex + 1 === homeDemoWords.length ? t("Hoàn thành lượt ôn tập") : t("Từ tiếp theo")} <span aria-hidden="true">→</span></button>}
          </div>}
        </div>
        <aside className={styles.guide}>
          <div className={styles.guideArt}><span className={styles.orbit} aria-hidden="true">旅 · 學 · 文</span><MascotSticker variant={finished ? "graduate" : mode === "quiz" && selectedId === word.id ? "graduate" : "study"} decorative className={styles.mascot} /></div>
          <span className={styles.guideCount}>{finished ? "03 / 03" : `0${modes.findIndex((item) => item.id === mode) + 1} / 03`}</span>
          <h3>{t(finished ? "Hoàn thành lượt ôn tập" : modes.find((item) => item.id === mode)!.label)}</h3>
          {!finished && <p>{t(modes.find((item) => item.id === mode)!.description)}</p>}
          {!finished && <div className={styles.scriptPicker} role="group" aria-label={t("Chọn loại chữ cho bản thử")}><button type="button" className={script === "traditional" ? styles.scriptActive : ""} aria-pressed={script === "traditional"} onClick={() => setScript("traditional")}>{t("Chữ Phồn thể")}</button><button type="button" className={script === "simplified" ? styles.scriptActive : ""} aria-pressed={script === "simplified"} onClick={() => setScript("simplified")}>{t("Chữ Giản thể")}</button></div>}
          <small className={styles.disclaimer}>{t("Bản xem thử · không lưu vào tiến độ học")}</small>
        </aside>
      </div>
    </div>
  </section>;
}

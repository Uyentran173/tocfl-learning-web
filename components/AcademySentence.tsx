"use client";

import { useMemo, useState } from "react";
import type { AcademySentence as Sentence } from "@/lib/academy-catalog";
import { cc1Lesson01Words } from "@/lib/cc1-lesson01-vocabulary";
import type { AcademyScript } from "@/lib/academy-script";
import { useT } from "./PreferencesProvider";

type Piece = { text: string; id?: string; pinyin?: string; meaning?: string };
function tokenize(input: string, script: AcademyScript): Piece[] {
  const lexicon = cc1Lesson01Words.map((word) => ({ text: script === "simplified" ? word.simplified! : word.traditional!, id: word.id!, pinyin: word.pinyin, meaning: word.meaning })).sort((a, b) => b.text.length - a.text.length);
  const pieces: Piece[] = [];
  let index = 0;
  while (index < input.length) {
    const found = lexicon.find((entry) => input.startsWith(entry.text, index));
    if (found) { pieces.push(found); index += found.text.length; }
    else { pieces.push({ text: input[index] }); index += 1; }
  }
  return pieces;
}

export default function AcademySentence({ sentence, script, revealAll = false }: { sentence: Sentence; script: AcademyScript; revealAll?: boolean }) {
  const t = useT();
  const [wordIndex, setWordIndex] = useState<number | null>(null);
  const [showPinyin, setShowPinyin] = useState(false);
  const [showVi, setShowVi] = useState(false);
  const chinese = script === "simplified" ? sentence.simplified : sentence.chinese;
  const pieces = useMemo(() => tokenize(chinese, script), [chinese, script]);
  const selected = wordIndex === null ? null : pieces[wordIndex];
  return <div className="academy-sentence">
    <p className="academy-chinese" lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{pieces.map((piece, index) => piece.id
      ? <button key={`${index}-${piece.text}`} type="button" className="academy-chinese-word" aria-expanded={wordIndex === index} aria-label={`${piece.text}: ${t("Xem phiên âm và nghĩa")}`} onClick={() => setWordIndex(wordIndex === index ? null : index)}>{piece.text}</button>
      : <span key={`${index}-${piece.text}`}>{piece.text}</span>)}</p>
    {selected?.id && <div className="academy-word-popover" role="status"><strong lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{selected.text}</strong><span>{selected.pinyin}</span><span>{selected.meaning}</span><button type="button" aria-label={t("Đóng nghĩa của từ")} onClick={() => setWordIndex(null)}>×</button></div>}
    <div className="academy-reveal-actions"><button type="button" aria-pressed={showPinyin || revealAll} onClick={() => setShowPinyin((value) => !value)}>{t(showPinyin ? "Ẩn Pinyin" : "Xem Pinyin")}</button><button type="button" aria-pressed={showVi || revealAll} onClick={() => setShowVi((value) => !value)}>{t(showVi ? "Ẩn bản dịch" : "Xem bản dịch")}</button></div>
    {(showPinyin || revealAll) && <p className="academy-pinyin">{sentence.pinyin}</p>}
    {(showVi || revealAll) && <p className="academy-meaning">{sentence.meaningVi}</p>}
  </div>;
}

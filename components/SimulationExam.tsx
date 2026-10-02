"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { MockTest, Question, Section } from "@/lib/tests";
import { formatTime, letters } from "./ExamParts";
import { BrandMark } from "./SiteBrand";
import { getBandAReadingVisual } from "@/lib/band-a-reading-visual";
import BandAReadingImage from "./BandAReadingImage";
import { CroppedSource } from "./BandAReadingImage";
import { getBandBReadingVisual, isBandBDocumentQuestion } from "@/lib/band-b-reading-visual";
import BandBReadingImage from "./BandBReadingImage";
import StructuredSourceImage from "./StructuredSourceImage";

function HeadphonesIcon({ size = 88 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true"><path d="M15 51V42a33 33 0 0 1 66 0v9" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/><rect x="11" y="48" width="17" height="29" rx="6" fill="currentColor"/><rect x="68" y="48" width="17" height="29" rx="6" fill="currentColor"/><path d="M81 76c-3 8-10 12-24 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><rect x="50" y="83" width="13" height="7" rx="3.5" fill="currentColor"/></svg>;
}
function SpeakerIcon({ loud = false }: { loud?: boolean }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3Z" fill="currentColor"/><path d={loud ? "M15 8c2 1 3 2.5 3 4s-1 3-3 4M17 5c3 2 5 4 5 7s-2 5-5 7" : "M15 9c1.5.8 2 1.8 2 3s-.5 2.2-2 3"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
}
function ClockIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 6.5V12l3.5 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SimulationExamHeader({ section }: { section?: Section }) {
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => { const onChange = () => setFullscreen(Boolean(document.fullscreenElement)); document.addEventListener("fullscreenchange", onChange); return () => document.removeEventListener("fullscreenchange", onChange); }, []);
  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { /* Fullscreen is optional. */ }
  }
  return <header className="sim-header"><div><BrandMark /><p className="sim-brand-en">BÀI THI MÔ PHỎNG</p></div><div className="sim-header-right">{section && <span className="sim-section-label">{section === "listening" ? "Nghe" : "Đọc"}</span>}<button type="button" className="sim-fullscreen-toggle" onClick={toggleFullscreen} aria-label={fullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"} title={fullscreen ? "Thoát toàn màn hình" : "Xem toàn màn hình"}>{fullscreen ? "▣" : "□"}</button></div></header>;
}
export function SimulationExamShell({ section, toolbar, footer, children }: { section?: Section; toolbar?: ReactNode; footer?: ReactNode; children: ReactNode }) {
  return <div className="sim-outer"><div className="sim-canvas"><SimulationExamHeader section={section}/>{toolbar && <div className="sim-toolbar">{toolbar}</div>}<div className="sim-scroll-region">{children}</div>{footer && <footer className="sim-footer">{footer}</footer>}</div></div>;
}
export function SimulationToolbar({ section, remaining, volume, onVolumeChange }: { section: Section; remaining: number; volume: number; onVolumeChange: (value: number) => void }) {
  return <><div className="sim-toolbar-left">{section === "listening" && <div className="sim-volume"><span className="sr-only">Âm lượng</span><SpeakerIcon/><input type="range" aria-label="Âm lượng âm thanh" min="0" max="100" value={Math.round(volume * 100)} onChange={(event) => onVolumeChange(Number(event.target.value) / 100)} /><SpeakerIcon loud/></div>}{section === "reading" && <span className="sim-toolbar-section">Bài thi Đọc</span>}</div>{section === "reading" && <div className={`sim-timer ${remaining <= 300 ? "sim-timer-low" : ""}`} aria-label={`Thời gian còn lại ${formatTime(remaining)}`}><ClockIcon/><span className="tabular-nums">{formatTime(remaining)}</span></div>}</>;
}
function SimulationQuestionImage({ question }: { question: Question }) {
  if (question.sourceImageReviewOnly && !isBandBDocumentQuestion(question)) return null;
  if (!question.imageUrl) return null;
  if (question.sourceVisual) return <StructuredSourceImage question={question} simulation />;
  if (getBandAReadingVisual(question)) return <BandAReadingImage question={question} simulation />;
  if (getBandBReadingVisual(question)) return <BandBReadingImage question={question} simulation />;
  return <div className="sim-image-area"><Image src={question.imageUrl} alt={question.imageAlt || "Hình minh họa câu hỏi"} width={1530} height={660} unoptimized className="sim-question-image" /></div>;
}
export function SimulationAnswerOptions({ question, selected, onSelect }: { question: Question; selected?: number; onSelect: (index: number) => void }) {
  const imageChoices = question.choiceImages?.some(Boolean);
  return <fieldset className={imageChoices ? "sim-options sim-image-options" : "sim-options"}><legend className="sr-only">Chọn đáp án</legend>{question.choices.map((choice, index) => {
    const sourceCrop = question.sourceVisual?.choices[index];
    return <label key={`${question.id}-${index}`} className="sim-option"><input type="radio" name={`answer-${question.id}`} value={index} checked={selected === index} onChange={() => onSelect(index)} aria-label={sourceCrop ? `Đáp án ${letters[index]}` : undefined} />{!sourceCrop && <span className="sim-option-letter">({letters[index] ?? index + 1})</span>}<span lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"} className={sourceCrop ? "min-w-0 flex-1" : undefined}>{sourceCrop ? <CroppedSource question={question} crop={sourceCrop} label={`Đáp án ${letters[index]}`} /> : choice}{question.choiceImages?.[index] && <Image src={question.choiceImages[index]!} alt={`Hình đáp án ${letters[index] ?? index + 1}`} width={510} height={440} unoptimized className="mt-1 h-auto max-h-44 w-auto max-w-full rounded-lg object-contain" />}</span></label>;
  })}</fieldset>;
}
export function SimulationListeningQuestion({ question, number, selected, audioBlocked, onRetryAudio, onSelect }: { question: Question; number: number; selected?: number; audioBlocked: boolean; onRetryAudio: () => void; onSelect: (index: number) => void }) {
  return <div className="sim-question sim-listening"><div className="sim-question-number">{number}.</div><div className="sim-audio-area" aria-hidden="true"><HeadphonesIcon size={62}/></div>{!question.audioUrl && <p className="sim-audio-recovery">Câu này chưa có tệp âm thanh. Bạn vẫn có thể chọn đáp án nếu nội dung câu hỏi đã được cung cấp.</p>}{audioBlocked && <div className="sim-audio-recovery" role="status"><p>Trình duyệt đã chặn phát âm thanh tự động. Hãy bật âm thanh để tiếp tục.</p><button type="button" className="sim-outline-button" onClick={onRetryAudio}>Bật âm thanh</button></div>}<SimulationQuestionImage question={question}/>{question.passage && <p className="sim-passage" lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"}>{question.passage}</p>}{question.question && <h2 className="sim-listening-prompt" lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"}>{question.question}</h2>}<SimulationAnswerOptions question={question} selected={selected} onSelect={onSelect}/></div>;
}
export function SimulationReadingQuestion({ question, number, selected, onSelect }: { question: Question; number: number; selected?: number; onSelect: (index: number) => void }) {
  return <div className="sim-question sim-reading">{!question.sourceVisual?.prompt && <div className="sim-question-number">{number}.</div>}<SimulationQuestionImage question={question}/>{question.passage && !isBandBDocumentQuestion(question) && <div className={`sim-reading-passage ${question.sourceImageReviewOnly ? "whitespace-pre-line" : ""}`} lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"}>{question.passage}</div>}{question.question && <h2 className="sim-reading-prompt" lang={question.script === "simplified" ? "zh-Hans" : "zh-Hant"}>{question.question}</h2>}<SimulationAnswerOptions question={question} selected={selected} onSelect={onSelect}/></div>;
}
export function SimulationNavigation({ first, last, onPrevious, onNext, onFinish }: { first: boolean; last: boolean; onPrevious: () => void; onNext: () => void; onFinish: () => void }) {
  return <div className="sim-navigation"><button type="button" className="sim-nav-circle" disabled={first} onClick={onPrevious} aria-label="Câu trước" title="Câu trước"><span aria-hidden="true">←</span></button><div className="sim-navigation-right">{last ? <button type="button" className="sim-finish" onClick={onFinish}>Nộp bài</button> : <button type="button" className="sim-nav-circle" onClick={onNext} aria-label="Câu sau" title="Câu sau"><span aria-hidden="true">→</span></button>}</div></div>;
}
export function SimulationListeningNavigation({ onNext }: { onNext: () => void }) {
  return <div className="sim-navigation"><button type="button" className="sim-listening-next" onClick={onNext} aria-label="Câu sau" title="Câu sau"><span aria-hidden="true">→</span></button></div>;
}
export function SimulationSectionTransition({ onBegin }: { onBegin: () => void }) {
  return <div className="sim-transition"><h1>Đã hoàn thành phần Nghe</h1><div className="sim-transition-rule"/><h2>Tiếp theo: phần Đọc</h2><p className="sim-transition-time">Thời gian làm bài: 60 phút</p><button type="button" className="sim-start-button" onClick={onBegin}>Bắt đầu phần Đọc</button></div>;
}
type SimulationIntroProps = { phase: "intro"; test: MockTest; onStart: () => void; onBack: () => void };
type SimulationActiveProps = { phase: "active"; test: MockTest; question: Question; index: number; selected?: number; remaining: number; volume: number; onVolumeChange: (value: number) => void; onSelect: (index: number) => void; onPrevious: () => void; onNext: () => void; onFinish: () => void; readingTransition: boolean; onBeginReading: () => void; audioBlocked: boolean; onRetryAudio: () => void };
export function SimulationExam(props: SimulationIntroProps | SimulationActiveProps) {
  if (props.phase === "intro") return <SimulationExamShell key="intro" section={props.test.questions[0]?.section}><SimulationIntroScreen test={props.test} onStart={props.onStart} onBack={props.onBack}/></SimulationExamShell>;
  const { test, question, index, selected, remaining, volume, onVolumeChange, onSelect, onPrevious, onNext, onFinish, readingTransition, onBeginReading, audioBlocked, onRetryAudio } = props;
  const toolbar = readingTransition ? undefined : <SimulationToolbar section={question.section} remaining={remaining} volume={volume} onVolumeChange={onVolumeChange}/>;
  if (readingTransition) return <SimulationExamShell key="transition" section="reading"><SimulationSectionTransition onBegin={onBeginReading}/></SimulationExamShell>;
  return <SimulationExamShell key="active" section={question.section} toolbar={toolbar} footer={question.section === "listening" ? <SimulationListeningNavigation onNext={onNext}/> : <SimulationNavigation first={index === 0 || test.questions[index - 1]?.section === "listening"} last={index === test.questions.length - 1} onPrevious={onPrevious} onNext={onNext} onFinish={onFinish}/>}>
    {question.section === "listening" ? <SimulationListeningQuestion question={question} number={question.number ?? index + 1} selected={selected} audioBlocked={audioBlocked} onRetryAudio={onRetryAudio} onSelect={onSelect}/> : <SimulationReadingQuestion question={question} number={question.number ?? index + 1} selected={selected} onSelect={onSelect}/>}
  </SimulationExamShell>;
}
export function SimulationIntroScreen({ test, onStart, onBack }: { test: MockTest; onStart: () => void; onBack: () => void }) {
  const [fullscreenMessage, setFullscreenMessage] = useState("");
  const [secondsUntilStart, setSecondsUntilStart] = useState(10);
  const startedRef = useRef(false);
  const onStartRef = useRef(onStart);
  useEffect(() => { onStartRef.current = onStart; }, [onStart]);
  const begin = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    onStartRef.current();
  }, []);
  useEffect(() => {
    const startsAt = Date.now() + 10_000;
    const interval = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((startsAt - Date.now()) / 1000));
      setSecondsUntilStart(left);
      if (left === 0) begin();
    }, 250);
    return () => window.clearInterval(interval);
  }, [begin]);
  async function enterFullscreen() {
    try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); setFullscreenMessage("Đã bật toàn màn hình. Nhấn Escape để thoát."); }
    catch { setFullscreenMessage("Trình duyệt này không hỗ trợ toàn màn hình."); }
  }
  const startsWithListening = test.questions[0]?.section === "listening";
  return <div className="sim-intro"><p className="sim-overline">{test.title}</p><h1>Chuẩn bị cho phần {startsWithListening ? "Nghe" : "Đọc"}</h1><p className="sim-intro-subtitle">Bài thi mô phỏng</p>{startsWithListening && <div className="sim-headphone-icon"><HeadphonesIcon/></div>}<p className="sim-intro-copy">{startsWithListening ? "Sau khi bắt đầu, phần Nghe sẽ phát sau khoảng 2 giây. Mỗi bản ghi âm đã có thời gian nghe và trả lời theo đề. Bạn có thể chuyển sang câu sau sớm hơn nhưng không thể quay lại câu trước." : "Đồng hồ 60 phút sẽ bắt đầu khi vào phần Đọc. Bạn có thể chuyển giữa các câu trong phần này và xác nhận trước khi nộp bài."}</p>{startsWithListening && test.questions.some((question) => question.section === "listening" && !question.audioUrl) && <p className="sim-resume-note">Một số câu Nghe chưa có tệp âm thanh.</p>}<div className="sim-intro-actions"><button type="button" className="sim-outline-button" onClick={enterFullscreen}>Xem toàn màn hình</button></div>{fullscreenMessage && <p role="status" className="sim-status-message">{fullscreenMessage}</p>}<div className="sim-intro-start"><p className="mb-3 text-sm font-semibold text-[var(--brand)]">Bạn đã sẵn sàng?</p><button type="button" className="sim-start-button" onClick={begin}>Tôi đã sẵn sàng</button><p className="mt-3 text-sm muted">Tự động bắt đầu sau {secondsUntilStart} giây</p></div><button type="button" className="sim-back-link" onClick={() => { startedRef.current = true; onBack(); }}>Quay lại chọn chế độ</button></div>;
}

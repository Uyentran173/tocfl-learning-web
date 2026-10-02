"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { ScriptVariant } from "@/lib/tests";
import { annotationKey, createTextAnchor, hasChinese, removeHighlightsInRange, resolveTextAnchor, sameTextRange, upsertAnnotation, type PracticeAnnotation, type TextAnchor } from "@/lib/practice-annotations";

type Position = { top: number; left: number };
type Selection = { anchor: TextAnchor; position: Position };
type NoteEditor = Selection & { draft: string };
type AnnotationContext = {
  questionId: string;
  annotations: PracticeAnnotation[];
  openNote: (annotation: PracticeAnnotation, position: Position) => void;
};

const Context = createContext<AnnotationContext | null>(null);
export const usePracticeAnnotationMode = () => useContext(Context) !== null;

function isAnnotation(value: unknown): value is PracticeAnnotation {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PracticeAnnotation>;
  return typeof item.id === "string" && typeof item.questionId === "string" && typeof item.field === "string" &&
    Number.isInteger(item.start) && Number.isInteger(item.end) && (item.start ?? -1) >= 0 && (item.end ?? 0) > (item.start ?? 0) &&
    typeof item.quote === "string" && typeof item.prefix === "string" && typeof item.suffix === "string" &&
    typeof item.highlighted === "boolean" && (item.note === undefined || typeof item.note === "string");
}

function positionNear(rect: DOMRect, width: number): Position {
  const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.left + rect.width / 2 - width / 2));
  const top = rect.top >= 56 ? rect.top - 48 : Math.min(window.innerHeight - 54, rect.bottom + 8);
  return { top, left };
}

function notePosition(rect: DOMRect): Position {
  const width = Math.min(304, window.innerWidth - 16);
  const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.left + rect.width / 2 - width / 2));
  const top = rect.bottom + 226 < window.innerHeight ? rect.bottom + 8 : Math.max(8, rect.top - 226);
  return { top, left };
}

function fieldOf(node: Node): HTMLElement | null {
  const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
  return element?.closest<HTMLElement>("[data-practice-field]") ?? null;
}

function offsetIn(root: HTMLElement, container: Node, offset: number) {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.setEnd(container, offset);
  return range.toString().length;
}

export function PracticeAnnotationProvider({ testId, script, questionId, children }: { testId: string; script: ScriptVariant; questionId: string; children: ReactNode }) {
  const key = annotationKey(testId, script);
  const [annotations, setAnnotations] = useState<PracticeAnnotation[]>([]);
  const annotationsRef = useRef<PracticeAnnotation[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [editor, setEditor] = useState<NoteEditor | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
        const next = Array.isArray(parsed) ? parsed.filter(isAnnotation) : [];
        annotationsRef.current = next;
        setAnnotations(next);
      } catch { annotationsRef.current = []; setAnnotations([]); }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [key]);

  const persist = useCallback((next: PracticeAnnotation[]) => {
    annotationsRef.current = next;
    setAnnotations(next);
    try { window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* Keep editing in memory if storage is unavailable. */ }
  }, [key]);

  const clearSelection = () => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const captureSelection = () => {
    const selected = window.getSelection();
    if (!selected || selected.isCollapsed || !selected.rangeCount) { setSelection(null); return; }
    const range = selected.getRangeAt(0);
    const field = fieldOf(range.startContainer);
    if (!field || field !== fieldOf(range.endContainer) || !field.contains(range.startContainer) || !field.contains(range.endContainer)) { setSelection(null); return; }
    const text = field.textContent ?? "";
    const anchor = createTextAnchor(questionId, field.dataset.practiceField ?? "", text, offsetIn(field, range.startContainer, range.startOffset), offsetIn(field, range.endContainer, range.endOffset));
    if (!anchor) { setSelection(null); return; }
    setEditor(null);
    setSelection({ anchor, position: positionNear(range.getBoundingClientRect(), 286) });
  };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (toolbarRef.current?.contains(event.target as Node) || editorRef.current?.contains(event.target as Node)) return;
      setSelection(null);
      setEditor(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSelection(null); setEditor(null); window.getSelection()?.removeAllRanges(); }
    };
    const onScroll = () => setSelection(null);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); window.removeEventListener("scroll", onScroll, true); };
  }, []);

  const openNote = (annotation: PracticeAnnotation, position: Position) => {
    setSelection(null);
    setEditor({ anchor: annotation, position, draft: annotation.note ?? "" });
  };
  const hasHighlight = selection && annotations.some((item) => item.questionId === selection.anchor.questionId && item.field === selection.anchor.field && item.highlighted && item.start < selection.anchor.end && item.end > selection.anchor.start);

  return <Context.Provider value={{ questionId, annotations, openNote }}>
    <div onMouseUp={(event) => { if (!(event.target as Element).closest("[data-annotation-control]")) captureSelection(); }} onKeyUp={(event) => { if (!(event.target as Element).closest("[data-annotation-control]")) captureSelection(); }} onTouchEnd={() => window.requestAnimationFrame(captureSelection)}>
      {children}
      {selection && <div ref={toolbarRef} data-annotation-control="toolbar" role="toolbar" aria-label="Công cụ cho chữ đã chọn" className="practice-selection-toolbar" style={selection.position} onMouseDown={(event) => event.preventDefault()}>
        <button type="button" onClick={() => { persist(upsertAnnotation(annotationsRef.current, selection.anchor, { highlighted: true })); clearSelection(); }}>Tô sáng</button>
        <button type="button" onClick={() => {
          const existing = annotationsRef.current.find((item) => sameTextRange(item, selection.anchor));
          const rect = toolbarRef.current?.getBoundingClientRect();
          setEditor({ anchor: selection.anchor, position: rect ? notePosition(rect) : selection.position, draft: existing?.note ?? "" });
          clearSelection();
        }}>Ghi chú</button>
        <button type="button" disabled={!hasHighlight} title="Bỏ tô sáng" aria-label="Bỏ tô sáng" onClick={() => { persist(removeHighlightsInRange(annotationsRef.current, selection.anchor)); clearSelection(); }}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 3h4m-8 4 1 13h10l1-13M10 11v6m4-6v6"/></svg>
        </button>
      </div>}
      {editor && <div ref={editorRef} data-annotation-control="note" className="practice-note-editor" style={editor.position}>
        <div className="practice-note-editor-header"><strong>Ghi chú</strong><button type="button" className="practice-note-delete" title="Xóa ghi chú" aria-label="Xóa ghi chú" onClick={() => { persist(upsertAnnotation(annotationsRef.current, editor.anchor, { note: null })); setEditor(null); }}>×</button></div>
        <p lang={script === "simplified" ? "zh-Hans" : "zh-Hant"} className="practice-note-quote">{editor.anchor.quote}</p>
        <textarea aria-label="Nội dung ghi chú" placeholder="Viết ghi chú của bạn…" value={editor.draft} maxLength={2000} onChange={(event) => setEditor({ ...editor, draft: event.target.value })} />
        <div className="practice-note-editor-actions"><button type="button" onClick={() => setEditor(null)}>Đóng</button><button type="button" onClick={() => { persist(upsertAnnotation(annotationsRef.current, editor.anchor, { note: editor.draft.trim() || null })); setEditor(null); }}>Lưu ghi chú</button></div>
      </div>}
    </div>
  </Context.Provider>;
}

export function AnnotatableText({ field, text }: { field: string; text: string }) {
  const context = useContext(Context);
  if (!context || !hasChinese(text)) return <>{text}</>;
  const resolved = context.annotations.flatMap((annotation) => {
    if (annotation.questionId !== context.questionId || annotation.field !== field) return [];
    const range = resolveTextAnchor(text, annotation);
    return range ? [{ annotation, ...range }] : [];
  });
  const boundaries = [...new Set([0, text.length, ...resolved.flatMap((item) => [item.start, item.end])])].sort((a, b) => a - b);
  return <span data-practice-field={field} className="practice-selectable-text">
    {boundaries.slice(0, -1).map((start, index) => {
      const end = boundaries[index + 1];
      const highlighted = resolved.some((item) => item.annotation.highlighted && item.start <= start && item.end >= end);
      const notes = resolved.filter((item) => item.annotation.note && item.end === end);
      return <span key={`${start}-${end}`}>
        {highlighted ? <mark className="practice-text-highlight">{text.slice(start, end)}</mark> : <span>{text.slice(start, end)}</span>}
        {notes.map(({ annotation }) => <button key={annotation.id} type="button" className="practice-note-marker" title="Mở ghi chú" aria-label={`Mở ghi chú cho “${annotation.quote}”`} onClick={(event) => { event.stopPropagation(); context.openNote(annotation, notePosition(event.currentTarget.getBoundingClientRect())); }}>
          <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h14v12H9l-4 4V4Z"/><path d="M9 8h6m-6 4h4"/></svg>
        </button>)}
      </span>;
    })}
  </span>;
}

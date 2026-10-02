import type { ScriptVariant } from "./tests";

export type TextAnchor = {
  questionId: string;
  field: string;
  start: number;
  end: number;
  quote: string;
  prefix: string;
  suffix: string;
};

export type PracticeAnnotation = TextAnchor & {
  id: string;
  highlighted: boolean;
  note?: string;
};

export const hasChinese = (text: string) => /[\u3400-\u9fff]/u.test(text);

export function annotationKey(testId: string, script: ScriptVariant) {
  return `tocfl-practice-annotations:v1:${testId}:${script}`;
}

export function createTextAnchor(questionId: string, field: string, text: string, start: number, end: number): TextAnchor | null {
  if (start < 0 || end <= start || end > text.length) return null;
  const quote = text.slice(start, end);
  if (!hasChinese(quote)) return null;
  return { questionId, field, start, end, quote, prefix: text.slice(Math.max(0, start - 24), start), suffix: text.slice(end, end + 24) };
}

export function resolveTextAnchor(text: string, anchor: TextAnchor): { start: number; end: number } | null {
  if (text.slice(anchor.start, anchor.end) === anchor.quote) return { start: anchor.start, end: anchor.end };
  if (!anchor.quote) return null;
  const candidates: number[] = [];
  for (let start = text.indexOf(anchor.quote); start >= 0; start = text.indexOf(anchor.quote, start + 1)) candidates.push(start);
  if (!candidates.length) return null;
  const score = (start: number) => {
    const before = text.slice(Math.max(0, start - anchor.prefix.length), start);
    const after = text.slice(start + anchor.quote.length, start + anchor.quote.length + anchor.suffix.length);
    let matchingPrefix = 0;
    let matchingSuffix = 0;
    while (matchingPrefix < Math.min(before.length, anchor.prefix.length) && before[before.length - 1 - matchingPrefix] === anchor.prefix[anchor.prefix.length - 1 - matchingPrefix]) matchingPrefix++;
    while (matchingSuffix < Math.min(after.length, anchor.suffix.length) && after[matchingSuffix] === anchor.suffix[matchingSuffix]) matchingSuffix++;
    return (matchingPrefix + matchingSuffix) * 1000 - Math.abs(start - anchor.start);
  };
  const start = candidates.reduce((best, candidate) => score(candidate) > score(best) ? candidate : best);
  return { start, end: start + anchor.quote.length };
}

export function sameTextRange(a: TextAnchor, b: TextAnchor) {
  return a.questionId === b.questionId && a.field === b.field && a.start === b.start && a.end === b.end && a.quote === b.quote;
}

export function upsertAnnotation(annotations: PracticeAnnotation[], anchor: TextAnchor, change: { highlighted?: boolean; note?: string | null }) {
  const existing = annotations.find((item) => sameTextRange(item, anchor));
  const next: PracticeAnnotation = {
    ...(existing ?? { ...anchor, id: `${anchor.questionId}:${anchor.field}:${anchor.start}:${anchor.end}:${anchor.quote}`, highlighted: false }),
    ...anchor,
    highlighted: change.highlighted ?? existing?.highlighted ?? false,
    note: change.note === null ? undefined : change.note === undefined ? existing?.note : change.note,
  };
  const others = annotations.filter((item) => item.id !== next.id);
  return next.highlighted || next.note ? [...others, next] : others;
}

export function removeHighlightsInRange(annotations: PracticeAnnotation[], anchor: TextAnchor) {
  return annotations.flatMap((item) => {
    if (item.questionId !== anchor.questionId || item.field !== anchor.field || !item.highlighted || item.end <= anchor.start || item.start >= anchor.end) return [item];
    return upsertAnnotation([item], item, { highlighted: false });
  });
}

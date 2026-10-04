"use client";

import { useState, type FormEvent } from "react";
import {
  contextDifficulties, contextPurposes, contextSources, contextTopics,
  type ContextRequest, type ContextWord,
} from "@/lib/context-vocabulary";
import type { VocabularySet } from "@/lib/vocabulary";
import VocabularyStudy from "./VocabularyStudy";

type Result = { words: ContextWord[]; available: number; topicLabel: string };
type Generated = { options: ContextRequest; result: Result; serial: number };

const initialOptions: ContextRequest = {
  topicId: "daily", purpose: "daily", difficulty: "basic", script: "traditional", count: 20, source: "auto",
};
const sourceLabels: Record<ContextWord["source"], string> = { tocfl: "TOCFL", textbook: "Giáo trình", website: "Kho từ website" };
const bandLabels: Record<string, string> = { novice: "Band Novice", band_a: "Band A", band_b: "Band B", band_c: "Band C" };

function labelFor<T extends { id: string; label: string }>(items: readonly T[], id: string): string {
  return items.find((item) => item.id === id)?.label ?? id;
}

export default function ContextVocabularyBuilder() {
  const [options, setOptions] = useState<ContextRequest>(initialOptions);
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof ContextRequest>(field: K, value: ContextRequest[K]) {
    setOptions((current) => ({ ...current, [field]: value }));
    setGenerated(null);
    setError("");
  }

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setGenerated(null);
    try {
      const response = await fetch("/api/vocabulary/context", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(options),
      });
      const data: Result & { error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Không tạo được bộ từ. Vui lòng thử lại.");
      setGenerated({ options: { ...options }, result: data, serial: Date.now() });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tạo được bộ từ. Vui lòng thử lại.");
    } finally { setLoading(false); }
  }

  const config = generated?.options;
  const result = generated?.result;
  const set: VocabularySet | null = config && result?.words.length ? {
    id: `context:${[config.topicId, encodeURIComponent(config.customTopic ?? ""), config.purpose, config.difficulty, config.script, config.count, config.source].join(":")}`,
    title: result.topicLabel,
    subtitle: `${labelFor(contextPurposes, config.purpose)} · ${labelFor(contextDifficulties, config.difficulty)}`,
    words: result.words.map((word) => ({
      hanzi: config.script === "simplified" ? word.simplified : word.traditional,
      pinyin: word.pinyin,
      meaning: word.meaningVi,
      example: config.script === "simplified" ? word.exampleSimplified : word.exampleTraditional,
      translation: word.exampleVi,
      wordClass: word.wordClass,
      sourceLabel: sourceLabels[word.source],
      levelLabel: word.band ? `${bandLabels[word.band] ?? word.band}${word.level ? ` · ${word.level.replace("level_", "cấp ").replace("novice_", "cấp ")}` : ""}` : null,
      scriptLang: config.script === "simplified" ? "zh-Hans" : "zh-Hant",
      exampleSource: word.exampleSource,
    })),
  } : null;

  return <div className="space-y-7">
    <form onSubmit={generate} className="paper p-5 sm:p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block text-sm font-semibold">Chủ đề
          <select className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 font-normal" value={options.topicId} onChange={(event) => update("topicId", event.target.value)}>
            {contextTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.label}</option>)}
            <option value="custom">Nhập chủ đề riêng</option>
          </select>
        </label>
        {options.topicId === "custom" && <label className="block text-sm font-semibold">Chủ đề của bạn
          <input className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 font-normal" type="text" minLength={2} maxLength={60} required value={options.customTopic ?? ""} onChange={(event) => update("customTopic", event.target.value)} placeholder="Ví dụ: âm nhạc, thú cưng…" />
        </label>}
        <label className="block text-sm font-semibold">Mục đích học
          <select className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 font-normal" value={options.purpose} onChange={(event) => update("purpose", event.target.value)}>
            {contextPurposes.map((purpose) => <option key={purpose.id} value={purpose.id}>{purpose.label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">Trình độ
          <select className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 font-normal" value={options.difficulty} onChange={(event) => update("difficulty", event.target.value)}>
            {contextDifficulties.map((difficulty) => <option key={difficulty.id} value={difficulty.id}>{difficulty.label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">Nguồn từ
          <select className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 font-normal" value={options.source} onChange={(event) => update("source", event.target.value as ContextRequest["source"])}>
            {contextSources.map((source) => <option key={source.id} value={source.id}>{source.label}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-6 flex flex-wrap gap-8">
        <fieldset><legend className="text-sm font-semibold">Dạng chữ</legend><div className="mt-2 flex flex-wrap gap-2">
          {(["traditional", "simplified"] as const).map((script) => <label key={script} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"><input type="radio" name="script" checked={options.script === script} onChange={() => update("script", script)} />{script === "traditional" ? "Chữ Phồn thể" : "Chữ Giản thể"}</label>)}
        </div></fieldset>
        <fieldset><legend className="text-sm font-semibold">Số lượng từ</legend><div className="mt-2 flex flex-wrap gap-2">
          {([10, 20, 30] as const).map((count) => <label key={count} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"><input type="radio" name="count" checked={options.count === count} onChange={() => update("count", count)} />{count} từ</label>)}
        </div></fieldset>
      </div>
      <p className="mt-5 text-sm leading-6 muted">Bộ từ lấy từ dữ liệu đang có. Với chủ đề riêng, hệ thống chỉ chọn từ khớp rõ với chủ đề; không tự tạo từ mới hoặc gắn nhãn TOCFL cho nguồn khác.</p>
      <button type="submit" className="button-primary mt-6" disabled={loading}>{loading ? "Đang tạo bộ từ…" : "Tạo bộ từ"}</button>
      {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
    </form>

    {config && result && <section className="paper p-5 sm:p-8" aria-live="polite">
      <p className="page-eyebrow">BỘ TỪ CỦA BẠN</p>
      <h2 className="mt-2 text-2xl font-bold">Xem trước bộ từ</h2>
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div><dt className="muted">Chủ đề</dt><dd className="font-semibold">{result.topicLabel}</dd></div>
        <div><dt className="muted">Mục đích</dt><dd className="font-semibold">{labelFor(contextPurposes, config.purpose)}</dd></div>
        <div><dt className="muted">Trình độ</dt><dd className="font-semibold">{labelFor(contextDifficulties, config.difficulty)}</dd></div>
        <div><dt className="muted">Nguồn từ</dt><dd className="font-semibold">{labelFor(contextSources, config.source)}</dd></div>
        <div><dt className="muted">Dạng chữ</dt><dd className="font-semibold">{config.script === "traditional" ? "Chữ Phồn thể" : "Chữ Giản thể"}</dd></div>
        <div><dt className="muted">Số lượng từ</dt><dd className="font-semibold">{result.words.length}/{config.count} từ</dd></div>
      </dl>
      {result.words.length < config.count && <p className="mt-5 rounded-xl bg-[var(--brand-soft)] px-4 py-3 text-sm leading-6 text-[var(--brand)]" role="status">Nguồn và điều kiện bạn chọn chỉ có {result.available} từ phù hợp, đủ nghĩa và ví dụ. Hãy đổi chủ đề, trình độ hoặc nguồn nếu muốn thêm từ.</p>}
      {config.difficulty === "advanced" && <p className="mt-3 text-sm muted">Các từ nâng cao hiện có nội dung học đầy đủ thuộc TOCFL cấp 4; Band C đang chờ biên tập nghĩa và ví dụ.</p>}
      {config.purpose === "tocfl" && config.source !== "auto" && config.source !== "tocfl" && <p className="mt-3 text-sm muted">Bạn đã chọn nguồn ngoài TOCFL chính thức; các từ này không được ghi là từ TOCFL.</p>}
      {result.words.length > 0 ? <ul className="mt-5 flex flex-wrap gap-2" aria-label="Các từ trong bộ">
        {result.words.map((word) => <li key={word.id} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm"><span lang={config.script === "simplified" ? "zh-Hans" : "zh-Hant"}>{config.script === "simplified" ? word.simplified : word.traditional}</span><span className="ml-2 text-xs muted">{sourceLabels[word.source]}</span></li>)}
      </ul> : <p className="mt-5 text-sm muted">Không tìm thấy từ phù hợp trong nguồn đã chọn. Thử một chủ đề khác hoặc chọn “Tự động · ưu tiên TOCFL”.</p>}
    </section>}
    {set && <VocabularyStudy key={generated?.serial} sets={[set]} kind="topic" showSetSelector={false} />}
  </div>;
}

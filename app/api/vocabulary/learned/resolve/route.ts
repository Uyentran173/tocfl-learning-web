import imported from "@/data/vocabulary/tocfl-imported.json";
import enrichment from "@/data/vocabulary/tocfl-enrichment.json";
import { createContextCandidates, parseContextRequest, selectContextVocabulary } from "@/lib/context-vocabulary";
import { fromBandRecord } from "@/lib/learned-vocabulary-adapters";
import type { LearnedVocabularyInput } from "@/lib/learned-vocabulary";
import type { TocflVocabularyRecord } from "@/lib/tocfl-vocabulary-types";
import { textbooks, topicSets } from "@/lib/vocabulary";

const official = imported.records as TocflVocabularyRecord[];
const candidates = createContextCandidates(official, enrichment.entries as Parameters<typeof createContextCandidates>[1], topicSets, textbooks);
const byOfficialId = new Map(official.map((record) => [record.id, record]));

export async function POST(request: Request) {
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Dữ liệu tiến độ không hợp lệ." }, { status: 400 }); }
  if (!input || typeof input !== "object") return Response.json({ error: "Dữ liệu tiến độ không hợp lệ." }, { status: 400 });
  const body = input as Record<string, unknown>;
  const bandIds = Array.isArray(body.bandIds) ? body.bandIds.filter((value): value is string => typeof value === "string").slice(0, 8000) : [];
  const setKeys = Array.isArray(body.setKeys) ? body.setKeys.filter((value): value is string => typeof value === "string").slice(0, 500) : [];
  const words: LearnedVocabularyInput[] = [];
  for (const id of bandIds) {
    const record = byOfficialId.get(id);
    if (record) {
      const enriched = enrichment.entries[id as keyof typeof enrichment.entries] as Partial<TocflVocabularyRecord> | undefined;
      words.push(fromBandRecord({ ...record, ...enriched }, "traditional"));
    }
  }
  for (const key of setKeys) {
    const separator = key.lastIndexOf(":");
    if (separator < 1) continue;
    const setId = key.slice(0, separator);
    const hanzi = key.slice(separator + 1);
    let match;
    if (setId.startsWith("context:")) {
      const parts = setId.split(":");
      if (parts.length !== 8) continue;
      const [topicId, encodedTopic, purpose, difficulty, script, count, source] = parts.slice(1);
      let customTopic = "";
      try { customTopic = decodeURIComponent(encodedTopic); } catch { continue; }
      const options = parseContextRequest({ topicId, customTopic, purpose, difficulty, script, count: Number(count), source });
      if (!options) continue;
      match = selectContextVocabulary(candidates, options).words.find((word) => (script === "simplified" ? word.simplified : word.traditional) === hanzi);
    } else {
      match = candidates.find((word) => word.id.startsWith(`website:${setId}:`) && word.traditional === hanzi)
        ?? candidates.find((word) => word.id.startsWith(`textbook:${setId}:`) && word.traditional === hanzi);
    }
    if (match) words.push({ sourceRecordId: match.id, source: match.source, band: match.band, level: match.level,
      studySetId: setId, topicId: setId.startsWith("context:") ? setId.split(":")[1] : setId,
      script: setId.includes(":simplified:") ? "simplified" : "traditional", traditional: match.traditional,
      simplified: match.simplified, pinyin: match.pinyin, meaningVi: match.meaningVi, wordClass: match.wordClass,
      exampleTraditional: match.exampleTraditional, exampleSimplified: match.exampleSimplified, exampleVi: match.exampleVi });
  }
  return Response.json({ words }, { headers: { "Cache-Control": "no-store" } });
}

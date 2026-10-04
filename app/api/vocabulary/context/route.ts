import imported from "@/data/vocabulary/tocfl-imported.json";
import enrichment from "@/data/vocabulary/tocfl-enrichment.json";
import { createContextCandidates, parseContextRequest, selectContextVocabulary } from "@/lib/context-vocabulary";
import type { TocflVocabularyRecord } from "@/lib/tocfl-vocabulary-types";
import { textbooks, topicSets } from "@/lib/vocabulary";

const candidates = createContextCandidates(
  imported.records as TocflVocabularyRecord[],
  enrichment.entries as Parameters<typeof createContextCandidates>[1],
  topicSets,
  textbooks,
);

export async function POST(request: Request) {
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Thông tin tạo bộ từ không hợp lệ." }, { status: 400 }); }
  const options = parseContextRequest(input);
  if (!options) return Response.json({ error: "Hãy chọn đủ chủ đề, mục đích, trình độ, dạng chữ, số từ và nguồn." }, { status: 400 });
  return Response.json(selectContextVocabulary(candidates, options), { headers: { "Cache-Control": "no-store" } });
}

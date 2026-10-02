import { getTocflVocabularyForBand } from "@/lib/tocfl-vocabulary-data";

export function GET(request: Request) {
  const bandId = new URL(request.url).searchParams.get("band") ?? "";
  const records = getTocflVocabularyForBand(bandId);
  if (!records) return Response.json({ error: "Không tìm thấy Band này." }, { status: 404 });
  return Response.json({ records });
}

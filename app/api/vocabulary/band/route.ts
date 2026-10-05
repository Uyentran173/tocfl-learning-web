import { getTocflVocabularyForBand } from "@/lib/tocfl-vocabulary-data";

export function GET(request: Request) {
  const bandId = new URL(request.url).searchParams.get("band") ?? "";
  const records = getTocflVocabularyForBand(bandId);
  if (!records) return Response.json({ error: "Không tìm thấy Band này." }, { status: 404 });
  return Response.json(
    { records },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400",
      },
    },
  );
}

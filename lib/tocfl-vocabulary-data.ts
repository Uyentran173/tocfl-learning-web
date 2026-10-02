import imported from "@/data/vocabulary/tocfl-imported.json";
import enrichment from "@/data/vocabulary/tocfl-enrichment.json";
import type { TocflVocabularyBand, TocflVocabularyRecord } from "./tocfl-vocabulary-types";

type SourceCatalog = {
  bandMapping: { bands: { id: string; labelVi: string; entryCount: number; levelIds: string[]; coverageNoteVi?: string }[] };
  levels: { id: string; officialLabelEn: string; officialLabelZh: string; entryCount: number }[];
};
const datasets = imported.datasets as { datasetId: string; catalog: SourceCatalog }[];
const records = imported.records as TocflVocabularyRecord[];
const enrichmentEntries = enrichment.entries as Record<string, Pick<TocflVocabularyRecord, "meaningVi" | "exampleTraditional" | "exampleSimplified" | "exampleVi" | "exampleSource">>;

export function getTocflVocabularyBands(): TocflVocabularyBand[] {
  const bands = new Map<string, TocflVocabularyBand>();
  for (const dataset of datasets) {
    const levels = new Map(dataset.catalog.levels.map((level) => [level.id, level]));
    for (const sourceBand of dataset.catalog.bandMapping.bands) {
      let band = bands.get(sourceBand.id);
      if (!band) {
        band = { id: sourceBand.id, label: sourceBand.labelVi, entryCount: 0, coverageNote: sourceBand.coverageNoteVi, levels: [] };
        bands.set(sourceBand.id, band);
      }
      for (const levelId of sourceBand.levelIds) {
        const level = levels.get(levelId);
        if (level && !band.levels.some((item) => item.id === levelId)) {
          band.levels.push({ id: levelId, label: level.officialLabelEn, labelZh: level.officialLabelZh, entryCount: 0 });
        }
      }
    }
  }
  for (const record of records) {
    const band = bands.get(record.band);
    if (!band) continue;
    band.entryCount++;
    const level = band.levels.find((item) => item.id === record.levelId);
    if (level) level.entryCount++;
  }
  return [...bands.values()];
}

export function getTocflVocabularyForBand(bandId: string): TocflVocabularyRecord[] | null {
  if (!getTocflVocabularyBands().some((band) => band.id === bandId)) return null;
  return records.filter((record) => record.band === bandId).map((record) => ({ ...record, ...enrichmentEntries[record.id] }));
}

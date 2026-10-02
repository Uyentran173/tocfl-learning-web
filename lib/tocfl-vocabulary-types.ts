export type TocflVocabularyRecord = {
  id: string;
  datasetId: string;
  source: "tocfl";
  learningPath: "band";
  band: string;
  levelId: string;
  globalSequence: number;
  levelSequence: number;
  traditional: string;
  simplified: string | null;
  pinyin: string | null;
  meaningVi: string | null;
  exampleTraditional?: string | null;
  exampleSimplified?: string | null;
  exampleVi?: string | null;
  exampleSource?: { kind: "tatoeba"; id: string; author: string };
  context: string | null;
  partOfSpeech: { raw: string | null; tags: string[] };
  sourceLocation: { sheet: string; row: number };
};

export type TocflVocabularyLevel = {
  id: string;
  label: string;
  labelZh: string;
  entryCount: number;
};

export type TocflVocabularyBand = {
  id: string;
  label: string;
  entryCount: number;
  coverageNote?: string;
  levels: TocflVocabularyLevel[];
};

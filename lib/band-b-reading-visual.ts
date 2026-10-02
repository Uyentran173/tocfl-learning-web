import type { Question } from "./tests";
import type { ImageCrop, ReadingVisual } from "./band-a-reading-visual";

type Source = { width: number; height: number; starts: number[] };
type Group = { first: number; last: number; traditional: Source; simplified: Source };
type Bounds = { x: number; y: number; width: number; height: number };

// Coordinates refer to the supplied source images. The same image remains shared
// by every question in a passage; only its visible viewport changes.
const groups: Group[] = [
  { first: 1, last: 5, traditional: { width: 1018, height: 1193, starts: [365, 365, 660, 660, 950] }, simplified: { width: 1018, height: 1216, starts: [385, 385, 680, 680, 975] } },
  { first: 6, last: 10, traditional: { width: 1001, height: 1197, starts: [365, 365, 660, 660, 950] }, simplified: { width: 1001, height: 1221, starts: [385, 385, 680, 680, 975] } },
  { first: 11, last: 15, traditional: { width: 1016, height: 1245, starts: [410, 410, 700, 700, 995] }, simplified: { width: 1016, height: 1273, starts: [430, 430, 725, 725, 1020] } },
  { first: 18, last: 19, traditional: { width: 1015, height: 988, starts: [450, 730] }, simplified: { width: 1016, height: 1021, starts: [485, 765] } },
  { first: 20, last: 21, traditional: { width: 1016, height: 940, starts: [400, 685] }, simplified: { width: 1016, height: 968, starts: [430, 715] } },
  { first: 22, last: 23, traditional: { width: 1016, height: 1013, starts: [475, 760] }, simplified: { width: 1016, height: 1072, starts: [535, 820] } },
  { first: 24, last: 25, traditional: { width: 1006, height: 1566, starts: [1028, 1310] }, simplified: { width: 975, height: 1515, starts: [980, 1265] } },
  { first: 26, last: 27, traditional: { width: 975, height: 1702, starts: [1163, 1445] }, simplified: { width: 921, height: 1573, starts: [1034, 1318] } },
  { first: 28, last: 29, traditional: { width: 939, height: 1673, starts: [1135, 1415] }, simplified: { width: 882, height: 1558, starts: [1020, 1306] } },
  { first: 30, last: 31, traditional: { width: 959, height: 1654, starts: [1113, 1398] }, simplified: { width: 967, height: 1661, starts: [1124, 1412] } },
  { first: 32, last: 33, traditional: { width: 1020, height: 1331, starts: [791, 1079] }, simplified: { width: 1021, height: 1304, starts: [768, 1054] } },
  { first: 34, last: 35, traditional: { width: 1020, height: 1615, starts: [1077, 1361] }, simplified: { width: 1015, height: 1577, starts: [1042, 1326] } },
  { first: 36, last: 37, traditional: { width: 1041, height: 1306, starts: [726, 1054] }, simplified: { width: 1041, height: 1306, starts: [728, 1056] } },
  { first: 38, last: 40, traditional: { width: 1017, height: 1365, starts: [495, 777, 1069] }, simplified: { width: 1017, height: 1403, starts: [532, 824, 1105] } },
  { first: 41, last: 43, traditional: { width: 1016, height: 1506, starts: [682, 970, 1251] }, simplified: { width: 1017, height: 1563, starts: [739, 1028, 1310] } },
  { first: 44, last: 46, traditional: { width: 1017, height: 1601, starts: [781, 1065, 1349] }, simplified: { width: 1017, height: 1667, starts: [850, 1131, 1412] } },
  { first: 47, last: 50, traditional: { width: 1014, height: 1973, starts: [870, 1142, 1432, 1715] }, simplified: { width: 1015, height: 2047, starts: [942, 1224, 1504, 1793] } },
];

// These groups contain an actual document that is needed to answer the question.
// Show its original pixels, ending before the printed question and choices.
const documentBounds: Record<number, { traditional: Bounds; simplified: Bounds }> = {
  24: { traditional: { x: 18, y: 73, width: 970, height: 897 }, simplified: { x: 48, y: 98, width: 910, height: 844 } },
  26: { traditional: { x: 45, y: 76, width: 912, height: 1050 }, simplified: { x: 18, y: 80, width: 888, height: 920 } },
  28: { traditional: { x: 18, y: 86, width: 904, height: 1045 }, simplified: { x: 85, y: 80, width: 782, height: 900 } },
  30: { traditional: { x: 18, y: 70, width: 923, height: 986 }, simplified: { x: 60, y: 89, width: 889, height: 950 } },
  32: { traditional: { x: 19, y: 99, width: 984, height: 649 }, simplified: { x: 22, y: 98, width: 981, height: 627 } },
  34: { traditional: { x: 19, y: 75, width: 984, height: 962 }, simplified: { x: 49, y: 73, width: 949, height: 924 } },
  36: { traditional: { x: 54, y: 108, width: 973, height: 580 }, simplified: { x: 55, y: 108, width: 970, height: 580 } },
};

export function isBandBDocumentQuestion(question: Question): boolean {
  if (question.section !== "reading" || !question.imageUrl?.startsWith("/tests/band-b-test-01/reading/assets/")) return false;
  const number = question.number ?? 0;
  return groups.some((group) => number >= group.first && number <= group.last && Boolean(documentBounds[group.first]));
}

function crop(source: Source, x: number, y: number, width: number, height: number): ImageCrop {
  return { x, y, width, height, sourceWidth: source.width, sourceHeight: source.height, maxWidth: 1000 };
}

export function getBandBReadingVisual(question: Question): ReadingVisual | null {
  if (question.section !== "reading" || !question.imageUrl?.startsWith("/tests/band-b-test-01/reading/assets/")) return null;
  const number = question.number ?? 0;
  const group = groups.find((item) => number >= item.first && number <= item.last);
  if (!group) return null;
  const source = question.script === "simplified" ? group.simplified : group.traditional;
  const document = documentBounds[group.first]?.[question.script === "simplified" ? "simplified" : "traditional"];
  if (document) return { sharedContextId: `${group.first}-${group.last}`, crops: [crop(source, document.x, document.y, document.width, document.height)] };
  const offset = number - group.first;
  const grid = group.first <= 15;
  const contextEnd = Math.min(...source.starts) - 18;
  let questionCrop: ImageCrop;
  if (grid) {
    const column = offset % 2;
    const row = Math.floor(offset / 2);
    const start = source.starts[offset] - 8;
    const next = source.starts[Math.min((row + 1) * 2, source.starts.length - 1)] ?? source.height;
    const end = row === 2 ? source.height : next - 20;
    const x = column === 0 ? 0 : Math.floor(source.width / 2);
    questionCrop = crop(source, x, start, source.width - x - (column === 0 ? Math.ceil(source.width / 2) : 0), end - start);
  } else {
    const start = source.starts[offset] - 8;
    const end = offset + 1 < source.starts.length ? source.starts[offset + 1] - 18 : source.height;
    questionCrop = crop(source, 0, start, source.width, end - start);
  }
  return { sharedContextId: `${group.first}-${group.last}`, crops: [crop(source, 0, 0, source.width, contextEnd), questionCrop] };
}

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const zipPath = resolve(process.argv[2] ?? resolve(root, "data/vocabulary/source/tocfl-vocabulary-by-band-20240923.zip"));
const outputPath = resolve(root, "data/vocabulary/tocfl-imported.json");

function zipBuffer(path) {
  return execFileSync("unzip", ["-p", zipPath, path], { maxBuffer: 20 * 1024 * 1024 });
}
function assert(value, message) {
  if (!value) throw new Error(message);
}
function jsonFromZip(path, manifest) {
  const buffer = zipBuffer(path);
  const listed = manifest.files.find((file) => file.path === path);
  assert(listed, `Thiếu ${path} trong manifest.`);
  assert(buffer.length === listed.size, `Kích thước ${path} không khớp manifest.`);
  assert(createHash("sha256").update(buffer).digest("hex") === listed.sha256, `SHA-256 của ${path} không khớp manifest.`);
  return JSON.parse(buffer.toString("utf8"));
}

const manifest = JSON.parse(zipBuffer("manifest.json").toString("utf8"));
const catalog = jsonFromZip("catalog.json", manifest);
const source = jsonFromZip("entries.json", manifest);
const supplemental = jsonFromZip("supplemental/cross-strait-terms.json", manifest);
assert(source.datasetId === catalog.datasetId, "Dataset ID trong catalog và entries không khớp.");
assert(Array.isArray(source.entries), "entries.json không có danh sách mục từ.");
assert(source.entries.length === catalog.counts.total, "Tổng số mục từ không khớp catalog.");

const levels = new Map(catalog.levels.map((level) => [level.id, level]));
const bands = new Map(catalog.bandMapping.bands.map((band) => [band.id, band]));
const ids = new Set();
const levelCounts = new Map();
const bandCounts = new Map();
const records = source.entries.map((entry, index) => {
  const level = levels.get(entry.levelId);
  assert(typeof entry.id === "string" && entry.id && !ids.has(entry.id), `ID trùng hoặc thiếu ở mục ${index + 1}.`);
  assert(level && bands.has(entry.bandId) && level.bandId === entry.bandId, `Band/level không khớp ở ${entry.id}.`);
  assert(entry.globalSequence === index + 1 && Number.isInteger(entry.levelSequence) && entry.levelSequence > 0, `Thứ tự không hợp lệ ở ${entry.id}.`);
  assert(typeof entry.traditional === "string" && entry.traditional.length > 0, `Thiếu chữ Phồn thể ở ${entry.id}.`);
  assert(entry.simplified == null || typeof entry.simplified === "string", `Chữ Giản thể không hợp lệ ở ${entry.id}.`);
  assert(entry.pinyin == null || typeof entry.pinyin === "string", `Pinyin không hợp lệ ở ${entry.id}.`);
  assert(entry.context == null || typeof entry.context === "string", `Ngữ cảnh không hợp lệ ở ${entry.id}.`);
  assert(entry.partOfSpeech && (entry.partOfSpeech.raw == null || typeof entry.partOfSpeech.raw === "string") && Array.isArray(entry.partOfSpeech.tags), `Từ loại không hợp lệ ở ${entry.id}.`);
  assert(entry.source && typeof entry.source.sheet === "string" && Number.isInteger(entry.source.row), `Nguồn không hợp lệ ở ${entry.id}.`);
  ids.add(entry.id);
  levelCounts.set(entry.levelId, (levelCounts.get(entry.levelId) ?? 0) + 1);
  bandCounts.set(entry.bandId, (bandCounts.get(entry.bandId) ?? 0) + 1);
  return {
    id: entry.id,
    datasetId: source.datasetId,
    source: "tocfl",
    learningPath: "band",
    band: entry.bandId,
    levelId: entry.levelId,
    globalSequence: entry.globalSequence,
    levelSequence: entry.levelSequence,
    traditional: entry.traditional,
    simplified: entry.simplified ?? null,
    pinyin: entry.pinyin ?? null,
    meaningVi: entry.meaningVi ?? null,
    context: entry.context ?? null,
    partOfSpeech: entry.partOfSpeech,
    sourceLocation: entry.source,
  };
});
for (const level of catalog.levels) assert(levelCounts.get(level.id) === level.entryCount, `Số mục từ của ${level.id} không khớp.`);
for (const band of catalog.bandMapping.bands) assert(bandCounts.get(band.id) === band.entryCount, `Số mục từ của ${band.id} không khớp.`);

let existing = { datasets: [], records: [] };
try { existing = JSON.parse(readFileSync(outputPath, "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }
const otherRecords = existing.records.filter((record) => record.datasetId !== source.datasetId);
const otherIds = new Set(otherRecords.map((record) => record.id));
for (const id of ids) assert(!otherIds.has(id), `ID ${id} đã thuộc một bộ dữ liệu khác.`);
const updated = {
  datasets: [...existing.datasets.filter((dataset) => dataset.datasetId !== source.datasetId), { datasetId: source.datasetId, catalog, supplemental }],
  records: [...otherRecords, ...records],
};
const temporaryPath = `${outputPath}.${process.pid}.tmp`;
writeFileSync(temporaryPath, JSON.stringify(updated));
renameSync(temporaryPath, outputPath);
console.log(`Đã nhập ${records.length} mục từ vào ${outputPath}; ${bands.size} Band, ${levels.size} cấp. Nhập lại cùng dataset sẽ thay thế bản cũ.`);

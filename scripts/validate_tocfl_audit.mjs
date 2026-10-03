import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { materializeStructuredTest, validateStructuredPackage } from "../lib/structured-tests.ts";

const [packagePath, assetsRoot, mode] = process.argv.slice(2);
if (!packagePath || !assetsRoot || !["full", "mapped"].includes(mode)) {
  throw new Error("Usage: node scripts/validate_tocfl_audit.mjs package.json assets-root full|mapped");
}
const data = JSON.parse(readFileSync(packagePath, "utf8"));
const prefix = `/tests/${data.exam.id}/`;
const assetExists = (path) => typeof path === "string" && path.startsWith(prefix) &&
  (existsSync(join(assetsRoot, path.slice(prefix.length))) || mode === "mapped" && path.includes("/listening/audio/"));
const errors = validateStructuredPackage(data, assetExists);
if (errors.length) throw new Error(errors.join("; "));
for (const variant of ["traditional", "simplified"]) {
  const exam = materializeStructuredTest(data, variant);
  if (exam.questions.length !== data.exam.totalQuestions || !exam.questions.every((question) =>
    Number.isInteger(question.correctAnswer) && question.correctAnswer >= 0 && question.correctAnswer < question.choices.length)) {
    throw new Error(`${variant} website materialization has missing questions or answers`);
  }
}
console.log(`${data.exam.id}: both website variants load`);

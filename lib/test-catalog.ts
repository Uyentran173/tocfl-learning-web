import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { selectTestScope, type MockTest, type ScriptVariant, type TestScope } from "./tests";
import { materializeStructuredTest, validateStructuredPackage, type StructuredPackage } from "./structured-tests";

const directory = join(process.cwd(), "data", "structured-tests");
export type TestRecord = { id: string; title: string; level: string; levelId: string; sections: ("reading" | "listening")[]; questionCount: number; test?: MockTest };
let cachedPackages: StructuredPackage[] | undefined;
const cachedValidity = new Map<string, boolean>();
const cachedVariants = new Map<string, MockTest>();

function readPackages(): StructuredPackage[] {
  if (process.env.NODE_ENV === "production" && cachedPackages) return cachedPackages;
  if (!existsSync(directory)) return [];
  const packages = readdirSync(directory).filter((file) => file.endsWith(".json")).sort().flatMap((file) => {
    try { return [JSON.parse(readFileSync(join(directory, file), "utf8")) as StructuredPackage]; }
    catch { return []; }
  });
  const unique = [...new Map(packages.filter((data) => data.exam?.id).map((data) => [data.exam.id, data])).values()];
  if (process.env.NODE_ENV === "production") cachedPackages = unique;
  return unique;
}

function assetExists(path: string) {
  return path.startsWith("/") && !path.includes("..") && existsSync(join(process.cwd(), "public", path.slice(1)));
}

function isValid(data: StructuredPackage): boolean {
  const id = data.exam?.id;
  if (process.env.NODE_ENV === "production" && cachedValidity.has(id)) return cachedValidity.get(id)!;
  const valid = validateStructuredPackage(data, assetExists).length === 0;
  if (process.env.NODE_ENV === "production") cachedValidity.set(id, valid);
  return valid;
}

export function getImportedTests(): TestRecord[] {
  return readPackages().map((data) => {
    const valid = isValid(data);
    const level = data.exam?.level === "Novice" ? "Band Novice" : data.exam?.level ?? "Band Novice";
    return { id: data.exam?.id ?? "", title: data.exam?.title ?? "Đề TOCFL", level, levelId: level.toLowerCase().replace(/^band\s+/, "").replace(/\s+/g, "-"), sections: data.exam?.componentOrder ?? [],
      questionCount: data.exam?.totalQuestions ?? 0, test: valid ? getTest(data.exam.id) : undefined };
  });
}

export function getTests(): MockTest[] { return getImportedTests().flatMap((record) => record.test ? [record.test] : []); }

export function getTest(id: string, script: ScriptVariant = "traditional", scope: TestScope = "full"): MockTest | undefined {
  const data = readPackages().find((item) => item.exam.id === id);
  if (!data || !isValid(data)) return undefined;
  const key = `${id}:${script}`;
  let variant = process.env.NODE_ENV === "production" ? cachedVariants.get(key) : undefined;
  if (!variant) {
    variant = materializeStructuredTest(data, script);
    if (process.env.NODE_ENV === "production") cachedVariants.set(key, variant);
  }
  return selectTestScope(variant, scope);
}

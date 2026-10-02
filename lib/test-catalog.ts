import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { selectTestScope, type MockTest, type ScriptVariant, type TestScope } from "./tests";
import { materializeStructuredTest, validateStructuredPackage, type StructuredPackage } from "./structured-tests";

const directory = join(process.cwd(), "data", "structured-tests");
export type TestRecord = { id: string; title: string; level: string; levelId: string; sections: ("reading" | "listening")[]; questionCount: number; test?: MockTest };

function readPackages(): StructuredPackage[] {
  if (!existsSync(directory)) return [];
  const packages = readdirSync(directory).filter((file) => file.endsWith(".json")).sort().flatMap((file) => {
    try { return [JSON.parse(readFileSync(join(directory, file), "utf8")) as StructuredPackage]; }
    catch { return []; }
  });
  return [...new Map(packages.filter((data) => data.exam?.id).map((data) => [data.exam.id, data])).values()];
}

function assetExists(path: string) {
  return path.startsWith("/") && !path.includes("..") && existsSync(join(process.cwd(), "public", path.slice(1)));
}

export function getImportedTests(): TestRecord[] {
  return readPackages().map((data) => {
    const valid = validateStructuredPackage(data, assetExists).length === 0;
    const level = data.exam?.level === "Novice" ? "Band Novice" : data.exam?.level ?? "Band Novice";
    return { id: data.exam?.id ?? "", title: data.exam?.title ?? "Đề TOCFL", level, levelId: level.toLowerCase().replace(/^band\s+/, "").replace(/\s+/g, "-"), sections: data.exam?.componentOrder ?? [],
      questionCount: data.exam?.totalQuestions ?? 0, test: valid ? materializeStructuredTest(data, "traditional") : undefined };
  });
}

export function getTests(): MockTest[] { return getImportedTests().flatMap((record) => record.test ? [record.test] : []); }

export function getTest(id: string, script: ScriptVariant = "traditional", scope: TestScope = "full"): MockTest | undefined {
  const data = readPackages().find((item) => item.exam.id === id);
  if (!data || validateStructuredPackage(data, assetExists).length) return undefined;
  return selectTestScope(materializeStructuredTest(data, script), scope);
}

import { getImportedTests } from "@/lib/test-catalog";
import TestLibrary from "@/components/TestLibrary";

export const dynamic = "force-dynamic";

export default function LibraryPage() {
  const records = getImportedTests().map(({ id, title, level, levelId, sections, questionCount, test }) => ({
    id, title, level, levelId, sections, questionCount, ready: Boolean(test),
  }));
  return <TestLibrary records={records} />;
}

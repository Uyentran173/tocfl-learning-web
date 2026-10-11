import { getImportedTests } from "@/lib/test-catalog";
import TestLibrary from "@/components/TestLibrary";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("Luyện đề TOCFL", "Chọn đề thi thử TOCFL theo Band, luyện nghe và đọc hoặc làm bài mô phỏng.", "/tocfl");

export default function LibraryPage() {
  const records = getImportedTests().map(({ id, title, level, levelId, sections, questionCount, test }) => ({
    id, title, level, levelId, sections, questionCount, ready: Boolean(test),
  }));
  return <TestLibrary records={records} />;
}

import type { Metadata } from "next";
import AccountDashboard from "@/components/AccountDashboard";
import { getImportedTests } from "@/lib/test-catalog";

export const metadata: Metadata = { title: "Hồ sơ học tập", robots: { index: false, follow: false } };
export default function AccountPage() {
  const tests = getImportedTests().map(({ id, title }) => ({ id, title }));
  return <AccountDashboard tests={tests} />;
}

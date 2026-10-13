import type { Metadata } from "next";
import LoginOptions from "@/components/LoginOptions";

export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false, follow: false } };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <main className="px-5 py-16 sm:py-24"><LoginOptions oauthError={params.error === "oauth"} /></main>;
}

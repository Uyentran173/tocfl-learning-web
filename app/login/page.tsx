import type { Metadata } from "next";
import LoginOptions from "@/components/LoginOptions";

export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false, follow: false } };

async function availableProviders() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { google: false, facebook: false };
  try {
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return { google: false, facebook: false };
    const settings: unknown = await response.json();
    const external = settings && typeof settings === "object" && "external" in settings ? settings.external : null;
    return {
      google: !!external && typeof external === "object" && "google" in external && external.google === true,
      facebook: !!external && typeof external === "object" && "facebook" in external && external.facebook === true,
    };
  } catch {
    return { google: false, facebook: false };
  }
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [params, providers] = await Promise.all([searchParams, availableProviders()]);
  return <main className="px-5 py-16 sm:py-24"><LoginOptions oauthError={params.error === "oauth"} providers={providers} /></main>;
}

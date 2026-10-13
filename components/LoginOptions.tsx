"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const facebookEnabled = process.env.NEXT_PUBLIC_FACEBOOK_OAUTH_ENABLED === "true";
export default function LoginOptions({ oauthError }: { oauthError: boolean }) {
  const router = useRouter();
  const { configured, user } = useAuth();
  const [busy, setBusy] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState<string | null>(oauthError ? "Đăng nhập chưa hoàn tất. Vui lòng thử lại." : null);
  useEffect(() => { if (user) router.replace("/account"); }, [router, user]);
  async function start(provider: "google" | "facebook") {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(provider);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError("Không thể mở trang đăng nhập. Vui lòng thử lại sau.");
      setBusy(null);
    }
  }
  return <div className="mx-auto w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-9">
    <p className="page-eyebrow">TÀI KHOẢN TAI WÉN</p>
    <h1 className="mt-3 text-3xl font-bold">Chào mừng bạn trở lại</h1>
    <p className="mt-3 text-sm leading-6 muted">Đăng nhập để lưu tiến độ học và luyện đề trên tài khoản của bạn.</p>
    <div className="mt-8 grid gap-3">
      <button type="button" className="button-primary w-full disabled:opacity-55" disabled={!configured || !!busy} onClick={() => void start("google")}>{busy === "google" ? "Đang chuyển tới Google…" : "Tiếp tục với Google"}</button>
      <button type="button" className="button-secondary w-full disabled:opacity-55" disabled={!configured || !facebookEnabled || !!busy} onClick={() => void start("facebook")}>Tiếp tục với Facebook</button>
      {!facebookEnabled && <p className="text-center text-xs muted">Đăng nhập Facebook sẽ mở khi được cấu hình.</p>}
      <div className="my-1 flex items-center gap-3 text-xs muted"><span className="h-px flex-1 bg-[var(--border)]" />hoặc<span className="h-px flex-1 bg-[var(--border)]" /></div>
      <Link href="/" className="button-secondary block text-center">Tiếp tục với tư cách khách</Link>
    </div>
    {!configured && <p className="mt-6 rounded-xl bg-[var(--brand-soft)] p-3 text-sm text-[var(--brand)]">Đăng nhập bằng tài khoản sẽ sớm được mở. Bạn vẫn có thể học và luyện đề với tư cách khách.</p>}
    {error && <p className="mt-5 text-sm text-red-700" role="alert">{error}</p>}
    <p className="mt-6 text-xs leading-5 muted">Tiến độ khách trên thiết bị này sẽ chỉ được chuyển vào tài khoản khi bạn chọn đồng bộ sau khi đăng nhập.</p>
  </div>;
}

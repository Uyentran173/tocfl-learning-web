"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import MascotSticker from "./MascotSticker";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useT } from "./PreferencesProvider";

type Provider = "google" | "facebook";

export default function LoginOptions({ oauthError, providers }: { oauthError: boolean; providers: { google: boolean; facebook: boolean } }) {
  const t = useT();
  const router = useRouter();
  const { configured, user } = useAuth();
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(oauthError ? "Đăng nhập chưa hoàn tất. Vui lòng thử lại." : null);

  useEffect(() => { if (user) router.replace("/account"); }, [router, user]);

  async function start(provider: Provider) {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Đăng nhập tạm thời chưa khả dụng. Bạn vẫn có thể học với tư cách khách.");
      return;
    }
    setBusy(provider);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError) throw authError;
    } catch {
      setError("Không thể mở trang đăng nhập. Vui lòng thử lại sau.");
      setBusy(null);
    }
  }

  return <div className="login-layout">
    <section className="login-card" aria-labelledby="login-title">
      <p className="page-eyebrow">{t("TÀI KHOẢN TAI WÉN")}</p>
      <h1 id="login-title">{t("Đăng nhập hoặc tạo tài khoản")}</h1>
      <p className="login-intro">{t("Tiếp tục với Google để lưu tiến độ học. Nếu bạn chưa có tài khoản, Tai Wén sẽ tạo tự động.")}</p>

      <div className="login-actions" aria-busy={!!busy}>
        <button type="button" className="login-provider" disabled={!configured || !providers.google || !!busy} onClick={() => void start("google")}>
          <span className="login-provider-mark login-provider-google" aria-hidden="true">G</span>
          <span>{t(busy === "google" ? "Đang chuyển tới Google…" : "Tiếp tục với Google")}</span>
          <span className="login-provider-arrow" aria-hidden="true">→</span>
        </button>
        {providers.facebook && <button type="button" className="login-provider" disabled={!configured || !!busy} onClick={() => void start("facebook")}>
          <span className="login-provider-mark login-provider-facebook" aria-hidden="true">f</span>
          <span>{t(busy === "facebook" ? "Đang chuyển tới Facebook…" : "Tiếp tục với Facebook")}</span>
          <span className="login-provider-arrow" aria-hidden="true">→</span>
        </button>}
      </div>

      {!configured && <p className="ui-alert mt-5" role="status">{t("Đăng nhập tạm thời chưa khả dụng. Bạn vẫn có thể học với tư cách khách.")}</p>}
      {configured && !providers.google && !providers.facebook && <p className="ui-alert mt-5" role="status">{t("Đăng nhập Google hiện chưa khả dụng. Bạn vẫn có thể học và luyện đề với tư cách khách.")}</p>}
      {error && <p className="ui-alert mt-5" data-variant="error" role="alert">{t(error)}</p>}

      <div className="login-divider"><span>{t("hoặc")}</span></div>
      <Link href="/" className="login-guest-link">{t("Tiếp tục với tư cách khách")} <span aria-hidden="true">→</span></Link>
      <p className="login-footnote">{t("Bạn có thể học ngay và đăng nhập sau. Tiến độ khách chỉ được gộp khi bạn đồng ý.")}</p>
    </section>

    <aside className="login-story" aria-label={t("Lợi ích của tài khoản Tai Wén")}>
      <p className="page-eyebrow">Tai Wén</p>
      <h2>{t("Học tiếp từ nơi bạn dừng lại.")}</h2>
      <p>{t("Lưu từ vựng, bài học và kết quả luyện đề để tiếp tục trên các thiết bị của bạn.")}</p>
      <div className="login-story-art" aria-hidden="true"><span>學</span><MascotSticker variant="study" decorative className="login-story-mascot" /></div>
    </aside>
  </div>;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AuthChangeEvent, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, supabaseConfigured } from "@/lib/supabase/client";
import { guestProgressNeedsMigration, loadAccountProgress, migrateGuestProgress, syncProgressEntry } from "@/lib/cloud-progress";
import { accountProgressKey, pendingProgressKeys, progressWriteEvent, setProgressUser } from "@/lib/progress-storage";

type AuthState = {
  user: User | null;
  ready: boolean;
  configured: boolean;
  syncError: string | null;
  guestMigrationAvailable: boolean;
  migrateGuest: () => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthState | null>(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider chưa được khởi tạo.");
  return value;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabaseConfigured);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [guestMigrationAvailable, setGuestMigrationAvailable] = useState(false);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const initialization = useRef(0);

  const initialize = useCallback(async () => {
    const run = ++initialization.current;
    if (!supabase) { setProgressUser(null); setReady(true); return; }
    const { data, error } = await supabase.auth.getUser();
    if (run !== initialization.current) return;
    if (error || !data.user) {
      setProgressUser(null);
      setUser(null);
      setReady(true);
      return;
    }
    const active = data.user;
    try {
      await loadAccountProgress(active.id);
      if (run !== initialization.current) return;
      setSyncError(null);
    } catch {
      if (run !== initialization.current) return;
      // Retain the per-account device copy if the network or schema is unavailable.
      setSyncError("Chưa đồng bộ được tiến độ. Dữ liệu trên thiết bị này vẫn được giữ lại.");
    }
    setProgressUser(active.id);
    setUser(active);
    setGuestMigrationAvailable(guestProgressNeedsMigration(active.id));
    setReady(true);
    const name = active.user_metadata?.full_name ?? active.user_metadata?.name;
    const avatar = active.user_metadata?.avatar_url;
    void supabase.from("profiles").upsert({
      user_id: active.id, display_name: typeof name === "string" ? name : null,
      avatar_url: typeof avatar === "string" ? avatar : null,
    }, { onConflict: "user_id" });
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void initialize(); }, 0);
    if (!supabase) return () => window.clearTimeout(timer);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        window.setTimeout(() => { void initialize(); }, 0);
      }
    });
    return () => { window.clearTimeout(timer); subscription.unsubscribe(); };
  }, [initialize, supabase]);

  useEffect(() => {
    const timers = new Map<string, number>();
    const inFlight = new Map<string, Promise<void>>();
    const onWrite = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string; key: string; value: string | null }>).detail;
      if (!detail || detail.userId !== user?.id) return;
      const previous = timers.get(detail.key);
      if (previous) window.clearTimeout(previous);
      timers.set(detail.key, window.setTimeout(() => {
        timers.delete(detail.key);
        const previousWrite = inFlight.get(detail.key) ?? Promise.resolve();
        const nextWrite = previousWrite.catch(() => {}).then(() => syncProgressEntry(detail.userId, detail.key, detail.value));
        inFlight.set(detail.key, nextWrite);
        void nextWrite.then(() => setSyncError(null))
          .catch(() => setSyncError("Chưa đồng bộ được một thay đổi. Dữ liệu vẫn còn trên thiết bị này và sẽ thử lại khi bạn mở lại trang."))
          .finally(() => { if (inFlight.get(detail.key) === nextWrite) inFlight.delete(detail.key); });
      }, 350));
    };
    window.addEventListener(progressWriteEvent, onWrite);
    // Catch edits made while the account view was mounting, before the listener existed.
    if (user?.id) {
      for (const key of pendingProgressKeys(user.id)) {
        onWrite(new CustomEvent(progressWriteEvent, { detail: {
          userId: user.id, key, value: window.localStorage.getItem(accountProgressKey(user.id, key)),
        } }));
      }
    }
    return () => { window.removeEventListener(progressWriteEvent, onWrite); for (const timer of timers.values()) window.clearTimeout(timer); };
  }, [user?.id]);

  const migrateGuest = useCallback(async () => {
    if (!user) return;
    await migrateGuestProgress(user.id);
    setGuestMigrationAvailable(false);
    setSyncError(null);
    window.location.reload();
  }, [user]);

  const signOut = useCallback(async () => {
    initialization.current++;
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
    setProgressUser(null);
    setUser(null);
    router.replace("/");
    router.refresh();
  }, [router, supabase]);

  const value: AuthState = { user, ready, configured: supabaseConfigured, syncError, guestMigrationAvailable, migrateGuest, signOut };
  return <AuthContext.Provider value={value}>{ready ? <div key={user?.id ?? "guest"} className="contents">{children}</div> : <main className="mx-auto max-w-4xl px-6 py-20 text-center" role="status">Đang mở Tai Wén…</main>}</AuthContext.Provider>;
}

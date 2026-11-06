"use client";

import { usePreferences } from "./PreferencesProvider";
import { isUiLocale, type ThemePreference, type UiLocale } from "@/lib/i18n";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AuthChangeEvent, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, supabaseConfigured } from "@/lib/supabase/client";
import { guestProgressNeedsMigration, loadAccountProgress, migrateGuestProgress, ProgressConflictError, resolveProgressConflict, syncProgressEntry } from "@/lib/cloud-progress";
import { accountProgressKey, pendingProgressKeys, progressWriteEvent, setProgressUser } from "@/lib/progress-storage";

type AuthState = {
  user: User | null;
  ready: boolean;
  configured: boolean;
  syncError: string | null;
  syncing: boolean;
  displayName: string | null;
  updateDisplayName: (name: string) => Promise<void>;
  savePreference: (key: "ui_locale" | "theme", value: UiLocale | ThemePreference) => Promise<void>;
  conflicts: string[];
  resolveConflict: (key: string, choice: "cloud" | "device") => Promise<void>;
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
  const { t, locale, theme, setLocale, setTheme } = usePreferences();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabaseConfigured);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncingCount, setSyncingCount] = useState(0);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [guestMigrationAvailable, setGuestMigrationAvailable] = useState(false);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const initialization = useRef(0);
  const profileWrites = useRef(new Map<string, Promise<void>>());
  const preferenceRef = useRef({ locale, theme });
  preferenceRef.current = { locale, theme };

  const flushProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    const previous = profileWrites.current.get(userId) ?? Promise.resolve();
    const next = previous.catch(() => {}).then(async () => {
      const pendingKey = `taiwen:profile-pending:${userId}`;
      const pending = window.localStorage.getItem(pendingKey);
      if (!pending) return;
      const fields = JSON.parse(pending) as Record<string, string>;
      const { error } = await supabase.from("profiles").upsert({ user_id: userId, ...fields }, { onConflict: "user_id" });
      if (error) throw error;
      if (window.localStorage.getItem(pendingKey) === pending) window.localStorage.removeItem(pendingKey);
    });
    profileWrites.current.set(userId, next);
    try { await next; } finally { if (profileWrites.current.get(userId) === next) profileWrites.current.delete(userId); }
  }, [supabase]);

  const saveProfileFields = useCallback(async (fields: Record<string, string>) => {
    if (!user || !supabase) return;
    const pendingKey = `taiwen:profile-pending:${user.id}`;
    const previous = window.localStorage.getItem(pendingKey);
    window.localStorage.setItem(pendingKey, JSON.stringify({ ...(previous ? JSON.parse(previous) : {}), ...fields }));
    await flushProfile(user.id);
  }, [user, supabase, flushProfile]);

  const savePreference = useCallback(async (key: "ui_locale" | "theme", value: UiLocale | ThemePreference) => {
    await saveProfileFields({ [key]: value });
  }, [saveProfileFields]);

  const updateDisplayName = useCallback(async (name: string) => {
    const clean = name.trim();
    if (!clean || clean.length > 100) throw new Error("Tên hiển thị cần từ 1 đến 100 ký tự.");
    await saveProfileFields({ display_name: clean });
    setDisplayName(clean);
  }, [saveProfileFields]);

  const initialize = useCallback(async () => {
    const run = ++initialization.current;
    if (!supabase) { setProgressUser(null); setReady(true); return; }
    const { data, error } = await supabase.auth.getUser();
    if (run !== initialization.current) return;
    if (error || !data.user) {
      setProgressUser(null);
      setUser(null);
      setDisplayName(null);
      setReady(true);
      return;
    }
    const active = data.user;
    const fallbackName = active.user_metadata?.full_name ?? active.user_metadata?.name;
    const fallbackAvatar = active.user_metadata?.avatar_url;
    const { data: existingProfile, error: profileError } = await supabase.from("profiles")
      .select("display_name,avatar_url,ui_locale,theme").eq("user_id", active.id).maybeSingle();
    if (run !== initialization.current) return;
    setDisplayName(typeof fallbackName === "string" ? fallbackName : null);
    if (!profileError) {
      if (!existingProfile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          user_id: active.id,
          display_name: typeof fallbackName === "string" ? fallbackName : null,
          avatar_url: typeof fallbackAvatar === "string" ? fallbackAvatar : null,
          ui_locale: preferenceRef.current.locale,
          theme: preferenceRef.current.theme,
        });
        if (insertError && insertError.code !== "23505") setSyncError("Chưa lưu được hồ sơ. Sẽ thử lại khi kết nối ổn định.");
      } else {
        setDisplayName(existingProfile.display_name ?? null);
        const hasPending = !!window.localStorage.getItem(`taiwen:profile-pending:${active.id}`);
        if (!hasPending) {
          if (isUiLocale(existingProfile.ui_locale)) setLocale(existingProfile.ui_locale);
          if (existingProfile.theme === "light" || existingProfile.theme === "dark" || existingProfile.theme === "system") setTheme(existingProfile.theme);
        }
      }
      void flushProfile(active.id).catch(() => setSyncError("Chưa đồng bộ được cài đặt tài khoản. Dữ liệu trên thiết bị vẫn được giữ."));
    }
    try {
      await loadAccountProgress(active.id);
      if (run !== initialization.current) return;
      setSyncError(null);
    } catch (error) {
      if (run !== initialization.current) return;
      // Retain the per-account device copy if the network or schema is unavailable.
      if (error instanceof ProgressConflictError) setConflicts((current) => [...new Set([...current, error.storageKey])]);
      setSyncError(error instanceof ProgressConflictError
        ? "Tiến độ này đã thay đổi trên thiết bị khác. Hãy chọn bản muốn giữ trong hồ sơ."
        : "Chưa đồng bộ được tiến độ. Dữ liệu trên thiết bị này vẫn được giữ lại.");
    }
    setProgressUser(active.id);
    setUser(active);
    setGuestMigrationAvailable(guestProgressNeedsMigration(active.id));
    setReady(true);
  }, [supabase, setLocale, setTheme, flushProfile]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void initialize(); }, 0);
    if (!supabase) return () => window.clearTimeout(timer);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        window.setTimeout(() => { void initialize(); }, 0);
      }
    });
    const onOnline = () => { void initialize(); };
    window.addEventListener("online", onOnline);
    return () => { window.clearTimeout(timer); subscription.unsubscribe(); window.removeEventListener("online", onOnline); };
  }, [initialize, supabase]);

  useEffect(() => {
    const timers = new Map<string, number>();
    const inFlight = new Map<string, Promise<void>>();
    const onWrite = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string; key: string; value: string | null }>).detail;
      if (!detail || detail.userId !== user?.id || conflicts.includes(detail.key)) return;
      const previous = timers.get(detail.key);
      if (previous) window.clearTimeout(previous);
      timers.set(detail.key, window.setTimeout(() => {
        timers.delete(detail.key);
        setSyncingCount((count) => count + 1);
        const previousWrite = inFlight.get(detail.key) ?? Promise.resolve();
        const nextWrite = previousWrite.catch(() => {}).then(() => syncProgressEntry(detail.userId, detail.key, detail.value));
        inFlight.set(detail.key, nextWrite);
        void nextWrite.then(() => setSyncError(null))
          .catch((error) => {
            if (error instanceof ProgressConflictError) {
              setConflicts((current) => [...new Set([...current, error.storageKey])]);
              setSyncError("Tiến độ này đã thay đổi trên thiết bị khác. Hãy chọn bản muốn giữ trong hồ sơ.");
            } else setSyncError("Chưa đồng bộ được một thay đổi. Dữ liệu vẫn còn trên thiết bị này và sẽ thử lại khi có mạng.");
          })
          .finally(() => { setSyncingCount((count) => Math.max(0, count - 1)); if (inFlight.get(detail.key) === nextWrite) inFlight.delete(detail.key); });
      }, 350));
    };
    window.addEventListener(progressWriteEvent, onWrite);
    const retryPending = () => {
      if (!user?.id || !navigator.onLine) return;
      for (const key of pendingProgressKeys(user.id)) {
        if (inFlight.has(key) || timers.has(key) || conflicts.includes(key)) continue;
        onWrite(new CustomEvent(progressWriteEvent, { detail: {
          userId: user.id, key, value: window.localStorage.getItem(accountProgressKey(user.id, key)),
        } }));
      }
    };
    window.addEventListener("online", retryPending);
    const retryProfile = () => { if (user?.id && navigator.onLine) void flushProfile(user.id).catch(() => {}); };
    window.addEventListener("online", retryProfile);
    const retryInterval = window.setInterval(retryPending, 30_000);
    const profileInterval = window.setInterval(retryProfile, 30_000);
    // Catch edits made while the account view was mounting, before the listener existed.
    if (user?.id) {
      retryPending();
    }
    return () => { window.removeEventListener(progressWriteEvent, onWrite); window.removeEventListener("online", retryPending); window.removeEventListener("online", retryProfile); window.clearInterval(retryInterval); window.clearInterval(profileInterval); for (const timer of timers.values()) window.clearTimeout(timer); };
  }, [user?.id, conflicts, flushProfile]);

  const resolveConflict = useCallback(async (key: string, choice: "cloud" | "device") => {
    if (!user) return;
    await resolveProgressConflict(user.id, key, choice);
    setConflicts((current) => current.filter((item) => item !== key));
    setSyncError(null);
    window.location.reload();
  }, [user]);

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
    setDisplayName(null);
    setConflicts([]);
    router.replace("/");
    router.refresh();
  }, [router, supabase]);

  const value: AuthState = { user, ready, configured: supabaseConfigured, syncError, syncing: syncingCount > 0, displayName, updateDisplayName, savePreference, conflicts, resolveConflict, guestMigrationAvailable, migrateGuest, signOut };
  return <AuthContext.Provider value={value}>{ready ? <div key={user?.id ?? "guest"} className="contents">{children}</div> : <main className="mx-auto max-w-4xl px-6 py-20 text-center" role="status">{t("Đang mở Tai Wén…")}</main>}</AuthContext.Provider>;
}

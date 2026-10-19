"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isUiLocale, localizedDocumentTitle, translate, type ThemePreference, type UiLocale } from "@/lib/i18n";

type Preferences = {
  locale: UiLocale;
  theme: ThemePreference;
  setLocale: (locale: UiLocale) => void;
  setTheme: (theme: ThemePreference) => void;
  t: (message: string) => string;
};

const Context = createContext<Preferences | null>(null);
const preferenceChangedEvent = "taiwen:preferences-changed";

function subscribePreferences(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(preferenceChangedEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(preferenceChangedEvent, onChange);
  };
}

function storedPreference(key: string, cookieName: string): string | null {
  try { return localStorage.getItem(key) ?? document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]+)`))?.[1] ?? null; }
  catch { return document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]+)`))?.[1] ?? null; }
}

function getLocaleSnapshot(): UiLocale {
  const stored = storedPreference("taiwen:ui-locale", "taiwen-ui-locale");
  return isUiLocale(stored) ? stored : "vi";
}

function getThemeSnapshot(): ThemePreference {
  const stored = storedPreference("taiwen:theme", "taiwen-theme");
  return stored === "light" || stored === "dark" ? stored : "system";
}

function savePreference(key: string, cookieName: string, value: string) {
  document.cookie = `${cookieName}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  try { localStorage.setItem(key, value); } catch { /* Cookie persistence still works. */ }
  window.dispatchEvent(new Event(preferenceChangedEvent));
}

export function usePreferences(): Preferences {
  const value = useContext(Context);
  if (!value) throw new Error("PreferencesProvider is missing");
  return value;
}

export function useT() { return usePreferences().t; }

export default function PreferencesProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const locale = useSyncExternalStore<UiLocale>(subscribePreferences, getLocaleSnapshot, () => "vi");
  const theme = useSyncExternalStore<ThemePreference>(subscribePreferences, getThemeSnapshot, () => "system");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const title = localizedDocumentTitle(locale, pathname);
    if (title) document.title = title;
  }, [locale, pathname]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const current = getThemeSnapshot();
      document.documentElement.dataset.theme = current === "system" ? (media.matches ? "dark" : "light") : current;
      document.documentElement.style.colorScheme = document.documentElement.dataset.theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const value = useMemo<Preferences>(() => ({
    locale, theme,
    setLocale(next) { savePreference("taiwen:ui-locale", "taiwen-ui-locale", next); },
    setTheme(next) { savePreference("taiwen:theme", "taiwen-theme", next); },
    t(message) { return translate(locale, message); },
  }), [locale, theme]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

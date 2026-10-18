"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { localizedDocumentTitle, translate, type ThemePreference, type UiLocale } from "@/lib/i18n";

type Preferences = {
  locale: UiLocale;
  theme: ThemePreference;
  setLocale: (locale: UiLocale) => void;
  setTheme: (theme: ThemePreference) => void;
  t: (message: string) => string;
};

const Context = createContext<Preferences | null>(null);

export function usePreferences(): Preferences {
  const value = useContext(Context);
  if (!value) throw new Error("PreferencesProvider is missing");
  return value;
}

export function useT() { return usePreferences().t; }

export default function PreferencesProvider({ children, initialLocale, initialTheme }: { children: ReactNode; initialLocale: UiLocale; initialTheme: ThemePreference }) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState(initialLocale);
  const [theme, setThemeState] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `taiwen-ui-locale=${encodeURIComponent(locale)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    localStorage.setItem("taiwen:ui-locale", locale);
  }, [locale]);

  useEffect(() => {
    const title = localizedDocumentTitle(locale, pathname);
    if (title) document.title = title;
  }, [locale, pathname]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.style.colorScheme = document.documentElement.dataset.theme;
    };
    apply();
    media.addEventListener("change", apply);
    document.cookie = `taiwen-theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
    localStorage.setItem("taiwen:theme", theme);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const value = useMemo<Preferences>(() => ({
    locale, theme,
    setLocale(next) {
      document.cookie = `taiwen-ui-locale=${encodeURIComponent(next)}; Path=/; Max-Age=31536000; SameSite=Lax`;
      setLocaleState(next);
      router.refresh();
    },
    setTheme: setThemeState,
    t(message) { return translate(locale, message); },
  }), [locale, theme, router]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

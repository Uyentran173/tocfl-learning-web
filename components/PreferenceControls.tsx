"use client";

import { localeNames, uiLocales, type ThemePreference, type UiLocale } from "@/lib/i18n";
import { usePreferences } from "./PreferencesProvider";

export default function PreferenceControls({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, theme, setTheme, t } = usePreferences();
  return <div className={compact ? "site-preferences site-preferences-mobile" : "site-preferences"}>
    <label className="site-preference">
      <span className="site-preference-icon" aria-hidden="true">文</span>
      <span className="sr-only">{t("Ngôn ngữ")}</span>
      <select aria-label={t("Ngôn ngữ")} value={locale} onChange={(event) => setLocale(event.target.value as UiLocale)}>
        {uiLocales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}
      </select>
    </label>
    <label className="site-preference">
      <span className="site-preference-icon" aria-hidden="true">◐</span>
      <span className="sr-only">{t("Giao diện")}</span>
      <select aria-label={t("Giao diện")} value={theme} onChange={(event) => setTheme(event.target.value as ThemePreference)}>
        <option value="light">{t("Sáng")}</option>
        <option value="dark">{t("Tối")}</option>
        <option value="system">{t("Theo hệ thống")}</option>
      </select>
    </label>
  </div>;
}

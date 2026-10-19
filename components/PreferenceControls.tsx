"use client";

import { useEffect, useRef, useState } from "react";
import { localeNames, uiLocales, type ThemePreference, type UiLocale } from "@/lib/i18n";
import { usePreferences } from "./PreferencesProvider";

type PreferenceOption<Value extends string> = { value: Value; label: string };

function PreferenceMenu<Value extends string>({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: string;
  value: Value;
  options: PreferenceOption<Value>[];
  onChange: (value: Value) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const focusOption = (index: number) => requestAnimationFrame(() => optionRefs.current[index]?.focus());
  const selectedIndex = options.findIndex((option) => option.value === value);

  return <div className="site-preference" ref={rootRef} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button
      ref={triggerRef}
      type="button"
      className="site-preference-trigger"
      aria-label={`${label}: ${options[selectedIndex]?.label ?? ""}`}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
          focusOption(Math.max(0, selectedIndex));
        }
      }}
    >
      <span className="site-preference-icon" aria-hidden="true">{icon}</span>
      <span className="site-preference-value">{options[selectedIndex]?.label}</span>
      <span className="site-preference-chevron" aria-hidden="true">⌄</span>
    </button>
    {open && <div className="site-preference-list" role="menu" aria-label={label} onKeyDown={(event) => {
      const current = optionRefs.current.findIndex((option) => option === document.activeElement);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        optionRefs.current[(current + options.length + (event.key === "ArrowDown" ? 1 : -1)) % options.length]?.focus();
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        optionRefs.current[event.key === "Home" ? 0 : options.length - 1]?.focus();
      }
    }}>
      {options.map((option, index) => <button
        key={option.value}
        ref={(element) => { optionRefs.current[index] = element; }}
        type="button"
        role="menuitemradio"
        aria-checked={option.value === value}
        className="site-preference-option"
        onClick={(event) => {
          onChange(option.value);
          setOpen(false);
          if (event.detail === 0) triggerRef.current?.focus();
        }}
      >{option.label}<span aria-hidden="true">{option.value === value ? "✓" : ""}</span></button>)}
    </div>}
  </div>;
}

export default function PreferenceControls({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, theme, setTheme, t } = usePreferences();
  return <div className={compact ? "site-preferences site-preferences-mobile" : "site-preferences"}>
    <PreferenceMenu label={t("Ngôn ngữ")} icon="文" value={locale} options={uiLocales.map((item) => ({ value: item, label: localeNames[item] }))} onChange={(value: UiLocale) => setLocale(value)} />
    <PreferenceMenu label={t("Giao diện")} icon="◐" value={theme} options={([
      { value: "light", label: t("Sáng") },
      { value: "dark", label: t("Tối") },
      { value: "system", label: t("Theo hệ thống") },
    ] satisfies PreferenceOption<ThemePreference>[])} onChange={(value: ThemePreference) => setTheme(value)} />
  </div>;
}

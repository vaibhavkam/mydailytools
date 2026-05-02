"use client";

import { useEffect, useState } from "react";

// A locale entry pairs a BCP-47 locale tag with a default currency. Users can
// override by switching locale; the locale's defaults travel together.
export type LocaleOption = {
  id: string;          // unique key
  label: string;       // visible name in the picker
  bcp47: string;       // passed to Intl APIs
  currency: string;    // ISO 4217 default
};

export const LOCALES: LocaleOption[] = [
  { id: "en-US", label: "🇺🇸 English (US) — USD", bcp47: "en-US", currency: "USD" },
  { id: "en-GB", label: "🇬🇧 English (UK) — GBP", bcp47: "en-GB", currency: "GBP" },
  { id: "en-CA", label: "🇨🇦 English (CA) — CAD", bcp47: "en-CA", currency: "CAD" },
  { id: "en-AU", label: "🇦🇺 English (AU) — AUD", bcp47: "en-AU", currency: "AUD" },
  { id: "en-IN", label: "🇮🇳 English (IN) — INR", bcp47: "en-IN", currency: "INR" },
  { id: "de-DE", label: "🇩🇪 Deutsch (DE) — EUR", bcp47: "de-DE", currency: "EUR" },
  { id: "fr-FR", label: "🇫🇷 Français (FR) — EUR", bcp47: "fr-FR", currency: "EUR" },
  { id: "es-ES", label: "🇪🇸 Español (ES) — EUR", bcp47: "es-ES", currency: "EUR" },
  { id: "it-IT", label: "🇮🇹 Italiano (IT) — EUR", bcp47: "it-IT", currency: "EUR" },
  { id: "ja-JP", label: "🇯🇵 日本語 (JP) — JPY", bcp47: "ja-JP", currency: "JPY" },
  { id: "zh-CN", label: "🇨🇳 中文 (CN) — CNY", bcp47: "zh-CN", currency: "CNY" },
  { id: "pt-BR", label: "🇧🇷 Português (BR) — BRL", bcp47: "pt-BR", currency: "BRL" },
];

const STORAGE_KEY = "mdt:locale";
const DEFAULT_LOCALE: LocaleOption = LOCALES[0];

function detectInitial(): LocaleOption {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const hit = LOCALES.find((l) => l.id === saved);
      if (hit) return hit;
    }
    // Fall back to navigator.language. Match exactly first, then by language part.
    const nav = navigator.language;
    const exact = LOCALES.find((l) => l.bcp47 === nav);
    if (exact) return exact;
    const lang = nav.split("-")[0];
    const byLang = LOCALES.find((l) => l.bcp47.startsWith(lang + "-"));
    if (byLang) return byLang;
  } catch { /* localStorage may be disabled */ }
  return DEFAULT_LOCALE;
}

// Hook: subscribe a component to the user's chosen locale + currency, and a
// small set of formatters that use them. Re-renders when the user picks a new
// locale via the header dropdown.
export function useLocale() {
  const [locale, setLocaleState] = useState<LocaleOption>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(detectInitial());
    function onChange(e: Event) {
      const detail = (e as CustomEvent<LocaleOption>).detail;
      if (detail) setLocaleState(detail);
    }
    window.addEventListener("mdt:locale-change", onChange as EventListener);
    return () => window.removeEventListener("mdt:locale-change", onChange as EventListener);
  }, []);

  function setLocale(opt: LocaleOption) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, opt.id);
    setLocaleState(opt);
    // Broadcast so every other mounted hook updates without a page refresh.
    window.dispatchEvent(new CustomEvent("mdt:locale-change", { detail: opt }));
  }

  function fmtCurrency(n: number, currencyOverride?: string) {
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString(locale.bcp47, {
      style: "currency",
      currency: currencyOverride ?? locale.currency,
    });
  }

  function fmtNumber(n: number, opts?: Intl.NumberFormatOptions) {
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString(locale.bcp47, opts);
  }

  function fmtDate(d: Date | string, opts?: Intl.DateTimeFormatOptions) {
    const date = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(locale.bcp47, opts ?? { dateStyle: "medium" }).format(date);
  }

  // Pull just the currency symbol/glyph for use in input labels like "Price ($)".
  // Intl returns e.g. "$0.00" for USD, "₹0.00" for INR, "€0.00" for EUR; the
  // currency symbol is whatever non-digit prefix/suffix is left after stripping.
  function currencySymbol(currencyOverride?: string) {
    try {
      const formatted = (0).toLocaleString(locale.bcp47, {
        style: "currency",
        currency: currencyOverride ?? locale.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      // Strip digits, spaces, and the literal zero. What remains is the symbol.
      return formatted.replace(/[\s 0-9]/g, "");
    } catch {
      return currencyOverride ?? locale.currency;
    }
  }

  return { locale, setLocale, fmtCurrency, fmtNumber, fmtDate, currencySymbol };
}

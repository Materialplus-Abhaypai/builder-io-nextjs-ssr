"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Locale = string;

const DEFAULT_LOCALE: Locale = "en";
const SUPPORTED: Locale[] = (process.env.NEXT_PUBLIC_LOCALES || "en,fr").split(",").map((l) => l.trim()).filter(Boolean);

function normalizeLocale(l: string | null | undefined): Locale {
  const base = (l || "").split("-")[0].toLowerCase();
  if (SUPPORTED.includes(base)) return base;
  return DEFAULT_LOCALE;
}

const Ctx = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({ locale: DEFAULT_LOCALE, setLocale: () => {} });

export function useLocale() {
  return useContext(Ctx);
}

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const ls = typeof window !== "undefined" ? window.localStorage.getItem("locale") : null;
    const nav = typeof navigator !== "undefined" ? navigator.language : undefined;
    const initial = normalizeLocale(ls || nav || DEFAULT_LOCALE);
    setLocaleState(initial);
  }, []);

  const setLocale = (l: Locale) => {
    const norm = normalizeLocale(l);
    setLocaleState(norm);
    if (typeof window !== "undefined") window.localStorage.setItem("locale", norm);
  };

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

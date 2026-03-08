"use client";

import { createContext, useContext, useCallback, useState, useTransition } from "react";
import type { Dictionary } from "./types";
import type { Locale } from "./shared";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale: initialLocale,
  dict: initialDict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [dict, setDict] = useState(initialDict);
  const [, startTransition] = useTransition();

  const setLocale = useCallback(
    (newLocale: Locale) => {
      document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      setLocaleState(newLocale);

      startTransition(async () => {
        const mod = await import(`./locales/${newLocale}`);
        setDict(mod.default);
      });

      // Reload to update server components
      window.location.reload();
    },
    []
  );

  return (
    <I18nContext.Provider value={{ locale, dict, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useDict() {
  return useI18n().dict;
}

export function useLocale() {
  return useI18n().locale;
}

"use client";

import { useI18n } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/shared";
import { LOCALES } from "@/lib/i18n/shared";

const FLAGS: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  fr: "FR",
};

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-0.5">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => { if (l !== locale) setLocale(l); }}
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
            l === locale
              ? "bg-swing-gold text-swing-navy"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          {FLAGS[l]}
        </button>
      ))}
    </div>
  );
}

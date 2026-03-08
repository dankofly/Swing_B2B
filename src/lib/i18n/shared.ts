export type Locale = "de" | "en" | "fr";
export const LOCALES: Locale[] = ["de", "en", "fr"];
export const DEFAULT_LOCALE: Locale = "de";

const LOCALE_LABELS: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
};

export function getLocaleLabel(locale: Locale): string {
  return LOCALE_LABELS[locale];
}

export function getDateLocale(locale: Locale): string {
  const map: Record<Locale, string> = {
    de: "de-DE",
    en: "en-GB",
    fr: "fr-FR",
  };
  return map[locale];
}

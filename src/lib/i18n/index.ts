import "server-only";

import { cookies } from "next/headers";
import type { Dictionary } from "./types";
import { DEFAULT_LOCALE, LOCALES } from "./shared";
import type { Locale } from "./shared";

export { type Locale, LOCALES, DEFAULT_LOCALE, getLocaleLabel, getDateLocale } from "./shared";
export type { Dictionary };

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("locale")?.value;
  if (raw && LOCALES.includes(raw as Locale)) return raw as Locale;
  return DEFAULT_LOCALE;
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  de: () => import("./locales/de").then((m) => m.default),
  en: () => import("./locales/en").then((m) => m.default),
  fr: () => import("./locales/fr").then((m) => m.default),
};

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  const l = locale ?? (await getLocale());
  return dictionaries[l]();
}

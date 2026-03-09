import type { Locale } from "./shared";
import { DEFAULT_LOCALE } from "./shared";

/**
 * Pick the locale-specific field from a DB record.
 * Falls back to the default (German) value if the translation is missing.
 *
 * Usage:
 *   localized(product, "name", locale)        → product.name_en || product.name
 *   localized(category, "name", locale)        → category.name_fr || category.name
 *   localized(product, "description", locale)  → product.description_en || product.description
 */
export function localized<T extends Record<string, unknown>>(
  record: T,
  field: string,
  locale: Locale
): string | null {
  if (locale === DEFAULT_LOCALE) {
    return (record[field] as string | null) ?? null;
  }
  const localizedKey = `${field}_${locale}`;
  const value = record[localizedKey] as string | null | undefined;
  return value || ((record[field] as string | null) ?? null);
}

import { getActiveNews } from "@/lib/actions/news";
import { getLocale } from "@/lib/i18n";
import NewsTicker from "./NewsTicker";

export default async function NewsTickerWrapper() {
  const [items, locale] = await Promise.all([getActiveNews(), getLocale()]);

  if (!items || items.length === 0) return null;

  // Pick locale-specific message with fallback to German
  const localized = items.map((item) => ({
    id: item.id,
    message:
      (locale === "en" && item.message_en) ||
      (locale === "fr" && item.message_fr) ||
      item.message,
  }));

  return <NewsTicker items={localized} />;
}

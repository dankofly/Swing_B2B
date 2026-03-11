import { getActiveNews } from "@/lib/actions/news";
import NewsTicker from "./NewsTicker";

export default async function NewsTickerWrapper() {
  const items = await getActiveNews();

  if (!items || items.length === 0) return null;

  return <NewsTicker items={items} />;
}

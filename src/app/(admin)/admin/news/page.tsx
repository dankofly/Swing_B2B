import { getAllNews } from "@/lib/actions/news";
import NewsManager from "./NewsManager";

export default async function NewsPage() {
  const news = await getAllNews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-swing-navy sm:text-2xl">
          News Ticker
        </h1>
        <p className="mt-1 text-sm text-swing-gray-dark/60">
          Kurznachrichten die als Laufschrift im Kundenkatalog angezeigt werden.
        </p>
      </div>

      <NewsManager initialNews={news} />
    </div>
  );
}

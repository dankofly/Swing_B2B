import Link from "next/link";
import { getLocale, getDictionary } from "@/lib/i18n";
import { AlertTriangle } from "lucide-react";

export default async function NotFound() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.errors.notFound;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="card mx-auto max-w-md p-8 sm:p-12">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-swing-gold/10">
            <AlertTriangle className="h-10 w-10 text-swing-gold" />
          </div>
        </div>
        <h1 className="mb-2 text-6xl font-extrabold text-swing-navy">{t.heading}</h1>
        <p className="mb-8 text-lg text-swing-gray-dark/70">{t.message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="btn-gold inline-flex items-center justify-center rounded bg-swing-gold px-6 py-2.5 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark"
          >
            {t.backHome}
          </Link>
          <Link
            href="/katalog"
            className="inline-flex items-center justify-center rounded border border-swing-navy/20 px-6 py-2.5 text-sm font-semibold text-swing-navy hover:bg-swing-navy/5"
          >
            {t.backToCatalog}
          </Link>
        </div>
      </div>
    </div>
  );
}

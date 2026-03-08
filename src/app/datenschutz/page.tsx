import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDictionary } from "@/lib/i18n";

export default async function DatenschutzPage() {
  const dict = await getDictionary();
  const t = dict.legal.datenschutz;

  return (
    <div className="min-h-screen bg-swing-gray-light">
      <div className="dash-hero px-5 py-10 sm:px-8 sm:py-14">
        <div className="relative z-10 mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            {dict.legal.backToHome}
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {t.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-5 py-10 sm:px-8">
        {/* Intro */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.intro}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.introText}
          </p>
        </section>

        {/* Responsible */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.responsible}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.responsibleText}
          </p>
        </section>

        {/* Data Collection */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.dataCollection}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.dataCollectionText}
          </p>
        </section>

        {/* Cookies */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.cookies}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.cookiesText}
          </p>
        </section>

        {/* Hosting */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.hosting}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.hostingText}
          </p>
        </section>

        {/* Auth */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.auth}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.authText}
          </p>
        </section>

        {/* Analytics */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.analytics}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.analyticsText}
          </p>
        </section>

        {/* Rights */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.rights}
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-swing-navy/70">
            {t.rightsText}
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-swing-navy/70">
            {t.rightsList.map((right, i) => (
              <li key={i}>{right}</li>
            ))}
          </ul>
        </section>

        {/* Changes */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.changes}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.changesText}
          </p>
          <p className="mt-4 text-xs text-swing-navy/30">
            {t.lastUpdated}
          </p>
        </section>
      </div>
    </div>
  );
}

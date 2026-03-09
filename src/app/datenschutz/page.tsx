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
            href="/katalog"
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
          <div className="mt-4 space-y-2 text-sm text-swing-navy">
            <p className="whitespace-pre-line font-semibold">{t.responsibleName}</p>
            <p className="whitespace-pre-line">{t.responsibleAddress}</p>
            <p>{t.responsibleEmail}</p>
            <p>{t.responsiblePhone}</p>
          </div>
        </section>

        {/* Legal Basis */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.legalBasis}
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-swing-navy/70">
            {t.legalBasisText}
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-swing-navy/70">
            {t.legalBasisList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Data Collection */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.dataCollection}
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-swing-navy/70">
            {t.dataCollectionText}
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-swing-navy/70">
            {t.dataCollectionList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Storage Duration */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.storageDuration}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.storageDurationText}
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

        {/* SSL/TLS */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.ssl}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.sslText}
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

        {/* Third Country Transfer */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.thirdCountry}
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-swing-navy/70">
            {t.thirdCountryText}
          </p>
          <ul className="list-inside list-disc space-y-1.5 text-sm text-swing-navy/70">
            {t.thirdCountryList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
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

        {/* AI Processing */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.aiProcessing}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.aiProcessingText}
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
          <ul className="list-inside list-disc space-y-1.5 text-sm text-swing-navy/70">
            {t.rightsList.map((right, i) => (
              <li key={i}>{right}</li>
            ))}
          </ul>
        </section>

        {/* Supervisory Authority */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.supervisory}
          </h2>
          <p className="mb-3 text-sm leading-relaxed text-swing-navy/70">
            {t.supervisoryText}
          </p>
          <div className="space-y-2 text-sm text-swing-navy">
            <p className="font-semibold">{t.supervisoryName}</p>
            <p className="whitespace-pre-line">{t.supervisoryAddress}</p>
            <p>{t.supervisoryPhone}</p>
            <p>
              <a
                href={t.supervisoryWeb}
                target="_blank"
                rel="noopener noreferrer"
                className="text-swing-navy/70 hover:text-swing-gold-dark"
              >
                {t.supervisoryWeb}
              </a>
            </p>
          </div>
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

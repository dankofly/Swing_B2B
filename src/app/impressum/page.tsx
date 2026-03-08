import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDictionary } from "@/lib/i18n";

export default async function ImpressumPage() {
  const dict = await getDictionary();
  const t = dict.legal.impressum;

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
        {/* Company Info */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.companyInfo}
          </h2>
          <p className="text-lg font-bold text-swing-navy">{t.companyName}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-swing-navy/30">
                {t.managingDirector}
              </p>
              <p className="mt-1 text-sm text-swing-navy">Günther Wörl</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-swing-navy/30">
                {t.address}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-swing-navy">
                An der Leiten 4
                <br />
                82290 Landsberied
                <br />
                Deutschland
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.contact}
          </h2>
          <div className="space-y-2 text-sm text-swing-navy">
            <p>
              <span className="text-swing-navy/40">{t.phone}:</span>{" "}
              <a href="tel:+498141327788" className="hover:text-swing-gold-dark">
                +49 (0) 81 41 / 32 77 888
              </a>
            </p>
            <p>
              <span className="text-swing-navy/40">{t.fax}:</span>{" "}
              +49 (0) 81 41 / 32 77 870
            </p>
            <p>
              <span className="text-swing-navy/40">{t.email}:</span>{" "}
              <a href="mailto:info@swing.de" className="hover:text-swing-gold-dark">
                info@swing.de
              </a>
            </p>
            <p>
              <span className="text-swing-navy/40">{t.website}:</span>{" "}
              <a
                href="https://www.swing.de"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-swing-gold-dark"
              >
                www.swing.de
              </a>
            </p>
          </div>
        </section>

        {/* Registration */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.registration}
          </h2>
          <div className="space-y-2 text-sm text-swing-navy">
            <p>
              <span className="text-swing-navy/40">{t.court}:</span>{" "}
              Amtsgericht München
            </p>
            <p>
              <span className="text-swing-navy/40">{t.registerNumber}:</span>{" "}
              HRB Nr.: 111 242
            </p>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-swing-navy/30">
              {t.vatId}
            </p>
            <p className="mt-1 text-sm text-swing-navy">DE 165 22 5951</p>
          </div>
        </section>

        {/* Responsibility */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.responsibility}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.responsibilityText}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-swing-navy">
            Günther Wörl
            <br />
            An der Leiten 4
            <br />
            82290 Landsberied
          </p>
        </section>

        {/* Disclaimer */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.disclaimer}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.disclaimerText}
          </p>
        </section>

        {/* Links */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.links}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.linksText}
          </p>
        </section>

        {/* Copyright */}
        <section className="card p-6 sm:p-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-swing-navy/40">
            {t.copyright}
          </h2>
          <p className="text-sm leading-relaxed text-swing-navy/70">
            {t.copyrightText}
          </p>
        </section>

        {/* Hypeakz Credit */}
        <div className="pb-4 pt-2 text-center text-xs text-swing-gray-dark/30">
          {t.madeWith}{" "}
          <a
            href="https://hypeakz.io"
            target="_blank"
            rel="noopener"
            className="font-semibold text-swing-navy/40 transition-colors hover:text-swing-gold"
          >
            Hypeakz.io
          </a>
        </div>
      </div>
    </div>
  );
}

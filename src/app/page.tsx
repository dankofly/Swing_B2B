import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, FileText } from "lucide-react";
import { getDictionary } from "@/lib/i18n";
export default async function Home() {
  const dict = await getDictionary();

  return (
    <div>
      {/* Hero */}
      <div className="relative flex min-h-[calc(100vh-160px)] flex-col items-center justify-center dash-hero px-5 py-12 text-center sm:px-4 sm:py-0">
        {/* Decorative rings — largest hidden on mobile to prevent overflow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-175 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full border border-swing-gold/5 sm:block" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full border border-swing-gold/8 sm:block" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-75 w-75 -translate-x-1/2 -translate-y-1/2 rounded-full border border-swing-gold/4" />

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="swing-h1 mb-2">{dict.landing.brand}</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="hidden h-px w-12 bg-swing-gold/20 sm:block" />
            <p className="text-xs font-extrabold uppercase tracking-[2px] text-white/35 sm:text-sm sm:tracking-[4px]">
              {dict.landing.title}
            </p>
            <div className="hidden h-px w-12 bg-swing-gold/20 sm:block" />
          </div>

          <p className="mt-5 max-w-sm text-center text-sm leading-relaxed text-white/25 sm:max-w-md">
            {dict.landing.subtitle}
          </p>

          <div className="mt-8 flex w-full max-w-xs flex-col items-center gap-3 sm:w-auto sm:max-w-none sm:flex-row">
            <Link
              href="/login"
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-swing-gold px-10 py-3.5 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20 sm:w-auto"
            >
              {dict.landing.login}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/register"
              className="w-full rounded-lg border border-white/10 px-10 py-3.5 text-center text-sm font-semibold tracking-wide text-white/60 transition-all duration-200 hover:border-white/25 hover:text-white/90 sm:w-auto"
            >
              {dict.landing.register}
            </Link>
          </div>
        </div>
      </div>

      {/* Features strip */}
      <div className="border-t border-white/6 bg-linear-to-b from-[#0D1F30] to-swing-navy">
        <div className="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: dict.landing.featurePrice,
              desc: dict.landing.featurePriceDesc,
            },
            {
              icon: Truck,
              title: dict.landing.featureStock,
              desc: dict.landing.featureStockDesc,
            },
            {
              icon: FileText,
              title: dict.landing.featureInquiry,
              desc: dict.landing.featureInquiryDesc,
            },
          ].map((feat, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 px-6 py-5 sm:px-8 sm:py-7 ${
                i < 2 ? "border-b border-white/6 sm:border-b-0 sm:border-r" : ""
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-swing-gold/10">
                <feat.icon size={20} className="text-swing-gold/70" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/80">{feat.title}</p>
                <p className="mt-0.5 text-xs text-white/30">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

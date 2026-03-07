import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  FileText,
  ShoppingCart,
  Building2,
  Download,
  CheckCircle,
  Clock,
  ArrowRight,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { getMyInquiries } from "@/lib/actions/inquiries";
import { getCompanyPriceUploads } from "@/lib/actions/price-uploads";
import InquiryBoard from "@/components/katalog/InquiryBoard";

const COMPANY_TYPE_LABELS: Record<string, string> = {
  dealer: "Händler",
  importer: "Importeur",
  importer_network: "Importeur mit Händlernetzwerk",
};

const CATEGORY_LABELS: Record<string, string> = {
  paragliders: "Gleitschirme",
  miniwings: "Miniwings",
  parakites: "Parakites",
  general: "Allgemein",
};

export default async function KundenDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) redirect("/katalog");

  const [{ data: company }, inquiries, priceUploads] = await Promise.all([
    supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .single(),
    getMyInquiries(),
    getCompanyPriceUploads(profile.company_id),
  ]);

  if (!company) redirect("/katalog");

  const uploadsByCategory = priceUploads.reduce<Record<string, typeof priceUploads>>((acc, u) => {
    const cat = u.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(u);
    return acc;
  }, {});

  const firstName = profile.full_name?.split(" ")[0] || "dort";

  return (
    <div className="space-y-8">
      {/* Hero welcome */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Willkommen zurück
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
              {firstName}
            </h1>
          </div>
          <Link
            href="/katalog"
            className="btn-gold flex cursor-pointer items-center gap-2 rounded-lg bg-swing-gold px-5 py-2.5 text-sm font-bold text-swing-navy shadow-lg shadow-swing-gold/20 transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-xl hover:shadow-swing-gold/25"
          >
            <Compass size={15} />
            Zum Katalog
          </Link>
        </div>
      </div>

      {/* Company + KPIs bento */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        {/* Company card — 2 cols */}
        <div className="overflow-hidden card  lg:col-span-2">
          <div className="flex items-start justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-swing-navy text-white">
                <Building2 size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-swing-navy">{company.name}</h2>
                <p className="mt-0.5 text-xs text-swing-gray-dark/40">
                  {company.company_type
                    ? COMPANY_TYPE_LABELS[company.company_type] || company.company_type
                    : "Kunde"}
                </p>
              </div>
            </div>
            {company.is_approved ? (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-600">
                <CheckCircle size={12} />
                Aktiv
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-600">
                <Clock size={12} />
                Ausstehend
              </div>
            )}
          </div>
          {(company.sells_paragliders || company.sells_miniwings || company.sells_parakites) && (
            <div className="flex gap-1.5 border-t border-gray-50 px-6 py-3">
              {company.sells_paragliders && (
                <span className="rounded bg-swing-navy/5 px-2 py-1 text-[10px] font-semibold text-swing-navy/50">
                  Gleitschirme
                </span>
              )}
              {company.sells_miniwings && (
                <span className="rounded bg-swing-navy/5 px-2 py-1 text-[10px] font-semibold text-swing-navy/50">
                  Miniwings
                </span>
              )}
              {company.sells_parakites && (
                <span className="rounded bg-swing-navy/5 px-2 py-1 text-[10px] font-semibold text-swing-navy/50">
                  Parakites
                </span>
              )}
            </div>
          )}
        </div>

        {/* KPI: Anfragen — instrument style */}
        <div className="card border-l-[3px] border-l-swing-gold p-6">
          <ShoppingCart size={15} className="text-swing-gold/60" />
          <p className="mt-4 text-3xl font-extrabold tabular-nums tracking-tight text-swing-navy">
            {inquiries.length}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-swing-gray-dark/30">
            Anfragen
          </p>
        </div>

        {/* KPI: Preislisten */}
        <div className="card border-l-[3px] border-l-red-400 p-6">
          <FileText size={15} className="text-red-400/60" />
          <p className="mt-4 text-3xl font-extrabold tabular-nums tracking-tight text-swing-navy">
            {priceUploads.length}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-swing-gray-dark/30">
            Preislisten
          </p>
        </div>
      </div>

      {/* Price lists */}
      <div className="overflow-hidden card ">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <FileText size={18} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-swing-navy">Preislisten</h3>
              <p className="text-[11px] text-swing-gray-dark/35">Ihre individuellen Händlerpreise</p>
            </div>
          </div>
        </div>

        {priceUploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-t border-gray-100 px-6 py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <FileText size={22} className="text-swing-navy/10" />
            </div>
            <p className="text-sm font-medium text-swing-navy/35">Noch keine Preislisten</p>
            <p className="mt-1 text-xs text-swing-gray-dark/35">
              Preislisten werden von SWING bereitgestellt
            </p>
          </div>
        ) : (
          <div className="border-t border-gray-100 p-3">
            {Object.entries(uploadsByCategory).map(([category, uploads]) => (
              <div key={category} className="mb-1 last:mb-0">
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-swing-gray-dark/25">
                  {CATEGORY_LABELS[category] || category}
                </p>
                {uploads.map((upload) => (
                  <a
                    key={upload.id}
                    href={upload.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex cursor-pointer items-center gap-4 rounded-lg px-3 py-3 transition-colors duration-150 hover:bg-swing-gold/4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 transition-colors duration-150 group-hover:bg-red-100">
                      <FileText size={18} className="text-red-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-swing-navy">
                        {upload.file_name || `${upload.file_type.toUpperCase()} Preisliste`}
                      </p>
                      <p className="text-[11px] text-swing-gray-dark/30">
                        {new Date(upload.created_at).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-swing-navy/15 transition-all duration-150 group-hover:bg-white group-hover:text-swing-navy/50 group-hover:shadow-sm">
                      <Download size={16} />
                    </div>
                  </a>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inquiries */}
      <div className="overflow-hidden card ">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-swing-navy text-white">
              <ShoppingCart size={18} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-swing-navy">Meine Anfragen</h3>
              <p className="text-[11px] text-swing-gray-dark/35">
                {inquiries.length > 0
                  ? `${inquiries.length} Anfrage${inquiries.length !== 1 ? "n" : ""}`
                  : "Übersicht Ihrer Bestellanfragen"}
              </p>
            </div>
          </div>
          {inquiries.length > 0 && (
            <Link
              href="/katalog"
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-150 px-4 py-2 text-xs font-semibold text-swing-navy/60 transition-all duration-150 hover:border-swing-gold hover:text-swing-navy"
            >
              Neue Anfrage
              <ArrowRight size={13} />
            </Link>
          )}
        </div>

        <div className="border-t border-gray-100 p-4">
          <InquiryBoard inquiries={inquiries} />
        </div>
      </div>
    </div>
  );
}

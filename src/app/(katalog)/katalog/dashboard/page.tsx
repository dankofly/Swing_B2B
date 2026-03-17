import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  ShoppingCart,
  Building2,
  CheckCircle,
  Clock,
  ArrowRight,
  Compass,
  Phone,
  Mail,
  Euro,
  PackageCheck,
  CalendarClock,
  FileText,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import { getMyInquiries } from "@/lib/actions/inquiries";
import { getCustomerVisibleNotes } from "@/lib/actions/company-notes";
import InquiryBoard from "@/components/katalog/InquiryBoard";
import CustomerNotes from "@/components/katalog/CustomerNotes";
import WelcomeBanner from "@/components/katalog/WelcomeBanner";
import { getDictionary, getLocale, getDateLocale } from "@/lib/i18n";
import { createAdminClient } from "@/lib/supabase/server";
import { getCompanyInquiriesForDashboard } from "@/lib/actions/inquiries";


const STATUS_COLORS: Record<string, { bg: string; bar: string }> = {
  new: { bg: "bg-blue-100", bar: "bg-blue-500" },
  in_progress: { bg: "bg-amber-100", bar: "bg-amber-500" },
  shipped: { bg: "bg-purple-100", bar: "bg-purple-500" },
  completed: { bg: "bg-emerald-100", bar: "bg-emerald-500" },
};

export default async function KundenDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ als?: string }>;
}) {
  const { als } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, full_name, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin";
  const viewingAsCompanyId = als && isAdmin ? als : undefined;
  const effectiveCompanyId = viewingAsCompanyId || profile?.company_id;

  if (!profile || !effectiveCompanyId) redirect("/katalog");

  const [{ data: company }, inquiries, customerNotes, locale, dict, { data: priceUploads }] = await Promise.all([
    (viewingAsCompanyId ? createAdminClient() : supabase)
      .from("companies")
      .select("*")
      .eq("id", effectiveCompanyId)
      .single(),
    viewingAsCompanyId
      ? getCompanyInquiriesForDashboard(viewingAsCompanyId)
      : getMyInquiries(),
    getCustomerVisibleNotes(effectiveCompanyId),
    getLocale(),
    getDictionary(),
    (viewingAsCompanyId ? createAdminClient() : supabase)
      .from("price_uploads")
      .select("id, file_url, file_type, status, created_at")
      .eq("company_id", effectiveCompanyId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (!company) redirect("/katalog");

  const alsSuffix = viewingAsCompanyId ? `?als=${viewingAsCompanyId}` : "";
  const dateLocale = getDateLocale(locale);
  const eur = (value: number) =>
    value.toLocaleString(dateLocale, { style: "currency", currency: "EUR" });

  const firstName = profile.full_name?.split(" ")[0] || "dort";

  // Computed stats
  const totalValue = inquiries.reduce(
    (sum, inq) =>
      sum +
      inq.items.reduce(
        (s: number, item: { quantity: number; unit_price: number | null }) =>
          s + item.quantity * (item.unit_price ?? 0),
        0
      ),
    0
  );
  const openCount = inquiries.filter(
    (i) => i.status === "new" || i.status === "in_progress"
  ).length;
  const completedCount = inquiries.filter(
    (i) => i.status === "shipped" || i.status === "completed"
  ).length;
  const lastInquiry = inquiries[0];

  // Status distribution
  const statusCounts: Record<string, number> = {};
  for (const inq of inquiries) {
    statusCounts[inq.status] = (statusCounts[inq.status] || 0) + 1;
  }

  const recentInquiries = inquiries.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero + Kontakt */}
      <div className="overflow-hidden rounded-xl">
        {/* Hero */}
        <div className="dash-hero px-5 py-9 sm:px-8 sm:py-12">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                {dict.dashboard.welcome}
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {firstName}
              </h1>
            </div>
            <Link
              href={`/katalog${alsSuffix}`}
              className="btn-gold flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-swing-gold px-5 py-2.5 text-sm font-bold text-swing-navy shadow-lg shadow-swing-gold/20 transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-xl hover:shadow-swing-gold/25 sm:w-auto"
            >
              <Compass size={15} />
              {dict.common.nav.zumKatalog}
            </Link>
          </div>
        </div>
        {/* Kontakt-Leiste */}
        <div className="grid grid-cols-1 border-t border-white/10 bg-swing-navy sm:grid-cols-3">
          <a
            href="tel:+498141327788"
            className="group flex items-center gap-3 px-5 py-4.5 transition-colors hover:bg-white/5 sm:px-6"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-swing-gold/15">
              <Phone size={15} className="text-swing-gold" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">{dict.dashboard.contact.hotline}</p>
              <p className="text-[13px] font-semibold text-white group-hover:text-swing-gold">
                +49 (0)8141 32 77 888
              </p>
            </div>
          </a>
          <a
            href="mailto:info@swing.de"
            className="group flex items-center gap-3 border-t border-white/5 px-5 py-4.5 transition-colors hover:bg-white/5 sm:border-l sm:border-t-0 sm:px-6"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-swing-gold/15">
              <Mail size={15} className="text-swing-gold" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">{dict.dashboard.contact.email}</p>
              <p className="text-[13px] font-semibold text-white group-hover:text-swing-gold">
                info@swing.de
              </p>
            </div>
          </a>
          <div className="flex items-center gap-3 border-t border-white/5 px-5 py-4.5 sm:border-l sm:border-t-0 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-swing-gold/15">
              <Clock size={15} className="text-swing-gold" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">{dict.dashboard.contact.hours}</p>
              <p className="text-[13px] text-white">
                <span className="font-semibold">Mo–Do</span> <span className="text-white/50">9–12 / 13–17</span>
                <span className="mx-1.5 text-white/20">|</span>
                <span className="font-semibold">Fr</span> <span className="text-white/50">9–12 / 13–15</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome banner for new dealers */}
      <WelcomeBanner
        firstName={firstName}
        links={{
          catalog: `/katalog${alsSuffix}`,
          profile: `/katalog/profil${alsSuffix}`,
          inquiries: `/katalog/anfragen${alsSuffix}`,
        }}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* KPI: Anfragen gesamt */}
        <div className="card border-l-[3px] border-l-swing-gold p-5">
          <ShoppingCart size={15} className="text-swing-gold/60" />
          <p className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight text-swing-navy">
            {inquiries.length}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-swing-gray-dark/30">
            {dict.dashboard.kpiInquiries}
          </p>
        </div>
        {/* KPI: Gesamtwert */}
        <div className="card border-l-[3px] border-l-emerald-400 p-5">
          <Euro size={15} className="text-emerald-400/60" />
          <p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-swing-navy sm:text-3xl">
            {eur(totalValue)}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-swing-gray-dark/30">
            {dict.dashboard.kpiTotalValue}
          </p>
        </div>
        {/* KPI: Offen */}
        <div className="card border-l-[3px] border-l-amber-400 p-5">
          <Clock size={15} className="text-amber-400/60" />
          <p className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight text-swing-navy">
            {openCount}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-swing-gray-dark/30">
            {dict.dashboard.kpiOpen}
          </p>
        </div>
        {/* KPI: Abgeschlossen */}
        <div className="card border-l-[3px] border-l-purple-400 p-5">
          <PackageCheck size={15} className="text-purple-400/60" />
          <p className="mt-3 text-3xl font-extrabold tabular-nums tracking-tight text-swing-navy">
            {completedCount}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-swing-gray-dark/30">
            {dict.dashboard.kpiShipped}
          </p>
        </div>
      </div>

      {/* Company + Status Distribution */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Company card */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-start justify-between p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-swing-navy text-white">
                <Building2 size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-swing-navy">{company.name}</h2>
                <p className="mt-0.5 text-xs text-swing-gray-dark/40">
                  {company.company_type
                    ? (dict.common.companyTypes as Record<string, string>)[company.company_type] || company.company_type
                    : dict.common.companyTypes.customer}
                </p>
              </div>
            </div>
            {company.is_approved ? (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-600">
                <CheckCircle size={12} />
                {dict.common.approved}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-600">
                <Clock size={12} />
                {dict.common.pending}
              </div>
            )}
          </div>
          {(company.sells_paragliders || company.sells_miniwings || company.sells_parakites) && (
            <div className="flex gap-1.5 border-t border-gray-50 px-6 py-3">
              {company.sells_paragliders && (
                <span className="rounded bg-swing-navy/5 px-2 py-1 text-[10px] font-semibold text-swing-navy/50">
                  {dict.common.categories.paragliders}
                </span>
              )}
              {company.sells_miniwings && (
                <span className="rounded bg-swing-navy/5 px-2 py-1 text-[10px] font-semibold text-swing-navy/50">
                  {dict.common.categories.miniwings}
                </span>
              )}
              {company.sells_parakites && (
                <span className="rounded bg-swing-navy/5 px-2 py-1 text-[10px] font-semibold text-swing-navy/50">
                  {dict.common.categories.parakites}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="card overflow-hidden p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-swing-navy/30">
            {dict.dashboard.statusDistribution}
          </p>
          {inquiries.length === 0 ? (
            <p className="mt-4 text-sm text-swing-navy/30">{dict.dashboard.noInquiries}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {/* Bar */}
              <div className="flex h-3 overflow-hidden rounded-full">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div
                    key={status}
                    className={`${STATUS_COLORS[status]?.bar || "bg-gray-300"} transition-all`}
                    style={{ width: `${(count / inquiries.length) * 100}%` }}
                  />
                ))}
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]?.bar || "bg-gray-300"}`} />
                    <span className="text-xs text-swing-navy/60">
                      {(dict.common.status as Record<string, string>)[status] || status}
                    </span>
                    <span className="ml-auto text-xs font-bold tabular-nums text-swing-navy">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
              {/* Last order */}
              {lastInquiry && (
                <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-3">
                  <CalendarClock size={13} className="text-swing-navy/25" />
                  <span className="text-[11px] text-swing-navy/40">{dict.dashboard.lastInquiry}</span>
                  <span className="ml-auto text-xs font-semibold text-swing-navy">
                    {new Date(lastInquiry.created_at).toLocaleDateString(dateLocale, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price Lists */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 p-4 sm:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-swing-navy text-white">
            <FileText size={18} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-swing-navy">{dict.dashboard.myPriceLists}</h3>
            <p className="text-[11px] text-swing-gray-dark/35">{dict.dashboard.myPriceListsHint}</p>
          </div>
        </div>

        {!priceUploads || priceUploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-t border-gray-100 px-6 py-12">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50">
              <FileText size={20} className="text-swing-navy/12" />
            </div>
            <p className="text-sm font-medium text-swing-navy/40">{dict.dashboard.noPriceLists}</p>
            <p className="mt-1 text-xs text-swing-gray-dark/25">{dict.dashboard.noPriceListsHint}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 border-t border-gray-100">
            {priceUploads.map((upload: any) => (
              <a
                key={upload.id}
                href={upload.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-swing-gold/4 sm:px-6"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                  <FileDown size={16} className="text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-swing-navy">
                    {dict.dashboard.myPriceLists}
                  </p>
                  <p className="text-[11px] tabular-nums text-swing-gray-dark/40">
                    {new Date(upload.created_at).toLocaleDateString(dateLocale, {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-swing-navy/25">
                  {upload.file_type?.toUpperCase() || "PDF"}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Customer notes */}
      <CustomerNotes notes={customerNotes} />

      {/* Recent Inquiries */}
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-swing-navy text-white">
              <ShoppingCart size={18} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-swing-navy">{dict.dashboard.recentInquiries}</h3>
              <p className="text-[11px] text-swing-gray-dark/35">
                {inquiries.length > 0
                  ? `${inquiries.length} ${dict.dashboard.inquiriesTotal}`
                  : dict.dashboard.inquiriesOverview}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {inquiries.length > 5 && (
              <Link
                href={`/katalog/anfragen${alsSuffix}`}
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-150 px-4 py-2.5 text-xs font-semibold text-swing-navy/60 transition-all duration-150 hover:border-swing-gold hover:text-swing-navy sm:w-auto"
              >
                {dict.common.buttons.showAll}
                <ArrowRight size={13} />
              </Link>
            )}
            <Link
              href={`/katalog${alsSuffix}`}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-swing-gold px-4 py-2.5 text-xs font-bold text-swing-navy transition-colors hover:bg-swing-gold-dark sm:w-auto"
            >
              {dict.dashboard.newInquiry}
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-100 p-4">
          <InquiryBoard inquiries={recentInquiries} />
        </div>
      </div>
    </div>
  );
}

import { createAdminClient } from "@/lib/supabase/server";
import {
  Package,
  Users,
  FileText,
  ArrowRight,
  Inbox,
  Activity,
  Warehouse,
  MessageSquare,
  FileDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getDictionary, getLocale, getDateLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createAdminClient();
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const dl = getDateLocale(locale);
  const td = dict.admin.dashboard;
  const ts = dict.common.status;

  // Get first day of current month for monthly query
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Parallelize ALL dashboard queries in a single batch
  const [
    { count: activeProducts },
    { count: comingSoonProducts },
    { count: preorderProducts },
    { count: inStockSizes },
    { count: lowStockSizes },
    { count: noStockSizes },
    { count: newInquiries },
    { count: inProgressInquiries },
    { count: shippedInquiries },
    { count: completedMonthly },
    { count: dealerCount },
    { count: importerCount },
    { count: importerNetworkCount },
    { data: recentInquiries },
    { data: recentPriceLists },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_coming_soon", true),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_preorder", true),
    supabase.from("product_sizes").select("*", { count: "exact", head: true }).gt("stock_quantity", 5),
    supabase.from("product_sizes").select("*", { count: "exact", head: true }).gt("stock_quantity", 0).lte("stock_quantity", 5),
    supabase.from("product_sizes").select("*", { count: "exact", head: true }).eq("stock_quantity", 0),
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "shipped"),
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "completed").gte("created_at", monthStart),
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("company_type", "dealer"),
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("company_type", "importer"),
    supabase.from("companies").select("*", { count: "exact", head: true }).eq("company_type", "importer_network"),
    supabase.from("inquiries").select(`
      id,
      status,
      created_at,
      company_id,
      company:companies(name),
      user:profiles(full_name, email),
      inquiry_items(quantity, unit_price)
    `).order("created_at", { ascending: false }).limit(6),
    supabase.from("price_uploads").select(`
      id,
      file_url,
      file_type,
      status,
      matched_count,
      total_count,
      created_at,
      company:companies(name)
    `).order("created_at", { ascending: false }).limit(5),
  ]);

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    new: { label: ts.new, color: "text-blue-700", bg: "bg-blue-100" },
    in_progress: { label: ts.in_progress, color: "text-yellow-700", bg: "bg-yellow-100" },
    shipped: { label: ts.shipped, color: "text-purple-700", bg: "bg-purple-100" },
    completed: { label: ts.completed, color: "text-green-700", bg: "bg-green-100" },
  };

  return (
    <div className="space-y-8">
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <Activity size={16} className="text-swing-gold/70" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                {td.title}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {td.subtitle}
            </h1>
          </div>
          <div className="hidden text-right sm:block">
            <div className="flex gap-5">
              {[
                { label: "SWING HQ", tz: "Europe/Vienna" },
                { label: "Tokyo", tz: "Asia/Tokyo" },
                { label: "New York", tz: "America/New_York" },
                { label: "Sydney", tz: "Australia/Sydney" },
              ].map((clock) => (
                <div key={clock.label} className="text-center">
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-white/25">
                    {clock.label}
                  </span>
                  <span className="block text-sm font-bold tabular-nums text-white/60">
                    {now.toLocaleTimeString(dl, { timeZone: clock.tz, hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs font-bold text-white/30">
              {now.toLocaleDateString(dl, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/produkte" className="card card-interactive overflow-hidden border-l-[3px] border-l-blue-500 p-5 fade-in-up fade-in-up-delay-1">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-blue-500 opacity-60" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-swing-navy/60">{td.products}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.active}</span>
              <span className="text-sm font-bold text-swing-navy">{activeProducts ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.comingSoon}</span>
              <span className="text-sm font-bold text-purple-600">{comingSoonProducts ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.preorder}</span>
              <span className="text-sm font-bold text-orange-600">{preorderProducts ?? 0}</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/lager" className="card card-interactive overflow-hidden border-l-[3px] border-l-emerald-500 p-5 fade-in-up fade-in-up-delay-2">
          <div className="flex items-center gap-2">
            <Warehouse size={16} className="text-emerald-500 opacity-60" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-swing-navy/60">{td.stock}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.onStock}</span>
              <span className="text-sm font-bold text-emerald-600">{inStockSizes ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.lowStock}</span>
              <span className="text-sm font-bold text-amber-600">{lowStockSizes ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.noStock}</span>
              <span className="text-sm font-bold text-red-600">{noStockSizes ?? 0}</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/anfragen" className="card card-interactive overflow-hidden border-l-[3px] border-l-swing-gold p-5 fade-in-up fade-in-up-delay-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-swing-gold opacity-60" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-swing-navy/60">{td.inquiries}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.open}</span>
              <span className="text-sm font-bold text-blue-600">{newInquiries ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.inProgress}</span>
              <span className="text-sm font-bold text-yellow-600">{inProgressInquiries ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.shipped}</span>
              <span className="text-sm font-bold text-purple-600">{shippedInquiries ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.shippedMonth}</span>
              <span className="text-sm font-bold text-green-600">{completedMonthly ?? 0}</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/kunden" className="card card-interactive overflow-hidden border-l-[3px] border-l-swing-navy p-5 fade-in-up fade-in-up-delay-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-swing-navy opacity-60" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-swing-navy/60">{td.customers}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.dealers}</span>
              <span className="text-sm font-bold text-swing-navy">{dealerCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.importers}</span>
              <span className="text-sm font-bold text-swing-navy">{importerCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">{td.importersNetwork}</span>
              <span className="text-sm font-bold text-swing-navy">{importerNetworkCount ?? 0}</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="overflow-hidden card ">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Inbox size={18} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-swing-navy">{td.recentInquiries}</h2>
              <p className="text-[11px] text-swing-gray-dark/35">{td.recentActivity}</p>
            </div>
          </div>
          <Link
            href="/admin/anfragen"
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-150 px-4 py-2.5 text-xs font-semibold text-swing-navy/60 transition-all duration-150 hover:border-swing-gold hover:text-swing-navy sm:w-auto"
          >
            {dict.common.buttons.showAll}
            <ArrowRight size={13} />
          </Link>
        </div>

        {!recentInquiries || recentInquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-t border-gray-100 px-6 py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <FileText size={22} className="text-swing-navy/12" />
            </div>
            <p className="text-sm font-medium text-swing-navy/40">{td.noInquiriesYet}</p>
            <p className="mt-1 text-xs text-swing-gray-dark/25">{td.noInquiriesHint}</p>
          </div>
        ) : (
          <div className="space-y-1 border-t border-gray-100 p-2">
            {recentInquiries.map((inquiry: any) => {
              const status = statusConfig[inquiry.status] ?? statusConfig.new;
              const items = inquiry.inquiry_items ?? [];
              const itemCount = items.length;
              const totalValue = items.reduce((sum: number, it: any) => sum + ((it.quantity ?? 0) * (parseFloat(it.unit_price) || 0)), 0);
              const companyName = (inquiry as any).company?.name ?? "—";

              return (
                <Link
                  key={inquiry.id}
                  href={inquiry.company_id ? `/admin/kunden/${inquiry.company_id}?inquiry=${inquiry.id}` : "/admin/anfragen"}
                  className="flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-white px-3 py-3 transition-colors duration-150 hover:bg-gray-50/40 sm:flex-nowrap sm:gap-4 sm:px-4"
                >
                  <span className="shrink-0 text-sm font-bold text-swing-navy sm:w-44 sm:truncate">
                    {companyName}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-swing-navy/40">
                    {new Date(inquiry.created_at).toLocaleDateString(dl, { day: "2-digit", month: "long", year: "numeric" })}
                  </span>

                  <span className="hidden flex-1 sm:block" />
                  <span className="flex-1 sm:hidden" />

                  <span className="shrink-0 text-xs tabular-nums text-swing-navy/40">
                    {itemCount} Pos.
                  </span>
                  <span className="shrink-0 text-right text-sm font-extrabold tabular-nums text-swing-navy sm:w-28">
                    {totalValue.toLocaleString(dl, { style: "currency", currency: "EUR" })}
                  </span>
                  <span className={`shrink-0 rounded py-0.5 text-center text-[10px] font-bold w-24 ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                  <ChevronRight size={14} className="shrink-0 text-swing-navy/15" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Price Lists */}
      <div className="overflow-hidden card">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-swing-navy text-white">
              <FileText size={18} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-swing-navy">{td.recentPriceLists}</h2>
              <p className="text-[11px] text-swing-gray-dark/35">{td.recentPriceListsHint}</p>
            </div>
          </div>
        </div>

        {!recentPriceLists || recentPriceLists.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-t border-gray-100 px-6 py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <FileText size={22} className="text-swing-navy/12" />
            </div>
            <p className="text-sm font-medium text-swing-navy/40">{td.noPriceLists}</p>
            <p className="mt-1 text-xs text-swing-gray-dark/25">{td.noPriceListsHint}</p>
          </div>
        ) : (
          <div className="space-y-1 border-t border-gray-100 p-2">
            {recentPriceLists.map((upload: any) => {
              const statusLabel = upload.status === "completed"
                ? `${upload.matched_count}/${upload.total_count}`
                : upload.status === "failed"
                ? "Fehler"
                : upload.status === "review"
                ? "Review"
                : "...";
              const statusColor = upload.status === "completed"
                ? "bg-emerald-100 text-emerald-700"
                : upload.status === "failed"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700";
              return (
                <div
                  key={upload.id}
                  className="flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-white px-3 py-3 transition-colors duration-150 hover:bg-gray-50/40 sm:flex-nowrap sm:gap-4 sm:px-4"
                >
                  <span className="shrink-0 text-sm font-bold text-swing-navy sm:w-44 sm:truncate">
                    {(upload as any).company?.name ?? "—"}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-swing-navy/40">
                    {new Date(upload.created_at).toLocaleDateString(dl, { day: "2-digit", month: "long", year: "numeric" })}
                  </span>

                  <span className="hidden flex-1 sm:block" />
                  <span className="flex-1 sm:hidden" />

                  <span className={`shrink-0 rounded py-0.5 text-center text-[10px] font-bold w-24 ${statusColor}`}>
                    {statusLabel}
                  </span>
                  <a
                    href={upload.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg p-1.5 text-red-500/60 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="PDF"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileDown size={14} />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

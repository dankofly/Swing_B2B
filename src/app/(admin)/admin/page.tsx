import { createAdminClient } from "@/lib/supabase/server";
import {
  Package,
  Users,
  FileText,
  ArrowRight,
  Inbox,
  Activity,
  Settings,
  Warehouse,
  MessageSquare,
  FileDown,
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
      user:profiles(full_name, email)
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

  const companyIds = [...new Set((recentInquiries ?? []).map((i: any) => i.company_id).filter(Boolean))];
  const { data: openCounts } = companyIds.length > 0
    ? await supabase
        .from("inquiries")
        .select("company_id")
        .in("company_id", companyIds)
        .in("status", ["new", "in_progress"])
    : { data: [] };
  const openCountMap: Record<string, number> = {};
  (openCounts ?? []).forEach((row: any) => {
    openCountMap[row.company_id] = (openCountMap[row.company_id] ?? 0) + 1;
  });

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
          <>
            <div className="hidden items-center gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-swing-navy/40 sm:grid sm:grid-cols-[1fr_7.5rem_9rem_4rem_2rem]">
              <span>{td.dealers}</span>
              <span className="text-center">{td.status}</span>
              <span className="text-right">{td.date}</span>
              <span className="text-center">{td.open}</span>
              <span />
            </div>

            <div className="divide-y divide-gray-50 border-t border-gray-100 sm:border-t-0">
              {recentInquiries.map((inquiry: any) => {
                const status = statusConfig[inquiry.status] ?? statusConfig.new;
                const openCount = openCountMap[inquiry.company_id] ?? 0;
                return (
                  <div
                    key={inquiry.id}
                    className="px-5 py-4 transition-colors duration-150 hover:bg-swing-gold/4 sm:grid sm:grid-cols-[1fr_7.5rem_9rem_4rem_2rem] sm:items-center sm:gap-3 sm:px-6 sm:py-3.5"
                  >
                    <div className="flex items-center justify-between sm:contents">
                      <span className="truncate text-sm font-semibold text-swing-navy">
                        {(inquiry as any).company?.name ?? "—"}
                      </span>
                      <span className={`inline-flex w-28 items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-swing-gray-dark/35 sm:hidden">
                      <span className="tabular-nums">
                        {new Date(inquiry.created_at).toLocaleDateString(dl, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {openCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="font-semibold text-amber-600">{openCount} {td.open.toLowerCase()}</span>
                        </>
                      )}
                    </div>
                    <span className="hidden text-right text-xs tabular-nums text-swing-gray-dark/35 sm:block">
                      {new Date(inquiry.created_at).toLocaleDateString(dl, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="hidden text-center text-xs font-semibold sm:block">
                      {openCount > 0 ? (
                        <span className="text-amber-600">{openCount}</span>
                      ) : (
                        <span className="text-swing-navy/20">0</span>
                      )}
                    </span>
                    <Link
                      href={inquiry.company_id ? `/admin/kunden/${inquiry.company_id}?inquiry=${inquiry.id}` : "/admin/anfragen"}
                      className="hidden rounded-lg p-1.5 text-swing-gray-dark/30 transition-colors hover:bg-swing-navy/5 hover:text-swing-navy sm:block"
                      title={dict.admin.inquiries.openAtCustomer}
                    >
                      <Settings size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
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
          <>
            <div className="hidden items-center gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-swing-navy/40 sm:grid sm:grid-cols-[1fr_7rem_9rem_2rem]">
              <span>{td.dealers}</span>
              <span className="text-center">{td.status}</span>
              <span className="text-right">{td.date}</span>
              <span />
            </div>

            <div className="divide-y divide-gray-50 border-t border-gray-100 sm:border-t-0">
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
                    className="px-5 py-4 transition-colors duration-150 hover:bg-swing-gold/4 sm:grid sm:grid-cols-[1fr_7rem_9rem_2rem] sm:items-center sm:gap-3 sm:px-6 sm:py-3.5"
                  >
                    <div className="flex items-center justify-between sm:contents">
                      <span className="truncate text-sm font-semibold text-swing-navy">
                        {(upload as any).company?.name ?? "—"}
                      </span>
                      <span className={`inline-flex w-20 items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <span className="mt-1 block text-xs tabular-nums text-swing-gray-dark/35 sm:mt-0 sm:text-right">
                      {new Date(upload.created_at).toLocaleDateString(dl, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <a
                      href={upload.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden rounded-lg p-1.5 text-red-500/60 transition-colors hover:bg-red-50 hover:text-red-600 sm:block"
                      title="PDF"
                    >
                      <FileDown size={14} />
                    </a>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

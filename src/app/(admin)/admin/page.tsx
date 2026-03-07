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
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  // Get first day of current month for monthly query
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

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
  ]);

  const { data: recentInquiries } = await supabase
    .from("inquiries")
    .select(`
      id,
      status,
      created_at,
      company_id,
      company:companies(name),
      user:profiles(full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(6);

  // Count open inquiries per company for the recent list
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
    new: { label: "Eingang", color: "text-blue-700", bg: "bg-blue-100" },
    in_progress: { label: "In Bearbeitung", color: "text-yellow-700", bg: "bg-yellow-100" },
    shipped: { label: "Versand", color: "text-purple-700", bg: "bg-purple-100" },
    completed: { label: "Erledigt", color: "text-green-700", bg: "bg-green-100" },
  };

  return (
    <div className="space-y-8">
      {/* Hero — cockpit briefing header */}
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <Activity size={16} className="text-swing-gold/70" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Control Center
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Dashboard
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
                    {now.toLocaleTimeString("de-DE", { timeZone: clock.tz, hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs font-bold text-white/30">
              {now.toLocaleDateString("de-DE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* KPI instrument cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Produkte */}
        <Link href="/admin/produkte" className="card card-interactive overflow-hidden border-l-[3px] border-l-blue-500 p-5 fade-in-up fade-in-up-delay-1">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-blue-500 opacity-60" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-swing-navy/60">Produkte</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Aktiv</span>
              <span className="text-sm font-bold text-swing-navy">{activeProducts ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Coming Soon</span>
              <span className="text-sm font-bold text-purple-600">{comingSoonProducts ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Vorbestellung</span>
              <span className="text-sm font-bold text-orange-600">{preorderProducts ?? 0}</span>
            </div>
          </div>
        </Link>

        {/* Bestand */}
        <Link href="/admin/lager" className="card card-interactive overflow-hidden border-l-[3px] border-l-emerald-500 p-5 fade-in-up fade-in-up-delay-2">
          <div className="flex items-center gap-2">
            <Warehouse size={16} className="text-emerald-500 opacity-60" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-swing-navy/60">Bestand</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Auf Lager</span>
              <span className="text-sm font-bold text-emerald-600">{inStockSizes ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Niedriger Bestand</span>
              <span className="text-sm font-bold text-amber-600">{lowStockSizes ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Kein Bestand</span>
              <span className="text-sm font-bold text-red-600">{noStockSizes ?? 0}</span>
            </div>
          </div>
        </Link>

        {/* Anfragen */}
        <Link href="/admin/anfragen" className="card card-interactive overflow-hidden border-l-[3px] border-l-swing-gold p-5 fade-in-up fade-in-up-delay-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-swing-gold opacity-60" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-swing-navy/60">Anfragen</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Offen</span>
              <span className="text-sm font-bold text-blue-600">{newInquiries ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">In Bearbeitung</span>
              <span className="text-sm font-bold text-yellow-600">{inProgressInquiries ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Im Versand</span>
              <span className="text-sm font-bold text-purple-600">{shippedInquiries ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Versendet (Monat)</span>
              <span className="text-sm font-bold text-green-600">{completedMonthly ?? 0}</span>
            </div>
          </div>
        </Link>

        {/* Kunden */}
        <Link href="/admin/kunden" className="card card-interactive overflow-hidden border-l-[3px] border-l-swing-navy p-5 fade-in-up fade-in-up-delay-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-swing-navy opacity-60" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-swing-navy/60">Kunden</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Händler</span>
              <span className="text-sm font-bold text-swing-navy">{dealerCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Importeure</span>
              <span className="text-sm font-bold text-swing-navy">{importerCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-swing-gray-dark/50">Importeure mit Netzw.</span>
              <span className="text-sm font-bold text-swing-navy">{importerNetworkCount ?? 0}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent inquiries */}
      <div className="overflow-hidden card ">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Inbox size={18} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-swing-navy">Letzte Anfragen</h2>
              <p className="text-[11px] text-swing-gray-dark/35">Neueste Händler-Aktivitäten</p>
            </div>
          </div>
          <Link
            href="/admin/anfragen"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-150 px-4 py-2 text-xs font-semibold text-swing-navy/60 transition-all duration-150 hover:border-swing-gold hover:text-swing-navy"
          >
            Alle anzeigen
            <ArrowRight size={13} />
          </Link>
        </div>

        {!recentInquiries || recentInquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-t border-gray-100 px-6 py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <FileText size={22} className="text-swing-navy/12" />
            </div>
            <p className="text-sm font-medium text-swing-navy/40">Noch keine Anfragen</p>
            <p className="mt-1 text-xs text-swing-gray-dark/25">
              Anfragen erscheinen hier sobald Händler bestellen
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden items-center gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-swing-navy/40 sm:grid sm:grid-cols-[1fr_7.5rem_9rem_4rem_2rem]">
              <span>Händler</span>
              <span className="text-center">Status</span>
              <span className="text-right">Datum</span>
              <span className="text-center">Offen</span>
              <span />
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50 border-t border-gray-100 sm:border-t-0">
              {recentInquiries.map((inquiry: any) => {
                const status = statusConfig[inquiry.status] ?? statusConfig.new;
                const openCount = openCountMap[inquiry.company_id] ?? 0;
                return (
                  <div
                    key={inquiry.id}
                    className="px-5 py-4 transition-colors duration-150 hover:bg-swing-gold/4 sm:grid sm:grid-cols-[1fr_7.5rem_9rem_4rem_2rem] sm:items-center sm:gap-3 sm:px-6 sm:py-3.5"
                  >
                    {/* Mobile layout */}
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
                        {new Date(inquiry.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {openCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="font-semibold text-amber-600">{openCount} offen</span>
                        </>
                      )}
                    </div>
                    {/* Desktop-only columns */}
                    <span className="hidden text-right text-xs tabular-nums text-swing-gray-dark/35 sm:block">
                      {new Date(inquiry.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
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
                      title="Bestellung beim Kunden öffnen"
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
    </div>
  );
}

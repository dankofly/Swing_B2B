import { createAdminClient } from "@/lib/supabase/server";
import {
  Package,
  Users,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Inbox,
  Activity,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: productCount },
    { count: companyCount },
    { count: openInquiries },
    { count: lowStock },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .in("status", ["new", "in_progress"]),
    supabase
      .from("product_sizes")
      .select("*", { count: "exact", head: true })
      .lte("stock_quantity", 5),
  ]);

  const stats = [
    {
      label: "Aktive Produkte",
      value: productCount ?? 0,
      icon: Package,
      accent: "border-l-blue-500",
      iconColor: "text-blue-500",
      href: "/admin/produkte",
    },
    {
      label: "Händler",
      value: companyCount ?? 0,
      icon: Users,
      accent: "border-l-emerald-500",
      iconColor: "text-emerald-500",
      href: "/admin/kunden",
    },
    {
      label: "Offene Anfragen",
      value: openInquiries ?? 0,
      icon: FileText,
      accent: "border-l-swing-gold",
      iconColor: "text-swing-gold",
      href: "/admin/anfragen",
    },
    {
      label: "Niedriger Bestand",
      value: lowStock ?? 0,
      icon: AlertTriangle,
      accent: "border-l-red-500",
      iconColor: "text-red-500",
      href: "/admin/lager",
    },
  ];

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

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    new: { label: "Neu", color: "text-blue-700", bg: "bg-blue-50" },
    in_progress: { label: "In Bearbeitung", color: "text-amber-700", bg: "bg-amber-50" },
    shipped: { label: "Versendet", color: "text-purple-700", bg: "bg-purple-50" },
    completed: { label: "Abgeschlossen", color: "text-emerald-700", bg: "bg-emerald-50" },
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
          <p className="hidden text-right text-xs font-medium text-white/25 sm:block">
            {new Date().toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* KPI instrument cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`card card-interactive group relative overflow-hidden border-l-[3px] p-5 fade-in-up fade-in-up-delay-${i + 1} ${stat.accent}`}
          >
            <div className="flex items-start justify-between">
              <stat.icon size={16} strokeWidth={2} className={`${stat.iconColor} opacity-60`} />
              <ArrowUpRight
                size={13}
                className="text-transparent transition-all duration-200 group-hover:text-swing-navy/30"
              />
            </div>
            <p className="kpi-value mt-4 text-3xl font-extrabold tracking-tight text-swing-navy">
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-swing-gray-dark/35">
              {stat.label}
            </p>
          </Link>
        ))}
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
            <div className="hidden items-center gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-swing-navy/40 sm:grid sm:grid-cols-[1fr_7rem_5rem_9rem]">
              <span>Händler</span>
              <span className="text-center">Status</span>
              <span className="text-center">Kontakt</span>
              <span className="text-right">Datum</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50 border-t border-gray-100 sm:border-t-0">
              {recentInquiries.map((inquiry: any) => {
                const status = statusConfig[inquiry.status] ?? statusConfig.new;
                return (
                  <Link
                    key={inquiry.id}
                    href={inquiry.company_id ? `/admin/kunden/${inquiry.company_id}` : "/admin/anfragen"}
                    className="block cursor-pointer px-5 py-4 transition-colors duration-150 hover:bg-swing-gold/4 sm:grid sm:grid-cols-[1fr_7rem_5rem_9rem] sm:items-center sm:gap-3 sm:px-6 sm:py-3.5"
                  >
                    {/* Mobile layout */}
                    <div className="flex items-center justify-between sm:contents">
                      <span className="truncate text-sm font-semibold text-swing-navy">
                        {(inquiry as any).company?.name ?? "—"}
                      </span>
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold sm:text-center ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-swing-gray-dark/35 sm:hidden">
                      <span>{(inquiry as any).user?.full_name?.split(" ")[0] || "—"}</span>
                      <span>·</span>
                      <span className="tabular-nums">
                        {new Date(inquiry.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </span>
                    </div>
                    {/* Desktop-only columns */}
                    <div className="hidden sm:flex sm:justify-center">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <span className="hidden truncate text-center text-xs text-swing-gray-dark/35 sm:block">
                      {(inquiry as any).user?.full_name?.split(" ")[0] || "—"}
                    </span>
                    <span className="hidden text-right text-xs tabular-nums text-swing-gray-dark/35 sm:block">
                      {new Date(inquiry.created_at).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

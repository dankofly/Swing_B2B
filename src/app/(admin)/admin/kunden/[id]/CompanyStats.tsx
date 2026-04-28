"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LogIn, ShoppingCart, Euro, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";
import { getCompanyStats, type CompanyStatsData } from "@/lib/actions/company-stats";

function AnimatedNumber({ value, locale, prefix = "", suffix = "" }: { value: number; locale: string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        ref.current = end;
      }
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  if (prefix || suffix) {
    const formatted = display >= 1000
      ? new Intl.NumberFormat(locale).format(display)
      : String(display);
    return <>{prefix}{formatted}{suffix}</>;
  }

  return <>{display >= 1000 ? new Intl.NumberFormat(locale).format(display) : display}</>;
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-swing-navy/25">
        <Minus size={10} />
      </span>
    );
  }

  const isPositive = value > 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        isPositive
          ? "bg-emerald-50 text-emerald-600"
          : "bg-red-50 text-red-500"
      }`}
    >
      {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {isPositive ? "+" : ""}{value}%
    </span>
  );
}

const EMPTY_STATS: CompanyStatsData = {
  logins: 0,
  loginsTrend: 0,
  inquiries: 0,
  inquiriesTrend: 0,
  revenue: 0,
  revenueTrend: 0,
};

export default function CompanyStats({ companyId, lastSignInAt }: { companyId: string; lastSignInAt?: string | null }) {
  const dict = useDict();
  const locale = useLocale();
  const dl = getDateLocale(locale);
  const ts = dict.admin.stats;

  const PERIODS = [
    { key: "7d", label: ts.period7d },
    { key: "30d", label: ts.period30d },
    { key: "90d", label: ts.period90d },
    { key: "1y", label: ts.period1y },
    { key: "all", label: ts.periodAll },
  ];

  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CompanyStatsData>(EMPTY_STATS);

  const fetchStats = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const result = await getCompanyStats(companyId, p);
      setData(result);
    } catch {
      setData(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  function switchPeriod(key: string) {
    if (key === period) return;
    setPeriod(key);
  }

  function formatCurrency(value: number) {
    if (value >= 1000) {
      return new Intl.NumberFormat(dl, { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    }
    return new Intl.NumberFormat(dl, { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(value);
  }

  const stats = [
    {
      label: ts.logins,
      value: data.logins,
      formatted: null as string | null,
      trend: data.loginsTrend,
      icon: LogIn,
      accent: "#3b82f6",
      bg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      lastLogin: lastSignInAt,
    },
    {
      label: ts.inquiries,
      value: data.inquiries,
      formatted: null as string | null,
      trend: data.inquiriesTrend,
      icon: ShoppingCart,
      accent: "#f59e0b",
      bg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      lastLogin: undefined,
    },
    {
      label: ts.revenue,
      value: data.revenue,
      formatted: formatCurrency(data.revenue),
      trend: data.revenueTrend,
      icon: Euro,
      accent: "#10b981",
      bg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      lastLogin: undefined,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Period selector */}
      <div className="flex rounded-lg bg-swing-navy/[0.03] p-0.5">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => switchPeriod(p.key)}
            className={`relative flex-1 cursor-pointer rounded-md px-1 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-200 ${
              period === p.key
                ? "bg-swing-navy text-white shadow-sm"
                : "text-swing-navy/30 hover:text-swing-navy/50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats rows */}
      <div
        className={`mt-4 flex flex-1 flex-col gap-1 transition-opacity duration-150 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="group relative rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-swing-navy/[0.02]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Top row: icon + label + last login + trend */}
            <div className="mb-1 flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-md ${s.bg} transition-transform duration-200 group-hover:scale-110`}>
                <s.icon size={12} className={s.iconColor} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-swing-navy/25">
                {s.label}
              </span>
              {s.lastLogin !== undefined && (
                <span className="text-[10px] text-swing-navy/25">
                  {s.lastLogin
                    ? new Date(s.lastLogin).toLocaleDateString(dl, { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
                    : "–"}
                </span>
              )}
              <span className="flex-1" />
              <TrendBadge value={s.trend} />
            </div>

            {/* Bottom row: value */}
            <div className="flex items-end justify-between pl-8">
              <span className="kpi-value text-xl font-extrabold leading-none text-swing-navy">
                {s.formatted ? (
                  <AnimatedNumber value={s.value} locale={dl} suffix=" EUR" />
                ) : (
                  <AnimatedNumber value={s.value} locale={dl} />
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state hint */}
      {!loading && data.inquiries === 0 && data.revenue === 0 && data.logins === 0 && (
        <p className="mt-2 text-center text-[10px] italic text-swing-navy/20">
          {ts.noData ?? "Noch keine Aktivität in diesem Zeitraum"}
        </p>
      )}
    </div>
  );
}

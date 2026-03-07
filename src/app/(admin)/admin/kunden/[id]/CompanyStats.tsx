"use client";

import { useState } from "react";
import { LogIn, ShoppingCart, Euro, TrendingUp, TrendingDown } from "lucide-react";

const PERIODS = [
  { key: "7d", label: "7 Tage" },
  { key: "30d", label: "30 Tage" },
  { key: "90d", label: "90 Tage" },
  { key: "1y", label: "1 Jahr" },
  { key: "all", label: "Gesamt" },
];

// Dummy data per period
const DUMMY: Record<string, { logins: number; loginsTrend: number; inquiries: number; inquiriesTrend: number; revenue: number; revenueTrend: number }> = {
  "7d": { logins: 4, loginsTrend: 12, inquiries: 1, inquiriesTrend: -50, revenue: 2450, revenueTrend: -20 },
  "30d": { logins: 18, loginsTrend: 8, inquiries: 5, inquiriesTrend: 25, revenue: 12800, revenueTrend: 15 },
  "90d": { logins: 47, loginsTrend: 5, inquiries: 14, inquiriesTrend: 40, revenue: 38500, revenueTrend: 22 },
  "1y": { logins: 156, loginsTrend: 3, inquiries: 42, inquiriesTrend: 18, revenue: 145200, revenueTrend: 12 },
  all: { logins: 312, loginsTrend: 0, inquiries: 87, inquiriesTrend: 0, revenue: 298400, revenueTrend: 0 },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export default function CompanyStats() {
  const [period, setPeriod] = useState("30d");
  const data = DUMMY[period];

  const stats = [
    {
      label: "Logins",
      value: data.logins,
      trend: data.loginsTrend,
      icon: LogIn,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Anfragen",
      value: data.inquiries,
      trend: data.inquiriesTrend,
      icon: ShoppingCart,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Umsatz",
      value: formatCurrency(data.revenue),
      trend: data.revenueTrend,
      icon: Euro,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Period selector */}
      <div className="flex flex-wrap gap-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`cursor-pointer rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              period === p.key
                ? "bg-swing-navy text-white"
                : "text-swing-navy/40 hover:bg-gray-100 hover:text-swing-navy/60"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 flex flex-1 flex-col justify-center gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">
                {s.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-swing-navy">
                  {s.value}
                </span>
                {s.trend !== 0 && (
                  <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${s.trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {s.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {s.trend > 0 ? "+" : ""}{s.trend}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

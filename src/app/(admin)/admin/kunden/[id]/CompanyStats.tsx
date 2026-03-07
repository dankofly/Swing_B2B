"use client";

import { useState, useEffect, useRef } from "react";
import { LogIn, ShoppingCart, Euro, TrendingUp, TrendingDown, Minus } from "lucide-react";

const PERIODS = [
  { key: "7d", label: "7T" },
  { key: "30d", label: "30T" },
  { key: "90d", label: "90T" },
  { key: "1y", label: "1J" },
  { key: "all", label: "Alle" },
];

// Dummy data per period — will be replaced with real Supabase queries
const DUMMY: Record<string, { logins: number; loginsTrend: number; inquiries: number; inquiriesTrend: number; revenue: number; revenueTrend: number; sparkline: number[] }> = {
  "7d": { logins: 4, loginsTrend: 12, inquiries: 1, inquiriesTrend: -50, revenue: 2450, revenueTrend: -20, sparkline: [1, 0, 2, 0, 0, 1, 0] },
  "30d": { logins: 18, loginsTrend: 8, inquiries: 5, inquiriesTrend: 25, revenue: 12800, revenueTrend: 15, sparkline: [2, 3, 1, 4, 2, 5, 3, 4, 6, 3] },
  "90d": { logins: 47, loginsTrend: 5, inquiries: 14, inquiriesTrend: 40, revenue: 38500, revenueTrend: 22, sparkline: [8, 12, 10, 15, 11, 18, 14, 20, 16, 22] },
  "1y": { logins: 156, loginsTrend: 3, inquiries: 42, inquiriesTrend: 18, revenue: 145200, revenueTrend: 12, sparkline: [10, 12, 9, 14, 16, 13, 18, 15, 20, 22, 18, 25] },
  all: { logins: 312, loginsTrend: 0, inquiries: 87, inquiriesTrend: 0, revenue: 298400, revenueTrend: 0, sparkline: [5, 8, 12, 15, 18, 22, 20, 25, 28, 30, 32, 35] },
};

function formatCurrency(value: number) {
  if (value >= 1000) {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(value);
}

function MiniSparkline({ data, color, height = 28 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const padding = 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (w - padding * 2);
    const y = padding + (1 - (v - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const areaPoints = [...points, `${padding + w - padding * 2},${height}`, `${padding},${height}`];

  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints.join(" ")}
        fill={`url(#grad-${color})`}
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 1px 2px ${color}40)` }}
      />
      <circle
        cx={points[points.length - 1].split(",")[0]}
        cy={points[points.length - 1].split(",")[1]}
        r="2.5"
        fill={color}
        className="animate-pulse"
      />
    </svg>
  );
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
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
      // Ease out cubic
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
      ? new Intl.NumberFormat("de-DE").format(display)
      : String(display);
    return <>{prefix}{formatted}{suffix}</>;
  }

  return <>{display >= 1000 ? new Intl.NumberFormat("de-DE").format(display) : display}</>;
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

export default function CompanyStats() {
  const [period, setPeriod] = useState("30d");
  const [transitioning, setTransitioning] = useState(false);
  const data = DUMMY[period];

  function switchPeriod(key: string) {
    if (key === period) return;
    setTransitioning(true);
    setTimeout(() => {
      setPeriod(key);
      setTransitioning(false);
    }, 150);
  }

  const stats = [
    {
      label: "Logins",
      value: data.logins,
      formatted: null as string | null,
      trend: data.loginsTrend,
      icon: LogIn,
      accent: "#3b82f6",
      bg: "bg-blue-500/10",
      iconColor: "text-blue-500",
    },
    {
      label: "Anfragen",
      value: data.inquiries,
      formatted: null as string | null,
      trend: data.inquiriesTrend,
      icon: ShoppingCart,
      accent: "#f59e0b",
      bg: "bg-amber-500/10",
      iconColor: "text-amber-500",
    },
    {
      label: "Umsatz",
      value: data.revenue,
      formatted: formatCurrency(data.revenue),
      trend: data.revenueTrend,
      icon: Euro,
      accent: "#10b981",
      bg: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Period selector — pill style */}
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
          transitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="group relative rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-swing-navy/[0.02]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Top row: icon + label + trend */}
            <div className="mb-1 flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-md ${s.bg} transition-transform duration-200 group-hover:scale-110`}>
                <s.icon size={12} className={s.iconColor} strokeWidth={2.5} />
              </div>
              <span className="flex-1 text-[10px] font-bold uppercase tracking-[0.1em] text-swing-navy/25">
                {s.label}
              </span>
              <TrendBadge value={s.trend} />
            </div>

            {/* Bottom row: value + sparkline */}
            <div className="flex items-end justify-between pl-8">
              <span className="kpi-value text-xl font-extrabold leading-none text-swing-navy">
                {s.formatted ? (
                  <AnimatedNumber value={s.value} suffix=" EUR" />
                ) : (
                  <AnimatedNumber value={s.value} />
                )}
              </span>
              <div className="opacity-60 transition-opacity duration-200 group-hover:opacity-100">
                <MiniSparkline data={data.sparkline} color={s.accent} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

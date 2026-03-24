"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface AdminBriefingProps {
  adminName: string;
  locale: string;
  stats: {
    activeProducts: number;
    comingSoonProducts: number;
    preorderProducts: number;
    inStockSizes: number;
    lowStockSizes: number;
    noStockSizes: number;
    newInquiries: number;
    inProgressInquiries: number;
    shippedInquiries: number;
    completedMonthly: number;
    dealerCount: number;
    importerCount: number;
    importerNetworkCount: number;
  };
}

interface BriefingData {
  greeting?: string;
  briefing: string[];
  emoji: string;
}

function getVisitCount(): number {
  try {
    const stored = localStorage.getItem("swing_admin_visits");
    if (!stored) return 0;
    const { date, count } = JSON.parse(stored);
    const today = new Date().toISOString().slice(0, 10);
    return date === today ? count : 0;
  } catch {
    return 0;
  }
}

function incrementVisitCount(): number {
  const today = new Date().toISOString().slice(0, 10);
  const current = getVisitCount();
  const newCount = current + 1;
  localStorage.setItem(
    "swing_admin_visits",
    JSON.stringify({ date: today, count: newCount })
  );
  return newCount;
}

export default function AdminBriefing({ adminName, locale, stats }: AdminBriefingProps) {
  const [data, setData] = useState<BriefingData | null>(null);
  const [isFullGreeting] = useState(() => incrementVisitCount() <= 2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin-briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminName,
        stats,
        locale,
        isFullGreeting,
      }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => {
        if (!cancelled) setData({ briefing: ["Dashboard bereit."], emoji: "📊" });
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [adminName, stats, locale, isFullGreeting]);

  if (loading) {
    return (
      <div className="briefing-card relative overflow-hidden rounded-xl border border-swing-navy/[0.06] bg-white fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-r from-swing-gold/[0.03] via-transparent to-swing-navy/[0.02]" />
        <div className="relative flex items-center gap-4 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-swing-gold/10">
            <Sparkles size={16} className="animate-spin text-swing-gold" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-52 animate-pulse rounded bg-swing-navy/[0.06]" />
            <div className="h-3 w-36 animate-pulse rounded bg-swing-navy/[0.04]" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Compact mode (3+ visits today)
  if (!isFullGreeting) {
    return (
      <div className="briefing-card group relative overflow-hidden rounded-xl border border-swing-navy/[0.06] bg-white transition-all duration-300 hover:border-swing-gold/20 hover:shadow-[0_2px_12px_rgba(252,185,35,0.08)] fade-in-up">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-swing-gold/[0.02] via-transparent to-swing-navy/[0.015]" />
        {/* Gold accent line left */}
        <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-swing-gold/60 via-swing-gold/30 to-transparent" />

        <div className="relative flex items-center gap-4 px-6 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-swing-navy/[0.06] to-swing-navy/[0.02]">
            <span className="text-base leading-none">{data.emoji}</span>
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-x-1.5">
            {data.briefing.map((point, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[13px] leading-relaxed text-swing-navy/55">
                {i > 0 && <span className="mx-1 inline-block h-[3px] w-[3px] rounded-full bg-swing-gold/40" />}
                {point}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Sparkles size={9} className="text-swing-gold/30" />
            <span className="text-[8px] font-semibold uppercase tracking-[0.1em] text-swing-navy/15">AI</span>
          </div>
        </div>
      </div>
    );
  }

  // Full greeting (1st or 2nd visit today)
  return (
    <div className="briefing-card group relative overflow-hidden rounded-xl border border-swing-navy/[0.06] bg-white transition-all duration-300 hover:border-swing-gold/20 hover:shadow-[0_4px_20px_rgba(252,185,35,0.08)] fade-in-up">
      {/* Layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-swing-gold/[0.03] via-transparent to-swing-navy/[0.02]" />
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-swing-gold/[0.04] blur-3xl" />
      {/* Gold accent line left */}
      <div className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-gradient-to-b from-swing-gold via-swing-gold/40 to-transparent" />

      <div className="relative px-6 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start gap-4">
          {/* Emoji container */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-swing-gold/15 to-swing-gold/5 ring-1 ring-swing-gold/10">
            <span className="text-xl leading-none">{data.emoji}</span>
          </div>

          <div className="min-w-0 flex-1">
            {/* Greeting */}
            {data.greeting && (
              <p className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-swing-navy">
                {data.greeting}
              </p>
            )}

            {/* Briefing points */}
            <div className="mt-3 space-y-2">
              {data.briefing.map((point, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5"
                >
                  <div className="mt-[7px] flex h-[5px] w-[5px] shrink-0 items-center justify-center">
                    <span className="block h-[5px] w-[5px] rounded-full bg-gradient-to-br from-swing-gold to-swing-gold-dark" />
                  </div>
                  <p className="text-[13px] leading-relaxed text-swing-navy/55">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer badge */}
        <div className="mt-4 flex items-center gap-1.5 border-t border-swing-navy/[0.04] pt-3">
          <Sparkles size={10} className="text-swing-gold/35" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-swing-navy/20">
            Gemini Briefing
          </span>
        </div>
      </div>
    </div>
  );
}

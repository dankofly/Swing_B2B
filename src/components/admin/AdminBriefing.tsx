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
  const [isFullGreeting, setIsFullGreeting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const visitCount = incrementVisitCount();
    const showFull = visitCount <= 2;
    setIsFullGreeting(showFull);

    fetch("/api/admin-briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adminName,
        stats,
        locale,
        isFullGreeting: showFull,
      }),
    })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() =>
        setData({ briefing: ["Dashboard bereit."], emoji: "📊" })
      )
      .finally(() => setLoading(false));
  }, [adminName, stats, locale]);

  if (loading) {
    return (
      <div className="card overflow-hidden border-l-[3px] border-l-swing-gold">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center">
            <Sparkles size={18} className="animate-spin text-swing-gold" />
          </div>
          <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Compact mode (3+ visits today)
  if (!isFullGreeting) {
    return (
      <div className="card overflow-hidden border-l-[3px] border-l-swing-gold/50 fade-in-up">
        <div className="flex items-start gap-3 px-5 py-3">
          <span className="mt-0.5 text-lg">{data.emoji}</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {data.briefing.map((point, i) => (
              <span key={i} className="text-xs text-swing-navy/50">
                {point}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Full greeting (1st or 2nd visit today)
  return (
    <div className="card overflow-hidden border-l-[3px] border-l-swing-gold fade-in-up">
      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{data.emoji}</span>
          <div className="min-w-0 flex-1">
            {data.greeting && (
              <p className="text-[15px] font-bold leading-snug text-swing-navy">
                {data.greeting}
              </p>
            )}
            <ul className="mt-2.5 space-y-1.5">
              {data.briefing.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[13px] leading-relaxed text-swing-navy/60"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-swing-gold" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-gray-50 pt-2.5">
          <Sparkles size={10} className="text-swing-gold/40" />
          <span className="text-[9px] font-medium uppercase tracking-wider text-swing-navy/20">
            Gemini Briefing
          </span>
        </div>
      </div>
    </div>
  );
}

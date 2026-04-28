"use server";

import { createAdminClient, guardAdminOrTestadmin } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/rate-limit";

export interface CompanyStatsData {
  logins: number;
  loginsTrend: number;
  inquiries: number;
  inquiriesTrend: number;
  revenue: number;
  revenueTrend: number;
}

/**
 * Compute real statistics for a company over a given period.
 * Trend = % change vs the preceding period of equal length.
 *
 * AuthZ: This action is invoked from a Client Component (CompanyStats.tsx)
 * and uses the service-role admin client (bypasses RLS). Without an explicit
 * guard, any logged-in buyer could invoke it for an arbitrary companyId.
 * Only admins/superadmins/testadmins are allowed; buyers are rejected.
 */
export async function getCompanyStats(
  companyId: string,
  periodKey: string
): Promise<CompanyStatsData> {
  if (!isValidUUID(companyId)) throw new Error("Ungültige Firmen-ID");
  await guardAdminOrTestadmin();
  const supabase = createAdminClient();

  const now = new Date();
  const periodDays = getPeriodDays(periodKey);

  // Current period boundaries
  const currentStart = periodDays
    ? new Date(now.getTime() - periodDays * 86400000)
    : null;
  // Previous period boundaries (for trend)
  const prevStart = periodDays && currentStart
    ? new Date(currentStart.getTime() - periodDays * 86400000)
    : null;

  // --- Logins: count from login_events table if it exists, otherwise 0 ---
  // Supabase auth.audit_log_entries is not reliably queryable via PostgREST,
  // so login tracking would need a custom login_events table.
  // For now, we show 0 until login tracking is implemented.
  const logins = 0;
  const loginsPrev = 0;

  // --- Inquiries ---
  let inquiriesCount = 0;
  let inquiriesPrev = 0;

  if (currentStart) {
    const { count } = await supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .gte("created_at", currentStart.toISOString());
    inquiriesCount = count ?? 0;

    if (prevStart) {
      const { count: prevCount } = await supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId)
        .gte("created_at", prevStart.toISOString())
        .lt("created_at", currentStart.toISOString());
      inquiriesPrev = prevCount ?? 0;
    }
  } else {
    const { count } = await supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId);
    inquiriesCount = count ?? 0;
  }

  // --- Revenue (sum of quantity * unit_price from inquiry_items) ---
  let revenue = 0;
  let revenuePrev = 0;

  if (currentStart) {
    revenue = await calcRevenue(supabase, companyId, currentStart, now);
    if (prevStart) {
      revenuePrev = await calcRevenue(supabase, companyId, prevStart, currentStart);
    }
  } else {
    revenue = await calcRevenue(supabase, companyId, null, now);
  }

  return {
    logins,
    loginsTrend: calcTrend(logins, loginsPrev),
    inquiries: inquiriesCount,
    inquiriesTrend: calcTrend(inquiriesCount, inquiriesPrev),
    revenue,
    revenueTrend: calcTrend(revenue, revenuePrev),
  };
}

function getPeriodDays(key: string): number | null {
  switch (key) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "1y": return 365;
    case "all": return null;
    default: return 30;
  }
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

async function calcRevenue(
  supabase: ReturnType<typeof createAdminClient>,
  companyId: string,
  start: Date | null,
  end: Date
): Promise<number> {
  let query = supabase
    .from("inquiries")
    .select("id")
    .eq("company_id", companyId);

  if (start) {
    query = query.gte("created_at", start.toISOString());
  }
  query = query.lt("created_at", end.toISOString());

  const { data: inquiries } = await query;
  if (!inquiries || inquiries.length === 0) return 0;

  const ids = inquiries.map((i) => i.id);
  const { data: items } = await supabase
    .from("inquiry_items")
    .select("quantity, unit_price")
    .in("inquiry_id", ids);

  if (!items) return 0;
  return items.reduce((sum, i) => sum + (i.quantity ?? 0) * (i.unit_price ?? 0), 0);
}

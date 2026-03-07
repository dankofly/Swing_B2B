import { createAdminClient } from "@/lib/supabase/server";
import KundenList from "./KundenList";

export const dynamic = "force-dynamic";

export default async function AdminKundenPage() {
  const supabase = createAdminClient();

  const { data: companiesRaw } = await supabase
    .from("companies")
    .select("id, name, contact_email, phone, address, is_approved, created_at")
    .order("created_at", { ascending: false });

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, company_id");

  const companies = (companiesRaw ?? []).map((c) => ({
    ...c,
    profiles: (allProfiles ?? []).filter((p) => p.company_id === c.id),
  }));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Verwaltung
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Kundenverwaltung
          </h1>
        </div>
      </div>

      <KundenList companies={companies ?? []} />
    </div>
  );
}

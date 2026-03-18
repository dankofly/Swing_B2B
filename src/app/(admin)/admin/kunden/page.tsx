import { createAdminClient } from "@/lib/supabase/server";
import KundenList from "./KundenList";
import PendingRequests from "./PendingRequests";


export default async function AdminKundenPage() {
  const supabase = createAdminClient();

  const { data: companiesRaw } = await supabase
    .from("companies")
    .select("id, name, contact_email, phone, address, is_approved, created_at, company_type, contact_person, vat_id")
    .order("created_at", { ascending: false });

  const [{ data: allProfiles }, authResult] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, role, company_id"),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const authUsers = authResult.data?.users ?? [];

  // Build a map of user_id → last_sign_in_at
  const lastSignInMap = new Map(
    authUsers.map((u) => [u.id, u.last_sign_in_at ?? null])
  );

  const companies = (companiesRaw ?? []).map((c) => ({
    ...c,
    profiles: (allProfiles ?? []).filter((p) => p.company_id === c.id).map((p) => ({
      ...p,
      last_sign_in_at: lastSignInMap.get(p.id) ?? null,
    })),
  }));

  const pending = companies.filter((c) => !c.is_approved);
  const approved = companies.filter((c) => c.is_approved);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Verwaltung
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Kundenverwaltung
            </h1>
          </div>
          {pending.length > 0 && (
            <div className="flex items-center gap-2 rounded bg-white/10 px-3 py-2 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-swing-gold opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-swing-gold" />
              </span>
              <span className="text-sm font-bold text-white">
                {pending.length} {pending.length === 1 ? "Anfrage" : "Anfragen"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pending Access Requests */}
      {pending.length > 0 && <PendingRequests requests={pending} />}

      {/* All Customers */}
      <KundenList companies={approved} />
    </div>
  );
}

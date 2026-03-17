import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import ProfileForm from "./ProfileForm";
import { getDictionary } from "@/lib/i18n";


export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ als?: string }>;
}) {
  const { als } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, full_name, email, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin";
  const viewingAsCompanyId = als && isAdmin ? als : undefined;
  const effectiveCompanyId = viewingAsCompanyId || profile?.company_id;

  if (!profile || !effectiveCompanyId) redirect("/katalog");

  const { data: company } = await (viewingAsCompanyId ? createAdminClient() : supabase)
    .from("companies")
    .select("*")
    .eq("id", effectiveCompanyId)
    .single();

  if (!company) redirect("/katalog");

  const dict = await getDictionary();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
            {dict.profile.subtitle}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {dict.profile.title}
          </h1>
        </div>
      </div>

      <ProfileForm
        company={company}
        fullName={profile.full_name ?? ""}
        email={profile.email}
      />
    </div>
  );
}

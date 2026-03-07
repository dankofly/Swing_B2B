import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) redirect("/katalog");

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profile.company_id)
    .single();

  if (!company) redirect("/katalog");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Konto
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Mein Profil
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

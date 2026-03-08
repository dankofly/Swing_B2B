import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import AdminProfileForm from "./AdminProfileForm";

export const dynamic = "force-dynamic";

export default async function AdminProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const dict = await getDictionary();

  return (
    <div className="space-y-6">
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
            {dict.adminProfile.subtitle}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {dict.adminProfile.title}
          </h1>
        </div>
      </div>

      <AdminProfileForm
        fullName={profile.full_name ?? ""}
        email={profile.email}
        role={profile.role}
      />
    </div>
  );
}

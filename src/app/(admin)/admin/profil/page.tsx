import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import AdminProfileForm from "./AdminProfileForm";
import RoleManager from "./RoleManager";

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

  // If superadmin, fetch all profiles for role management
  let allProfiles: {
    id: string;
    full_name: string | null;
    email: string;
    role: string;
    company_id: string | null;
  }[] = [];

  if (profile.role === "superadmin") {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("id, full_name, email, role, company_id")
      .order("role", { ascending: true })
      .order("full_name", { ascending: true });

    allProfiles = data ?? [];
  }

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

      {profile.role === "superadmin" && (
        <RoleManager profiles={allProfiles} currentUserId={user.id} />
      )}
    </div>
  );
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateMyProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Nicht angemeldet" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id)
    return { success: false, error: "Kein Unternehmen zugeordnet" };

  const admin = createAdminClient();

  // Update company fields
  const fields = {
    name: formData.get("name") as string,
    contact_email: formData.get("contact_email") as string,
    phone: (formData.get("phone") as string) || null,
    phone_whatsapp: formData.get("phone_whatsapp") === "on",
    address_street: (formData.get("address_street") as string) || null,
    address_zip: (formData.get("address_zip") as string) || null,
    address_city: (formData.get("address_city") as string) || null,
    address_country: (formData.get("address_country") as string) || null,
    vat_id: (formData.get("vat_id") as string) || null,
    updated_at: new Date().toISOString(),
  };

  const { error: companyError } = await admin
    .from("companies")
    .update(fields)
    .eq("id", profile.company_id);

  if (companyError)
    return { success: false, error: companyError.message };

  // Update profile full_name
  const fullName = formData.get("full_name") as string;
  if (fullName) {
    await admin
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);
  }

  revalidatePath("/katalog/profil");
  revalidatePath(`/admin/kunden/${profile.company_id}`);
  return { success: true };
}

export async function updateAdminProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Nicht angemeldet" };

  const admin = createAdminClient();

  const fullName = formData.get("full_name") as string;
  if (!fullName) return { success: false, error: "Name ist erforderlich" };

  const { error } = await admin
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/profil");
  return { success: true };
}

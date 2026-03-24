"use server";

import { createClient, createAdminClient, guardAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { buildInvitationEmail, sendEmail } from "@/lib/email";

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
  await guardAdmin();
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

export async function updateUserRole(userId: string, newRole: string) {
  await guardAdmin();
  if (!["superadmin", "admin", "buyer", "testadmin"].includes(newRole)) {
    return { success: false, error: "Ungültige Rolle" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Nicht angemeldet" };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const callerRole = callerProfile?.role;

  // Only admins and superadmins can change roles
  if (callerRole !== "superadmin" && callerRole !== "admin") {
    return { success: false, error: "Keine Berechtigung" };
  }

  // Only superadmins can assign the superadmin role
  if (newRole === "superadmin" && callerRole !== "superadmin") {
    return { success: false, error: "Nur Super Admins können die Super Admin Rolle vergeben" };
  }

  // Admins cannot change the role of a superadmin
  if (callerRole === "admin") {
    const admin = createAdminClient();
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (targetProfile?.role === "superadmin") {
      return { success: false, error: "Keine Berechtigung, Super Admin Rollen zu ändern" };
    }
  }

  // Prevent changing own role
  if (userId === user.id) {
    return { success: false, error: "Eigene Rolle kann nicht geändert werden" };
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/profil");
  return { success: true };
}

export async function deleteUser(userId: string) {
  await guardAdmin();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Nicht angemeldet" };

  // Only superadmins can delete users
  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "superadmin") {
    return { success: false, error: "Nur Super Admins können Benutzer löschen" };
  }

  // Cannot delete yourself
  if (userId === user.id) {
    return { success: false, error: "Eigenen Account kann nicht gelöscht werden" };
  }

  const admin = createAdminClient();

  // Check target user exists and is not superadmin
  const { data: targetProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!targetProfile) {
    return { success: false, error: "Benutzer nicht gefunden" };
  }

  // Delete profile first (FK constraint)
  await admin.from("profiles").delete().eq("id", userId);

  // Delete auth user
  const { error: authError } = await admin.auth.admin.deleteUser(userId);

  if (authError) {
    return { success: false, error: authError.message };
  }

  revalidatePath("/admin/profil");
  return { success: true };
}

export async function inviteUser(email: string, role: string, fullName: string) {
  await guardAdmin();
  if (!["admin", "buyer", "testadmin"].includes(role)) {
    // Only superadmins can invite as superadmin - checked below
    if (role !== "superadmin") {
      return { success: false, error: "Ungültige Rolle" };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Nicht angemeldet" };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const callerRole = callerProfile?.role;

  if (callerRole !== "superadmin" && callerRole !== "admin") {
    return { success: false, error: "Keine Berechtigung" };
  }

  if (role === "superadmin" && callerRole !== "superadmin") {
    return { success: false, error: "Nur Super Admins können Super Admins einladen" };
  }

  const admin = createAdminClient();

  // Check if user already exists
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (existingProfile) {
    return { success: false, error: "Ein Benutzer mit dieser E-Mail existiert bereits" };
  }

  // Create user via Supabase Admin Auth
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    return { success: false, error: createError.message };
  }

  if (!newUser.user) {
    return { success: false, error: "Benutzer konnte nicht erstellt werden" };
  }

  // Update profile role (trigger creates it as 'buyer')
  if (role !== "buyer") {
    await admin
      .from("profiles")
      .update({ role })
      .eq("id", newUser.user.id);
  }

  // Update full_name in profile
  if (fullName) {
    await admin
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", newUser.user.id);
  }

  // Generate recovery link so user can set their password
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://swingparagliders.pro";
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error("Failed to generate invite link:", linkError?.message);
    // User is created but link failed — return success with warning
    revalidatePath("/admin/profil");
    return { success: true, warning: "Benutzer erstellt, aber Einladungs-Email konnte nicht gesendet werden" };
  }

  // Build custom verify URL (bypasses Supabase redirect allowlist)
  const verifyUrl = `${siteUrl}/auth/verify?token_hash=${encodeURIComponent(linkData.properties.hashed_token)}&type=recovery`;

  // Send branded invitation email
  const html = buildInvitationEmail(null, fullName, verifyUrl);
  const sent = await sendEmail(email, "Einladung zum SWING B2B Portal", html);

  if (!sent) {
    console.error("Failed to send invitation email to:", email);
  }

  revalidatePath("/admin/profil");
  return { success: true };
}

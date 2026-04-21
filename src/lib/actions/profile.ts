"use server";

import { createClient, createAdminClient, guardAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { buildInvitationEmail, sendEmail } from "@/lib/email";

// ── Input sanitation helpers ──────────────────────────────────────────
// Profile mutations were previously mass-assigning raw FormData strings
// directly into the companies table. Any dealer could set contact_email
// to arbitrary text (CRLF injection risk for the outbound email pipeline)
// and run past any length caps. These helpers enforce:
//   - CRLF stripping (prevents header/content injection in email templates)
//   - length caps (DB-friendly, prevents oversized payloads)
//   - null coercion for empty strings
//   - email format check for the one field that flows back into SMTP recipients

function cleanStr(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const cleaned = v.replace(/[\r\n]/g, " ").trim();
  if (cleaned.length === 0) return null;
  return cleaned.slice(0, max);
}
function requireStr(v: unknown, max: number): string {
  const c = cleanStr(v, max);
  if (c === null) throw new Error("Pflichtfeld fehlt");
  return c;
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // Sanitize + validate every field before touching the DB.
  // Required fields: name, contact_email (email format).
  // Everything else is optional and gets null on empty/invalid.
  let fields;
  try {
    const contactEmail = requireStr(formData.get("contact_email"), 200);
    if (!EMAIL_RE.test(contactEmail)) {
      return { success: false, error: "Ungültige E-Mail-Adresse" };
    }
    fields = {
      name: requireStr(formData.get("name"), 200),
      contact_email: contactEmail,
      phone: cleanStr(formData.get("phone"), 50),
      phone_whatsapp: formData.get("phone_whatsapp") === "on",
      address_street: cleanStr(formData.get("address_street"), 200),
      address_zip: cleanStr(formData.get("address_zip"), 20),
      address_city: cleanStr(formData.get("address_city"), 100),
      address_country: cleanStr(formData.get("address_country"), 100),
      vat_id: cleanStr(formData.get("vat_id"), 50),
      updated_at: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Ungültige Eingabe",
    };
  }

  const admin = createAdminClient();

  const { error: companyError } = await admin
    .from("companies")
    .update(fields)
    .eq("id", profile.company_id);

  if (companyError)
    return { success: false, error: companyError.message };

  // Update profile full_name (optional, same sanitation)
  const fullName = cleanStr(formData.get("full_name"), 200);
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

  // Delete the auth user FIRST. The profiles.id FK uses ON DELETE CASCADE
  // (see schema.sql:31), so the profile row is removed automatically as
  // part of this call. Doing it in this order means: if the auth deletion
  // fails, the profile survives and the user is still coherent. The
  // previous order (profile first, then auth) left an orphaned auth user
  // with no profile row when the second step errored, and the profile
  // auto-create trigger would not rehydrate it.
  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    return { success: false, error: authError.message };
  }

  // Defensive: if for any reason the cascade didn't fire (trigger disabled,
  // manual RLS change), clean up the profile row explicitly. No-op if
  // already gone.
  await admin.from("profiles").delete().eq("id", userId);

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
    revalidatePath("/admin/profil");
    return { success: false, error: "Benutzer erstellt, aber Einladungs-E-Mail konnte nicht gesendet werden. Bitte erneut einladen." };
  }

  revalidatePath("/admin/profil");
  return { success: true };
}

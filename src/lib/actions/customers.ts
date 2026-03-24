"use server";

import { createAdminClient, guardAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail, buildApprovalEmail, buildInvitationEmail } from "@/lib/email";
import { isValidUUID } from "@/lib/rate-limit";

function extractCompanyFields(formData: FormData) {
  return {
    name: formData.get("name") as string,
    contact_email: formData.get("contact_email") as string,
    contact_person: (formData.get("contact_person") as string) || null,
    phone: (formData.get("phone") as string) || null,
    phone_whatsapp: formData.get("phone_whatsapp") === "on",
    address_street: (formData.get("address_street") as string) || null,
    address_zip: (formData.get("address_zip") as string) || null,
    address_city: (formData.get("address_city") as string) || null,
    address_country: (formData.get("address_country") as string) || null,
    vat_id: (formData.get("vat_id") as string) || null,
    company_type: (formData.get("company_type") as string) || "dealer",
    sells_paragliders: formData.get("sells_paragliders") === "on",
    sells_miniwings: formData.get("sells_miniwings") === "on",
    sells_parakites: formData.get("sells_parakites") === "on",
  };
}

export async function createCompany(formData: FormData) {
  await guardAdmin();
  const supabase = createAdminClient();
  const fields = extractCompanyFields(formData);

  const { data, error } = await supabase
    .from("companies")
    .insert(fields)
    .select("id")
    .single();

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/kunden");
  return { success: true as const, id: data.id };
}

export async function updateCompany(id: string, formData: FormData) {
  if (!isValidUUID(id)) return { success: false, error: "Ungültige ID" };
  await guardAdmin();
  const supabase = createAdminClient();
  const fields = extractCompanyFields(formData);

  const { error } = await supabase
    .from("companies")
    .update(fields)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/kunden");
  revalidatePath(`/admin/kunden/${id}`);
  return { success: true };
}

export async function updateCompanyNotes(id: string, notes: string) {
  if (!isValidUUID(id)) return { success: false, error: "Ungültige ID" };
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("companies")
    .update({ notes })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/kunden/${id}`);
  return { success: true };
}

export async function toggleCompanyApproval(id: string, approved: boolean) {
  if (!isValidUUID(id)) return { success: false, error: "Ungültige ID" };
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("companies")
    .update({ is_approved: approved })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  // Send approval email to company contact
  if (approved) {
    const { data: company } = await supabase
      .from("companies")
      .select("name, contact_email")
      .eq("id", id)
      .single();

    if (company?.contact_email) {
      sendEmail(
        company.contact_email,
        `Ihr SWING B2B Zugang wurde freigeschaltet`,
        buildApprovalEmail(company.name)
      ).catch((err) => {
        console.error(`[approval-email] Failed for ${company.contact_email}:`, err);
      });
    }
  }

  revalidatePath("/admin/kunden");
  revalidatePath(`/admin/kunden/${id}`);
  return { success: true };
}

export async function inviteCustomer(
  companyId: string,
  email: string,
  fullName: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isValidUUID(companyId)) return { success: false, error: "Ungültige Company-ID" };
  if (!email || !email.includes("@")) return { success: false, error: "Ungültige E-Mail" };

  await guardAdmin();
  const supabase = createAdminClient();

  // Check company exists
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, is_approved")
    .eq("id", companyId)
    .single();

  if (!company) return { success: false, error: "Firma nicht gefunden" };

  // Check if user with this email already exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .single();

  if (existingProfile) return { success: false, error: "Ein Benutzer mit dieser E-Mail existiert bereits" };

  // Create Supabase auth user (email pre-confirmed, no password yet)
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !newUser?.user) {
    console.error("[inviteCustomer] createUser error:", createError);
    return { success: false, error: createError?.message || "Benutzer konnte nicht erstellt werden" };
  }

  // Link profile to company with buyer role
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: newUser.user.id,
      email,
      full_name: fullName || null,
      company_id: companyId,
      role: "buyer",
    });

  if (profileError) {
    console.error("[inviteCustomer] profile upsert error:", profileError);
  }

  // Auto-approve company if not yet approved
  if (!company.is_approved) {
    await supabase
      .from("companies")
      .update({ is_approved: true })
      .eq("id", companyId);
  }

  // Generate recovery link (user sets password on first visit)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://swingparagliders.pro";
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error("[inviteCustomer] generateLink error:", linkError);
    return { success: false, error: "Einladungslink konnte nicht erstellt werden" };
  }

  // Build custom verify URL (bypasses Supabase redirect allowlist)
  const verifyUrl = `${siteUrl}/auth/verify?token_hash=${encodeURIComponent(linkData.properties.hashed_token)}&type=recovery`;

  // Send branded invitation email via Resend
  const html = buildInvitationEmail(company.name, fullName, verifyUrl);
  const sent = await sendEmail(email, `Einladung zum SWING B2B Portal`, html);

  if (!sent) {
    return { success: false, error: "E-Mail konnte nicht gesendet werden" };
  }

  revalidatePath(`/admin/kunden/${companyId}`);
  return { success: true };
}

export async function deleteCompany(id: string) {
  if (!isValidUUID(id)) return { success: false, error: "Ungültige ID" };
  await guardAdmin();
  const supabase = createAdminClient();

  // Get inquiry IDs for this company to delete their items first
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("id")
    .eq("company_id", id);

  if (inquiries && inquiries.length > 0) {
    const inquiryIds = inquiries.map((i) => i.id);
    const { error: itemsErr } = await supabase.from("inquiry_items").delete().in("inquiry_id", inquiryIds);
    if (itemsErr) return { success: false, error: itemsErr.message };
    const { error: inqErr } = await supabase.from("inquiries").delete().eq("company_id", id);
    if (inqErr) return { success: false, error: inqErr.message };
  }

  // Detach profiles from this company (don't delete users, just unlink)
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ company_id: null })
    .eq("company_id", id);
  if (profileErr) return { success: false, error: profileErr.message };

  // Now delete the company (cascades: company_notes, customer_prices, price_uploads)
  const { error } = await supabase.from("companies").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/kunden");
  return { success: true };
}

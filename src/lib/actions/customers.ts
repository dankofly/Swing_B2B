"use server";

import { createAdminClient, guardAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail, buildApprovalEmail } from "@/lib/email";

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
      ).catch(() => {}); // fire-and-forget
    }
  }

  revalidatePath("/admin/kunden");
  revalidatePath(`/admin/kunden/${id}`);
  return { success: true };
}

export async function deleteCompany(id: string) {
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

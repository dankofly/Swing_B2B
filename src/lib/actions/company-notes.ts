"use server";

import { createAdminClient, guardAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isValidUUID } from "@/lib/rate-limit";

export async function getCompanyNotes(companyId: string) {
  if (!isValidUUID(companyId)) throw new Error("Ungültige ID");
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("company_notes")
    .select("id, subject, content, visible_to_customer, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getCustomerVisibleNotes(companyId: string) {
  if (!isValidUUID(companyId)) throw new Error("Ungültige ID");
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("company_notes")
    .select("id, subject, content, created_at")
    .eq("company_id", companyId)
    .eq("visible_to_customer", true)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createCompanyNote(
  companyId: string,
  subject: string,
  content: string,
  visibleToCustomer: boolean = false
) {
  if (!isValidUUID(companyId)) throw new Error("Ungültige ID");
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("company_notes").insert({
    company_id: companyId,
    subject,
    content,
    visible_to_customer: visibleToCustomer,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/kunden/${companyId}`);
  return { success: true };
}

export async function toggleNoteVisibility(noteId: string, companyId: string, visible: boolean) {
  if (!isValidUUID(noteId)) throw new Error("Ungültige ID");
  if (!isValidUUID(companyId)) throw new Error("Ungültige ID");
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("company_notes")
    .update({ visible_to_customer: visible })
    .eq("id", noteId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/kunden/${companyId}`);
  return { success: true };
}

export async function deleteCompanyNote(noteId: string, companyId: string) {
  if (!isValidUUID(noteId)) throw new Error("Ungültige ID");
  if (!isValidUUID(companyId)) throw new Error("Ungültige ID");
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("company_notes")
    .delete()
    .eq("id", noteId);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/kunden/${companyId}`);
  return { success: true };
}

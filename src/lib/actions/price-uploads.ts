"use server";

import { createAdminClient, guardReadOnly } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadPriceList(companyId: string, formData: FormData, category: string = "general") {
  await guardReadOnly();
  const supabase = createAdminClient();
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { success: false, error: "Keine Datei ausgewählt" };
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "pdf" && ext !== "csv") {
    return { success: false, error: "Nur PDF und CSV Dateien erlaubt" };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${companyId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("price-lists")
    .upload(fileName, file);

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from("price-lists")
    .getPublicUrl(fileName);

  const { error: dbError } = await supabase.from("price_uploads").insert({
    company_id: companyId,
    file_url: urlData.publicUrl,
    file_name: file.name,
    file_type: ext,
    category,
    status: "completed",
  });

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  revalidatePath(`/admin/kunden/${companyId}`);
  return { success: true };
}

export async function getCompanyPriceUploads(companyId: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("price_uploads")
    .select("id, file_url, file_name, file_type, category, status, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function deletePriceUpload(id: string, companyId: string) {
  await guardReadOnly();
  const supabase = createAdminClient();

  const { error } = await supabase.from("price_uploads").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/kunden/${companyId}`);
  return { success: true };
}

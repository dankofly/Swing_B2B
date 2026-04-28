"use server";

import { createAdminClient, guardAdmin, guardAdminOrTestadmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isValidUUID } from "@/lib/rate-limit";

/**
 * Legacy server-action upload (sends file through Netlify → slow, 10s timeout).
 * Kept for non-PDF/CSV fallback but the primary path now uses direct browser upload.
 */
export async function uploadPriceList(companyId: string, formData: FormData, category: string = "general") {
  if (!isValidUUID(companyId)) return { success: false, error: "Ungültige ID" };
  await guardAdmin();
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

/**
 * Save a price_uploads DB record after the browser has already uploaded
 * the file directly to Supabase Storage (no file transfer through Netlify).
 */
export async function savePriceUploadRecord(
  companyId: string,
  fileUrl: string,
  fileName: string,
  fileType: string,
  category: string = "general"
) {
  if (!isValidUUID(companyId)) return { success: false, error: "Ungültige ID" };
  await guardAdmin();
  const supabase = createAdminClient();

  const { error: dbError } = await supabase.from("price_uploads").insert({
    company_id: companyId,
    file_url: fileUrl,
    file_name: fileName,
    file_type: fileType,
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
  if (!isValidUUID(companyId)) return [];
  await guardAdminOrTestadmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("price_uploads")
    .select("id, file_url, file_name, file_type, category, status, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function deletePriceUpload(id: string, companyId: string) {
  if (!isValidUUID(id) || !isValidUUID(companyId)) return { success: false, error: "Ungültige ID" };
  try {
    await guardAdmin();
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Keine Berechtigung" };
  }

  const supabase = createAdminClient();

  // Get the file URL before deleting the record
  const { data: upload } = await supabase
    .from("price_uploads")
    .select("file_url")
    .eq("id", id)
    .single();

  if (!upload) {
    return { success: false, error: "Eintrag nicht gefunden" };
  }

  const { error } = await supabase
    .from("price_uploads")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) return { success: false, error: error.message };

  // Delete the file from storage
  if (upload.file_url) {
    try {
      const path = upload.file_url.split("/price-lists/").pop();
      if (path) {
        await supabase.storage.from("price-lists").remove([decodeURIComponent(path)]);
      }
    } catch {
      // Storage cleanup is best-effort
    }
  }

  revalidatePath(`/admin/kunden/${companyId}`);
  return { success: true };
}

/**
 * Delete ALL price uploads for a company+category and also remove
 * the associated customer_prices so the dealer sees no stale prices.
 */
export async function deleteAllCategoryUploads(companyId: string, category: string) {
  if (!isValidUUID(companyId)) return { success: false, error: "Ungültige ID" };
  try {
    await guardAdmin();
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Keine Berechtigung" };
  }

  const supabase = createAdminClient();

  // 1. Get all uploads for this company+category
  const { data: uploads } = await supabase
    .from("price_uploads")
    .select("id, file_url")
    .eq("company_id", companyId)
    .eq("category", category);

  if (!uploads || uploads.length === 0) {
    return { success: false, error: "Keine Einträge gefunden" };
  }

  // 2. Delete all DB records
  const { error } = await supabase
    .from("price_uploads")
    .delete()
    .eq("company_id", companyId)
    .eq("category", category);

  if (error) return { success: false, error: error.message };

  // 3. Delete all files from storage (best-effort)
  const storagePaths: string[] = [];
  for (const u of uploads) {
    if (u.file_url) {
      const path = u.file_url.split("/price-lists/").pop();
      if (path) storagePaths.push(decodeURIComponent(path));
    }
  }
  if (storagePaths.length > 0) {
    try {
      await supabase.storage.from("price-lists").remove(storagePaths);
    } catch {
      // Storage cleanup is best-effort
    }
  }

  // 4. Delete all customer_prices for this company
  await supabase
    .from("customer_prices")
    .delete()
    .eq("company_id", companyId);

  revalidatePath(`/admin/kunden/${companyId}`);
  revalidatePath(`/admin/kunden/${companyId}/preise`);
  return { success: true, deletedCount: uploads.length };
}

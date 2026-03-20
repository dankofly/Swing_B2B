"use server";

import { createAdminClient, guardAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isValidUUID } from "@/lib/rate-limit";

export async function getActiveNews() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("news_ticker")
    .select("id, message, message_en, message_fr")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAllNews() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("news_ticker")
    .select("id, message, message_en, message_fr, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createNews(message: string, messageEn?: string, messageFr?: string) {
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("news_ticker").insert({
    message,
    message_en: messageEn || null,
    message_fr: messageFr || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/news");
  revalidatePath("/katalog");
  return { success: true };
}

export async function updateNews(
  id: string,
  message: string,
  messageEn?: string,
  messageFr?: string
) {
  if (!isValidUUID(id)) throw new Error("Ungültige ID");
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("news_ticker")
    .update({
      message,
      message_en: messageEn || null,
      message_fr: messageFr || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/news");
  revalidatePath("/katalog");
  return { success: true };
}

export async function toggleNewsActive(id: string, isActive: boolean) {
  if (!isValidUUID(id)) throw new Error("Ungültige ID");
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("news_ticker")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/news");
  revalidatePath("/katalog");
  return { success: true };
}

export async function deleteNews(id: string) {
  if (!isValidUUID(id)) throw new Error("Ungültige ID");
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.from("news_ticker").delete().eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/news");
  revalidatePath("/katalog");
  return { success: true };
}

export async function reorderNews(ids: string[]) {
  if (!ids.every(isValidUUID)) throw new Error("Ungültige ID");
  await guardAdmin();
  const supabase = createAdminClient();

  await Promise.all(
    ids.map((id, i) =>
      supabase.from("news_ticker").update({ sort_order: i }).eq("id", id)
    )
  );

  revalidatePath("/admin/news");
  revalidatePath("/katalog");
  return { success: true };
}

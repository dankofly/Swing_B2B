"use server";

import { createAdminClient, guardAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id: string): boolean { return UUID_RE.test(id); }

/** A single matched price row ready to be saved (one per product_size). */
export interface MatchedPriceItem {
  product_size_id: string;
  product_id: string | null;
  portal_model: string;
  portal_size: string;
  sku: string | null;
  uvp_incl_vat: number | null;
  ek_netto: number | null;
  pdf_model_raw: string;
  pdf_category: string;
}

/**
 * Confirm and save matched prices for a dealer (company).
 * Deletes ALL existing prices for this company first – each upload replaces the full price list.
 */
export async function confirmPrices(
  companyId: string,
  items: MatchedPriceItem[]
) {
  if (!isValidUUID(companyId)) throw new Error("Ungültige Firmen-ID");
  await guardAdmin();
  const supabase = createAdminClient();

  const valid = items.filter(
    (i) => i.product_size_id && i.ek_netto != null && i.ek_netto > 0
  );

  if (valid.length === 0) {
    throw new Error("Keine gültigen Preise zum Speichern");
  }

  // Delete ALL existing prices for this company first
  await supabase
    .from("customer_prices")
    .delete()
    .eq("company_id", companyId);

  const productIds = new Set<string>();

  // Batch update UVP on product level (deduplicate by product_id)
  const uvpUpdates = new Map<string, number>();
  for (const item of valid) {
    if (item.uvp_incl_vat && item.uvp_incl_vat > 0 && item.product_id) {
      uvpUpdates.set(item.product_id, item.uvp_incl_vat);
    }
    if (item.product_id) productIds.add(item.product_id);
  }

  await Promise.all(
    Array.from(uvpUpdates.entries()).map(([productId, uvp]) =>
      supabase.from("products").update({ uvp_brutto: uvp }).eq("id", productId)
    )
  );

  // Batch insert all prices at once
  const rows = valid.map((item) => ({
    company_id: companyId,
    product_size_id: item.product_size_id,
    unit_price: item.ek_netto,
    uvp_incl_vat: item.uvp_incl_vat,
  }));

  const { error } = await supabase.from("customer_prices").insert(rows);
  if (error) {
    console.error("Batch price insert error:", error);
    throw new Error(`Preise konnten nicht gespeichert werden: ${error.message}`);
  }

  revalidatePath(`/admin/kunden/${companyId}`);
  return { savedCount: valid.length, productCount: productIds.size };
}

export async function getCompanyPrices(companyId: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("customer_prices")
    .select(
      `
      id,
      unit_price,
      uvp_incl_vat,
      valid_from,
      product_size:product_sizes(
        id, sku, size_label,
        product:products(name)
      )
    `
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

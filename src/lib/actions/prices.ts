"use server";

import { createAdminClient, guardReadOnly } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  await guardReadOnly();
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

  let savedCount = 0;
  const productIds = new Set<string>();

  for (const item of valid) {
    // Save UVP on the product level (if available)
    if (item.uvp_incl_vat && item.uvp_incl_vat > 0 && item.product_id) {
      await supabase
        .from("products")
        .update({ uvp_brutto: item.uvp_incl_vat })
        .eq("id", item.product_id);
    }

    // Save dealer price per size
    const { error } = await supabase.from("customer_prices").insert({
      company_id: companyId,
      product_size_id: item.product_size_id,
      unit_price: item.ek_netto,
      uvp_incl_vat: item.uvp_incl_vat,
    });

    if (error) {
      console.error(`Price insert error for ${item.sku}:`, error);
    } else {
      savedCount++;
      if (item.product_id) productIds.add(item.product_id);
    }
  }

  revalidatePath(`/admin/kunden/${companyId}`);
  return { savedCount, productCount: productIds.size };
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

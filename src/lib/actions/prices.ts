"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ParsedPriceItem {
  modell_pdf: string;
  uvp_brutto: number;
  ek_netto: number;
  groessen: string;
  discount: number;
  status: "matched" | "unmatched";
  product_id: string | null;
  product_name: string | null;
  product_sizes: Array<{ id: string; sku: string; size_label: string }>;
}

export async function confirmPrices(
  companyId: string,
  items: ParsedPriceItem[]
) {
  const supabase = createAdminClient();

  const matched = items.filter(
    (i) => i.status === "matched" && i.product_id && i.product_sizes.length > 0
  );

  if (matched.length === 0) {
    throw new Error("Keine zugeordneten Preise zum Speichern");
  }

  // Delete ALL existing prices for this company first
  // Each customer gets exactly the prices from their uploaded price list
  await supabase
    .from("customer_prices")
    .delete()
    .eq("company_id", companyId);

  let savedCount = 0;

  for (const item of matched) {
    // Save UVP on the product
    if (item.uvp_brutto > 0 && item.product_id) {
      await supabase
        .from("products")
        .update({ uvp_brutto: item.uvp_brutto })
        .eq("id", item.product_id);
    }

    // Save the same EK netto price for ALL sizes of this product
    for (const size of item.product_sizes) {
      const { error } = await supabase.from("customer_prices").insert({
        company_id: companyId,
        product_size_id: size.id,
        unit_price: item.ek_netto,
        discount: item.discount,
      });

      if (error) {
        console.error(`Price insert error for ${size.sku}:`, error);
      } else {
        savedCount++;
      }
    }
  }

  revalidatePath("/admin/preislisten");
  revalidatePath(`/admin/kunden/${companyId}`);
  return { savedCount, productCount: matched.length };
}

export async function getCompanyPrices(companyId: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("customer_prices")
    .select(
      `
      id,
      unit_price,
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

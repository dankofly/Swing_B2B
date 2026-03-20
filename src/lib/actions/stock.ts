"use server";

import { createAdminClient, guardAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isValidUUID } from "@/lib/rate-limit";

interface StockEntry {
  color_name: string;
  size_label: string;
  stock_quantity: number;
}

export async function updateColorSizeStock(
  productId: string,
  stockData: StockEntry[]
) {
  if (!isValidUUID(productId)) throw new Error("Ungültige ID");
  await guardAdmin();
  const supabase = createAdminClient();

  // Delete existing entries for this product, then insert fresh
  const { error: deleteError } = await supabase
    .from("color_size_stock")
    .delete()
    .eq("product_id", productId);

  if (deleteError) throw new Error(deleteError.message);

  if (stockData.length > 0) {
    const { error: insertError } = await supabase
      .from("color_size_stock")
      .insert(
        stockData.map((entry) => ({
          product_id: productId,
          color_name: entry.color_name,
          size_label: entry.size_label,
          stock_quantity: entry.stock_quantity,
        }))
      );

    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath("/katalog");
  revalidatePath("/admin/produkte");
}

interface CSVStockEntry {
  product_id: string;
  product_name: string;
  size_label: string;
  color_name: string | null;
  count: number;
}

/**
 * Full-sync stock import from CSV.
 * 1. Zero ALL product_sizes.stock_quantity → 0 for all products
 * 2. Delete ALL color_size_stock entries
 * 3. Apply matched CSV values (overwrite)
 *
 * This ensures: matched variants = CSV stock, unmatched = 0.
 * No products are ever deleted.
 */
export async function importStockFromCSV(
  stockData: CSVStockEntry[],
  options?: { fullSync?: boolean }
): Promise<{ updated: number; zeroed: number }> {
  await guardAdmin();
  const supabase = createAdminClient();
  let updated = 0;
  let zeroed = 0;

  const isFullSync = options?.fullSync ?? true;

  // ── Step 1: Zero out ALL stock (full sync) ──
  if (isFullSync) {
    // Zero all product_sizes.stock_quantity → 0
    const { data: allSizes } = await supabase
      .from("product_sizes")
      .select("id, stock_quantity")
      .gt("stock_quantity", 0);

    if (allSizes && allSizes.length > 0) {
      // Batch update in chunks of 50
      const CHUNK = 50;
      for (let i = 0; i < allSizes.length; i += CHUNK) {
        const chunk = allSizes.slice(i, i + CHUNK);
        await Promise.all(
          chunk.map((s) =>
            supabase
              .from("product_sizes")
              .update({ stock_quantity: 0 })
              .eq("id", s.id)
          )
        );
      }
      zeroed = allSizes.length;
    }

    // Delete ALL color_size_stock entries
    await supabase.from("color_size_stock").delete().neq("stock_quantity", -999);
  }

  // ── Step 2: Apply matched CSV values ──
  // Group by product_id for batch processing
  const byProduct = new Map<string, CSVStockEntry[]>();
  for (const entry of stockData) {
    const arr = byProduct.get(entry.product_id) ?? [];
    arr.push(entry);
    byProduct.set(entry.product_id, arr);
  }

  // Process all products in parallel
  const results = await Promise.all(
    Array.from(byProduct.entries()).map(async ([productId, entries]) => {
      let productUpdated = 0;

      // 1. Insert color_size_stock for entries with a color
      const colorEntries = entries.filter((e) => e.color_name);
      if (colorEntries.length > 0) {
        const { error: insertError } = await supabase
          .from("color_size_stock")
          .insert(
            colorEntries.map((entry) => ({
              product_id: productId,
              color_name: entry.color_name!,
              size_label: entry.size_label,
              stock_quantity: entry.count,
            }))
          );

        if (insertError) {
          console.error(`color_size_stock insert error for ${productId}:`, insertError);
        }
      }

      // 2. Update product_sizes.stock_quantity (aggregate all colors per size)
      const sizeStock = new Map<string, number>();
      for (const entry of entries) {
        sizeStock.set(
          entry.size_label,
          (sizeStock.get(entry.size_label) || 0) + entry.count
        );
      }

      // Batch size updates in parallel per product
      const sizeResults = await Promise.all(
        Array.from(sizeStock.entries()).map(([sizeLabel, quantity]) =>
          supabase
            .from("product_sizes")
            .update({ stock_quantity: quantity })
            .eq("product_id", productId)
            .eq("size_label", sizeLabel)
        )
      );

      for (const { error } of sizeResults) {
        if (!error) productUpdated++;
      }

      return productUpdated;
    })
  );

  updated = results.reduce((sum, count) => sum + count, 0);

  revalidatePath("/katalog");
  revalidatePath("/admin/produkte");
  revalidatePath("/admin/lager");

  return { updated, zeroed };
}

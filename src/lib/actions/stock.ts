"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface StockEntry {
  color_name: string;
  size_label: string;
  stock_quantity: number;
}

export async function updateColorSizeStock(
  productId: string,
  stockData: StockEntry[]
) {
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

export async function importStockFromCSV(
  stockData: CSVStockEntry[]
): Promise<{ updated: number }> {
  const supabase = createAdminClient();
  let updated = 0;

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

      // 1. Update color_size_stock for entries with a color
      const colorEntries = entries.filter((e) => e.color_name);
      if (colorEntries.length > 0) {
        await supabase
          .from("color_size_stock")
          .delete()
          .eq("product_id", productId);

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

  return { updated };
}

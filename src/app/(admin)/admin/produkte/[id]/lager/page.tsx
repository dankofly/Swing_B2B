import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import type { ProductSize, ProductColor } from "@/lib/types";
import StockMatrixClient from "@/components/admin/StockMatrixClient";

export default async function LagerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      id, name,
      sizes:product_sizes(id, size_label, stock_quantity, sort_order),
      colors:product_colors(id, color_name, color_image_url, sort_order)
    `)
    .eq("id", id)
    .single();

  if (!product) notFound();

  const sizes = ((product.sizes || []) as ProductSize[]).sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const colors = ((product.colors || []) as ProductColor[]).sort(
    (a, b) => a.sort_order - b.sort_order
  );

  // Load existing per-color-size stock
  const { data: stockEntries } = await supabase
    .from("color_size_stock")
    .select("color_name, size_label, stock_quantity")
    .eq("product_id", id);

  const stockMap: Record<string, number> = {};
  for (const entry of stockEntries ?? []) {
    stockMap[`${entry.color_name}::${entry.size_label}`] = entry.stock_quantity;
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10 flex items-center gap-4">
          <Link
            href="/admin/produkte"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Lagerbestand
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              {product.name}
            </h1>
          </div>
        </div>
      </div>

      {colors.length === 0 || sizes.length === 0 ? (
        <div className="card p-12 text-center ">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
            <Package size={24} className="text-swing-navy/25" />
          </div>
          <p className="text-sm font-bold text-swing-navy/25">
            Keine {colors.length === 0 ? "Farbdesigns" : "Größen"} vorhanden
          </p>
          <p className="mt-1 text-[13px] text-swing-gray-dark/25">
            Bitte zuerst im Produkt anlegen.
          </p>
          <Link
            href={`/admin/produkte/${id}/bearbeiten`}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-swing-gold px-5 py-2.5 text-sm font-bold text-swing-navy transition-colors hover:bg-swing-gold-dark"
          >
            Produkt bearbeiten
          </Link>
        </div>
      ) : (
        <StockMatrixClient
          productId={id}
          sizes={sizes.map((s) => ({
            size_label: s.size_label,
            stock_quantity: s.stock_quantity,
          }))}
          colors={colors.map((c) => ({
            color_name: c.color_name,
            color_image_url: c.color_image_url,
          }))}
          stockMap={stockMap}
        />
      )}
    </div>
  );
}

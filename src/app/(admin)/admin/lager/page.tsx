import { createAdminClient } from "@/lib/supabase/server";
import LagerImportClient from "./LagerImportClient";
import StockOverview from "./StockOverview";


export default async function AdminLagerPage() {
  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, slug,
      sizes:product_sizes(id, size_label, sku, stock_quantity, sort_order),
      colors:product_colors(id, color_name, sort_order)
    `)
    .eq("is_active", true)
    .order("name");

  // Compute summary stats
  const allSizes = (products ?? []).flatMap((p) => p.sizes ?? []);
  const totalStock = allSizes.reduce((s, sz) => s + (sz.stock_quantity ?? 0), 0);
  const outOfStock = allSizes.filter((sz) => (sz.stock_quantity ?? 0) === 0).length;
  const lowStock = allSizes.filter(
    (sz) => (sz.stock_quantity ?? 0) > 0 && (sz.stock_quantity ?? 0) <= 10
  ).length;
  const inStock = allSizes.filter((sz) => (sz.stock_quantity ?? 0) > 10).length;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Verwaltung
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Lagerbestand
          </h1>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-swing-navy">{totalStock}</p>
          <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">
            Gesamtbestand
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{inStock}</p>
          <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">
            Verfügbar (&gt;10)
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{lowStock}</p>
          <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">
            Niedrig (1–10)
          </p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{outOfStock}</p>
          <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">
            Ausverkauft
          </p>
        </div>
      </div>

      {/* Stock Overview */}
      <StockOverview products={products ?? []} />

      {/* CSV Import */}
      <LagerImportClient />
    </div>
  );
}

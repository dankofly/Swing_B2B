import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Plus, Package } from "lucide-react";
import SortableProductList from "./SortableProductList";

export const dynamic = "force-dynamic";

export default async function ProduktePage() {
  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name),
      sizes:product_sizes(id, size_label, sku, stock_quantity),
      colors:product_colors(id, color_name)
    `)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Verwaltung
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Produkte
            </h1>
          </div>
          <Link
            href="/admin/produkte/neu"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-swing-gold px-4 py-2.5 text-sm font-bold text-swing-navy transition-colors hover:bg-swing-gold-dark sm:px-5"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Neues Produkt</span>
            <span className="sm:hidden">Neu</span>
          </Link>
        </div>
      </div>

      {!products || products.length === 0 ? (
        <div className="card p-12 text-center ">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
            <Package size={24} className="text-swing-navy/40" />
          </div>
          <p className="text-sm font-bold text-swing-navy/40">
            Noch keine Produkte vorhanden
          </p>
          <p className="mt-1 text-[13px] text-swing-gray-dark/25">
            Legen Sie Ihr erstes Produkt an, um den Katalog zu befüllen.
          </p>
          <Link
            href="/admin/produkte/neu"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-swing-gold px-5 py-2.5 text-sm font-bold text-swing-navy transition-colors hover:bg-swing-gold-dark"
          >
            <Plus size={16} />
            Erstes Produkt anlegen
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden card">
          <SortableProductList products={products as any} />
        </div>
      )}
    </div>
  );
}

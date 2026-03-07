import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Plus, Pencil, Eye, EyeOff, Package } from "lucide-react";
import type { Product } from "@/lib/types";
import { DeleteProductButton, ToggleActiveButton } from "./ProductActions";

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
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Verwaltung
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Produkte
            </h1>
          </div>
          <Link
            href="/admin/produkte/neu"
            className="flex items-center gap-2 rounded-lg bg-swing-gold px-5 py-2.5 text-sm font-bold text-swing-navy transition-colors hover:bg-swing-gold-dark"
          >
            <Plus size={16} />
            Neues Produkt
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
        <div className="overflow-hidden card ">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/60 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                <th className="px-6 py-3">Produkt</th>
                <th className="px-6 py-3">Kategorie</th>
                <th className="px-6 py-3">Größen</th>
                <th className="px-6 py-3">Farben</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(products as (Product & { category: { name: string } | null })[]).map((product) => (
                <tr key={product.id} className="hover:bg-swing-gold/4">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-xs text-swing-navy/40">
                          —
                        </div>
                      )}
                      <span className="font-medium text-swing-navy">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-swing-gray-dark/60">
                    {product.category?.name || "—"}
                  </td>
                  <td className="px-6 py-4 tabular-nums">
                    {product.sizes?.length || 0} Größen
                  </td>
                  <td className="px-6 py-4 tabular-nums">
                    {product.colors?.length || 0} Farben
                  </td>
                  <td className="px-6 py-4">
                    <ToggleActiveButton
                      productId={product.id}
                      isActive={product.is_active}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/produkte/${product.id}/lager`}
                        className="rounded-lg p-2 text-swing-navy/40 transition-colors hover:bg-swing-gold/10 hover:text-swing-navy"
                        title="Lagerbestand"
                      >
                        <Package size={16} />
                      </Link>
                      <Link
                        href={`/admin/produkte/${product.id}/bearbeiten`}
                        className="rounded-lg p-2 text-swing-navy/40 transition-colors hover:bg-swing-gold/10 hover:text-swing-navy"
                        title="Bearbeiten"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PriceEditor from "./PriceEditor";

export default async function CustomerPricesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch company, all active products+sizes, and existing customer prices in parallel
  const [
    { data: company },
    { data: products },
    { data: sizes },
    { data: prices },
    { data: categories },
  ] = await Promise.all([
    supabase.from("companies").select("id, name").eq("id", id).single(),
    supabase.from("products").select("id, name, category_id, uvp_brutto, sort_order").eq("is_active", true).order("sort_order"),
    supabase.from("product_sizes").select("id, product_id, size_label, sku, stock_quantity, sort_order").order("sort_order"),
    supabase.from("customer_prices").select("id, product_size_id, unit_price, uvp_incl_vat").eq("company_id", id),
    supabase.from("categories").select("id, name, sort_order").order("sort_order"),
  ]);

  if (!company) notFound();

  // Build price lookup: product_size_id → { ek_netto, uvp }
  const priceMap: Record<string, { ek_netto: number; uvp_incl_vat: number | null }> = {};
  for (const p of prices ?? []) {
    priceMap[p.product_size_id] = {
      ek_netto: p.unit_price,
      uvp_incl_vat: p.uvp_incl_vat,
    };
  }

  // Build category lookup
  const categoryMap: Record<string, string> = {};
  for (const c of categories ?? []) {
    categoryMap[c.id] = c.name;
  }

  // Group sizes by product, then group products by category
  const sizesByProduct: Record<string, typeof sizes> = {};
  for (const s of sizes ?? []) {
    if (!sizesByProduct[s.product_id]) sizesByProduct[s.product_id] = [];
    sizesByProduct[s.product_id]!.push(s);
  }

  // Build structured data for the editor
  const productData = (products ?? [])
    .filter((p) => sizesByProduct[p.id]?.length)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category_id ? categoryMap[p.category_id] || "" : "",
      uvp_brutto: p.uvp_brutto,
      sizes: (sizesByProduct[p.id] ?? []).map((s) => ({
        id: s.id,
        label: s.size_label,
        sku: s.sku,
        stock: s.stock_quantity,
        ek_netto: priceMap[s.id]?.ek_netto ?? null,
        uvp_incl_vat: priceMap[s.id]?.uvp_incl_vat ?? null,
      })),
    }));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
          <Link
            href={`/admin/kunden/${id}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Preise bearbeiten
            </p>
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {company.name}
            </h1>
          </div>
        </div>
      </div>

      <PriceEditor companyId={id} products={productData} />
    </div>
  );
}

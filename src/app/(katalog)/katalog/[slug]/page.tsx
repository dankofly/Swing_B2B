import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { ProductSize, ProductColor } from "@/lib/types";
import ProductDetailClient from "@/components/katalog/ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProduktDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name, slug),
      sizes:product_sizes(*),
      colors:product_colors(*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const sizes = ((product.sizes || []) as ProductSize[]).sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const colors = ((product.colors || []) as ProductColor[]).sort(
    (a, b) => a.sort_order - b.sort_order
  );

  // Fetch logged-in user's company prices for this product's sizes
  const { data: { user } } = await supabase.auth.getUser();
  let priceMap: Record<string, number> = {};
  let discountMap: Record<string, number> = {};
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (profile?.company_id) {
      const sizeIds = sizes.map((s) => s.id);
      const { data: prices } = await supabase
        .from("customer_prices")
        .select("product_size_id, unit_price, discount")
        .eq("company_id", profile.company_id)
        .in("product_size_id", sizeIds);

      for (const p of prices ?? []) {
        priceMap[p.product_size_id] = Number(p.unit_price);
        if (p.discount) discountMap[p.product_size_id] = Number(p.discount);
      }
    }
  }

  // Fetch per-color-size stock overrides
  const { data: stockEntries } = await supabase
    .from("color_size_stock")
    .select("color_name, size_label, stock_quantity")
    .eq("product_id", product.id);

  const stockMap: Record<string, number> = {};
  for (const entry of stockEntries ?? []) {
    stockMap[`${entry.color_name}::${entry.size_label}`] = entry.stock_quantity;
  }

  const enClass = product.en_class || product.tech_specs?.["EN-Zertifizierung"];
  const categoryName = product.category
    ? (product.category as unknown as { name: string }).name
    : null;

  const rawSpecs = product.tech_specs as Record<string, string> | null;
  // Filter out en_class / EN-Zertifizierung — already shown as badge
  const techSpecs = rawSpecs
    ? Object.fromEntries(
        Object.entries(rawSpecs).filter(
          ([key]) => key !== "en_class" && key !== "EN-Zertifizierung"
        )
      )
    : null;
  const hasSpecs = techSpecs && Object.keys(techSpecs).length > 0;

  return (
    <div className="space-y-6">
      <Link
        href="/katalog"
        className="inline-flex items-center gap-1.5 text-sm text-swing-navy/40 transition-colors duration-200 hover:text-swing-navy"
      >
        <ArrowLeft size={14} />
        Zurück zum Katalog
      </Link>

      {/* Product Hero */}
      <div className="dash-hero overflow-hidden rounded-xl">
        {/* Top bar with category + badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 border-b border-white/8 px-6 py-3.5 sm:px-8">
          {categoryName && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              {categoryName}
            </span>
          )}
          {(enClass || product.classification || product.use_case || product.is_preorder || product.is_fade_out) && (
            <div className="flex flex-wrap items-center gap-2">
              {product.is_preorder && (
                <span className="rounded bg-swing-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-swing-navy">
                  Jetzt vorbestellen
                </span>
              )}
              {product.is_fade_out && (
                <span className="rounded bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700">
                  Fade Out
                </span>
              )}
              {enClass && (
                <span className="rounded bg-swing-gold px-3 py-1 text-xs font-bold tracking-wide text-swing-navy">
                  {enClass}
                </span>
              )}
              {product.classification && (
                <span className="glass-dark rounded px-3 py-1 text-xs font-bold tracking-wide text-white/90">
                  {product.classification}
                </span>
              )}
              {product.use_case && (
                <span className="rounded bg-white/8 px-3 py-1 text-xs font-medium tracking-wide text-white/60">
                  {product.use_case}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main hero content */}
        <div className={`relative z-10 grid gap-8 p-6 sm:p-8 lg:p-10 ${hasSpecs ? "lg:grid-cols-[1fr,auto]" : ""}`}>
          {/* Left: Name + Description */}
          <div className="flex flex-col justify-center">
            <h1 className="swing-h1">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-white/50">
                {product.description}
              </p>
            )}

            {product.website_url && (
              <a
                href={product.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold group mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-swing-gold px-5 py-2.5 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20"
              >
                <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5" />
                Produkt auf swing.de ansehen
              </a>
            )}
          </div>

          {/* Right: Tech Specs card */}
          {hasSpecs && (
            <div className="glass-dark min-w-65 rounded-lg p-6">
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-gold/80">
                Technische Daten
              </h3>
              <dl className="space-y-2.5 text-sm">
                {Object.entries(techSpecs).map(([key, value]) => (
                  <div key={key} className="flex items-baseline justify-between gap-6">
                    <dt className="text-white/35">{key}</dt>
                    <dd className="text-right font-semibold text-white/90 tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Color Designs + Size Table */}
      <ProductDetailClient
        productId={product.id}
        productName={product.name}
        sizes={sizes}
        colors={colors}
        priceMap={priceMap}
        discountMap={discountMap}
        uvpBrutto={product.uvp_brutto ? Number(product.uvp_brutto) : null}
        stockMap={stockMap}
      />
    </div>
  );
}

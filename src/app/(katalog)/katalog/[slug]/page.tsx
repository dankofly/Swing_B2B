import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { ProductSize, ProductColor } from "@/lib/types";
import ProductDetailClient from "@/components/katalog/ProductDetailClient";
import ActionCountdown from "@/components/katalog/ActionCountdown";
import RelatedProductCard from "@/components/katalog/RelatedProductCard";
import { getDictionary, getLocale } from "@/lib/i18n";
import { localized } from "@/lib/i18n/localized";

export const dynamic = "force-dynamic";

export default async function ProduktDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ als?: string }>;
}) {
  const { slug } = await params;
  const { als } = await searchParams;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name, name_en, name_fr, slug),
      sizes:product_sizes(*),
      colors:product_colors(*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

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
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin" || profile?.role === "superadmin";

    // Use "als" company_id if admin is viewing as customer, otherwise own company
    const effectiveCompanyId = als && isAdmin ? als : profile?.company_id;

    if (effectiveCompanyId) {
      const sizeIds = sizes.map((s) => s.id);
      const { data: prices } = await supabase
        .from("customer_prices")
        .select("product_size_id, unit_price, discount")
        .eq("company_id", effectiveCompanyId)
        .in("product_size_id", sizeIds);

      for (const p of prices ?? []) {
        priceMap[p.product_size_id] = Number(p.unit_price);
        if (p.discount) discountMap[p.product_size_id] = Number(p.discount);
      }
    }
  }

  const viewingAsCompanyId = als && isAdmin ? als : undefined;

  // Fetch per-color-size stock overrides
  const { data: stockEntries } = await supabase
    .from("color_size_stock")
    .select("color_name, size_label, stock_quantity")
    .eq("product_id", product.id);

  const stockMap: Record<string, number> = {};
  for (const entry of stockEntries ?? []) {
    stockMap[`${entry.color_name}::${entry.size_label}`] = entry.stock_quantity;
  }

  // Fetch related products
  const { data: relationsRaw } = await supabase
    .from("product_relations")
    .select("related_product_id, relation_type, sort_order")
    .eq("product_id", product.id)
    .order("sort_order");

  const relatedIds = (relationsRaw || []).map((r) => r.related_product_id);
  let similarProducts: any[] = [];
  let accessoryProducts: any[] = [];

  if (relatedIds.length > 0) {
    const { data: relatedRaw } = await supabase
      .from("products")
      .select("id, name, name_en, name_fr, slug, description, description_en, description_fr, category:categories(name, name_en, name_fr), en_class, en_class_custom, classification, use_case, use_case_en, use_case_fr, is_action")
      .in("id", relatedIds)
      .eq("is_active", true);

    const relatedMap = new Map((relatedRaw || []).map((p) => [p.id, p]));
    const similarIds = (relationsRaw || []).filter((r) => r.relation_type === "similar").map((r) => r.related_product_id);
    const accessoryIds = (relationsRaw || []).filter((r) => r.relation_type === "accessory").map((r) => r.related_product_id);
    similarProducts = similarIds.map((id) => relatedMap.get(id)).filter(Boolean);
    accessoryProducts = accessoryIds.map((id) => relatedMap.get(id)).filter(Boolean);
  }

  const enClass = product.en_class || product.tech_specs?.["EN-Zertifizierung"];
  const enClassCustom = product.en_class_custom;
  const rawCategory = product.category as unknown as Record<string, unknown> | null;
  const categoryName = rawCategory ? localized(rawCategory, "name", locale) : null;
  const productName = localized(product as unknown as Record<string, unknown>, "name", locale) || product.name;
  const productDescription = localized(product as unknown as Record<string, unknown>, "description", locale);
  const productUseCase = localized(product as unknown as Record<string, unknown>, "use_case", locale);
  const productActionText = localized(product as unknown as Record<string, unknown>, "action_text", locale);

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

  const backHref = viewingAsCompanyId ? `/katalog?als=${viewingAsCompanyId}` : "/katalog";

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-swing-navy/40 transition-colors duration-200 hover:text-swing-navy"
      >
        <ArrowLeft size={14} />
        {dict.katalog.detail.backToCatalog}
      </Link>

      {/* Product Hero */}
      <div className="dash-hero overflow-hidden rounded-xl">
        {/* Top bar with category + badges */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 border-b border-white/8 px-4 py-3 sm:gap-3 sm:px-6 sm:py-3.5 md:px-8">
          {categoryName && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              {categoryName}
            </span>
          )}
          {(enClass || enClassCustom || product.classification || product.use_case || product.is_preorder || product.is_fade_out || product.is_action) && (
            <div className="flex flex-wrap items-center gap-2">
              {product.is_preorder && (
                <span className="rounded bg-swing-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-swing-navy">
                  {dict.katalog.badges.preorder}
                </span>
              )}
              {product.is_fade_out && (
                <span className="rounded bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700">
                  Fade Out
                </span>
              )}
              {product.is_action && (
                <span className="badge-action rounded px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  {dict.katalog.badges.action}
                </span>
              )}
              {enClass && (
                <span className="rounded bg-swing-gold px-3 py-1 text-xs font-bold tracking-wide text-swing-navy" title={dict.katalog.tooltips.enClass}>
                  {enClass}
                </span>
              )}
              {enClassCustom && (
                <span className="rounded border border-swing-gold/40 bg-swing-gold/15 px-3 py-1 text-xs font-bold tracking-wide text-swing-gold" title={dict.katalog.tooltips.enClass}>
                  {enClassCustom}
                </span>
              )}
              {product.classification && (
                <span className="glass-dark rounded px-3 py-1 text-xs font-bold tracking-wide text-white/90" title={dict.katalog.tooltips.classification}>
                  {product.classification}
                </span>
              )}
              {product.use_case && (
                <span className="rounded bg-white/8 px-3 py-1 text-xs font-medium tracking-wide text-white/60">
                  {productUseCase}
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
              {productName}
            </h1>

            {product.description && (
              <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-white/50">
                {productDescription}
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
                {dict.katalog.detail.viewOnWebsite}
              </a>
            )}
          </div>

          {/* Right: Tech Specs card */}
          {hasSpecs && (
            <div className="glass-dark w-full rounded-lg p-5 sm:p-6 lg:min-w-65">
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-gold/80">
                {dict.katalog.detail.techSpecs}
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

      {/* Action/Sale Banner */}
      {product.is_action && product.action_text && (
        <div className="action-banner relative overflow-hidden rounded-xl border border-orange-200/60 px-5 py-4 sm:px-8 sm:py-5">
          <div className="action-banner-stripe" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-start gap-3 sm:items-center">
              <span className="shrink-0 rounded bg-linear-to-r from-[#ff6b35] to-[#ff3d00] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white sm:mt-0">
                {dict.katalog.badges.action}
              </span>
              <p className="whitespace-pre-line text-sm font-medium leading-relaxed text-swing-navy/80">
                {productActionText}
              </p>
            </div>
            {product.action_end && (
              <div className="flex flex-wrap items-center gap-3">
                {product.action_start && (
                  <span className="text-xs text-swing-navy/50">
                    {new Date(product.action_start).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    {" — "}
                    {new Date(product.action_end).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </span>
                )}
                <ActionCountdown
                  actionEnd={product.action_end}
                  label={dict.admin.products.form.actionCountdown}
                />
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div>
          <h2 className="swing-h2 mb-4">{dict.katalog.detail.similarProducts}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {similarProducts.map((p: any) => (
              <RelatedProductCard
                key={p.id}
                product={{
                  ...p,
                  category: Array.isArray(p.category) ? p.category[0] || null : p.category,
                }}
                viewingAsCompanyId={viewingAsCompanyId}
                locale={locale}
              />
            ))}
          </div>
        </div>
      )}

      {/* Accessories */}
      {accessoryProducts.length > 0 && (
        <div>
          <h2 className="swing-h2 mb-4">{dict.katalog.detail.accessories}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {accessoryProducts.map((p: any) => (
              <RelatedProductCard
                key={p.id}
                product={{
                  ...p,
                  category: Array.isArray(p.category) ? p.category[0] || null : p.category,
                }}
                viewingAsCompanyId={viewingAsCompanyId}
                locale={locale}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

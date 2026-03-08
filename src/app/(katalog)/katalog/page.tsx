import { createClient } from "@/lib/supabase/server";
import { Search, ChevronRight, SlidersHorizontal, PackageOpen, Settings } from "lucide-react";
import Link from "next/link";
import type { Product, Category } from "@/lib/types";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const CLASSIFICATIONS = ["N-LITE", "D-LITE", "U-LITE"];
const EN_CLASSES = [
  "EN-A",
  "EN-A/B",
  "LOW EN-B",
  "MID EN-B",
  "HIGH EN-B",
  "EN-C 2-Liner",
  "EN-D 2-Liner",
  "EN-926-1",
];

const MAIN_CATEGORIES = [
  "gleitschirme",
  "miniwings",
  "speedflying",
  "parakites",
  "gurtzeuge",
  "rettungsgeraete",
  "zubehoer",
];

const GLEITSCHIRM_SUBS = ["tandem", "motorschirme"];
const GLEITSCHIRM_ALL = ["gleitschirme", ...GLEITSCHIRM_SUBS];

function filterUrl(
  base: Record<string, string | undefined>,
  key: string,
  value: string | undefined
) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) {
    if (k === key) continue;
    if (key === "kategorie" && k === "sub") continue;
    if (v) params.set(k, v);
  }
  if (value) params.set(key, value);
  const qs = params.toString();
  return `/katalog${qs ? `?${qs}` : ""}`;
}

export default async function KatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    kategorie?: string;
    sub?: string;
    en?: string;
    gewicht?: string;
    als?: string;
  }>;
}) {
  const { q, kategorie, sub, en, gewicht, als } = await searchParams;
  const supabase = await createClient();
  const dict = await getDictionary();
  const allParams = { q, kategorie, sub, en, gewicht, als };

  // Check if current user is admin/superadmin for edit links
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin" || profile?.role === "superadmin";
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  const catMap = Object.fromEntries(
    (categories as Category[])?.map((c) => [c.slug, c]) ?? []
  );

  let query = supabase
    .from("products")
    .select(`
      *,
      category:categories(name, slug),
      sizes:product_sizes(id, size_label, stock_quantity, sort_order),
      colors:product_colors(id, color_name, color_image_url, classification, is_limited)
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name");

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  if (kategorie === "gleitschirme") {
    if (sub && GLEITSCHIRM_SUBS.includes(sub)) {
      const cat = catMap[sub];
      if (cat) query = query.eq("category_id", cat.id);
    } else {
      const catIds = GLEITSCHIRM_ALL.map((s) => catMap[s]?.id).filter(Boolean);
      if (catIds.length > 0) query = query.in("category_id", catIds);
    }
  } else if (kategorie) {
    const cat = catMap[kategorie];
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (en) {
    query = query.eq("en_class", en);
  }

  if (gewicht) {
    query = query.eq("classification", gewicht);
  }

  const { data: products } = await query;

  const hasActiveFilters = !!(kategorie || en || gewicht || q);
  const isGleitschirmeActive = kategorie === "gleitschirme";
  const activeCount = [kategorie, en, gewicht].filter(Boolean).length;

  // Validate "als" param: only admins can use it
  const viewingAsCompanyId = als && isAdmin ? als : undefined;
  // Hide admin UI (gear icons etc.) when viewing as customer
  const showAdminUI = isAdmin && !viewingAsCompanyId;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="dash-hero rounded-xl px-5 pb-0 pt-7 sm:px-8 sm:pt-9">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              {dict.common.nav.katalog}
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {dict.katalog.title}
            </h1>
            <p className="mt-1.5 text-sm text-white/40 tabular-nums">
              {products?.length ?? 0} {(products?.length ?? 0) !== 1 ? dict.katalog.productsCount : dict.katalog.productCount}
              {hasActiveFilters && (
                <> &middot; <Link href="/katalog" className="text-swing-gold hover:text-white transition-colors duration-200">{dict.common.buttons.resetFilters}</Link></>
              )}
            </p>
          </div>
          <form method="GET" className="flex gap-2">
            {kategorie && <input type="hidden" name="kategorie" value={kategorie} />}
            {sub && <input type="hidden" name="sub" value={sub} />}
            {en && <input type="hidden" name="en" value={en} />}
            {gewicht && <input type="hidden" name="gewicht" value={gewicht} />}
            {viewingAsCompanyId && <input type="hidden" name="als" value={viewingAsCompanyId} />}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-swing-navy/40" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder={dict.katalog.searchPlaceholder}
                className="w-full rounded-lg border border-white/10 bg-white py-2.5 pl-9 pr-4 text-sm text-swing-navy transition-all duration-200 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20 sm:w-64"
              />
            </div>
            <button
              type="submit"
              aria-label={dict.common.buttons.search}
              className="rounded-lg bg-swing-gold px-4 py-2.5 text-sm font-bold text-swing-navy transition-colors duration-200 hover:bg-swing-gold-dark active:scale-[0.97]"
            >
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Quick category tabs */}
        <div className="relative z-10 -mx-5 mt-6 overflow-x-auto px-5 sm:-mx-8 sm:px-8 katalog-tabs-scroll">
          <div className="flex items-end gap-0 border-t border-white/[0.06]">
            {[
              { label: "Alle", href: "/katalog", slug: undefined },
              { label: "Paragleiter", href: "/katalog?kategorie=gleitschirme", slug: "gleitschirme" },
              { label: "Tandem", href: "/katalog?kategorie=gleitschirme&sub=tandem", slug: "tandem" },
              { label: "Motor", href: "/katalog?kategorie=gleitschirme&sub=motorschirme", slug: "motorschirme" },
              { label: "Miniwings", href: "/katalog?kategorie=miniwings", slug: "miniwings" },
              { label: "Speedflying/riding", href: "/katalog?kategorie=speedflying", slug: "speedflying" },
              { label: "Parakites", href: "/katalog?kategorie=parakites", slug: "parakites" },
              { label: "Gurtzeuge", href: "/katalog?kategorie=gurtzeuge", slug: "gurtzeuge" },
              { label: "Rettungen", href: "#", slug: "_rettungen" },
              { label: "Zubehör", href: "#", slug: "_zubehoer" },
            ].map((tab) => {
              const isActive =
                tab.slug === undefined
                  ? !kategorie && !sub
                  : tab.slug === "tandem" || tab.slug === "motorschirme"
                    ? sub === tab.slug
                    : kategorie === tab.slug;
              const isDisabled = tab.href === "#";
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`katalog-tab shrink-0 whitespace-nowrap ${
                    isDisabled
                      ? "katalog-tab-disabled"
                      : isActive
                        ? "katalog-tab-active"
                        : ""
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card overflow-hidden">
        {/* Row 1: Kategorie — horizontally scrollable on mobile */}
        <div className="space-y-1 px-4 pt-4 sm:grid sm:grid-cols-[7rem_1fr] sm:items-center sm:gap-x-4 sm:space-y-0 sm:px-6 sm:pt-5">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
            <SlidersHorizontal size={13} />
            {dict.katalog.filters.category}
          </span>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-1.5 pb-1 sm:flex-wrap sm:pb-0">
              <Link
                href={filterUrl(allParams, "kategorie", undefined)}
                className={`shrink-0 cursor-pointer rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all duration-150 active:scale-[0.96] min-h-11 flex items-center sm:min-h-0 sm:text-sm sm:py-2 ${
                  !kategorie
                    ? "bg-swing-navy text-white shadow-sm"
                    : "text-swing-navy/60 hover:bg-gray-50 hover:text-swing-navy"
                }`}
              >
                {dict.katalog.filters.all}
              </Link>
              {MAIN_CATEGORIES.map((slug) => {
                const cat = catMap[slug];
                if (!cat) return null;
                return (
                  <Link
                    key={cat.id}
                    href={filterUrl(allParams, "kategorie", slug)}
                    className={`shrink-0 cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2.5 text-xs font-medium transition-all duration-150 active:scale-[0.96] min-h-11 flex items-center sm:min-h-0 sm:text-sm sm:py-2 ${
                      kategorie === slug
                        ? "bg-swing-navy text-white shadow-sm"
                        : "text-swing-navy/60 hover:bg-gray-50 hover:text-swing-navy"
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sub-categories for Gleitschirme */}
        {isGleitschirmeActive && (
          <div className="space-y-1 border-t border-gray-50 px-4 pt-3 sm:grid sm:grid-cols-[7rem_1fr] sm:items-center sm:gap-x-4 sm:space-y-0 sm:border-0 sm:px-6 sm:pt-0">
            <div className="hidden sm:block" />
            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-1.5 pb-1 sm:flex-wrap sm:pb-0">
                <Link
                  href={filterUrl(allParams, "sub", undefined)}
                  className={`shrink-0 cursor-pointer rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.96] sm:py-1.5 ${
                    !sub
                      ? "bg-swing-navy/10 text-swing-navy font-semibold"
                      : "text-swing-navy/60 hover:bg-gray-50"
                  }`}
                >
                  {dict.katalog.filters.all}
                </Link>
                {GLEITSCHIRM_SUBS.map((slug) => {
                  const cat = catMap[slug];
                  if (!cat) return null;
                  return (
                    <Link
                      key={cat.id}
                      href={filterUrl(allParams, "sub", slug)}
                      className={`shrink-0 cursor-pointer rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.96] sm:py-1.5 ${
                        sub === slug
                          ? "bg-swing-navy/10 text-swing-navy font-semibold"
                          : "text-swing-navy/60 hover:bg-gray-50"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="mx-4 border-t border-gray-50 sm:mx-6" />

        {/* Row 2: EN-Klasse */}
        <div className="space-y-1 px-4 pt-3 sm:grid sm:grid-cols-[7rem_1fr] sm:items-center sm:gap-x-4 sm:space-y-0 sm:px-6 sm:pt-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
            {dict.katalog.filters.enClass}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={filterUrl(allParams, "en", undefined)}
              className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.96] sm:py-1.5 sm:px-3 ${
                !en
                  ? "bg-swing-gold/15 text-swing-navy font-semibold"
                  : "text-swing-navy/60 hover:bg-gray-50"
              }`}
            >
              {dict.katalog.filters.all}
            </Link>
            {EN_CLASSES.map((cls) => (
              <Link
                key={cls}
                href={filterUrl(allParams, "en", cls)}
                className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.96] sm:py-1.5 sm:px-3 ${
                  en === cls
                    ? "bg-swing-gold/15 text-swing-navy font-semibold"
                    : "text-swing-navy/60 hover:bg-gray-50"
                }`}
              >
                {cls}
              </Link>
            ))}
          </div>
        </div>

        {/* Row 3: Gewicht */}
        <div className="space-y-1 px-4 pb-4 pt-2 sm:grid sm:grid-cols-[7rem_1fr] sm:items-center sm:gap-x-4 sm:space-y-0 sm:px-6 sm:pb-5 sm:pt-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
            {dict.katalog.filters.weight}
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={filterUrl(allParams, "gewicht", undefined)}
              className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.96] sm:py-1.5 sm:px-3 ${
                !gewicht
                  ? "bg-swing-gold/15 text-swing-navy font-semibold"
                  : "text-swing-navy/60 hover:bg-gray-50"
              }`}
            >
              {dict.katalog.filters.all}
            </Link>
            {CLASSIFICATIONS.map((cls) => (
              <Link
                key={cls}
                href={filterUrl(allParams, "gewicht", cls)}
                className={`cursor-pointer rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.96] sm:py-1.5 sm:px-3 ${
                  gewicht === cls
                    ? "bg-swing-gold/15 text-swing-navy font-semibold"
                    : "text-swing-navy/60 hover:bg-gray-50"
                }`}
              >
                {cls}
              </Link>
            ))}
          </div>
        </div>

        {/* Active filter count badge */}
        {activeCount > 0 && (
          <div className="border-t border-gray-50 px-4 py-3 sm:grid sm:grid-cols-[7rem_1fr] sm:gap-x-4 sm:px-6">
            <div className="hidden sm:block" />
            <div className="flex items-center gap-3">
              <span className="rounded bg-swing-navy/5 px-2.5 py-1 text-[10px] font-bold text-swing-navy/50 tabular-nums">
                {activeCount} {dict.katalog.filters.activeFilters}
              </span>
              <Link
                href="/katalog"
                className="cursor-pointer text-[10px] font-bold text-swing-gold-dark hover:text-swing-navy transition-colors duration-200"
              >
                {dict.common.buttons.resetAll}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Product Grid */}
      {!products || products.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
            <PackageOpen size={24} className="text-swing-navy/20" />
          </div>
          <p className="text-[15px] font-bold text-swing-navy/25">
            {q
              ? dict.katalog.noProductsSearch.replace("{query}", q)
              : dict.katalog.noProductsFilter}
          </p>
          {hasActiveFilters && (
            <Link href="/katalog" className="mt-3 inline-block text-sm font-medium text-swing-gold-dark hover:text-swing-navy transition-colors duration-200">
              {dict.common.buttons.resetFilters}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products as Product[]).map((product) => {
            const categoryName = product.category
              ? (product.category as unknown as { name: string }).name
              : null;
            const enClass = product.en_class || product.tech_specs?.["EN-Zertifizierung"];
            const isComingSoon = product.is_coming_soon;
            const isPreorder = product.is_preorder;
            const isFadeOut = product.is_fade_out;

            const Wrapper = isComingSoon ? "div" : Link;
            const productHref = viewingAsCompanyId
              ? `/katalog/${product.slug}?als=${viewingAsCompanyId}`
              : `/katalog/${product.slug}`;
            const wrapperProps = isComingSoon
              ? {}
              : { href: productHref };

            return (
              <Wrapper
                key={product.id}
                {...(wrapperProps as any)}
                className={`card group overflow-hidden ${
                  isComingSoon
                    ? "opacity-75"
                    : "card-interactive"
                }`}
              >
                {/* Header band */}
                <div className="relative flex navy-gradient">
                  {/* Badges top-left */}
                  <div className="absolute left-3 top-2.5 flex flex-wrap gap-1">
                    {isComingSoon && (
                      <span className="rounded bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-swing-navy">
                        {dict.katalog.badges.comingSoon}
                      </span>
                    )}
                    {isPreorder && !isComingSoon && (
                      <span className="rounded bg-swing-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-swing-navy">
                        {dict.katalog.badges.preorder}
                      </span>
                    )}
                    {isFadeOut && (
                      <span className="rounded bg-red-500/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        {dict.katalog.badges.fadeOut}
                      </span>
                    )}
                    {product.classification && (
                      <span className="rounded bg-swing-gold/25 px-2 py-0.5 text-[10px] font-bold tracking-wide text-swing-gold">
                        {product.classification}
                      </span>
                    )}
                    {enClass && (
                      <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white/80">
                        {enClass}
                      </span>
                    )}
                  </div>
                  {/* Product title centered */}
                  <span className="mx-3 mt-12 mb-3 w-full text-sm font-bold italic uppercase tracking-wide text-white select-none">
                    {product.name}
                  </span>
                  {/* Admin edit gear */}
                  {showAdminUI && (
                    <Link
                      href={`/admin/produkte/${product.id}/bearbeiten`}
                      className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded bg-white/10 text-white/40 transition-all duration-200 hover:bg-white/25 hover:text-white z-10"
                      title="Bearbeiten"
                    >
                      <Settings size={13} />
                    </Link>
                  )}
                  {/* Arrow */}
                  {!isComingSoon && (
                    <div className="absolute bottom-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-lg bg-swing-gold/0 transition-all duration-200 group-hover:bg-swing-gold">
                      <ChevronRight size={14} className="text-white/0 transition-all duration-200 group-hover:text-swing-navy" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5">
                  <div className="flex items-center gap-1.5">
                    {categoryName && (
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                        {categoryName}
                      </span>
                    )}
                    {product.use_case && (
                      <>
                        <span className="text-swing-navy/15">&middot;</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-gold-dark/50">
                          {product.use_case}
                        </span>
                      </>
                    )}
                  </div>

                  {product.description && (
                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-swing-gray-dark/50">
                      {product.description}
                    </p>
                  )}

                  {/* Sizes + Colors */}
                  {((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) && (
                    <div className="mt-2.5 flex items-center gap-3 border-t border-gray-50 pt-2">
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="flex gap-0.5">
                          {product.sizes
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((s) => (
                              <span
                                key={s.id}
                                className={`inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-[10px] font-bold tabular-nums ${
                                  s.stock_quantity > 10
                                    ? "bg-emerald-50 text-emerald-700"
                                    : s.stock_quantity > 0
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-red-50 text-red-700"
                                }`}
                              >
                                {s.size_label}
                              </span>
                            ))}
                        </div>
                      )}
                      {product.colors && product.colors.length > 0 && (
                        <div className="ml-auto flex items-center gap-1.5">
                          {(product.colors as unknown as { is_limited: boolean }[]).some((c) => c.is_limited) && (
                            <span className="rounded bg-swing-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-swing-gold-dark">
                              {dict.katalog.badges.limited}
                            </span>
                          )}
                          <span className="text-[10px] font-medium text-swing-navy/25 tabular-nums">
                            {product.colors.length} {product.colors.length > 1 ? dict.katalog.badges.designs : dict.katalog.badges.design}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}

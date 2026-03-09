import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { localized } from "@/lib/i18n/localized";
import type { Locale } from "@/lib/i18n/shared";

interface RelatedProduct {
  id: string;
  name: string;
  name_en?: string | null;
  name_fr?: string | null;
  slug: string;
  description: string | null;
  description_en?: string | null;
  description_fr?: string | null;
  category: { name: string; name_en?: string | null; name_fr?: string | null } | null;
  en_class: string | null;
  en_class_custom: string | null;
  classification: string | null;
  use_case: string | null;
  use_case_en?: string | null;
  use_case_fr?: string | null;
  is_action: boolean;
}

interface RelatedProductCardProps {
  product: RelatedProduct;
  viewingAsCompanyId?: string;
  locale: Locale;
}

export default function RelatedProductCard({ product, viewingAsCompanyId, locale }: RelatedProductCardProps) {
  const href = viewingAsCompanyId
    ? `/katalog/${product.slug}?als=${viewingAsCompanyId}`
    : `/katalog/${product.slug}`;

  const rec = product as unknown as Record<string, unknown>;
  const catRec = product.category as unknown as Record<string, unknown> | null;
  const categoryName = catRec ? localized(catRec, "name", locale) : null;
  const enClass = product.en_class;
  const enClassCustom = product.en_class_custom;

  return (
    <Link
      href={href}
      className="card card-interactive group overflow-hidden"
    >
      {/* Header band */}
      <div className="relative flex navy-gradient">
        {/* Badges */}
        <div className="absolute left-3 top-2.5 flex flex-wrap gap-1">
          {product.is_action && (
            <span className="badge-action rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
              Aktion
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
          {enClassCustom && (
            <span className="rounded bg-white/25 px-2 py-0.5 text-[10px] font-bold tracking-wide text-swing-gold">
              {enClassCustom}
            </span>
          )}
        </div>
        {/* Title */}
        <span className="mx-3 mt-12 mb-3 w-full text-sm font-bold italic uppercase tracking-wide text-white select-none">
          {localized(rec, "name", locale)}
        </span>
        {/* Arrow */}
        <div className="absolute bottom-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-lg bg-swing-gold/0 transition-all duration-200 group-hover:bg-swing-gold">
          <ChevronRight size={14} className="text-white/0 transition-all duration-200 group-hover:text-swing-navy" />
        </div>
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
                {localized(rec, "use_case", locale)}
              </span>
            </>
          )}
        </div>
        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-swing-gray-dark/50">
            {localized(rec, "description", locale)}
          </p>
        )}
      </div>
    </Link>
  );
}

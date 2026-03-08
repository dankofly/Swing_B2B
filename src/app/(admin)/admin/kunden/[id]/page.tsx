import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Users,
  Pencil,
  MessageCircle,
  FileText,
  ShoppingCart,
  BarChart3,
  Eye,
} from "lucide-react";
import ApprovalToggle from "./ApprovalToggle";
import DeleteCompanyButton from "../DeleteCompanyButton";
import PriceListSection from "./PriceListSection";
import NotesSection from "./NotesSection";
import KanbanBoard from "./KanbanBoard";
import { getCompanyPriceUploads } from "@/lib/actions/price-uploads";
import { getCompanyInquiries } from "@/lib/actions/inquiries";
import { getCompanyNotes } from "@/lib/actions/company-notes";
import CompanyStats from "./CompanyStats";
import LocalClock from "./LocalClock";
import { getDictionary, getLocale, getDateLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function KundenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const dl = getDateLocale(locale);
  const td = dict.admin.customers.detail;
  const companyTypes = dict.common.companyTypes as Record<string, string>;
  const categories = dict.common.categories;

  const [
    { data: companyRaw },
    { data: profiles },
    priceUploads,
    inquiries,
    companyNotes,
  ] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).single(),
    supabase.from("profiles").select("id, email, full_name, role").eq("company_id", id),
    getCompanyPriceUploads(id),
    getCompanyInquiries(id),
    getCompanyNotes(id),
  ]);

  const company = companyRaw ? { ...companyRaw, profiles: profiles ?? [] } : null;

  if (!company) notFound();

  return (
    <div className="space-y-8">
      {/* Hero + Typ-Leiste */}
      <div className="overflow-hidden rounded-xl">
        {/* Hero */}
        <div className="dash-hero px-5 py-9 sm:px-8 sm:py-12">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/admin/kunden"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
              >
                <ArrowLeft size={18} />
              </Link>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                  {td.title}
                </p>
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {company.name}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:pl-0">
              <DeleteCompanyButton
                companyId={id}
                companyName={company.name}
                variant="button"
              />
              <Link
                href={`/katalog?als=${id}`}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 sm:px-5"
                title={td.viewAsCatalog}
              >
                <Eye size={14} />
                <span className="hidden sm:inline">{td.viewAsCatalog}</span>
              </Link>
              <Link
                href={`/admin/kunden/${id}/bearbeiten`}
                className="flex items-center gap-2 rounded-lg bg-swing-gold px-4 py-2.5 text-sm font-bold text-swing-navy transition-colors hover:bg-swing-gold-dark sm:px-5"
              >
                <Pencil size={14} />
                <span className="hidden sm:inline">{dict.common.buttons.edit}</span>
              </Link>
            </div>
          </div>
        </div>
        {/* Typ-Leiste */}
        <div className="flex flex-col gap-2 border-t border-white/10 bg-swing-navy px-5 py-4.5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-white/70 sm:text-sm">
              {company.company_type
                ? companyTypes[company.company_type] || company.company_type
                : companyTypes.customer}
            </span>
            {(company.sells_paragliders || company.sells_miniwings || company.sells_parakites) && (
              <div className="flex gap-1.5">
                {company.sells_paragliders && (
                  <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white/80">
                    {categories.paragliders}
                  </span>
                )}
                {company.sells_miniwings && (
                  <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white/80">
                    {categories.miniwings}
                  </span>
                )}
                {company.sells_parakites && (
                  <span className="rounded bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white/80">
                    {categories.parakites}
                  </span>
                )}
              </div>
            )}
          </div>
          <ApprovalToggle
            companyId={company.id}
            initialApproved={company.is_approved ?? false}
          />
        </div>
      </div>

      {/* Cards grid: Stammdaten + Statistik + Preislisten */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Card 1: Stammdaten (address, contact, UID, map, users) */}
        <div className="card overflow-hidden lg:col-span-1">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-swing-navy text-white">
              <MapPin size={14} strokeWidth={1.75} />
            </div>
            <h3 className="text-sm font-bold text-swing-navy">{td.masterData}</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Address */}
            <div className="px-5 py-2.5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">{td.address}</p>
              {(company.address_street || company.address || company.address_city) ? (() => {
                let street = company.address_street as string | undefined;
                let zipCity = [company.address_zip, company.address_city].filter(Boolean).join(" ");
                const country = company.address_country as string | undefined;

                if (!street && company.address) {
                  const raw = (company.address as string).replace(/\r\n/g, "\n");
                  const parts = raw.includes("\n")
                    ? raw.split("\n").map((s: string) => s.trim()).filter(Boolean)
                    : raw.split(",").map((s: string) => s.trim()).filter(Boolean);
                  if (parts.length >= 2) {
                    street = parts[0];
                    zipCity = parts.slice(1).join(", ");
                  } else {
                    street = parts[0] ?? "";
                  }
                }

                return (
                  <div className="text-sm leading-relaxed text-swing-navy">
                    {street && <div>{street}</div>}
                    {zipCity && <div>{zipCity}</div>}
                    {country && <div>{country}</div>}
                  </div>
                );
              })() : (
                <p className="text-sm italic text-swing-navy/30">{td.noAddress}</p>
              )}
            </div>

            {/* Kontakt */}
            <div className="px-5 py-2.5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">{td.contactSection}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="shrink-0 text-swing-navy/25" />
                  <a href={`mailto:${company.contact_email}`} className="text-sm text-swing-navy hover:text-swing-gold-dark">
                    {company.contact_email}
                  </a>
                </div>
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="shrink-0 text-swing-navy/25" />
                    <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="text-sm text-swing-navy hover:text-swing-gold-dark">
                      {company.phone}
                    </a>
                    {company.phone_whatsapp && (
                      <a
                        href={`https://wa.me/${company.phone.replace(/[\s+\-()]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 hover:bg-green-100"
                      >
                        <MessageCircle size={10} />
                        WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* UID */}
            <div className="px-5 py-2.5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">{td.vatId}</p>
              <p className="text-sm tabular-nums text-swing-navy">{company.vat_id || "—"}</p>
            </div>

            {/* Kunde seit */}
            <div className="px-5 py-2.5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">{td.customerSince}</p>
              <p className="text-sm text-swing-navy">
                {new Date(company.created_at).toLocaleDateString(dl, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Benutzer */}
            {company.profiles && company.profiles.length > 0 && (
              <div className="px-5 py-2.5">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">
                  <Users size={11} />
                  {td.users}
                </p>
                <div className="space-y-1.5">
                  {company.profiles.map(
                    (p: { id: string; email: string; full_name: string | null; role: string }) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <span className="text-xs text-swing-navy">{p.full_name || p.email}</span>
                        <span className="rounded bg-swing-navy/10 px-2 py-0.5 text-[10px] font-bold text-swing-navy">{p.role}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Card 2: Statistik */}
        <div className="card overflow-hidden lg:col-span-1">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-swing-navy text-white">
              <BarChart3 size={14} strokeWidth={1.75} />
            </div>
            <h3 className="text-sm font-bold text-swing-navy">{td.statistics}</h3>
          </div>
          <div className="p-5">
            <CompanyStats />
          </div>
        </div>

        {/* Card 3: Preislisten + Karte */}
        <div className="card flex flex-col overflow-hidden lg:col-span-1">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-swing-navy text-white">
              <FileText size={14} strokeWidth={1.75} />
            </div>
            <h3 className="text-sm font-bold text-swing-navy">{td.priceLists}</h3>
          </div>
          <div className="flex-1 p-5">
            <PriceListSection
              companyId={company.id}
              uploads={priceUploads}
              categories={[
                { key: "paragliders", label: categories.paragliders },
                { key: "miniwings", label: categories.miniwings },
              ]}
            />
          </div>
          {(company.address_city || company.address_street || company.address) && (() => {
            const q = company.address_street
              ? [company.address_street, company.address_zip, company.address_city, company.address_country].filter(Boolean).join(", ")
              : (company.address as string) || "";
            return (
              <div className="border-t border-gray-100">
                <iframe
                  title={`${company.name}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="180"
                  className="border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  allowFullScreen={false}
                />
                {company.address_country && (
                  <div className="px-4 py-2">
                    <LocalClock country={company.address_country as string} />
                  </div>
                )}
              </div>
            );
          })()}
        </div>

      </div>

      {/* Notes section */}
      <NotesSection companyId={company.id} notes={companyNotes} />

      {/* Kanban board */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/25">
          <ShoppingCart size={14} />
          {td.inquirySection}
        </h2>
        <KanbanBoard inquiries={inquiries} />
      </div>
    </div>
  );
}

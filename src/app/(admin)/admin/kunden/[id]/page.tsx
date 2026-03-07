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

export const dynamic = "force-dynamic";

const COMPANY_TYPE_LABELS: Record<string, string> = {
  dealer: "Händler",
  importer: "Importeur",
  importer_network: "Importeur mit Händlernetzwerk",
};

export default async function KundenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

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
      {/* Hero */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/kunden"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Kundendetail
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                {company.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DeleteCompanyButton
              companyId={id}
              companyName={company.name}
              variant="button"
            />
            <Link
              href={`/admin/kunden/${id}/bearbeiten`}
              className="flex items-center gap-2 rounded-lg bg-swing-gold px-5 py-2.5 text-sm font-bold text-swing-navy transition-colors hover:bg-swing-gold-dark"
            >
              <Pencil size={14} />
              Bearbeiten
            </Link>
          </div>
        </div>
      </div>

      {/* Mini-Hero: Händler type bar */}
      <div className="dash-hero rounded-xl px-6 py-4">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold uppercase tracking-widest text-white/70">
              {company.company_type
                ? COMPANY_TYPE_LABELS[company.company_type] || company.company_type
                : "Kunde"}
            </span>
            {(company.sells_paragliders || company.sells_miniwings || company.sells_parakites) && (
              <div className="flex gap-1.5">
                {company.sells_paragliders && (
                  <span className="rounded bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/80">
                    Gleitschirme
                  </span>
                )}
                {company.sells_miniwings && (
                  <span className="rounded bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/80">
                    Miniwings
                  </span>
                )}
                {company.sells_parakites && (
                  <span className="rounded bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white/80">
                    Parakites
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
            <h3 className="text-sm font-bold text-swing-navy">Stammdaten</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Address */}
            <div className="px-5 py-4">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">Adresse</p>
              {(company.address_street || company.address || company.address_city) ? (
                <div className="text-sm leading-relaxed text-swing-navy">
                  {company.address_street && <div>{company.address_street}</div>}
                  {(company.address_zip || company.address_city) && (
                    <div>{[company.address_zip, company.address_city].filter(Boolean).join(" ")}</div>
                  )}
                  {company.address_country && (
                    <div className="text-swing-navy/50">{company.address_country}</div>
                  )}
                  {!company.address_street && company.address && (
                    <div className="whitespace-pre-line">{company.address}</div>
                  )}
                </div>
              ) : (
                <p className="text-sm italic text-swing-navy/30">Keine Adresse</p>
              )}
            </div>

            {/* Contact */}
            <div className="px-5 py-4">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">Kontakt</p>
              <div className="space-y-2">
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

            {/* VAT ID */}
            {company.vat_id && (
              <div className="px-5 py-4">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">UID-Nummer</p>
                <p className="text-sm font-medium tabular-nums text-swing-navy">{company.vat_id}</p>
              </div>
            )}

            {/* Map */}
            {(company.address_city || company.address_street) && (() => {
              const q = [company.address_street, company.address_zip, company.address_city, company.address_country]
                .filter(Boolean)
                .join(", ");
              return (
                <div>
                  <iframe
                    title={`Standort ${company.name}`}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="160"
                    className="border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    allowFullScreen={false}
                  />
                </div>
              );
            })()}
          </div>

          {/* Footer: Kunde seit + Users */}
          <div className="border-t border-gray-100 px-5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/25">
              Kunde seit{" "}
              <span className="normal-case tracking-normal font-normal text-swing-gray-dark/35">
                {new Date(company.created_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </p>
            {company.profiles && company.profiles.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/25">
                  <Users size={11} />
                  Benutzer
                </h4>
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
            <h3 className="text-sm font-bold text-swing-navy">Statistik</h3>
          </div>
          <div className="p-5">
            <CompanyStats />
          </div>
        </div>

        {/* Card 3: Preislisten */}
        <div className="card overflow-hidden lg:col-span-1">
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-swing-navy text-white">
              <FileText size={14} strokeWidth={1.75} />
            </div>
            <h3 className="text-sm font-bold text-swing-navy">Preislisten</h3>
          </div>
          <div className="p-5">
            <PriceListSection
              companyId={company.id}
              uploads={priceUploads}
              categories={[
                ...(company.sells_paragliders ? [{ key: "paragliders", label: "Gleitschirme" }] : []),
                ...(company.sells_miniwings ? [{ key: "miniwings", label: "Miniwings" }] : []),
                ...(company.sells_parakites ? [{ key: "parakites", label: "Parakites" }] : []),
              ]}
            />
          </div>
        </div>

      </div>

      {/* Notes section */}
      <NotesSection companyId={company.id} notes={companyNotes} />

      {/* Kanban board */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/25">
          <ShoppingCart size={14} />
          Anfragen
        </h2>
        <KanbanBoard inquiries={inquiries} />
      </div>
    </div>
  );
}

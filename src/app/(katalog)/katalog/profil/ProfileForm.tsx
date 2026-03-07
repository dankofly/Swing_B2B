"use client";

import { useState } from "react";
import { updateMyProfile } from "@/lib/actions/profile";
import { Save, Loader2, CheckCircle } from "lucide-react";

interface Company {
  id: string;
  name: string;
  contact_email: string;
  phone: string | null;
  phone_whatsapp: boolean;
  address_street: string | null;
  address_zip: string | null;
  address_city: string | null;
  address_country: string | null;
  vat_id: string | null;
  company_type: string;
  sells_paragliders: boolean;
  sells_miniwings: boolean;
  sells_parakites: boolean;
}

const inputClass =
  "w-full rounded border border-gray-200 bg-white px-3 py-2.5 text-sm transition-all focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20";
const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-widest text-swing-navy/50";
const sectionClass =
  "text-xs font-bold uppercase tracking-widest text-swing-navy/70 mb-4";

const COMPANY_TYPE_LABELS: Record<string, string> = {
  dealer: "Händler",
  importer: "Importeur",
  importer_network: "Importeur mit Händlernetzwerk",
};

export default function ProfileForm({
  company,
  fullName,
  email,
}: {
  company: Company;
  fullName: string;
  email: string;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateMyProfile(formData);

    setSaving(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Fehler beim Speichern");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="rounded border border-gray-200 bg-white p-6">
        {/* Company info */}
        <h3 className={sectionClass}>Firmendaten</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Firmenname *</label>
            <input
              name="name"
              required
              defaultValue={company.name}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Typ</label>
            <input
              type="text"
              disabled
              value={
                COMPANY_TYPE_LABELS[company.company_type] ||
                company.company_type
              }
              className={`${inputClass} bg-gray-50 text-swing-navy/50`}
            />
          </div>

          <div>
            <label className={labelClass}>UID-Nummer</label>
            <input
              name="vat_id"
              defaultValue={company.vat_id ?? ""}
              className={inputClass}
              placeholder="z.B. ATU12345678"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Produktkategorien</label>
            <div className="mt-1 flex flex-wrap gap-3">
              {company.sells_paragliders && (
                <span className="rounded bg-swing-navy/10 px-2 py-1 text-xs font-semibold text-swing-navy/70">
                  Gleitschirme
                </span>
              )}
              {company.sells_miniwings && (
                <span className="rounded bg-swing-navy/10 px-2 py-1 text-xs font-semibold text-swing-navy/70">
                  Miniwings
                </span>
              )}
              {company.sells_parakites && (
                <span className="rounded bg-swing-navy/10 px-2 py-1 text-xs font-semibold text-swing-navy/70">
                  Parakites
                </span>
              )}
              {!company.sells_paragliders &&
                !company.sells_miniwings &&
                !company.sells_parakites && (
                  <span className="text-xs text-swing-navy/30">
                    Keine Kategorien zugewiesen
                  </span>
                )}
            </div>
            <p className="mt-1 text-[10px] text-swing-navy/30">
              Kategorien können nur vom Admin geändert werden
            </p>
          </div>
        </div>

        {/* Contact */}
        <h3 className={`${sectionClass} mt-8`}>Kontakt</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Ansprechpartner *</label>
            <input
              name="full_name"
              required
              defaultValue={fullName}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>E-Mail *</label>
            <input
              name="contact_email"
              type="email"
              required
              defaultValue={company.contact_email}
              className={inputClass}
            />
            <p className="mt-1 text-[10px] text-swing-navy/30">
              Login-E-Mail: {email}
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Telefon</label>
            <div className="flex gap-2">
              <input
                name="phone"
                type="tel"
                defaultValue={company.phone ?? ""}
                className={`${inputClass} flex-1`}
                placeholder="+43 512 123456"
              />
              <label className="flex cursor-pointer items-center gap-1.5 rounded border border-gray-200 bg-white px-3 text-xs text-swing-navy/60">
                <input
                  type="checkbox"
                  name="phone_whatsapp"
                  defaultChecked={company.phone_whatsapp ?? false}
                  className="accent-swing-gold"
                />
                WhatsApp
              </label>
            </div>
          </div>
        </div>

        {/* Address */}
        <h3 className={`${sectionClass} mt-8`}>Adresse</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Straße + Nr.</label>
            <input
              name="address_street"
              defaultValue={company.address_street ?? ""}
              className={inputClass}
              placeholder="Bergstraße 12"
            />
          </div>

          <div>
            <label className={labelClass}>PLZ</label>
            <input
              name="address_zip"
              defaultValue={company.address_zip ?? ""}
              className={inputClass}
              placeholder="6020"
            />
          </div>

          <div>
            <label className={labelClass}>Stadt</label>
            <input
              name="address_city"
              defaultValue={company.address_city ?? ""}
              className={inputClass}
              placeholder="Innsbruck"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Land</label>
            <input
              name="address_country"
              defaultValue={company.address_country ?? ""}
              className={inputClass}
              placeholder="Österreich"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle size={16} />
            Änderungen gespeichert
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 rounded bg-swing-gold px-5 py-2.5 text-sm font-semibold text-swing-navy transition-colors hover:bg-swing-gold-dark disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Speichert..." : "Änderungen speichern"}
          </button>
        </div>
      </div>
    </form>
  );
}

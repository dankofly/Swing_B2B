"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompany, updateCompany } from "@/lib/actions/customers";
import {
  Save,
  Loader2,
  Building2,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

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
  is_approved: boolean;
}

const inputClass =
  "w-full rounded border border-gray-200 bg-white px-4 py-3 text-sm transition-all duration-150 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20";
const labelClass =
  "mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-swing-navy/40";

export default function KundenForm({ company }: { company?: Company }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isEdit = !!company;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    if (isEdit) {
      const result = await updateCompany(company.id, formData);
      setSaving(false);
      if (result.success) {
        router.push(`/admin/kunden/${company.id}`);
      } else {
        setError(result.error || "Fehler beim Speichern");
      }
    } else {
      const result = await createCompany(formData);
      setSaving(false);
      if (result.success) {
        router.push(`/admin/kunden/${result.id}`);
      } else {
        setError(result.error || "Fehler beim Speichern");
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Firmendaten */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
            <Building2 size={16} strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-bold text-swing-navy">Firmendaten</h3>
        </div>
        <div className="grid gap-5 p-4 sm:p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Firmenname *</label>
            <input
              name="name"
              required
              defaultValue={company?.name ?? ""}
              className={inputClass}
              placeholder="z.B. Paragliding Center Alpen"
            />
          </div>

          <div>
            <label className={labelClass}>Typ *</label>
            <select
              name="company_type"
              defaultValue={company?.company_type ?? "dealer"}
              className={inputClass}
            >
              <option value="dealer">Händler</option>
              <option value="importer">Importeur</option>
              <option value="importer_network">Importeur mit Händlernetzwerk</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>UID-Nummer</label>
            <input
              name="vat_id"
              defaultValue={company?.vat_id ?? ""}
              className={inputClass}
              placeholder="z.B. ATU12345678"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Produktkategorien</label>
            <div className="mt-1.5 flex flex-wrap gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-swing-navy/70 transition-colors has-checked:border-swing-gold/40 has-checked:bg-swing-gold/5 has-checked:text-swing-navy hover:border-gray-300">
                <input
                  type="checkbox"
                  name="sells_paragliders"
                  defaultChecked={company?.sells_paragliders ?? false}
                  className="accent-swing-gold"
                />
                Gleitschirme
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-swing-navy/70 transition-colors has-checked:border-swing-gold/40 has-checked:bg-swing-gold/5 has-checked:text-swing-navy hover:border-gray-300">
                <input
                  type="checkbox"
                  name="sells_miniwings"
                  defaultChecked={company?.sells_miniwings ?? false}
                  className="accent-swing-gold"
                />
                Miniwings
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-swing-navy/70 transition-colors has-checked:border-swing-gold/40 has-checked:bg-swing-gold/5 has-checked:text-swing-navy hover:border-gray-300">
                <input
                  type="checkbox"
                  name="sells_parakites"
                  defaultChecked={company?.sells_parakites ?? false}
                  className="accent-swing-gold"
                />
                Parakites
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Kontakt */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
            <Mail size={16} strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-bold text-swing-navy">Kontakt</h3>
        </div>
        <div className="grid gap-5 p-4 sm:p-6 sm:grid-cols-2">
          <div>
            <label className={labelClass}>E-Mail *</label>
            <input
              name="contact_email"
              type="email"
              required
              defaultValue={company?.contact_email ?? ""}
              className={inputClass}
              placeholder="info@example.com"
            />
          </div>

          <div>
            <label className={labelClass}>Telefon</label>
            <div className="flex gap-2">
              <input
                name="phone"
                type="tel"
                defaultValue={company?.phone ?? ""}
                className={`${inputClass} flex-1`}
                placeholder="+43 512 123456"
              />
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-swing-navy/60 transition-colors has-checked:border-green-300 has-checked:bg-green-50 has-checked:text-green-700 hover:border-gray-300">
                <input
                  type="checkbox"
                  name="phone_whatsapp"
                  defaultChecked={company?.phone_whatsapp ?? false}
                  className="accent-green-600"
                />
                WhatsApp
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
            <MapPin size={16} strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-bold text-swing-navy">Adresse</h3>
        </div>
        <div className="grid gap-5 p-4 sm:p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Straße + Nr.</label>
            <input
              name="address_street"
              defaultValue={company?.address_street ?? ""}
              className={inputClass}
              placeholder="Bergstraße 12"
            />
          </div>

          <div>
            <label className={labelClass}>PLZ</label>
            <input
              name="address_zip"
              defaultValue={company?.address_zip ?? ""}
              className={inputClass}
              placeholder="6020"
            />
          </div>

          <div>
            <label className={labelClass}>Stadt</label>
            <input
              name="address_city"
              defaultValue={company?.address_city ?? ""}
              className={inputClass}
              placeholder="Innsbruck"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Land</label>
            <input
              name="address_country"
              defaultValue={company?.address_country ?? ""}
              className={inputClass}
              placeholder="Österreich"
            />
          </div>
        </div>
      </div>

      {/* Error + Submit */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-gold flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-swing-gold px-6 py-3 text-sm font-bold text-swing-navy shadow-lg shadow-swing-gold/20 transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-xl hover:shadow-swing-gold/25 disabled:opacity-50 sm:w-auto sm:justify-start"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isEdit ? "Änderungen speichern" : "Kunden anlegen"}
        </button>
      </div>
    </form>
  );
}

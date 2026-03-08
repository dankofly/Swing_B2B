"use client";

import { useState } from "react";
import { updateMyProfile } from "@/lib/actions/profile";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { useDict } from "@/lib/i18n/context";

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

export default function ProfileForm({
  company,
  fullName,
  email,
}: {
  company: Company;
  fullName: string;
  email: string;
}) {
  const dict = useDict();
  const tp = dict.profile;
  const companyTypeLabels = dict.common.companyTypes as Record<string, string>;
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
      setError(result.error || tp.saveError);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded border border-gray-200 bg-white p-4 sm:p-6">
        {/* Company info */}
        <h3 className={sectionClass}>{tp.companyData}</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>{tp.companyName} *</label>
            <input
              name="name"
              required
              defaultValue={company.name}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{tp.type}</label>
            <input
              type="text"
              disabled
              value={
                companyTypeLabels[company.company_type] ||
                company.company_type
              }
              className={`${inputClass} bg-gray-50 text-swing-navy/50`}
            />
          </div>

          <div>
            <label className={labelClass}>{tp.vatId}</label>
            <input
              name="vat_id"
              defaultValue={company.vat_id ?? ""}
              className={inputClass}
              placeholder="z.B. ATU12345678"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>{tp.productCategories}</label>
            <div className="mt-1 flex flex-wrap gap-3">
              {company.sells_paragliders && (
                <span className="rounded bg-swing-navy/10 px-2 py-1 text-xs font-semibold text-swing-navy/70">
                  {dict.common.categories.paragliders}
                </span>
              )}
              {company.sells_miniwings && (
                <span className="rounded bg-swing-navy/10 px-2 py-1 text-xs font-semibold text-swing-navy/70">
                  {dict.common.categories.miniwings}
                </span>
              )}
              {company.sells_parakites && (
                <span className="rounded bg-swing-navy/10 px-2 py-1 text-xs font-semibold text-swing-navy/70">
                  {dict.common.categories.parakites}
                </span>
              )}
              {!company.sells_paragliders &&
                !company.sells_miniwings &&
                !company.sells_parakites && (
                  <span className="text-xs text-swing-navy/30">
                    {tp.noCategoriesAssigned}
                  </span>
                )}
            </div>
            <p className="mt-1 text-[10px] text-swing-navy/30">
              {tp.categoriesAdminOnly}
            </p>
          </div>
        </div>

        {/* Contact */}
        <h3 className={`${sectionClass} mt-8`}>{tp.contact}</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{tp.contactPerson} *</label>
            <input
              name="full_name"
              required
              defaultValue={fullName}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{tp.email} *</label>
            <input
              name="contact_email"
              type="email"
              required
              defaultValue={company.contact_email}
              className={inputClass}
            />
            <p className="mt-1 text-[10px] text-swing-navy/30">
              {tp.loginEmail}: {email}
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>{tp.phone}</label>
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
        <h3 className={`${sectionClass} mt-8`}>{tp.address}</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>{tp.street}</label>
            <input
              name="address_street"
              defaultValue={company.address_street ?? ""}
              className={inputClass}
              placeholder="Bergstraße 12"
            />
          </div>

          <div>
            <label className={labelClass}>{tp.zip}</label>
            <input
              name="address_zip"
              defaultValue={company.address_zip ?? ""}
              className={inputClass}
              placeholder="6020"
            />
          </div>

          <div>
            <label className={labelClass}>{tp.city}</label>
            <input
              name="address_city"
              defaultValue={company.address_city ?? ""}
              className={inputClass}
              placeholder="Innsbruck"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>{tp.country}</label>
            <select
              name="address_country"
              defaultValue={company.address_country ?? ""}
              className={inputClass}
            >
              <option value="">{tp.selectCountry}</option>
              <option value="Österreich">Österreich</option>
              <option value="Deutschland">Deutschland</option>
              <option value="Schweiz">Schweiz</option>
              <option value="Italien">Italien</option>
              <option value="Frankreich">Frankreich</option>
              <option value="Slowenien">Slowenien</option>
              <option value="Tschechien">Tschechien</option>
              <option value="Ungarn">Ungarn</option>
              <option value="Polen">Polen</option>
              <option value="Niederlande">Niederlande</option>
              <option value="Belgien">Belgien</option>
              <option value="Luxemburg">Luxemburg</option>
              <option value="Spanien">Spanien</option>
              <option value="Portugal">Portugal</option>
              <option value="Großbritannien">Großbritannien</option>
              <option value="Schweden">Schweden</option>
              <option value="Norwegen">Norwegen</option>
              <option value="Dänemark">Dänemark</option>
              <option value="Finnland">Finnland</option>
              <option value="Griechenland">Griechenland</option>
              <option value="Türkei">Türkei</option>
              <option value="Japan">Japan</option>
              <option value="Südkorea">Südkorea</option>
              <option value="USA">USA</option>
              <option value="Kanada">Kanada</option>
              <option value="Australien">Australien</option>
              <option value="Neuseeland">Neuseeland</option>
              <option value="Brasilien">Brasilien</option>
              <option value="Chile">Chile</option>
              <option value="Südafrika">Südafrika</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle size={16} />
            {tp.saved}
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-swing-gold px-5 py-2.5 text-sm font-semibold text-swing-navy transition-colors hover:bg-swing-gold-dark disabled:opacity-50 sm:w-auto"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? tp.saving : tp.save}
          </button>
        </div>
      </div>
    </form>
  );
}

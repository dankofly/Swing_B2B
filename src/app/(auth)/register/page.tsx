"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowRight, CheckCircle, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    companyType: "dealer",
    sellsParagliders: false,
    sellsMiniwings: false,
    sellsParakites: false,
    fullName: "",
    email: "",
    phone: "",
    phoneWhatsapp: false,
    addressStreet: "",
    addressZip: "",
    addressCity: "",
    addressCountry: "",
    vatId: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.passwordConfirm) {
      setError("Passwörter stimmen nicht überein.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          company_name: formData.companyName,
          company_type: formData.companyType,
          sells_paragliders: formData.sellsParagliders,
          sells_miniwings: formData.sellsMiniwings,
          sells_parakites: formData.sellsParakites,
          phone: formData.phone,
          phone_whatsapp: formData.phoneWhatsapp,
          address_street: formData.addressStreet,
          address_zip: formData.addressZip,
          address_city: formData.addressCity,
          address_country: formData.addressCountry,
          vat_id: formData.vatId,
        },
      },
    });

    if (signUpError) {
      const errorMap: Record<string, string> = {
        "User already registered": "Diese E-Mail-Adresse ist bereits registriert.",
        "Password should be at least 6 characters": "Das Passwort muss mindestens 6 Zeichen lang sein.",
        "Unable to validate email address: invalid format": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        "Signup requires a valid password": "Bitte geben Sie ein gültiges Passwort ein.",
      };
      setError(errorMap[signUpError.message] || "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center dash-hero px-4">
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full border border-swing-gold/5 sm:block" />

        <div className="relative z-10 w-full max-w-md">
          <div className="card p-10 text-center ">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h2 className="text-lg font-extrabold uppercase tracking-[2px] text-swing-navy">
              Registrierung eingegangen
            </h2>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-swing-gray-dark/50">
              Vielen Dank für Ihre Registrierung. Ihr Konto wird von unserem Team
              geprüft und freigeschaltet. Sie erhalten eine E-Mail sobald Ihr
              Zugang aktiv ist.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-swing-gold px-8 py-3 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20"
            >
              Zum Login
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm transition-all duration-150 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20";
  const labelClass =
    "mb-2 block text-[11px] font-bold uppercase tracking-wider text-swing-navy/40";
  const sectionClass =
    "flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[3px] text-swing-navy/60 mb-4 mt-2";

  return (
    <div className="flex min-h-screen items-center justify-center dash-hero px-4 py-12">
      {/* Decorative rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-200 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full border border-swing-gold/5 sm:block" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full border border-swing-gold/8 sm:block" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Branding */}
        <div className="mb-10 text-center">
          <Link href="/" className="group inline-block">
            <span className="text-3xl font-extrabold italic tracking-[4px] text-white transition-colors group-hover:text-swing-gold">
              SWING PARAGLIDERS
            </span>
          </Link>
          <p className="mt-2 text-xs font-extrabold uppercase tracking-[3px] text-white/30">
            B2B Händlerportal
          </p>
        </div>

        {/* Card */}
        <div className="card p-8 ">
          {/* Icon + heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-swing-navy/5">
              <UserPlus size={20} className="text-swing-navy/60" />
            </div>
            <h1 className="text-lg font-extrabold uppercase tracking-[2px] text-swing-navy">
              Händler-Registrierung
            </h1>
            <p className="mt-1.5 text-sm text-swing-gray-dark/40">
              Erstellen Sie Ihren SWING PARAGLIDERS B2B-Zugang
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Company info */}
            <div className={sectionClass}>
              <div className="h-px flex-1 bg-gray-100" />
              <span>Firmendaten</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Firmenname *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Paragliding Center Alpen"
                />
              </div>

              <div>
                <label className={labelClass}>Typ *</label>
                <select
                  value={formData.companyType}
                  onChange={(e) => updateField("companyType", e.target.value)}
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
                  type="text"
                  value={formData.vatId}
                  onChange={(e) => updateField("vatId", e.target.value)}
                  className={inputClass}
                  placeholder="z.B. ATU12345678"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Produktkategorien</label>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-swing-gray-dark/60 transition-colors hover:text-swing-gray-dark">
                    <input
                      type="checkbox"
                      checked={formData.sellsParagliders}
                      onChange={(e) => updateField("sellsParagliders", e.target.checked)}
                      className="accent-swing-gold"
                    />
                    Gleitschirme
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-swing-gray-dark/60 transition-colors hover:text-swing-gray-dark">
                    <input
                      type="checkbox"
                      checked={formData.sellsMiniwings}
                      onChange={(e) => updateField("sellsMiniwings", e.target.checked)}
                      className="accent-swing-gold"
                    />
                    Miniwings
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-swing-gray-dark/60 transition-colors hover:text-swing-gray-dark">
                    <input
                      type="checkbox"
                      checked={formData.sellsParakites}
                      onChange={(e) => updateField("sellsParakites", e.target.checked)}
                      className="accent-swing-gold"
                    />
                    Parakites
                  </label>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className={sectionClass}>
              <div className="h-px flex-1 bg-gray-100" />
              <span>Kontakt</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Ansprechpartner *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Max Mustermann"
                />
              </div>

              <div>
                <label className={labelClass}>E-Mail *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                  className={inputClass}
                  placeholder="kontakt@haendler.de"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Telefon</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder="+43 512 123456"
                  />
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 text-xs text-swing-gray-dark/50 transition-all duration-150 hover:border-swing-gold/30">
                    <input
                      type="checkbox"
                      checked={formData.phoneWhatsapp}
                      onChange={(e) => updateField("phoneWhatsapp", e.target.checked)}
                      className="accent-swing-gold"
                    />
                    WhatsApp
                  </label>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className={sectionClass}>
              <div className="h-px flex-1 bg-gray-100" />
              <span>Adresse</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Straße + Nr.</label>
                <input
                  type="text"
                  value={formData.addressStreet}
                  onChange={(e) => updateField("addressStreet", e.target.value)}
                  className={inputClass}
                  placeholder="Bergstraße 12"
                />
              </div>

              <div>
                <label className={labelClass}>PLZ</label>
                <input
                  type="text"
                  value={formData.addressZip}
                  onChange={(e) => updateField("addressZip", e.target.value)}
                  className={inputClass}
                  placeholder="6020"
                />
              </div>

              <div>
                <label className={labelClass}>Stadt</label>
                <input
                  type="text"
                  value={formData.addressCity}
                  onChange={(e) => updateField("addressCity", e.target.value)}
                  className={inputClass}
                  placeholder="Innsbruck"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Land</label>
                <input
                  type="text"
                  value={formData.addressCountry}
                  onChange={(e) => updateField("addressCountry", e.target.value)}
                  className={inputClass}
                  placeholder="Österreich"
                />
              </div>
            </div>

            {/* Password */}
            <div className={sectionClass}>
              <div className="h-px flex-1 bg-gray-100" />
              <span>Passwort</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Passwort *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                  minLength={8}
                  className={inputClass}
                  placeholder="Mindestens 8 Zeichen"
                />
              </div>

              <div>
                <label className={labelClass}>Passwort bestätigen *</label>
                <input
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={(e) => updateField("passwordConfirm", e.target.value)}
                  required
                  className={inputClass}
                  placeholder="Passwort wiederholen"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-swing-gold py-3.5 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Wird registriert..." : "Registrieren"}
              {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-swing-gray-dark/40">
              Bereits registriert?{" "}
              <Link
                href="/login"
                className="font-semibold text-swing-navy transition-colors hover:text-swing-gold"
              >
                Zum Login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-[11px] text-white/20">
          SWING Flugsportgeräte GmbH &middot; swing.de
        </p>
      </div>
    </div>
  );
}

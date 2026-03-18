"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowRight, CheckCircle, Loader2, UserPlus } from "lucide-react";
import { useDict } from "@/lib/i18n/context";

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
  const dict = useDict();

  function updateField(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.passwordConfirm) {
      setError(dict.auth.register.errorPasswordMismatch);
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError(dict.auth.register.errorPasswordMin);
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
        "User already registered": dict.auth.register.errorEmailExists,
        "Password should be at least 6 characters": dict.auth.register.errorPasswordMin,
        "Unable to validate email address: invalid format": dict.auth.register.errorGeneric,
        "Signup requires a valid password": dict.auth.register.errorGeneric,
      };
      setError(errorMap[signUpError.message] || dict.auth.register.errorGeneric);
      setLoading(false);
      return;
    }

    // Send email notification to SWING (fire-and-forget)
    fetch("/api/notify-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: formData.companyName,
        companyType: formData.companyType,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        phoneWhatsapp: formData.phoneWhatsapp,
        addressStreet: formData.addressStreet,
        addressZip: formData.addressZip,
        addressCity: formData.addressCity,
        addressCountry: formData.addressCountry,
        vatId: formData.vatId,
        sellsParagliders: formData.sellsParagliders,
        sellsMiniwings: formData.sellsMiniwings,
        sellsParakites: formData.sellsParakites,
      }),
    }).catch(() => {}); // silent fail — registration still succeeds

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
              {dict.auth.register.successTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-swing-gray-dark/50">
              {dict.auth.register.successMessage}
            </p>

            {/* What happens next */}
            <div className="mx-auto mt-6 max-w-xs space-y-3 text-left">
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">
                {dict.auth.register.nextSteps}
              </p>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-600">1</div>
                <p className="text-xs leading-relaxed text-swing-gray-dark/50">
                  <span className="font-semibold text-swing-navy/70">{dict.auth.register.step1Title}</span> — {dict.auth.register.step1Desc}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-swing-navy/10 text-[10px] font-bold text-swing-navy/50">2</div>
                <p className="text-xs leading-relaxed text-swing-gray-dark/50">
                  <span className="font-semibold text-swing-navy/70">{dict.auth.register.step2Title}</span> — {dict.auth.register.step2Desc}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-swing-navy/10 text-[10px] font-bold text-swing-navy/50">3</div>
                <p className="text-xs leading-relaxed text-swing-gray-dark/50">
                  <span className="font-semibold text-swing-navy/70">{dict.auth.register.step3Title}</span> — {dict.auth.register.step3Desc}
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-swing-gold px-8 py-3 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20"
            >
              {dict.auth.register.toLogin}
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
        <div className="mb-6 text-center sm:mb-10">
          <Link href="/" className="group inline-block">
            <span className="text-2xl font-extrabold italic tracking-[3px] text-white transition-colors group-hover:text-swing-gold sm:text-3xl sm:tracking-[4px]">
              SWING PARAGLIDERS
            </span>
          </Link>
          <p className="mt-2 text-xs font-extrabold uppercase tracking-[3px] text-white/30">
            {dict.auth.login.portalSubtitle}
          </p>
        </div>

        {/* Card */}
        <div className="card p-5 sm:p-8">
          {/* Icon + heading */}
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-swing-navy/5">
              <UserPlus size={20} className="text-swing-navy/60" />
            </div>
            <h1 className="text-lg font-extrabold uppercase tracking-[2px] text-swing-navy">
              {dict.auth.register.title}
            </h1>
            <p className="mt-1.5 text-sm text-swing-gray-dark/40">
              {dict.auth.register.subtitle}
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
              <span>{dict.auth.register.companyData}</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>{dict.auth.register.companyName} *</label>
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
                <label className={labelClass}>{dict.auth.register.companyType} *</label>
                <select
                  value={formData.companyType}
                  onChange={(e) => updateField("companyType", e.target.value)}
                  className={inputClass}
                >
                  <option value="dealer">{dict.common.companyTypes.dealer}</option>
                  <option value="importer">{dict.common.companyTypes.importer}</option>
                  <option value="importer_network">{dict.common.companyTypes.importer_network}</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>{dict.auth.register.vatId}</label>
                <input
                  type="text"
                  value={formData.vatId}
                  onChange={(e) => updateField("vatId", e.target.value)}
                  className={inputClass}
                  placeholder="z.B. ATU12345678"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>{dict.auth.register.productCategories}</label>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-swing-gray-dark/60 transition-colors hover:text-swing-gray-dark">
                    <input
                      type="checkbox"
                      checked={formData.sellsParagliders}
                      onChange={(e) => updateField("sellsParagliders", e.target.checked)}
                      className="accent-swing-gold"
                    />
                    {dict.common.categories.paragliders}
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-swing-gray-dark/60 transition-colors hover:text-swing-gray-dark">
                    <input
                      type="checkbox"
                      checked={formData.sellsMiniwings}
                      onChange={(e) => updateField("sellsMiniwings", e.target.checked)}
                      className="accent-swing-gold"
                    />
                    {dict.common.categories.miniwings}
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-swing-gray-dark/60 transition-colors hover:text-swing-gray-dark">
                    <input
                      type="checkbox"
                      checked={formData.sellsParakites}
                      onChange={(e) => updateField("sellsParakites", e.target.checked)}
                      className="accent-swing-gold"
                    />
                    {dict.common.categories.parakites}
                  </label>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className={sectionClass}>
              <div className="h-px flex-1 bg-gray-100" />
              <span>{dict.auth.register.contact}</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>{dict.auth.register.contactPerson} *</label>
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
                <label className={labelClass}>{dict.auth.register.email} *</label>
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
                <label className={labelClass}>{dict.auth.register.phone}</label>
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
              <span>{dict.auth.register.address}</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>{dict.auth.register.street}</label>
                <input
                  type="text"
                  value={formData.addressStreet}
                  onChange={(e) => updateField("addressStreet", e.target.value)}
                  className={inputClass}
                  placeholder="Bergstraße 12"
                />
              </div>

              <div>
                <label className={labelClass}>{dict.auth.register.zip}</label>
                <input
                  type="text"
                  value={formData.addressZip}
                  onChange={(e) => updateField("addressZip", e.target.value)}
                  className={inputClass}
                  placeholder="6020"
                />
              </div>

              <div>
                <label className={labelClass}>{dict.auth.register.city}</label>
                <input
                  type="text"
                  value={formData.addressCity}
                  onChange={(e) => updateField("addressCity", e.target.value)}
                  className={inputClass}
                  placeholder="Innsbruck"
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>{dict.auth.register.country}</label>
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
              <span>{dict.auth.register.passwordSection}</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>{dict.auth.register.password} *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                  minLength={8}
                  className={inputClass}
                  placeholder={dict.auth.register.passwordMin}
                />
              </div>

              <div>
                <label className={labelClass}>{dict.auth.register.passwordConfirm} *</label>
                <input
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={(e) => updateField("passwordConfirm", e.target.value)}
                  required
                  className={inputClass}
                  placeholder={dict.auth.register.passwordRepeat}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-swing-gold py-3.5 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? dict.auth.register.submitting : dict.auth.register.submit}
              {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-swing-gray-dark/40">
              {dict.auth.register.alreadyRegistered}{" "}
              <Link
                href="/login"
                className="font-semibold text-swing-navy transition-colors hover:text-swing-gold"
              >
                {dict.auth.register.loginLink}
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

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, CheckCircle, Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
import { useDict } from "@/lib/i18n/context";

function generateSecurePassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%&*?";
  const all = upper + lower + digits + symbols;

  // Guarantee at least one of each type
  const parts = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  for (let i = parts.length; i < 16; i++) {
    parts.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Shuffle
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts.join("");
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const dict = useDict();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== passwordConfirm) {
      setError(dict.auth.resetPassword.errorMismatch);
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(dict.auth.resetPassword.errorMin);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(dict.auth.resetPassword.errorGeneric);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/katalog"), 3000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center dash-hero px-4">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full border border-swing-gold/5" />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="mb-10 text-center">
          <Link href="/" className="group inline-block">
            <span className="text-3xl font-extrabold italic tracking-[4px] text-white transition-colors group-hover:text-swing-gold">
              SWING PARAGLIDERS
            </span>
            <span className="ml-2.5 inline-block rounded-lg bg-swing-gold px-2.5 py-1 text-[10px] font-extrabold tracking-[3px] text-swing-navy">
              B2B
            </span>
          </Link>
          <p className="mt-3 text-xs font-medium uppercase tracking-[3px] text-white/30">
            Händlerportal
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <h1 className="text-lg font-extrabold uppercase tracking-[2px] text-swing-navy">
                {dict.auth.resetPassword.successTitle}
              </h1>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-swing-gray-dark/50">
                {dict.auth.resetPassword.successMessage}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-swing-navy/5">
                  <KeyRound size={20} className="text-swing-navy/60" />
                </div>
                <h1 className="text-lg font-extrabold uppercase tracking-[2px] text-swing-navy">
                  {dict.auth.resetPassword.title}
                </h1>
                <p className="mt-1.5 text-sm text-swing-gray-dark/40">
                  {dict.auth.resetPassword.subtitle}
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-5">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-swing-navy/40"
                  >
                    {dict.auth.resetPassword.newPassword}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pr-10 text-sm transition-all duration-150 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20"
                      placeholder={dict.auth.resetPassword.passwordMin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-swing-navy/30 transition-colors hover:text-swing-navy/60"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="passwordConfirm"
                    className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-swing-navy/40"
                  >
                    {dict.auth.resetPassword.confirmPassword}
                  </label>
                  <div className="relative">
                    <input
                      id="passwordConfirm"
                      type={showConfirm ? "text" : "password"}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 pr-10 text-sm transition-all duration-150 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20"
                      placeholder={dict.auth.resetPassword.passwordRepeat}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-swing-navy/30 transition-colors hover:text-swing-navy/60"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const pw = generateSecurePassword();
                    setPassword(pw);
                    setPasswordConfirm(pw);
                    setShowPassword(true);
                    setShowConfirm(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-xs font-semibold text-swing-navy/50 transition-all hover:border-swing-gold/50 hover:text-swing-navy/80"
                >
                  <Sparkles size={14} />
                  Sicheres Passwort generieren
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-swing-gold py-3.5 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? dict.auth.resetPassword.submitting : dict.auth.resetPassword.submit}
                  {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-[11px] text-white/20">
          SWING Flugsportgeräte GmbH &middot; swing.de
        </p>
      </div>
    </div>
  );
}

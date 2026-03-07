"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.");
      setLoading(false);
      return;
    }

    router.push("/katalog");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center dash-hero px-4">
      {/* Decorative rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full border border-swing-gold/5" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-100 w-100 -translate-x-1/2 -translate-y-1/2 rounded-full border border-swing-gold/8" />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="mb-10 text-center">
          <Link href="/" className="group inline-block">
            <span className="text-3xl font-extrabold italic tracking-[4px] text-white transition-colors group-hover:text-swing-gold">
              SWING
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
        <div className="card p-8 ">
          {/* Icon + heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-swing-navy/5">
              <Lock size={20} className="text-swing-navy/60" />
            </div>
            <h1 className="text-lg font-extrabold uppercase tracking-[2px] text-swing-navy">
              Anmelden
            </h1>
            <p className="mt-1.5 text-sm text-swing-gray-dark/40">
              Zugang zu Ihrem B2B-Katalog
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-swing-navy/40"
              >
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm transition-all duration-150 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20"
                placeholder="ihre@email.de"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-swing-navy/40"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm transition-all duration-150 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-swing-navy/40 transition-colors hover:text-swing-gold"
              >
                Passwort vergessen?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-swing-gold py-3.5 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Anmelden..." : "Anmelden"}
              {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-swing-gray-dark/40">
              Noch kein Konto?{" "}
              <Link
                href="/register"
                className="font-semibold text-swing-navy transition-colors hover:text-swing-gold"
              >
                Jetzt registrieren
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

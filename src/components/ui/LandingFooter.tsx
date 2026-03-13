"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { useDict } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

export default function LandingFooter() {
  const dict = useDict();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.role === "admin" || data?.role === "superadmin") {
            setIsAdmin(true);
          }
        });
    });
  }, []);

  return (
    <div className="border-t border-white/10 bg-swing-navy px-5 py-5">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        {/* Left: SWING.DE link */}
        <a
          href="https://www.swing.de/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold tracking-wider text-white/40 transition-colors hover:text-white/70"
        >
          SWING.DE
        </a>

        {/* Center: Legal links + Language switcher */}
        <div className="flex items-center gap-2">
          <Link href="/anleitung" className="rounded px-2 py-1.5 text-xs text-white/35 transition-colors hover:text-white/60">
            Anleitung
          </Link>
          {isAdmin && (
            <>
              <div className="h-3 w-px bg-white/15" />
              <Link href="/admin-anleitung" className="rounded px-2 py-1.5 text-xs text-swing-gold/50 transition-colors hover:text-swing-gold/80">
                Admin-Handbuch
              </Link>
            </>
          )}
          <div className="h-3 w-px bg-white/15" />
          <Link href="/impressum" className="rounded px-2 py-1.5 text-xs text-white/35 transition-colors hover:text-white/60">
            {dict.landing.impressum}
          </Link>
          <Link href="/datenschutz" className="rounded px-2 py-1.5 text-xs text-white/35 transition-colors hover:text-white/60">
            {dict.landing.datenschutz}
          </Link>
          <div className="h-3 w-px bg-white/15" />
          <LanguageSwitcher />
        </div>

        {/* Right: Hypeakz credit */}
        <a
          href="https://hypeakz.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/30 transition-colors hover:text-white/50"
        >
          Powered by Hypeakz.io
        </a>
      </div>
    </div>
  );
}

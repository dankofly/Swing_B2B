"use client";

import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { useDict } from "@/lib/i18n/context";

export default function LandingFooter() {
  const dict = useDict();

  return (
    <div className="bg-[#0a1620] px-5 py-4">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        {/* Left: SWING.DE link */}
        <a
          href="https://www.swing.de/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold tracking-wider text-white/25 transition-colors hover:text-white/50"
        >
          SWING.DE
        </a>

        {/* Center: Legal links + Language switcher */}
        <div className="flex items-center gap-4">
          <Link href="/impressum" className="text-[11px] text-white/20 transition-colors hover:text-white/40">
            {dict.landing.impressum}
          </Link>
          <Link href="/datenschutz" className="text-[11px] text-white/20 transition-colors hover:text-white/40">
            {dict.landing.datenschutz}
          </Link>
          <div className="h-3 w-px bg-white/10" />
          <LanguageSwitcher />
        </div>

        {/* Right: Hypeakz credit */}
        <a
          href="https://hypeakz.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-white/15 transition-colors hover:text-white/30"
        >
          App by Hypeakz.io
        </a>
      </div>
    </div>
  );
}

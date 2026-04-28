"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { X, ShoppingBag, User, FileText } from "lucide-react";

const STORAGE_KEY = "swing_welcome_dismissed";

function subscribeStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getDismissed() {
  if (typeof window === "undefined") return true;
  return !!window.localStorage.getItem(STORAGE_KEY);
}

export default function WelcomeBanner({
  firstName,
  links,
}: {
  firstName: string;
  links: { catalog: string; profile: string; inquiries: string };
}) {
  // Server snapshot returns "true" (dismissed) so the banner is hidden during SSR/hydration
  // and only shown on the client after reading localStorage. This avoids setState-in-effect
  // and prevents a flash for users who already dismissed.
  const dismissedFromStorage = useSyncExternalStore(subscribeStorage, getDismissed, () => true);
  const [dismissedLocally, setDismissedLocally] = useState(false);
  const visible = !dismissedFromStorage && !dismissedLocally;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissedLocally(true);
  }

  if (!visible) return null;

  return (
    <div className="card fade-in-up overflow-hidden border-l-[3px] border-l-swing-gold">
      <div className="relative px-5 py-5 sm:px-6">
        <button
          onClick={dismiss}
          className="btn-press absolute right-3 top-3 rounded p-1.5 text-swing-navy/20 transition-colors hover:bg-gray-100 hover:text-swing-navy/50"
          aria-label="Schließen"
        >
          <X size={16} />
        </button>

        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-swing-gold">
          Willkommen im B2B-Portal
        </p>
        <h3 className="mt-1 text-lg font-extrabold text-swing-navy">
          Hallo {firstName}, schön dass Sie da sind!
        </h3>
        <p className="mt-1.5 max-w-lg text-sm text-swing-gray-dark/50">
          Hier finden Sie unseren aktuellen Katalog mit Ihren individuellen Händlerpreisen.
          Stöbern Sie durch unser Sortiment und senden Sie unverbindliche Bestellanfragen.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={links.catalog}
            className="btn-gold inline-flex items-center gap-2 rounded-lg bg-swing-gold px-4 py-2 text-xs font-bold text-swing-navy transition-all hover:bg-swing-gold-dark"
          >
            <ShoppingBag size={14} />
            Katalog entdecken
          </Link>
          <Link
            href={links.profile}
            className="inline-flex items-center gap-2 rounded-lg border border-swing-navy/10 px-4 py-2 text-xs font-semibold text-swing-navy/50 transition-colors hover:border-swing-navy/20 hover:text-swing-navy"
          >
            <User size={14} />
            Profil vervollständigen
          </Link>
          <Link
            href={links.inquiries}
            className="inline-flex items-center gap-2 rounded-lg border border-swing-navy/10 px-4 py-2 text-xs font-semibold text-swing-navy/50 transition-colors hover:border-swing-navy/20 hover:text-swing-navy"
          >
            <FileText size={14} />
            Anfragen verwalten
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDict } from "@/lib/i18n/context";
import { RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = useDict();
  const t = dict.errors.generic;

  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="card mx-auto max-w-md p-8">
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h2 className="mb-2 text-xl font-bold text-swing-navy">{t.heading}</h2>
        <p className="mb-4 text-sm text-swing-gray-dark/70">{t.message}</p>
        <div className="mx-auto mb-5 max-w-xs rounded-lg bg-gray-50 px-5 py-4 text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">{t.recoveryTitle}</p>
          <ul className="mt-2 space-y-1.5 text-xs text-swing-gray-dark/50">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-swing-gold" />
              {t.recoveryHint1}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-swing-gold" />
              {t.recoveryHint2}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-swing-gold" />
              {t.recoveryHint3}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="btn-gold inline-flex items-center justify-center gap-2 rounded bg-swing-gold px-5 py-2 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark"
          >
            <RefreshCw className="h-4 w-4" />
            {t.retry}
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 rounded border border-swing-navy/20 px-5 py-2 text-sm font-semibold text-swing-navy hover:bg-swing-navy/5"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

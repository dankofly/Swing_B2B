"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDict } from "@/lib/i18n/context";
import { RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const dict = useDict();
  const t = dict.errors.generic;

  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="card mx-auto max-w-md p-8 sm:p-12">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-extrabold text-swing-navy">{t.heading}</h1>
        <p className="mb-8 text-swing-gray-dark/70">{t.message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="btn-gold inline-flex items-center justify-center gap-2 rounded bg-swing-gold px-6 py-2.5 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark"
          >
            <RefreshCw className="h-4 w-4" />
            {t.retry}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded border border-swing-navy/20 px-6 py-2.5 text-sm font-semibold text-swing-navy hover:bg-swing-navy/5"
          >
            <Home className="h-4 w-4" />
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}

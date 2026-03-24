"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function KundenDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[kunden-detail] Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
      <div className="card mx-auto max-w-sm p-6">
        <p className="mb-3 text-sm font-semibold text-swing-navy">
          Kundendaten konnten nicht geladen werden.
        </p>
        <p className="mb-4 text-xs text-swing-gray-dark/50">
          Bitte versuche es erneut oder lade die Seite neu.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded bg-swing-gold px-4 py-2 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark"
        >
          <RefreshCw className="h-4 w-4" />
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}

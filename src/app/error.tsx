"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card max-w-sm p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-red-50">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-extrabold uppercase tracking-[2px] text-swing-navy">
          Fehler
        </h2>
        <p className="mt-3 text-sm text-swing-gray-dark/50">
          Ein unerwarteter Fehler ist aufgetreten.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded bg-swing-gold px-8 py-3 text-sm font-bold text-swing-navy transition-colors hover:bg-swing-gold-dark"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
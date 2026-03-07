"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteCompany } from "@/lib/actions/customers";

interface DeleteCompanyButtonProps {
  companyId: string;
  companyName: string;
  variant?: "icon" | "button";
}

export default function DeleteCompanyButton({
  companyId,
  companyName,
  variant = "icon",
}: DeleteCompanyButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCompany(companyId);
    if (result.success) {
      router.push("/admin/kunden");
      router.refresh();
    } else {
      alert("Fehler beim Löschen: " + (result.error || "Unbekannter Fehler"));
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="flex cursor-pointer items-center gap-1 rounded px-3 py-1.5 text-xs font-bold text-red-500/60 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
          title="Kunde löschen"
        >
          <Trash2 size={14} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-bold text-white/60 transition-colors hover:bg-red-500/20 hover:text-red-300"
        >
          <Trash2 size={14} />
          Löschen
        </button>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-swing-navy">
              Kunde löschen?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-swing-gray-dark/60">
              Möchten Sie <strong>{companyName}</strong> wirklich löschen? Alle
              zugehörigen Daten (Benutzer, Preislisten, Anfragen) werden
              unwiderruflich entfernt.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="flex-1 cursor-pointer rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-swing-navy transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 cursor-pointer rounded-lg bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Wird gelöscht..." : "Endgültig löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

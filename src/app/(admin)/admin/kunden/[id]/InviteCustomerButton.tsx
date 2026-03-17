"use client";

import { useState } from "react";
import { Mail, Loader2, Check, X } from "lucide-react";
import { inviteCustomer } from "@/lib/actions/customers";

export default function InviteCustomerButton({
  companyId,
  companyEmail,
  contactName,
}: {
  companyId: string;
  companyEmail: string;
  contactName: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(companyEmail);
  const [name, setName] = useState(contactName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await inviteCustomer(companyId, email, name);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 3000);
    } else {
      setError(result.error || "Fehler beim Einladen");
    }

    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded bg-swing-gold/15 px-2.5 py-1.5 text-[11px] font-semibold text-swing-navy transition-colors hover:bg-swing-gold/30 cursor-pointer"
      >
        <Mail size={12} />
        Einladen
      </button>
    );
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
        <Check size={14} className="text-green-600" />
        Einladung gesendet an {email}
      </div>
    );
  }

  return (
    <form onSubmit={handleInvite} className="rounded border border-swing-gold/20 bg-swing-gold/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
          Händler einladen
        </p>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          className="rounded p-0.5 text-swing-navy/30 hover:text-swing-navy cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {error && (
        <p className="mb-2 text-xs font-medium text-red-600">{error}</p>
      )}

      <div className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs focus:border-swing-gold focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-Mail"
          required
          className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs focus:border-swing-gold focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded bg-swing-gold px-3 py-2 text-xs font-bold text-swing-navy transition-colors hover:bg-swing-gold-dark disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            Wird gesendet...
          </>
        ) : (
          <>
            <Mail size={12} />
            Einladung senden
          </>
        )}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Mail, Loader2, Check, AlertCircle } from "lucide-react";
import { resendCustomerInvitation } from "@/lib/actions/customers";

/**
 * "Login pending" status indicator with a Resend-Invitation action.
 *
 * Shown in the admin customer detail view when a buyer profile exists but
 * has never signed in. Clicking re-triggers the invite pipeline which
 * generates a fresh recovery link and re-sends the branded email. Every
 * call is written to the invitation_log table regardless of outcome.
 */
export default function ResendInvitationButton({
  companyId,
  email,
}: {
  companyId: string;
  email: string;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleResend() {
    setLoading(true);
    setResult(null);
    const r = await resendCustomerInvitation(companyId);
    setResult(
      r.success
        ? { ok: true, msg: `Einladung erneut an ${email} gesendet` }
        : { ok: false, msg: r.error || "Fehler beim Senden" },
    );
    setLoading(false);
    if (r.success) setTimeout(() => setResult(null), 4000);
  }

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between gap-2 rounded border border-amber-200 bg-amber-50 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
          <AlertCircle size={12} />
          Login ausstehend
        </div>
        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded bg-swing-gold/20 px-2 py-1 text-[10px] font-bold text-swing-navy transition-colors hover:bg-swing-gold/40 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={10} className="animate-spin" />
              Sendet…
            </>
          ) : (
            <>
              <Mail size={10} />
              Erneut senden
            </>
          )}
        </button>
      </div>

      {result && (
        <div
          className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] ${
            result.ok
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {result.ok ? <Check size={11} /> : <AlertCircle size={11} />}
          {result.msg}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { updateAdminProfile } from "@/lib/actions/profile";
import { Save, Loader2, CheckCircle, User } from "lucide-react";
import { useDict } from "@/lib/i18n/context";

const inputClass =
  "w-full rounded border border-gray-200 bg-white px-4 py-3 text-sm transition-all duration-150 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20";
const labelClass =
  "mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-swing-navy/40";

export default function AdminProfileForm({
  fullName,
  email,
  role,
}: {
  fullName: string;
  email: string;
  role: string;
}) {
  const dict = useDict();
  const tp = dict.adminProfile;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateAdminProfile(formData);

    setSaving(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || tp.saveError);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-3.5 sm:px-6 sm:py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-swing-navy text-white">
            <User size={16} strokeWidth={1.75} />
          </div>
          <h3 className="text-sm font-bold text-swing-navy">{tp.personalData}</h3>
        </div>

        <div className="grid gap-5 p-4 sm:p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>{tp.fullName} *</label>
            <input
              name="full_name"
              required
              defaultValue={fullName}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>{tp.email}</label>
            <input
              type="email"
              disabled
              value={email}
              className={`${inputClass} bg-gray-50 text-swing-navy/50`}
            />
            <p className="mt-1 text-[10px] text-swing-navy/30">
              {tp.emailHint}
            </p>
          </div>

          <div>
            <label className={labelClass}>{tp.role}</label>
            <input
              type="text"
              disabled
              value={role}
              className={`${inputClass} bg-gray-50 text-swing-navy/50`}
            />
          </div>
        </div>

        {error && (
          <div className="mx-4 mb-4 sm:mx-6">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-4 mb-4 flex items-center gap-2 text-sm font-medium text-green-700 sm:mx-6">
            <CheckCircle size={16} />
            {tp.saved}
          </div>
        )}

        <div className="border-t border-gray-100 px-4 py-4 sm:px-6">
          <button
            type="submit"
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 rounded bg-swing-gold px-5 py-2.5 text-sm font-semibold text-swing-navy transition-colors hover:bg-swing-gold-dark disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? tp.saving : tp.save}
          </button>
        </div>
      </div>
    </form>
  );
}

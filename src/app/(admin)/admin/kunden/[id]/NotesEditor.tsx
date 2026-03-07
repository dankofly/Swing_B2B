"use client";

import { useState } from "react";
import { updateCompanyNotes } from "@/lib/actions/customers";
import { Save, Loader2 } from "lucide-react";

export default function NotesEditor({
  companyId,
  initialNotes,
}: {
  companyId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const result = await updateCompanyNotes(companyId, notes);
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        rows={6}
        className="w-full rounded border border-gray-200 bg-white px-3 py-2.5 text-sm transition-all focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20"
        placeholder="Interne Notizen zu diesem Kunden..."
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex cursor-pointer items-center gap-2 rounded bg-swing-gold px-4 py-2 text-sm font-semibold text-swing-navy transition-colors hover:bg-swing-gold-dark disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Notizen speichern
        </button>
        {saved && (
          <span className="text-sm font-medium text-emerald-600">
            Gespeichert
          </span>
        )}
      </div>
    </div>
  );
}

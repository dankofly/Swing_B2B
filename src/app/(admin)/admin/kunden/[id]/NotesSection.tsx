"use client";

import { useState } from "react";
import { createCompanyNote, deleteCompanyNote, toggleNoteVisibility } from "@/lib/actions/company-notes";
import {
  StickyNote,
  ChevronDown,
  Plus,
  Trash2,
  Loader2,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

interface Note {
  id: string;
  subject: string;
  content: string;
  visible_to_customer: boolean;
  created_at: string;
}

export default function NotesSection({
  companyId,
  notes: initialNotes,
}: {
  companyId: string;
  notes: Note[];
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [visibleToCustomer, setVisibleToCustomer] = useState(false);

  async function handleCreate() {
    if (!subject.trim()) return;
    setSaving(true);

    const result = await createCompanyNote(companyId, subject.trim(), content.trim(), visibleToCustomer);
    if (result.success) {
      setNotes((prev) => [
        {
          id: crypto.randomUUID(),
          subject: subject.trim(),
          content: content.trim(),
          visible_to_customer: visibleToCustomer,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setSubject("");
      setContent("");
      setVisibleToCustomer(false);
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleDelete(noteId: string) {
    const result = await deleteCompanyNote(noteId, companyId);
    if (result.success) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (expandedId === noteId) setExpandedId(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-swing-navy/50">
          <StickyNote size={14} />
          Notizen
          {notes.length > 0 && (
            <span className="rounded bg-swing-navy/10 px-1.5 py-0.5 text-[10px] font-semibold text-swing-navy/60">
              {notes.length}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex cursor-pointer items-center gap-1.5 rounded bg-swing-gold px-3 py-1.5 text-xs font-semibold text-swing-navy transition-colors hover:bg-swing-gold-dark"
        >
          {showForm ? <X size={12} /> : <Plus size={12} />}
          {showForm ? "Abbrechen" : "Neue Notiz"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-3 rounded border border-gray-200 bg-white p-4">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-swing-navy/40">
                Betreff *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="z.B. Erstgespräch geführt"
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-swing-navy placeholder:text-swing-navy/30 focus:border-swing-navy/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-swing-navy/40">
                Inhalt
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder="Details zur Notiz..."
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm text-swing-navy placeholder:text-swing-navy/30 focus:border-swing-navy/30 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-swing-navy/50">
                <input
                  type="checkbox"
                  checked={visibleToCustomer}
                  onChange={(e) => setVisibleToCustomer(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 accent-swing-gold"
                />
                <Eye size={12} />
                Für Händler sichtbar
              </label>
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving || !subject.trim()}
                className="flex cursor-pointer items-center gap-1.5 rounded bg-swing-gold px-4 py-2 text-xs font-semibold text-swing-navy transition-colors hover:bg-swing-gold-dark disabled:opacity-50"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                {saving ? "Speichert..." : "Notiz speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex items-center justify-center rounded border border-dashed border-gray-200 bg-white p-8">
          <p className="text-sm text-swing-navy/30">Keine Notizen vorhanden</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notes.map((note) => {
            const isExpanded = expandedId === note.id;

            return (
              <div
                key={note.id}
                className="rounded border border-gray-200 bg-white transition-shadow hover:shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : note.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
                >
                  <ChevronDown
                    size={14}
                    className={`shrink-0 text-swing-navy/30 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-swing-navy">
                    {note.subject}
                  </span>
                  {note.visible_to_customer && (
                    <span className="shrink-0 rounded bg-swing-gold/15 px-1.5 py-0.5 text-[9px] font-bold text-swing-gold-dark">
                      Händler
                    </span>
                  )}
                  <span className="shrink-0 text-[11px] text-swing-navy/40">
                    {new Date(note.created_at).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-3 pt-2">
                    {note.content ? (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-swing-navy/70">
                        {note.content}
                      </p>
                    ) : (
                      <p className="text-sm italic text-swing-navy/30">Kein Inhalt</p>
                    )}
                    <div className="mt-2 flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={async () => {
                          const newVal = !note.visible_to_customer;
                          setNotes((prev) =>
                            prev.map((n) =>
                              n.id === note.id ? { ...n, visible_to_customer: newVal } : n
                            )
                          );
                          await toggleNoteVisibility(note.id, companyId, newVal);
                        }}
                        className={`flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-[11px] transition-colors ${
                          note.visible_to_customer
                            ? "text-swing-gold-dark hover:bg-swing-gold/10"
                            : "text-swing-navy/40 hover:bg-gray-100"
                        }`}
                      >
                        {note.visible_to_customer ? <Eye size={11} /> : <EyeOff size={11} />}
                        {note.visible_to_customer ? "Sichtbar" : "Verborgen"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-[11px] text-swing-navy/40 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={11} />
                        Löschen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

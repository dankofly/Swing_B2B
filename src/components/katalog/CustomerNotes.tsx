"use client";

import { useState } from "react";
import { StickyNote, ChevronDown } from "lucide-react";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";

interface Note {
  id: string;
  subject: string;
  content: string;
  created_at: string;
}

export default function CustomerNotes({ notes }: { notes: Note[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dict = useDict();
  const locale = useLocale();

  if (notes.length === 0) return null;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-swing-navy/5">
          <StickyNote size={18} className="text-swing-navy/50" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-swing-navy">{dict.dashboard.notes.title}</h3>
          <p className="text-[11px] text-swing-gray-dark/35">
            {notes.length} {dict.dashboard.notes.title} {dict.dashboard.notes.countSuffix}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100">
        {notes.map((note) => {
          const isExpanded = expandedId === note.id;

          return (
            <div
              key={note.id}
              className="border-b border-gray-50 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : note.id)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-swing-gold/4 sm:px-6"
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
                <span className="shrink-0 text-[11px] text-swing-navy/40">
                  {new Date(note.created_at).toLocaleDateString(getDateLocale(locale), {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </button>

              {isExpanded && note.content && (
                <div className="border-t border-gray-50 px-5 pb-4 pt-3 sm:px-6">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-swing-navy/70">
                    {note.content}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

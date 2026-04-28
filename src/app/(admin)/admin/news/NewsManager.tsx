"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, GripVertical, Languages, Loader2, Check } from "lucide-react";
import {
  createNews,
  updateNews,
  toggleNewsActive,
  deleteNews,
} from "@/lib/actions/news";
import { useRouter } from "next/navigation";

type Locale = "de" | "en" | "fr";

interface NewsItem {
  id: string;
  message: string;
  message_en: string | null;
  message_fr: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

function TabBar({
  active,
  onChange,
  hasEn,
  hasFr,
  onTranslate,
  translating,
}: {
  active: Locale;
  onChange: (l: Locale) => void;
  hasEn: boolean;
  hasFr: boolean;
  onTranslate: () => void;
  translating: string;
}) {
  const tabs: { key: Locale; label: string; hasContent?: boolean }[] = [
    { key: "de", label: "DE" },
    { key: "en", label: "EN", hasContent: hasEn },
    { key: "fr", label: "FR", hasContent: hasFr },
  ];

  return (
    <div className="flex items-center gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`relative rounded px-2 py-0.5 text-[11px] font-bold tracking-wider transition-colors ${
            active === tab.key
              ? "bg-swing-navy text-white"
              : "text-swing-gray-dark/40 hover:text-swing-gray-dark/70"
          }`}
        >
          {tab.label}
          {tab.key !== "de" && (
            <span
              className={`ml-1 inline-block h-1.5 w-1.5 rounded-full ${
                tab.hasContent ? "bg-emerald-400" : "bg-swing-gray-dark/20"
              }`}
            />
          )}
        </button>
      ))}
      <button
        type="button"
        onClick={onTranslate}
        disabled={translating !== "idle"}
        className="ml-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-swing-gray-dark/40 transition-colors hover:bg-swing-gold/10 hover:text-swing-navy disabled:opacity-50"
        title="DE → EN + FR übersetzen"
      >
        {translating !== "idle" ? (
          <Loader2 size={10} className="animate-spin" />
        ) : (
          <Languages size={10} />
        )}
        Auto
      </button>
    </div>
  );
}

export default function NewsManager({
  initialNews,
}: {
  initialNews: NewsItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialNews);
  const [saving, setSaving] = useState(false);

  // New message state (with tabs)
  const [newTab, setNewTab] = useState<Locale>("de");
  const [newDe, setNewDe] = useState("");
  const [newEn, setNewEn] = useState("");
  const [newFr, setNewFr] = useState("");
  const [translatingNew, setTranslatingNew] = useState<"idle" | "en" | "fr" | "both">("idle");

  // Edit state (with tabs)
  const [editId, setEditId] = useState<string | null>(null);
  const [editTab, setEditTab] = useState<Locale>("de");
  const [editDe, setEditDe] = useState("");
  const [editEn, setEditEn] = useState("");
  const [editFr, setEditFr] = useState("");
  const [translatingEdit, setTranslatingEdit] = useState<"idle" | "en" | "fr" | "both">("idle");

  async function translateMessage(text: string, targetLocale: "en" | "fr"): Promise<string> {
    const res = await fetch("/api/translate-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: text,
        targetLocale,
      }),
    });
    if (!res.ok) throw new Error("Translation failed");
    const { translated } = await res.json();
    return translated.name || text;
  }

  async function handleTranslateNew() {
    if (!newDe.trim()) return;
    setTranslatingNew("both");
    try {
      const [en, fr] = await Promise.all([
        translateMessage(newDe, "en"),
        translateMessage(newDe, "fr"),
      ]);
      setNewEn(en);
      setNewFr(fr);
    } catch {
      // silent
    }
    setTranslatingNew("idle");
  }

  async function handleTranslateEdit() {
    if (!editDe.trim()) return;
    setTranslatingEdit("both");
    try {
      const [en, fr] = await Promise.all([
        translateMessage(editDe, "en"),
        translateMessage(editDe, "fr"),
      ]);
      setEditEn(en);
      setEditFr(fr);
    } catch {
      // silent
    }
    setTranslatingEdit("idle");
  }

  async function handleCreate() {
    if (!newDe.trim()) return;
    setSaving(true);
    const result = await createNews(newDe.trim(), newEn.trim() || undefined, newFr.trim() || undefined);
    if (result.success) {
      setNewDe("");
      setNewEn("");
      setNewFr("");
      setNewTab("de");
      router.refresh();
      setItems((prev) => [
        {
          id: crypto.randomUUID(),
          message: newDe.trim(),
          message_en: newEn.trim() || null,
          message_fr: newFr.trim() || null,
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setSaving(false);
  }

  function startEdit(item: NewsItem) {
    setEditId(item.id);
    setEditTab("de");
    setEditDe(item.message);
    setEditEn(item.message_en || "");
    setEditFr(item.message_fr || "");
  }

  async function handleSaveEdit(id: string) {
    if (!editDe.trim()) return;
    setSaving(true);
    const result = await updateNews(id, editDe.trim(), editEn.trim() || undefined, editFr.trim() || undefined);
    if (result.success) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, message: editDe.trim(), message_en: editEn.trim() || null, message_fr: editFr.trim() || null }
            : i
        )
      );
      setEditId(null);
    }
    setSaving(false);
  }

  async function handleToggle(id: string, current: boolean) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_active: !current } : i))
    );
    await toggleNewsActive(id, !current);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("News-Eintrag wirklich löschen?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteNews(id);
    router.refresh();
  }

  const activeCount = items.filter((i) => i.is_active).length;

  return (
    <div className="space-y-4">
      {/* Add new */}
      <div className="rounded border border-swing-gray bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-swing-navy/60">
            Neue Nachricht
          </label>
          <TabBar
            active={newTab}
            onChange={setNewTab}
            hasEn={!!newEn}
            hasFr={!!newFr}
            onTranslate={handleTranslateNew}
            translating={translatingNew}
          />
        </div>
        <div className="flex gap-2">
          {newTab === "de" && (
            <input
              type="text"
              value={newDe}
              onChange={(e) => setNewDe(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="z.B. Neue Kollektion ab sofort verfügbar!"
              className="flex-1 rounded border border-swing-gray px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
            />
          )}
          {newTab === "en" && (
            <input
              type="text"
              value={newEn}
              onChange={(e) => setNewEn(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="English translation..."
              className="flex-1 rounded border border-swing-gray px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
            />
          )}
          {newTab === "fr" && (
            <input
              type="text"
              value={newFr}
              onChange={(e) => setNewFr(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Traduction française..."
              className="flex-1 rounded border border-swing-gray px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
            />
          )}
          <button
            onClick={handleCreate}
            disabled={saving || !newDe.trim()}
            className="flex items-center gap-1.5 rounded bg-swing-gold px-4 py-2 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50"
          >
            <Plus size={16} />
            Hinzufügen
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-swing-gray-dark/60">
        <span>{items.length} Einträge gesamt</span>
        <span className="text-swing-gray">|</span>
        <span className="text-emerald-600">{activeCount} aktiv</span>
        <span className="text-swing-gray">|</span>
        <span className="text-swing-gray-dark/40">{items.length - activeCount} ausgeblendet</span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="rounded border border-dashed border-swing-gray bg-white p-8 text-center text-sm text-swing-gray-dark/40">
            Noch keine News vorhanden. Füge oben die erste Nachricht hinzu.
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className={`group rounded border bg-white transition-all ${
              item.is_active
                ? "border-swing-gray"
                : "border-swing-gray/50 opacity-50"
            }`}
          >
            <div className="flex items-start gap-3 p-3">
              {/* Grip */}
              <div className="mt-0.5 cursor-grab text-swing-gray-dark/20">
                <GripVertical size={16} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                {editId === item.id ? (
                  <div className="space-y-2">
                    <TabBar
                      active={editTab}
                      onChange={setEditTab}
                      hasEn={!!editEn}
                      hasFr={!!editFr}
                      onTranslate={handleTranslateEdit}
                      translating={translatingEdit}
                    />
                    <div className="flex gap-2">
                      {editTab === "de" && (
                        <input
                          type="text"
                          value={editDe}
                          onChange={(e) => setEditDe(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(item.id);
                            if (e.key === "Escape") setEditId(null);
                          }}
                          className="flex-1 rounded border border-swing-gold px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-swing-gold"
                          autoFocus
                        />
                      )}
                      {editTab === "en" && (
                        <input
                          type="text"
                          value={editEn}
                          onChange={(e) => setEditEn(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(item.id);
                            if (e.key === "Escape") setEditId(null);
                          }}
                          placeholder="English translation..."
                          className="flex-1 rounded border border-swing-gold px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-swing-gold"
                          autoFocus
                        />
                      )}
                      {editTab === "fr" && (
                        <input
                          type="text"
                          value={editFr}
                          onChange={(e) => setEditFr(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(item.id);
                            if (e.key === "Escape") setEditId(null);
                          }}
                          placeholder="Traduction française..."
                          className="flex-1 rounded border border-swing-gold px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-swing-gold"
                          autoFocus
                        />
                      )}
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        disabled={saving}
                        className="flex items-center gap-1 rounded bg-swing-gold px-3 py-1 text-xs font-semibold text-swing-navy hover:bg-swing-gold-dark"
                      >
                        <Check size={12} />
                        Speichern
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="rounded px-2 py-1 text-xs text-swing-gray-dark/60 hover:text-swing-gray-dark"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p
                      className="cursor-pointer text-sm text-swing-gray-dark hover:text-swing-navy"
                      onClick={() => startEdit(item)}
                      title="Klicken zum Bearbeiten"
                    >
                      {item.message}
                    </p>
                    {/* Translation indicators */}
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-[10px] text-swing-gray-dark/30">
                        {new Date(item.created_at).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <span className="text-swing-gray-dark/15">|</span>
                      <span className={`text-[10px] font-medium ${item.message_en ? "text-emerald-500" : "text-swing-gray-dark/20"}`}>
                        EN {item.message_en ? "\u2713" : "\u2717"}
                      </span>
                      <span className={`text-[10px] font-medium ${item.message_fr ? "text-emerald-500" : "text-swing-gray-dark/20"}`}>
                        FR {item.message_fr ? "\u2713" : "\u2717"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggle(item.id, item.is_active)}
                  className={`rounded p-1.5 transition-colors ${
                    item.is_active
                      ? "text-emerald-500 hover:bg-emerald-50"
                      : "text-swing-gray-dark/30 hover:bg-gray-50"
                  }`}
                  title={item.is_active ? "Ausblenden" : "Einblenden"}
                >
                  {item.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded p-1.5 text-swing-gray-dark/20 transition-colors hover:bg-red-50 hover:text-red-500"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      {activeCount > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-swing-navy/60">
            Vorschau
          </label>
          <div className="overflow-hidden rounded border border-swing-navy/20 bg-swing-navy p-2">
            <div className="flex whitespace-nowrap" style={{ animation: "ticker 16s linear infinite" }}>
              <span className="text-[12px] font-medium tracking-wide text-white/80 sm:text-[13px]">
                {items
                  .filter((i) => i.is_active)
                  .map((i) => i.message)
                  .join(" \u00A0\u00A0\u2022\u00A0\u00A0 ")}
                {" \u00A0\u00A0\u2022\u00A0\u00A0 "}
                {items
                  .filter((i) => i.is_active)
                  .map((i) => i.message)
                  .join(" \u00A0\u00A0\u2022\u00A0\u00A0 ")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import {
  createNews,
  updateNews,
  toggleNewsActive,
  deleteNews,
} from "@/lib/actions/news";
import { useRouter } from "next/navigation";

interface NewsItem {
  id: string;
  message: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export default function NewsManager({
  initialNews,
}: {
  initialNews: NewsItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialNews);
  const [newMessage, setNewMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  async function handleCreate() {
    if (!newMessage.trim()) return;
    setSaving(true);
    const result = await createNews(newMessage.trim());
    if (result.success) {
      setNewMessage("");
      router.refresh();
      // Optimistic: we'll get fresh data on refresh, but add temporarily
      setItems((prev) => [
        { id: crypto.randomUUID(), message: newMessage.trim(), is_active: true, sort_order: 0, created_at: new Date().toISOString() },
        ...prev,
      ]);
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

  async function handleSaveEdit(id: string) {
    if (!editText.trim()) return;
    setSaving(true);
    const result = await updateNews(id, editText.trim());
    if (result.success) {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, message: editText.trim() } : i))
      );
      setEditId(null);
    }
    setSaving(false);
  }

  const activeCount = items.filter((i) => i.is_active).length;

  return (
    <div className="space-y-4">
      {/* Add new */}
      <div className="rounded border border-swing-gray bg-white p-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-swing-navy/60">
          Neue Nachricht
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="z.B. Neue Kollektion ab sofort verfügbar!"
            className="flex-1 rounded border border-swing-gray px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
          />
          <button
            onClick={handleCreate}
            disabled={saving || !newMessage.trim()}
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
            className={`group flex items-start gap-3 rounded border bg-white p-3 transition-all ${
              item.is_active
                ? "border-swing-gray"
                : "border-swing-gray/50 opacity-50"
            }`}
          >
            {/* Grip */}
            <div className="mt-0.5 cursor-grab text-swing-gray-dark/20">
              <GripVertical size={16} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {editId === item.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(item.id);
                      if (e.key === "Escape") setEditId(null);
                    }}
                    className="flex-1 rounded border border-swing-gold px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-swing-gold"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(item.id)}
                    disabled={saving}
                    className="rounded bg-swing-gold px-3 py-1 text-xs font-semibold text-swing-navy hover:bg-swing-gold-dark"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="rounded px-2 py-1 text-xs text-swing-gray-dark/60 hover:text-swing-gray-dark"
                  >
                    Abbrechen
                  </button>
                </div>
              ) : (
                <p
                  className="cursor-pointer text-sm text-swing-gray-dark hover:text-swing-navy"
                  onClick={() => {
                    setEditId(item.id);
                    setEditText(item.message);
                  }}
                  title="Klicken zum Bearbeiten"
                >
                  {item.message}
                </p>
              )}
              <p className="mt-1 text-[10px] text-swing-gray-dark/30">
                {new Date(item.created_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
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

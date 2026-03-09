"use client";

import { useState } from "react";
import AiInfoTooltip from "@/components/ui/AiInfoTooltip";
import {
  Upload,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Loader2,
  X,
  Package,
} from "lucide-react";
import { importStockFromCSV } from "@/lib/actions/stock";

interface StockItem {
  bezeichnung: string;
  product_id: string | null;
  product_name: string;
  size_label: string;
  size_id: string | null;
  color_name: string | null;
  color_id: string | null;
  count: number;
  current_stock: number | null;
  matched: boolean;
  color_matched: boolean;
}

interface ParseResult {
  items: StockItem[];
  summary: {
    total: number;
    matched: number;
    unmatched: number;
    csv_rows: number;
    filtered_items: number;
  };
}

export default function LagerImportClient() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<ParseResult["summary"] | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ updated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setError(null);
    setResult(null);
    setItems([]);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-stock-csv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error + (data.raw ? `\n\nAnfang:\n${data.raw}` : "") + (data.rawEnd ? `\n\n...Ende:\n${data.rawEnd}` : ""));
        return;
      }

      setItems(data.items);
      setSummary(data.summary);
    } catch {
      setError("Netzwerkfehler beim Hochladen");
    } finally {
      setParsing(false);
    }
  }

  async function handleConfirm() {
    const matched = items.filter((i) => i.matched);
    if (matched.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      const stockData = matched.map((item) => ({
        product_id: item.product_id!,
        product_name: item.product_name,
        size_label: item.size_label,
        color_name: item.color_name,
        count: item.count,
      }));

      const res = await importStockFromCSV(stockData);
      setResult({ updated: res.updated });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setItems([]);
    setSummary(null);
    setResult(null);
    setError(null);
  }

  const matchedItems = items.filter((i) => i.matched);
  const unmatchedItems = items.filter((i) => !i.matched);
  const totalStock = matchedItems.reduce((sum, i) => sum + i.count, 0);

  // Group matched items by product
  const grouped = new Map<string, StockItem[]>();
  for (const item of matchedItems) {
    const key = item.product_name;
    const arr = grouped.get(key) ?? [];
    arr.push(item);
    grouped.set(key, arr);
  }

  return (
    <div>
      {/* Upload Card */}
      <div className="glass-card mb-6 rounded p-4 sm:p-6">
        <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-swing-navy">
          WinLine Bestandsliste importieren
          <AiInfoTooltip
            action="Die hochgeladene CSV-Datei wird von Google Gemini analysiert. Die KI erkennt automatisch Artikelbezeichnungen und ordnet sie den Katalog-Produkten, Größen und Farbdesigns zu."
            costNote="Pro CSV-Analyse werden API-Tokens verbraucht, die Kosten verursachen können."
          />
        </h2>
        <p className="mb-4 text-sm text-swing-gray-dark/60">
          Laden Sie die CSV-Bestandsliste aus Mesonic WinLine hoch. Nur
          Artikel mit <code className="rounded bg-swing-gray-light px-1.5 py-0.5 text-xs font-mono">NL</code> oder{" "}
          <code className="rounded bg-swing-gray-light px-1.5 py-0.5 text-xs font-mono">NE</code> in
          der Artikelnummer werden berücksichtigt. Gemini ordnet die Artikel
          automatisch den Katalog-Produkten zu.
        </p>

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded border-2 border-dashed border-swing-gray px-6 py-8 text-sm text-swing-gray-dark/40 transition-all duration-200 hover:border-swing-gold hover:bg-swing-gold/5 hover:text-swing-navy">
          {parsing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Gemini analysiert die Bestandsliste...
            </>
          ) : (
            <>
              <FileSpreadsheet size={20} />
              CSV-Datei auswählen...
            </>
          )}
          <input
            type="file"
            accept=".csv,.txt,.tsv"
            className="hidden"
            onChange={handleFile}
            disabled={parsing}
          />
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span className="font-medium">Fehler</span>
          </div>
          <pre className="mt-2 max-h-[200px] overflow-auto whitespace-pre-wrap text-xs">{error}</pre>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-swing-navy">{summary.csv_rows}</p>
            <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">CSV-Zeilen</p>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-swing-navy">{summary.filtered_items}</p>
            <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">NL/NE Artikel</p>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{summary.matched}</p>
            <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">Zugeordnet</p>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{summary.unmatched}</p>
            <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">Nicht gefunden</p>
          </div>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="mb-6 flex items-center gap-2 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <Check size={16} />
          {result.updated} Lagerbestände erfolgreich aktualisiert ({totalStock} Einzelstücke).
        </div>
      )}

      {/* Matched Items */}
      {matchedItems.length > 0 && (
        <div className="glass-card mb-6 overflow-hidden rounded">
          <div className="flex flex-col gap-3 border-b border-swing-gray/30 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-swing-navy">
                Zugeordnete Artikel
              </h2>
              <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                {matchedItems.length} Positionen / {totalStock} Stk.
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="cursor-pointer rounded border border-swing-gray px-4 py-2 text-sm font-medium text-swing-gray-dark/50 transition-all duration-200 hover:bg-swing-gray-light"
              >
                Zurücksetzen
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving || !!result}
                className="flex cursor-pointer items-center gap-2 rounded bg-swing-gold px-4 py-2 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none sm:px-6"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Wird gespeichert...
                  </>
                ) : result ? (
                  <>
                    <Check size={14} />
                    Gespeichert
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Bestände aktualisieren
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="max-h-[600px] overflow-auto">
            {Array.from(grouped.entries()).map(([productName, productItems]) => (
              <div key={productName}>
                <div className="flex items-center gap-2 border-b border-swing-gray/20 bg-swing-gray-light/50 px-6 py-2">
                  <Package size={14} className="text-swing-navy/50" />
                  <span className="text-sm font-bold text-swing-navy">
                    {productName}
                  </span>
                  <span className="text-xs text-swing-gray-dark/40">
                    {productItems.reduce((s, i) => s + i.count, 0)} Stk. gesamt
                  </span>
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {productItems.map((item, i) => (
                      <tr key={i} className="hover:bg-swing-gray-light/30">
                        <td className="py-2.5 pl-12 pr-6">
                          <Check size={14} className="text-green-500" />
                        </td>
                        <td className="px-4 py-2.5 font-medium text-swing-navy">
                          {item.size_label}
                        </td>
                        <td className="px-4 py-2.5">
                          {item.color_name ? (
                            <span className={item.color_matched ? "text-swing-gray-dark" : "text-amber-600"}>
                              {item.color_name}
                              {!item.color_matched && (
                                <span className="ml-1 text-[10px]" title="Farbe nicht im Katalog">
                                  ?
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-swing-gray-dark/30">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-swing-navy">
                          {item.count}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs text-swing-gray-dark/40">
                          {item.current_stock !== null && (
                            <span>vorher: {item.current_stock}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[11px] text-swing-gray-dark/30 max-w-[200px] truncate">
                          {item.bezeichnung}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unmatched Items */}
      {unmatchedItems.length > 0 && (
        <div className="glass-card overflow-hidden rounded">
          <div className="flex items-center gap-2 border-b border-swing-gray/30 px-6 py-4">
            <AlertTriangle size={16} className="text-red-400" />
            <h2 className="text-base font-bold text-swing-navy">
              Nicht zugeordnet
            </h2>
            <span className="rounded bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
              {unmatchedItems.length}
            </span>
          </div>
          <div className="max-h-[300px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-swing-gray/30 bg-swing-gray-light/80 text-[11px] uppercase tracking-widest text-swing-gray-dark/40 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-2 text-left">Bezeichnung</th>
                  <th className="px-4 py-2 text-left">Erkanntes Produkt</th>
                  <th className="px-4 py-2 text-left">Größe</th>
                  <th className="px-4 py-2 text-left">Farbe</th>
                  <th className="px-4 py-2 text-right">Stk.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unmatchedItems.map((item, i) => (
                  <tr key={i} className="bg-red-50/30">
                    <td className="px-6 py-2.5 text-xs text-swing-gray-dark/60">
                      {item.bezeichnung}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-red-600">
                      {item.product_name}
                    </td>
                    <td className="px-4 py-2.5 text-xs">{item.size_label}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {item.color_name ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs font-bold">
                      {item.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-swing-gray/20 px-6 py-3">
            <p className="text-xs text-swing-gray-dark/40">
              Diese Artikel konnten keinem Katalog-Produkt zugeordnet werden. Prüfen Sie ob das Produkt/die Größe im Katalog angelegt ist.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

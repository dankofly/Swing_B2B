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
  HelpCircle,
  PackageX,
  Lock,
} from "lucide-react";
import { importStockFromCSV } from "@/lib/actions/stock";
import { useDict } from "@/lib/i18n/context";

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
  match_basis?: string;
}

interface ReviewItem {
  bezeichnung: string;
  model_raw: string;
  design_raw: string | null;
  size_raw: string;
  stock_total: number;
  reason: string;
  portal_candidates: Array<{
    product_name: string;
    design: string | null;
    size: string;
  }>;
}

interface MissingItem {
  product_id: string;
  product_name: string;
  design: string | null;
  size: string;
}

interface IgnoredItem {
  bezeichnung: string;
  model_raw: string;
  design_raw: string | null;
  size_raw: string;
  stock_total: number;
  reason: string;
}

interface CreatedLockedItem {
  model: string;
  design: string | null;
  size: string;
  stock: number;
  product_id: string;
  reason: string;
}

interface Summary {
  total: number;
  matched: number;
  review_needed: number;
  missing_in_csv: number;
  ignored: number;
  created_locked: number;
  csv_rows: number;
  filtered_items: number;
  llm_fallback_used: boolean;
  llm_fallback_count: number;
}

export default function LagerImportClient() {
  const dict = useDict();
  const t = dict.stockImport;
  const [items, setItems] = useState<StockItem[]>([]);
  const [reviewNeeded, setReviewNeeded] = useState<ReviewItem[]>([]);
  const [missingInCsv, setMissingInCsv] = useState<MissingItem[]>([]);
  const [ignoredItems, setIgnoredItems] = useState<IgnoredItem[]>([]);
  const [createdLocked, setCreatedLocked] = useState<CreatedLockedItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ updated: number; zeroed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setError(null);
    setResult(null);
    setItems([]);
    setReviewNeeded([]);
    setMissingInCsv([]);
    setIgnoredItems([]);
    setCreatedLocked([]);
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
        const msg = data.error || `HTTP ${res.status}: ${res.statusText}`;
        setError(msg + (data.raw ? `\n\nAnfang:\n${data.raw}` : "") + (data.rawEnd ? `\n\n...Ende:\n${data.rawEnd}` : ""));
        return;
      }

      setItems(data.items ?? []);
      setReviewNeeded(data.review_needed ?? []);
      setMissingInCsv(data.missing_in_csv ?? []);
      setIgnoredItems(data.ignored ?? []);
      setCreatedLocked(data.created_locked ?? []);
      setSummary(data.summary);
    } catch {
      setError(t.networkError);
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

      const res = await importStockFromCSV(stockData, { fullSync: true });
      setResult({ updated: res.updated, zeroed: res.zeroed });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setItems([]);
    setReviewNeeded([]);
    setMissingInCsv([]);
    setIgnoredItems([]);
    setCreatedLocked([]);
    setSummary(null);
    setResult(null);
    setError(null);
  }

  const matchedItems = items.filter((i) => i.matched);
  const totalStock = matchedItems.reduce((sum, i) => sum + i.count, 0);

  // Group matched items by product
  const grouped = new Map<string, StockItem[]>();
  for (const item of matchedItems) {
    const key = item.product_name;
    const arr = grouped.get(key) ?? [];
    arr.push(item);
    grouped.set(key, arr);
  }

  // Group missing items by product
  const missingGrouped = new Map<string, MissingItem[]>();
  for (const item of missingInCsv) {
    const arr = missingGrouped.get(item.product_name) ?? [];
    arr.push(item);
    missingGrouped.set(item.product_name, arr);
  }

  return (
    <div>
      {/* Upload Card */}
      <div className="glass-card mb-6 rounded p-4 sm:p-6">
        <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-swing-navy">
          {t.title}
          <AiInfoTooltip
            action={t.aiTooltipAction}
            costNote={t.aiTooltipCost}
          />
        </h2>
        <p className="mb-2 text-sm text-swing-gray-dark/60">
          {t.description}{" "}
          <code className="rounded bg-swing-gray-light px-1.5 py-0.5 text-xs font-mono">{t.nlTag}</code>{" / "}
          <code className="rounded bg-swing-gray-light px-1.5 py-0.5 text-xs font-mono">{t.neTag}</code>.
        </p>
        <p className="mb-4 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          {t.fullSyncNote}
        </p>

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded border-2 border-dashed border-swing-gray px-6 py-8 text-sm text-swing-gray-dark/40 transition-all duration-200 hover:border-swing-gold hover:bg-swing-gold/5 hover:text-swing-navy">
          {parsing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {t.csvProcessing}
            </>
          ) : (
            <>
              <FileSpreadsheet size={20} />
              {t.selectFile}
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
            <span className="font-medium">{t.error}</span>
          </div>
          <pre className="mt-2 max-h-[200px] overflow-auto whitespace-pre-wrap text-xs">{error}</pre>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <div className="rounded border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-swing-navy">{summary.csv_rows}</p>
            <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">{t.csvRows}</p>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-swing-navy">{summary.filtered_items}</p>
            <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">{t.nlNeItems}</p>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{summary.matched}</p>
            <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">{t.assigned}</p>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{summary.review_needed}</p>
            <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">{t.reviewNeeded}</p>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-purple-500">{summary.created_locked}</p>
            <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">{t.createdLocked}</p>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{summary.ignored}</p>
            <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">{t.notFound}</p>
          </div>
          <div className="rounded border border-gray-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{summary.missing_in_csv}</p>
            <p className="text-[11px] uppercase tracking-wider text-swing-gray-dark/40">{t.missingInCsv}</p>
          </div>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <Check size={16} />
            {t.stockUpdated.replace("{count}", String(result.updated)).replace("{pieces}", String(totalStock))}
          </div>
          {result.zeroed > 0 && (
            <div className="flex items-center gap-2 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <Package size={16} />
              {t.zeroedOut.replace("{count}", String(result.zeroed))}
            </div>
          )}
        </div>
      )}

      {/* Matched Items */}
      {matchedItems.length > 0 && (
        <div className="glass-card mb-6 overflow-hidden rounded">
          <div className="flex flex-col gap-3 border-b border-swing-gray/30 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-swing-navy">
                {t.assignedItems}
              </h2>
              <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                {matchedItems.length} {t.positions} / {totalStock} {t.pieces}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="cursor-pointer rounded border border-swing-gray px-4 py-2 text-sm font-medium text-swing-gray-dark/50 transition-all duration-200 hover:bg-swing-gray-light"
              >
                {t.reset}
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving || !!result}
                className="flex cursor-pointer items-center gap-2 rounded bg-swing-gold px-4 py-2 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none sm:px-6"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {t.saving}
                  </>
                ) : result ? (
                  <>
                    <Check size={14} />
                    {t.savedLabel}
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    {t.updateStock}
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
                    {productItems.reduce((s, i) => s + i.count, 0)} {t.totalPieces}
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
                                <span className="ml-1 text-[10px]" title={t.colorNotInCatalog}>
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
                            <span>{t.before}: {item.current_stock}</span>
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

      {/* Review Needed */}
      {reviewNeeded.length > 0 && (
        <div className="glass-card mb-6 overflow-hidden rounded">
          <div className="flex items-center gap-2 border-b border-swing-gray/30 px-6 py-4">
            <HelpCircle size={16} className="text-amber-500" />
            <h2 className="text-base font-bold text-swing-navy">
              {t.reviewNeededTitle}
            </h2>
            <span className="rounded bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              {reviewNeeded.length}
            </span>
          </div>
          <div className="max-h-[400px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-swing-gray/30 bg-swing-gray-light/80 text-[11px] uppercase tracking-widest text-swing-gray-dark/40 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-2 text-left">{t.designation}</th>
                  <th className="px-4 py-2 text-left">{t.recognizedProduct}</th>
                  <th className="px-4 py-2 text-left">{t.size}</th>
                  <th className="px-4 py-2 text-left">{t.color}</th>
                  <th className="px-4 py-2 text-right">{t.pcs}</th>
                  <th className="px-4 py-2 text-left">{t.reviewReason}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviewNeeded.map((item, i) => (
                  <tr key={i} className="bg-amber-50/30">
                    <td className="px-6 py-2.5 text-xs text-swing-gray-dark/60">
                      {item.bezeichnung}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-amber-700">
                      {item.model_raw}
                    </td>
                    <td className="px-4 py-2.5 text-xs">{item.size_raw}</td>
                    <td className="px-4 py-2.5 text-xs">{item.design_raw ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right text-xs font-bold">{item.stock_total}</td>
                    <td className="px-4 py-2.5 text-xs text-amber-600">
                      {item.reason}
                      {item.portal_candidates.length > 0 && (
                        <span className="ml-1 text-swing-gray-dark/40">
                          ({item.portal_candidates.map((c) => c.design ?? c.product_name).join(", ")})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-swing-gray/20 px-6 py-3">
            <p className="text-xs text-swing-gray-dark/40">
              {t.reviewHint}
            </p>
          </div>
        </div>
      )}

      {/* Created Locked */}
      {createdLocked.length > 0 && (
        <div className="glass-card mb-6 overflow-hidden rounded">
          <div className="flex items-center gap-2 border-b border-swing-gray/30 px-6 py-4">
            <Lock size={16} className="text-purple-500" />
            <h2 className="text-base font-bold text-swing-navy">
              {t.createdLockedTitle}
            </h2>
            <span className="rounded bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
              {createdLocked.length}
            </span>
          </div>
          <div className="max-h-75 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-swing-gray/30 bg-swing-gray-light/80 text-[11px] uppercase tracking-widest text-swing-gray-dark/40 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-2 text-left">{t.recognizedProduct}</th>
                  <th className="px-4 py-2 text-left">{t.size}</th>
                  <th className="px-4 py-2 text-left">{t.color}</th>
                  <th className="px-4 py-2 text-right">{t.pcs}</th>
                  <th className="px-4 py-2 text-center">{t.status || "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {createdLocked.map((item, i) => (
                  <tr key={i} className="bg-purple-50/30">
                    <td className="px-6 py-2.5 text-xs font-medium text-purple-700">
                      {item.model}
                    </td>
                    <td className="px-4 py-2.5 text-xs">{item.size}</td>
                    <td className="px-4 py-2.5 text-xs">{item.design ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right text-xs font-bold">{item.stock}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                        <Lock size={10} />
                        {t.locked}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-swing-gray/20 px-6 py-3">
            <p className="text-xs text-swing-gray-dark/40">
              {t.createdLockedHint}
            </p>
          </div>
        </div>
      )}

      {/* Ignored (not in portal) */}
      {ignoredItems.length > 0 && (
        <div className="glass-card mb-6 overflow-hidden rounded">
          <div className="flex items-center gap-2 border-b border-swing-gray/30 px-6 py-4">
            <AlertTriangle size={16} className="text-red-400" />
            <h2 className="text-base font-bold text-swing-navy">
              {t.unassigned}
            </h2>
            <span className="rounded bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
              {ignoredItems.length}
            </span>
          </div>
          <div className="max-h-[300px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-swing-gray/30 bg-swing-gray-light/80 text-[11px] uppercase tracking-widest text-swing-gray-dark/40 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-2 text-left">{t.designation}</th>
                  <th className="px-4 py-2 text-left">{t.recognizedProduct}</th>
                  <th className="px-4 py-2 text-left">{t.size}</th>
                  <th className="px-4 py-2 text-left">{t.color}</th>
                  <th className="px-4 py-2 text-right">{t.pcs}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ignoredItems.map((item, i) => (
                  <tr key={i} className="bg-red-50/30">
                    <td className="px-6 py-2.5 text-xs text-swing-gray-dark/60">
                      {item.bezeichnung}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-red-600">
                      {item.model_raw}
                    </td>
                    <td className="px-4 py-2.5 text-xs">{item.size_raw}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {item.design_raw ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs font-bold">
                      {item.stock_total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-swing-gray/20 px-6 py-3">
            <p className="text-xs text-swing-gray-dark/40">
              {t.unassignedHint}
            </p>
          </div>
        </div>
      )}

      {/* Missing in CSV */}
      {missingInCsv.length > 0 && (
        <div className="glass-card overflow-hidden rounded">
          <div className="flex items-center gap-2 border-b border-swing-gray/30 px-6 py-4">
            <PackageX size={16} className="text-blue-400" />
            <h2 className="text-base font-bold text-swing-navy">
              {t.missingInCsvTitle}
            </h2>
            <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
              {missingInCsv.length}
            </span>
          </div>
          <div className="max-h-[300px] overflow-auto">
            {Array.from(missingGrouped.entries()).map(([productName, productItems]) => (
              <div key={productName}>
                <div className="flex items-center gap-2 border-b border-swing-gray/20 bg-blue-50/30 px-6 py-2">
                  <Package size={12} className="text-blue-400" />
                  <span className="text-xs font-bold text-swing-navy">{productName}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 px-6 py-2">
                  {productItems.map((item, i) => (
                    <span key={i} className="rounded bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                      {item.size}{item.design ? ` / ${item.design}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-swing-gray/20 px-6 py-3">
            <p className="text-xs text-swing-gray-dark/40">
              {t.missingInCsvHint}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

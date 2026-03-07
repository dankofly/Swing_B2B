"use client";

import { useState } from "react";
import { uploadPriceList, deletePriceUpload } from "@/lib/actions/price-uploads";
import { confirmPrices, type ParsedPriceItem } from "@/lib/actions/prices";
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  ExternalLink,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

interface PriceUpload {
  id: string;
  file_url: string;
  file_name: string | null;
  file_type: string;
  category: string;
  status: string;
  created_at: string;
}

interface CategoryConfig {
  key: string;
  label: string;
}

interface ParseResult {
  items: ParsedPriceItem[];
  summary: { total: number; matched: number; unmatched: number };
}

function eur(value: number) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

export default function PriceListSection({
  companyId,
  uploads: initialUploads,
  categories,
}: {
  companyId: string;
  uploads: PriceUpload[];
  categories: CategoryConfig[];
}) {
  const [uploads, setUploads] = useState(initialUploads);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parsing state
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [parseCategory, setParseCategory] = useState<string | null>(null);
  const [discounts, setDiscounts] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [savedInfo, setSavedInfo] = useState<{
    savedCount: number;
    productCount: number;
  } | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, category: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCategory(category);
    setError(null);
    setParseResult(null);
    setSavedInfo(null);
    setParseCategory(null);

    // Step 1: Upload file to storage + save to price_uploads
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadPriceList(companyId, formData, category);
    if (!result.success) {
      setError(result.error || "Upload fehlgeschlagen");
      setUploadingCategory(null);
      e.target.value = "";
      return;
    }

    // Step 2: If PDF, trigger Gemini parsing
    const ext = file.name.split(".").pop()?.toLowerCase();
    let didParse = false;

    if (ext === "pdf") {
      setParsing(true);
      setParseCategory(category);

      try {
        const parseFormData = new FormData();
        parseFormData.append("file", file);
        parseFormData.append("company_id", companyId);

        const res = await fetch("/api/parse-pricelist", {
          method: "POST",
          body: parseFormData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Fehler beim Parsen der Preisliste");
        } else {
          setParseResult(data);
          setDiscounts({});
          didParse = true;
        }
      } catch {
        setError("Netzwerkfehler beim Parsen");
      } finally {
        setParsing(false);
      }
    }

    setUploadingCategory(null);
    e.target.value = "";

    // If parsing produced results, show preview; otherwise reload to update uploads list
    if (!didParse) {
      window.location.reload();
    }
  }

  async function handleConfirm() {
    if (!parseResult) return;

    setSaving(true);
    setError(null);

    try {
      const itemsWithDiscount = parseResult.items.map((item, i) => ({
        ...item,
        discount: discounts[i] ?? 0,
        ek_netto: item.ek_netto * (1 - (discounts[i] ?? 0) / 100),
      }));
      const info = await confirmPrices(companyId, itemsWithDiscount);
      setSavedInfo(info);
      setParseResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  function handleCancelParse() {
    setParseResult(null);
    setParseCategory(null);
    setDiscounts({});
  }

  async function handleDelete(id: string) {
    const result = await deletePriceUpload(id, companyId);
    if (result.success) {
      setUploads((prev) => prev.filter((u) => u.id !== id));
    }
  }

  function renderUploadRow(upload: PriceUpload) {
    return (
      <div
        key={upload.id}
        className="flex items-center justify-between rounded bg-gray-50 px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <FileText size={14} className="shrink-0 text-red-500" />
          <div>
            <p className="text-xs font-medium text-swing-navy">
              {upload.file_name || `${upload.file_type.toUpperCase()} Preisliste`}
            </p>
            <p className="text-[10px] text-swing-gray-dark/40">
              {new Date(upload.created_at).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={upload.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1.5 text-swing-navy/40 transition-colors hover:bg-gray-200 hover:text-swing-navy"
          >
            <ExternalLink size={13} />
          </a>
          <button
            onClick={() => handleDelete(upload.id)}
            className="cursor-pointer rounded p-1.5 text-swing-navy/40 transition-colors hover:bg-red-100 hover:text-red-600"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  // If we have a parse result, show the preview overlay
  if (parseResult && !savedInfo) {
    return (
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-swing-navy/50">
          <FileText size={14} />
          Preise-Vorschau
          {parseCategory && (
            <span className="rounded bg-swing-navy/10 px-1.5 py-0.5 text-[10px] font-semibold text-swing-navy/60">
              {categories.find((c) => c.key === parseCategory)?.label}
            </span>
          )}
        </h3>

        {error && (
          <div className="mb-3 flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-3 flex gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-700">
            <Check size={12} />
            {parseResult.summary.matched} zugeordnet
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <X size={12} />
            {parseResult.summary.unmatched} nicht gefunden
          </span>
        </div>

        <div className="max-h-100 overflow-auto rounded border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 border-b bg-gray-50 text-[10px] uppercase tracking-wider text-swing-gray-dark/50">
              <tr>
                <th className="px-2 py-2"></th>
                <th className="px-2 py-2">Modell</th>
                <th className="px-2 py-2 text-right">UVP</th>
                <th className="px-2 py-2 text-right">EK netto</th>
                <th className="px-2 py-2 text-right">Rabatt</th>
                <th className="px-2 py-2 text-right">Endpreis</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {parseResult.items.map((item, i) => (
                <tr
                  key={i}
                  className={item.status === "unmatched" ? "bg-red-50/50" : ""}
                >
                  <td className="px-2 py-1.5">
                    {item.status === "matched" ? (
                      <Check size={12} className="text-green-600" />
                    ) : (
                      <X size={12} className="text-red-500" />
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="font-medium text-swing-navy">
                      {item.modell_pdf}
                    </div>
                    {item.product_name && item.product_name !== item.modell_pdf && (
                      <div className="text-[10px] text-swing-gray-dark/40">
                        {item.product_name} ({item.product_sizes.length} SKUs)
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right text-swing-gray-dark/60">
                    {eur(item.uvp_brutto)}
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium text-swing-navy">
                    {eur(item.ek_netto)}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <div className="inline-flex items-center gap-0.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={discounts[i] ?? 0}
                        onChange={(e) =>
                          setDiscounts((prev) => ({
                            ...prev,
                            [i]: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                          }))
                        }
                        className="w-12 rounded border border-gray-300 px-1 py-0.5 text-right text-[11px] focus:border-swing-gold focus:outline-none"
                      />
                      <span className="text-[10px] text-swing-gray-dark/50">%</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium text-swing-navy">
                    {eur(item.ek_netto * (1 - (discounts[i] ?? 0) / 100))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={handleCancelParse}
            className="cursor-pointer rounded border border-gray-300 px-3 py-1.5 text-xs text-swing-gray-dark hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || parseResult.summary.matched === 0}
            className="flex cursor-pointer items-center gap-1.5 rounded bg-swing-gold px-3 py-1.5 text-xs font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Speichert...
              </>
            ) : (
              <>
                <Check size={12} />
                {parseResult.summary.matched} Preise übernehmen
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-xs font-medium text-red-600">{error}</p>
      )}

      {/* Success message after saving prices */}
      {savedInfo && (
        <div className="mb-3 flex items-start gap-2 rounded border border-green-200 bg-green-50 p-3">
          <Check size={14} className="mt-0.5 shrink-0 text-green-600" />
          <div>
            <p className="text-xs font-semibold text-green-800">
              Preise gespeichert
            </p>
            <p className="text-[11px] text-green-700">
              {savedInfo.savedCount} Preise für {savedInfo.productCount} Produkte übernommen.
            </p>
          </div>
        </div>
      )}

      {/* Parsing indicator */}
      {parsing && (
        <div className="mb-3 flex items-center gap-2 rounded border border-swing-gold/30 bg-swing-gold/10 p-3">
          <Loader2 size={14} className="animate-spin text-swing-navy" />
          <p className="text-xs font-medium text-swing-navy">
            Gemini analysiert die Preisliste...
          </p>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="text-sm text-swing-gray-dark/40">
          Keine Produktkategorien ausgewählt
        </p>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const catUploads = uploads.filter((u) => u.category === cat.key);
            const isUploading = uploadingCategory === cat.key;

            return (
              <div key={cat.key}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-swing-navy/70">
                    {cat.label}
                  </span>
                  <label
                    className={`flex cursor-pointer items-center gap-1.5 rounded bg-swing-gold px-2.5 py-1 text-[11px] font-semibold text-swing-navy transition-colors hover:bg-swing-gold-dark ${isUploading ? "opacity-50" : ""}`}
                  >
                    {isUploading ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Upload size={11} />
                    )}
                    {isUploading ? "Lädt..." : "Hochladen"}
                    <input
                      type="file"
                      accept=".pdf,.csv"
                      onChange={(e) => handleUpload(e, cat.key)}
                      disabled={isUploading || parsing}
                      className="hidden"
                    />
                  </label>
                </div>

                {catUploads.length === 0 ? (
                  <p className="text-xs text-swing-gray-dark/30">
                    Keine Preisliste
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {catUploads.map(renderUploadRow)}
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

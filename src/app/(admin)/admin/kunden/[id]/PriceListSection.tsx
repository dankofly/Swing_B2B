"use client";

import { useState } from "react";
import AiInfoTooltip from "@/components/ui/AiInfoTooltip";
import { uploadPriceList, deletePriceUpload } from "@/lib/actions/price-uploads";
import { confirmPrices, type ParsedPriceItem } from "@/lib/actions/prices";
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";

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

export default function PriceListSection({
  companyId,
  uploads: initialUploads,
  categories,
}: {
  companyId: string;
  uploads: PriceUpload[];
  categories: CategoryConfig[];
}) {
  const dict = useDict();
  const locale = useLocale();
  const dl = getDateLocale(locale);
  const tp = dict.admin.priceLists;

  function eur(value: number) {
    return value.toLocaleString(dl, { style: "currency", currency: "EUR" });
  }

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
      setError(result.error || tp.uploadFailed);
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
          setError(data.error || tp.parseError);
        } else {
          setParseResult(data);
          setDiscounts({});
          didParse = true;
        }
      } catch {
        setError(tp.networkError);
      } finally {
        setParsing(false);
      }
    }

    setUploadingCategory(null);
    e.target.value = "";

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
      setError(err instanceof Error ? err.message : tp.saveError);
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

  // If we have a parse result, show the preview overlay
  if (parseResult && !savedInfo) {
    return (
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-swing-navy/50">
          <FileText size={14} />
          {tp.pricePreview}
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
            {parseResult.summary.matched} {tp.matched}
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <X size={12} />
            {parseResult.summary.unmatched} {tp.notFound}
          </span>
        </div>

        <div className="max-h-100 overflow-auto rounded border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 border-b bg-gray-50 text-[10px] uppercase tracking-wider text-swing-gray-dark/50">
              <tr>
                <th className="px-2 py-2"></th>
                <th className="px-2 py-2">{tp.modelPdf}</th>
                <th className="px-2 py-2 text-right">{tp.uvpGross}</th>
                <th className="px-2 py-2 text-right">{tp.dealerNet}</th>
                <th className="px-2 py-2 text-right">{tp.discount}</th>
                <th className="px-2 py-2 text-right">{tp.finalPrice}</th>
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
            {dict.common.buttons.cancel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || parseResult.summary.matched === 0}
            className="flex cursor-pointer items-center gap-1.5 rounded bg-swing-gold px-3 py-1.5 text-xs font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                {dict.common.buttons.loading}
              </>
            ) : (
              <>
                <Check size={12} />
                {tp.applyCount.replace("{count}", String(parseResult.summary.matched))}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-swing-navy/30">Upload + KI-Zuordnung</span>
        <AiInfoTooltip
          action="Beim Upload einer PDF-Preisliste wird diese von Google Gemini analysiert. Die KI erkennt automatisch Modelle, UVP und Händler-EK und ordnet sie den Katalog-Produkten zu."
          costNote="Pro PDF-Upload werden API-Tokens verbraucht, die Kosten verursachen können."
        />
      </div>
      {error && (
        <p className="mb-3 text-xs font-medium text-red-600">{error}</p>
      )}

      {/* Success message after saving prices */}
      {savedInfo && (
        <div className="mb-3 flex items-start gap-2 rounded border border-green-200 bg-green-50 p-3">
          <Check size={14} className="mt-0.5 shrink-0 text-green-600" />
          <div>
            <p className="text-xs font-semibold text-green-800">
              {tp.pricesSaved}
            </p>
            <p className="text-[11px] text-green-700">
              {tp.pricesSavedCount
                .replace("{saved}", String(savedInfo.savedCount))
                .replace("{products}", String(savedInfo.productCount))}
            </p>
          </div>
        </div>
      )}

      {/* Parsing indicator */}
      {parsing && (
        <div className="mb-3 flex items-center gap-2 rounded border border-swing-gold/30 bg-swing-gold/10 p-3">
          <Loader2 size={14} className="animate-spin text-swing-navy" />
          <p className="text-xs font-medium text-swing-navy">
            {tp.geminiAnalyzing}
          </p>
        </div>
      )}

      <div className="space-y-2.5">
        {categories.map((cat) => {
          const catUploads = uploads.filter((u) => u.category === cat.key);
          const latestUpload = catUploads[0]; // most recent
          const isUploading = uploadingCategory === cat.key;

          return (
            <div key={cat.key}>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">
                {cat.label}
              </p>

              {latestUpload ? (
                <div className="flex items-center gap-1.5">
                  {/* View button - full width */}
                  <a
                    href={latestUpload.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center gap-2 rounded bg-swing-navy/5 px-3 py-2 text-xs text-swing-navy transition-colors hover:bg-swing-navy/10"
                  >
                    <Eye size={13} className="shrink-0 text-swing-navy/40" />
                    <span className="flex-1 truncate">
                      {latestUpload.file_name || "Preisliste.pdf"}
                    </span>
                    <span className="shrink-0 text-[10px] text-swing-navy/30">
                      {new Date(latestUpload.created_at).toLocaleDateString(dl, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </a>

                  {/* Replace upload */}
                  <label
                    className={`flex shrink-0 cursor-pointer items-center gap-1 rounded bg-swing-gold/15 px-2 py-2 text-[10px] font-semibold text-swing-navy transition-colors hover:bg-swing-gold/30 ${isUploading ? "opacity-50" : ""}`}
                  >
                    {isUploading ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Upload size={11} />
                    )}
                    <input
                      type="file"
                      accept=".pdf,.csv"
                      onChange={(e) => handleUpload(e, cat.key)}
                      disabled={isUploading || parsing}
                      className="hidden"
                    />
                  </label>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(latestUpload.id)}
                    className="shrink-0 cursor-pointer rounded p-2 text-swing-navy/20 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-swing-navy/15 px-3 py-2.5 text-xs text-swing-navy/40 transition-colors hover:border-swing-gold hover:bg-swing-gold/5 hover:text-swing-navy/60 ${isUploading ? "opacity-50" : ""}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      {tp.uploading}
                    </>
                  ) : (
                    <>
                      <Upload size={13} />
                      {tp.uploadPdf}
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.csv"
                    onChange={(e) => handleUpload(e, cat.key)}
                    disabled={isUploading || parsing}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import AiInfoTooltip from "@/components/ui/AiInfoTooltip";
import { uploadPriceList, deleteAllCategoryUploads } from "@/lib/actions/price-uploads";
import { confirmPrices, type MatchedPriceItem } from "@/lib/actions/prices";
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  Check,
  X,
  Eye,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";
import { extractPdfText } from "@/lib/pdf-extract";

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

// ── Step 1: Gemini extraction output ──
interface ExtractedItem {
  product: string;
  size: string;
  uvp_gross: number | null;
  dealer_net: number | null;
}

// ── Portal product from API (for client-side matching) ──
interface PortalProduct {
  product_size_id: string;
  product_id: string;
  model: string;
  size: string;
  sku: string | null;
}

// ── Step 2: Matched item after JS matching ──
interface MatchedItem {
  product_size_id: string;
  product_id: string;
  portal_model: string;
  portal_size: string;
  sku: string | null;
  uvp_incl_vat: number | null;
  ek_netto: number | null;
  pdf_product_raw: string;
  pdf_size_raw: string;
}

interface UnmatchedItem {
  product: string;
  size: string;
  uvp_gross: number | null;
  dealer_net: number | null;
}

interface ParseResult {
  matched: MatchedItem[];
  unmatched: UnmatchedItem[];
  summary: {
    total_extracted: number;
    matched: number;
    unmatched: number;
  };
}

// ── Normalize strings for matching ──
function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[-\u2013\u2014]/g, "-")
    .replace(/['']/g, "'");
}

// ── Match extracted items against portal products ──
function matchExtractedToPortal(
  extracted: ExtractedItem[],
  portalProducts: PortalProduct[]
): ParseResult {
  const matched: MatchedItem[] = [];
  const unmatched: UnmatchedItem[] = [];
  const matchedSizeIds = new Set<string>();

  for (const item of extracted) {
    const normProduct = normalize(item.product);
    const normSize = normalize(item.size);

    // 1. Exact normalized match
    const exactMatch = portalProducts.find(
      (pp) =>
        !matchedSizeIds.has(pp.product_size_id) &&
        normalize(pp.model) === normProduct &&
        normalize(pp.size) === normSize
    );

    if (exactMatch) {
      matched.push({
        product_size_id: exactMatch.product_size_id,
        product_id: exactMatch.product_id,
        portal_model: exactMatch.model,
        portal_size: exactMatch.size,
        sku: exactMatch.sku,
        uvp_incl_vat: item.uvp_gross,
        ek_netto: item.dealer_net,
        pdf_product_raw: item.product,
        pdf_size_raw: item.size,
      });
      matchedSizeIds.add(exactMatch.product_size_id);
      continue;
    }

    // 2. Fuzzy: one model name contains the other, sizes must match exactly
    const fuzzyMatch = portalProducts.find((pp) => {
      if (matchedSizeIds.has(pp.product_size_id)) return false;
      const normModel = normalize(pp.model);
      const normPPSize = normalize(pp.size);
      return (
        (normModel.includes(normProduct) || normProduct.includes(normModel)) &&
        normPPSize === normSize
      );
    });

    if (fuzzyMatch) {
      matched.push({
        product_size_id: fuzzyMatch.product_size_id,
        product_id: fuzzyMatch.product_id,
        portal_model: fuzzyMatch.model,
        portal_size: fuzzyMatch.size,
        sku: fuzzyMatch.sku,
        uvp_incl_vat: item.uvp_gross,
        ek_netto: item.dealer_net,
        pdf_product_raw: item.product,
        pdf_size_raw: item.size,
      });
      matchedSizeIds.add(fuzzyMatch.product_size_id);
      continue;
    }

    unmatched.push(item);
  }

  return {
    matched,
    unmatched,
    summary: {
      total_extracted: extracted.length,
      matched: matched.length,
      unmatched: unmatched.length,
    },
  };
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

  const [uploads, setUploads] = useState(initialUploads);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parsing state
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [parseCategory, setParseCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedInfo, setSavedInfo] = useState<{
    savedCount: number;
    productCount: number;
  } | null>(null);

  // Editable prices: keyed by product_size_id
  const [editedPrices, setEditedPrices] = useState<
    Record<string, { uvp: number | null; ek: number | null }>
  >({});

  // Collapsed sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    matched: true,
    unmatched: false,
  });

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function getPrice(item: MatchedItem) {
    const edited = editedPrices[item.product_size_id];
    return {
      uvp: edited?.uvp ?? item.uvp_incl_vat,
      ek: edited?.ek ?? item.ek_netto,
    };
  }

  function updatePrice(sizeId: string, field: "uvp" | "ek", value: string) {
    const num = parseFloat(value);
    setEditedPrices((prev) => ({
      ...prev,
      [sizeId]: {
        uvp: prev[sizeId]?.uvp ?? null,
        ek: prev[sizeId]?.ek ?? null,
        [field]: isNaN(num) ? null : num,
      },
    }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, category: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCategory(category);
    setError(null);
    setParseResult(null);
    setSavedInfo(null);
    setParseCategory(null);

    // Upload file to storage
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadPriceList(companyId, formData, category);
    if (!result.success) {
      setError(result.error || tp.uploadFailed);
      setUploadingCategory(null);
      e.target.value = "";
      return;
    }

    // If PDF, extract text and parse with Gemini
    const ext = file.name.split(".").pop()?.toLowerCase();
    let didParse = false;

    if (ext === "pdf") {
      setParsing(true);
      setParseCategory(category);

      try {
        // Extract PDF text in the browser
        let pdfText: string;
        try {
          pdfText = await extractPdfText(file);
        } catch (extractErr) {
          setError(`PDF konnte nicht gelesen werden: ${extractErr instanceof Error ? extractErr.message : "Unbekannter Fehler"}`);
          setParsing(false);
          setUploadingCategory(null);
          e.target.value = "";
          return;
        }

        if (!pdfText || pdfText.trim().length < 50) {
          setError("Das PDF enthält keinen extrahierbaren Text. Möglicherweise ist es ein gescanntes Dokument.");
          setParsing(false);
          setUploadingCategory(null);
          e.target.value = "";
          return;
        }

        // Get extraction prompt + portal products from server
        const prepRes = await fetch("/api/parse-pricelist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_id: companyId, pdf_text: pdfText }),
        });

        let prepData;
        try {
          prepData = await prepRes.json();
        } catch {
          setError(`Server-Fehler (${prepRes.status}): Antwort konnte nicht gelesen werden`);
          setParsing(false);
          setUploadingCategory(null);
          e.target.value = "";
          return;
        }

        if (!prepRes.ok) {
          setError(`Fehler ${prepRes.status}: ${prepData.error}`);
          setParsing(false);
          setUploadingCategory(null);
          e.target.value = "";
          return;
        }

        // Call Gemini directly from browser (extraction only, small output)
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${prepData.gemini_key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prepData.prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                maxOutputTokens: 16384,
              },
            }),
          }
        );

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          setError(`Gemini-Fehler (${geminiRes.status}): ${errText.slice(0, 200)}`);
          console.error("[PriceListSection] Gemini error:", errText);
          setParsing(false);
          setUploadingCategory(null);
          e.target.value = "";
          return;
        }

        const geminiData = await geminiRes.json();
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!responseText) {
          const reason = geminiData.candidates?.[0]?.finishReason
            || geminiData.promptFeedback?.blockReason
            || JSON.stringify(geminiData).slice(0, 300);
          setError("Gemini hat keine Antwort geliefert: " + reason);
          setParsing(false);
          setUploadingCategory(null);
          e.target.value = "";
          return;
        }

        // Parse Gemini JSON response (simple flat array)
        console.log("[PriceListSection] Gemini extraction response (first 500):", responseText.slice(0, 500));
        console.log("[PriceListSection] Response length:", responseText.length);

        let extracted: ExtractedItem[];
        try {
          const parsed = JSON.parse(responseText);
          // Handle both bare array and { products: [...] } wrapper
          extracted = Array.isArray(parsed) ? parsed : (parsed.products ?? parsed);
          if (!Array.isArray(extracted)) {
            throw new Error("Unexpected response format");
          }
        } catch {
          // Fallback: try to extract array from response
          const arrStart = responseText.indexOf("[");
          const arrEnd = responseText.lastIndexOf("]");
          if (arrStart !== -1 && arrEnd > arrStart) {
            try {
              extracted = JSON.parse(responseText.slice(arrStart, arrEnd + 1));
            } catch {
              setError("KI-Antwort konnte nicht gelesen werden. Bitte erneut versuchen.");
              setParsing(false);
              setUploadingCategory(null);
              e.target.value = "";
              return;
            }
          } else {
            setError("Kein gültiges JSON in der KI-Antwort.");
            setParsing(false);
            setUploadingCategory(null);
            e.target.value = "";
            return;
          }
        }

        console.log(`[PriceListSection] Extracted ${extracted.length} items from PDF`);

        // Step 2: Match against portal products (in JavaScript, no Gemini)
        const portalProducts: PortalProduct[] = prepData.portal_products;
        const matchResult = matchExtractedToPortal(extracted, portalProducts);

        console.log(`[PriceListSection] Matched: ${matchResult.summary.matched}, Unmatched: ${matchResult.summary.unmatched}`);

        setParseResult(matchResult);
        setEditedPrices({});
        didParse = true;
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
      const items: MatchedPriceItem[] = parseResult.matched.map((item) => {
        const prices = getPrice(item);
        return {
          product_size_id: item.product_size_id,
          product_id: item.product_id,
          portal_model: item.portal_model,
          portal_size: item.portal_size,
          sku: item.sku,
          uvp_incl_vat: prices.uvp,
          ek_netto: prices.ek,
          pdf_model_raw: item.pdf_product_raw,
        };
      });

      const info = await confirmPrices(companyId, items);
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
    setEditedPrices({});
  }

  async function handleDelete(id: string, category: string) {
    if (!confirm("Preisliste und alle zugehörigen Kundenpreise wirklich löschen?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const result = await deleteAllCategoryUploads(companyId, category);
      if (result.success) {
        setUploads((prev) => prev.filter((u) => u.category !== category));
      } else {
        setError(result.error || "Löschen fehlgeschlagen");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
    } finally {
      setDeletingId(null);
    }
  }

  // Group matched items by model for display
  function groupByModel(items: MatchedItem[]) {
    const groups = new Map<string, MatchedItem[]>();
    for (const item of items) {
      const key = item.portal_model;
      const arr = groups.get(key) ?? [];
      arr.push(item);
      groups.set(key, arr);
    }
    return groups;
  }

  // ──────────────────────────────────────────────
  // REVIEW / PREVIEW VIEW
  // ──────────────────────────────────────────────
  if (parseResult && !savedInfo) {
    const grouped = groupByModel(parseResult.matched);

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

        {/* Summary badges */}
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1 rounded bg-green-100 px-2 py-1 font-medium text-green-800">
            <Check size={12} />
            {parseResult.summary.matched} {tp.matched}
          </span>
          {parseResult.summary.unmatched > 0 && (
            <span className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 font-medium text-red-700">
              <X size={12} />
              {parseResult.summary.unmatched} {tp.notFound}
            </span>
          )}
          <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600">
            {parseResult.summary.total_extracted} aus PDF extrahiert
          </span>
        </div>

        {/* ── MATCHED SECTION ── */}
        <SectionHeader
          title={`Zugeordnete Preise (${parseResult.summary.matched})`}
          expanded={expandedSections.matched}
          onToggle={() => toggleSection("matched")}
          variant="green"
        />
        {expandedSections.matched && (
          <div className="mb-4 max-h-125 overflow-auto rounded border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b bg-gray-50 text-[10px] uppercase tracking-wider text-swing-gray-dark/50">
                <tr>
                  <th className="px-3 py-2">Modell</th>
                  <th className="px-2 py-2">Größe</th>
                  <th className="px-2 py-2 text-right">{tp.uvpGross}</th>
                  <th className="px-2 py-2 text-right">{tp.dealerNet}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.from(grouped.entries()).map(([model, items]) => (
                  items.map((item, idx) => (
                    <tr key={item.product_size_id} className="hover:bg-gray-50/50">
                      {idx === 0 && (
                        <td
                          className="px-3 py-1.5 font-medium text-swing-navy"
                          rowSpan={items.length}
                        >
                          <div>{model}</div>
                          {item.pdf_product_raw !== model && (
                            <div className="text-[10px] text-swing-gray-dark/40">
                              PDF: {item.pdf_product_raw}
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-2 py-1.5 font-medium">
                        {item.portal_size}
                        {item.sku && (
                          <span className="ml-1 text-[10px] text-swing-gray-dark/30">
                            {item.sku}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={getPrice(item).uvp ?? ""}
                          onChange={(e) =>
                            updatePrice(item.product_size_id, "uvp", e.target.value)
                          }
                          className="w-24 rounded border border-gray-200 px-1.5 py-0.5 text-right text-[11px] text-swing-gray-dark/60 focus:border-swing-gold focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={getPrice(item).ek ?? ""}
                          onChange={(e) =>
                            updatePrice(item.product_size_id, "ek", e.target.value)
                          }
                          className="w-24 rounded border border-gray-200 px-1.5 py-0.5 text-right text-[11px] font-semibold text-swing-navy focus:border-swing-gold focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── UNMATCHED SECTION ── */}
        {parseResult.unmatched.length > 0 && (
          <>
            <SectionHeader
              title={`Nicht zugeordnet (${parseResult.unmatched.length})`}
              expanded={expandedSections.unmatched}
              onToggle={() => toggleSection("unmatched")}
              variant="red"
            />
            {expandedSections.unmatched && (
              <div className="mb-4 space-y-1">
                {parseResult.unmatched.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded bg-red-50/50 px-2.5 py-1.5 text-xs"
                  >
                    <X size={12} className="mt-0.5 shrink-0 text-red-400" />
                    <div className="flex-1">
                      <span className="font-medium text-swing-navy">
                        {item.product}
                      </span>
                      <span className="ml-1 text-swing-gray-dark/40">
                        {item.size}
                      </span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-swing-gray-dark/40">
                      {item.uvp_gross != null && <span>UVP: {item.uvp_gross.toFixed(2)}</span>}
                      {item.dealer_net != null && <span>EK: {item.dealer_net.toFixed(2)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
          <button
            onClick={handleCancelParse}
            className="cursor-pointer rounded border border-gray-300 px-3 py-1.5 text-xs text-swing-gray-dark hover:bg-gray-50"
          >
            {dict.common.buttons.cancel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || parseResult.summary.matched === 0}
            className="flex cursor-pointer items-center gap-1.5 rounded bg-swing-gold px-4 py-1.5 text-xs font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50"
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

  // ──────────────────────────────────────────────
  // DEFAULT VIEW (upload buttons + file list)
  // ──────────────────────────────────────────────
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
          const latestUpload = catUploads[0];
          const isUploading = uploadingCategory === cat.key;

          return (
            <div key={cat.key}>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">
                {cat.label}
              </p>

              {latestUpload ? (
                <div className="overflow-hidden rounded border border-green-200 bg-green-50">
                  <a
                    href={latestUpload.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 px-3 py-2 text-xs text-green-800 transition-colors hover:bg-green-100"
                  >
                    <Eye size={13} className="mt-0.5 shrink-0 text-green-500" />
                    <span className="min-w-0 break-words">
                      {latestUpload.file_name || "Preisliste.pdf"}
                    </span>
                  </a>
                  <div className="flex items-center justify-between border-t border-green-200 px-3 py-1.5">
                    <span className="text-[10px] text-green-600/60">
                      {new Date(latestUpload.created_at).toLocaleDateString(dl, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      <label
                        className={`flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold text-green-700 transition-colors hover:bg-green-200 ${isUploading ? "opacity-50" : ""}`}
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
                      <button
                        onClick={() => handleDelete(latestUpload.id, cat.key)}
                        disabled={deletingId === latestUpload.id}
                        className="shrink-0 cursor-pointer rounded p-1 text-swing-navy/25 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      >
                        {deletingId === latestUpload.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Trash2 size={11} />
                        )}
                      </button>
                    </div>
                  </div>
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

// ── Collapsible section header ──
function SectionHeader({
  title,
  expanded,
  onToggle,
  variant,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  variant: "green" | "yellow" | "red" | "gray";
}) {
  const colors = {
    green: "border-green-200 bg-green-50/50 text-green-800",
    yellow: "border-yellow-200 bg-yellow-50/50 text-yellow-800",
    red: "border-red-200 bg-red-50/50 text-red-700",
    gray: "border-gray-200 bg-gray-50 text-gray-600",
  };

  return (
    <button
      onClick={onToggle}
      className={`mb-1 flex w-full cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1.5 text-left text-[11px] font-semibold ${colors[variant]}`}
    >
      {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      {title}
    </button>
  );
}

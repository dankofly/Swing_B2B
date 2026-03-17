"use client";

import { useState } from "react";
import AiInfoTooltip from "@/components/ui/AiInfoTooltip";
import { uploadPriceList, deletePriceUpload } from "@/lib/actions/price-uploads";
import { confirmPrices, type MatchedPriceItem } from "@/lib/actions/prices";
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronRight,
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

/** Shape returned by /api/parse-pricelist for matched items */
interface ApiMatchedItem {
  portal_product_id: string;
  portal_model: string;
  portal_size: string;
  pdf_category: string;
  pdf_model_raw: string;
  pdf_model_normalized: string;
  pdf_size_raw: string;
  pdf_size_normalized: string;
  uvp_incl_vat_eur: string;
  dealer_net_eur: string;
  confidence: string;
  match_basis: string;
  product_size_id: string;
  product_id: string | null;
  sku: string | null;
  uvp_incl_vat: number | null;
  ek_netto: number | null;
}

interface ApiPdfProduct {
  category: string;
  model_raw: string;
  model_normalized: string;
  size_raw: string;
  size_normalized: string;
  uvp_incl_vat_eur: string;
  dealer_net_eur: string;
}

interface ApiReviewItem {
  pdf_product: ApiPdfProduct;
  portal_candidates: Array<{
    portal_product_id: string;
    portal_model: string;
    portal_size: string;
  }>;
  reason: string;
}

interface ApiNoMatchItem {
  pdf_product: ApiPdfProduct;
  reason: string;
}

interface ApiMissingItem {
  portal_product_id: string;
  portal_model: string;
  portal_size: string;
  reason: string;
}

interface ParseResult {
  matched: ApiMatchedItem[];
  review_needed: ApiReviewItem[];
  no_match: ApiNoMatchItem[];
  missing_in_price_list: ApiMissingItem[];
  summary: {
    total_pdf: number;
    matched: number;
    review_needed: number;
    no_match: number;
    missing_in_price_list: number;
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
    review: false,
    noMatch: false,
    missing: false,
  });

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function getPrice(item: ApiMatchedItem) {
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

    // Step 1: Upload file to storage
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadPriceList(companyId, formData, category);
    if (!result.success) {
      setError(result.error || tp.uploadFailed);
      setUploadingCategory(null);
      e.target.value = "";
      return;
    }

    // Step 2: If PDF, extract text client-side then send to Gemini
    const ext = file.name.split(".").pop()?.toLowerCase();
    let didParse = false;

    if (ext === "pdf") {
      setParsing(true);
      setParseCategory(category);

      try {
        // Extract PDF text in the browser (no server needed for this step)
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

        // Step 1: Get prompt + API key from server (fast, no timeout risk)
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

        // Step 2: Call Gemini directly from browser (no server timeout)
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${prepData.gemini_key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prepData.prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                maxOutputTokens: 65536,
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

        // Parse Gemini JSON response
        console.log("[PriceListSection] Gemini raw response (first 500):", responseText.slice(0, 500));
        let parsed;
        try {
          parsed = JSON.parse(responseText);
        } catch (parseErr1) {
          console.error("[PriceListSection] JSON.parse failed:", parseErr1);
          // Fallback: strip markdown fences
          let cleaned = responseText
            .replace(/^[\s\S]*?```json?\s*/i, "")
            .replace(/```[\s\S]*$/i, "")
            .trim();
          try {
            parsed = JSON.parse(cleaned);
          } catch {
            // Fallback 2: extract by braces
            const first = responseText.indexOf("{");
            const last = responseText.lastIndexOf("}");
            if (first !== -1 && last > first) {
              cleaned = responseText.slice(first, last + 1);
              try {
                parsed = JSON.parse(cleaned);
              } catch {
                setError("Parse-Fehler (3). Antwort: " + responseText.slice(0, 300));
                setParsing(false);
                setUploadingCategory(null);
                e.target.value = "";
                return;
              }
            } else {
              setError("Kein JSON gefunden. Antwort: " + responseText.slice(0, 300));
              setParsing(false);
              setUploadingCategory(null);
              e.target.value = "";
              return;
            }
          }
        }

        // Handle case where Gemini returns the data in a different structure
        if (!parsed.matched && Array.isArray(parsed)) {
          parsed = { matched: parsed, review_needed: [], no_match: [], missing_in_price_list: [] };
        }

        // Enrich matched items with product_id and SKU
        const sizeMap = new Map(
          (prepData.sizes as Array<{ id: string; sku: string; product_id: string }>).map(
            (s) => [s.id, s]
          )
        );

        const matched = (parsed.matched ?? []).map((item: Record<string, string>) => {
          const size = sizeMap.get(item.portal_product_id);
          return {
            ...item,
            product_size_id: item.portal_product_id,
            product_id: size?.product_id ?? null,
            sku: size?.sku ?? null,
            uvp_incl_vat: item.uvp_incl_vat_eur ? parseFloat(item.uvp_incl_vat_eur.replace(/\s/g, "").replace(",", ".")) || null : null,
            ek_netto: item.dealer_net_eur ? parseFloat(item.dealer_net_eur.replace(/\s/g, "").replace(",", ".")) || null : null,
          };
        });

        const data = {
          matched,
          review_needed: parsed.review_needed ?? [],
          no_match: parsed.no_match ?? [],
          missing_in_price_list: parsed.missing_in_price_list ?? [],
          summary: {
            total_pdf: (parsed.matched?.length ?? 0) + (parsed.review_needed?.length ?? 0) + (parsed.no_match?.length ?? 0),
            matched: parsed.matched?.length ?? 0,
            review_needed: parsed.review_needed?.length ?? 0,
            no_match: parsed.no_match?.length ?? 0,
            missing_in_price_list: parsed.missing_in_price_list?.length ?? 0,
          },
        };

        setParseResult(data);
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
          pdf_model_raw: item.pdf_model_raw,
          pdf_category: item.pdf_category,
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

  async function handleDelete(id: string) {
    const result = await deletePriceUpload(id, companyId);
    if (result.success) {
      setUploads((prev) => prev.filter((u) => u.id !== id));
    }
  }

  // Group matched items by model for display
  function groupByModel(items: ApiMatchedItem[]) {
    const groups = new Map<string, ApiMatchedItem[]>();
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
          {parseResult.summary.review_needed > 0 && (
            <span className="flex items-center gap-1 rounded bg-yellow-100 px-2 py-1 font-medium text-yellow-800">
              <AlertTriangle size={12} />
              {parseResult.summary.review_needed} prüfen
            </span>
          )}
          {parseResult.summary.no_match > 0 && (
            <span className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 font-medium text-red-700">
              <X size={12} />
              {parseResult.summary.no_match} {tp.notFound}
            </span>
          )}
          {parseResult.summary.missing_in_price_list > 0 && (
            <span className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 font-medium text-gray-600">
              {parseResult.summary.missing_in_price_list} fehlen in PDF
            </span>
          )}
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
                          {item.pdf_model_raw !== model && (
                            <div className="text-[10px] text-swing-gray-dark/40">
                              PDF: {item.pdf_model_raw}
                            </div>
                          )}
                          <div className="text-[10px] text-swing-gray-dark/30">
                            {item.pdf_category}
                          </div>
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

        {/* ── REVIEW NEEDED SECTION ── */}
        {parseResult.review_needed.length > 0 && (
          <>
            <SectionHeader
              title={`Prüfung nötig (${parseResult.review_needed.length})`}
              expanded={expandedSections.review}
              onToggle={() => toggleSection("review")}
              variant="yellow"
            />
            {expandedSections.review && (
              <div className="mb-4 space-y-2">
                {parseResult.review_needed.map((item, i) => (
                  <div
                    key={i}
                    className="rounded border border-yellow-200 bg-yellow-50/50 p-2.5 text-xs"
                  >
                    <div className="font-medium text-swing-navy">
                      {item.pdf_product.model_raw} – {item.pdf_product.size_raw}
                    </div>
                    <div className="text-[10px] text-yellow-800">{item.reason}</div>
                    {item.portal_candidates.length > 0 && (
                      <div className="mt-1 text-[10px] text-swing-gray-dark/50">
                        Mögliche Zuordnungen:{" "}
                        {item.portal_candidates
                          .map((c) => `${c.portal_model} ${c.portal_size}`)
                          .join(", ")}
                      </div>
                    )}
                    <div className="mt-1 flex gap-3 text-[10px] text-swing-gray-dark/40">
                      <span>UVP: {item.pdf_product.uvp_incl_vat_eur}</span>
                      <span>EK: {item.pdf_product.dealer_net_eur}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── NO MATCH SECTION ── */}
        {parseResult.no_match.length > 0 && (
          <>
            <SectionHeader
              title={`Nicht zugeordnet (${parseResult.no_match.length})`}
              expanded={expandedSections.noMatch}
              onToggle={() => toggleSection("noMatch")}
              variant="red"
            />
            {expandedSections.noMatch && (
              <div className="mb-4 space-y-1">
                {parseResult.no_match.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded bg-red-50/50 px-2.5 py-1.5 text-xs"
                  >
                    <X size={12} className="mt-0.5 shrink-0 text-red-400" />
                    <div>
                      <span className="font-medium text-swing-navy">
                        {item.pdf_product.model_raw}
                      </span>
                      <span className="ml-1 text-swing-gray-dark/40">
                        {item.pdf_product.size_raw}
                      </span>
                      <span className="ml-2 text-[10px] text-red-600">
                        {item.reason}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── MISSING IN PRICE LIST ── */}
        {parseResult.missing_in_price_list.length > 0 && (
          <>
            <SectionHeader
              title={`Fehlen in Preisliste (${parseResult.missing_in_price_list.length})`}
              expanded={expandedSections.missing}
              onToggle={() => toggleSection("missing")}
              variant="gray"
            />
            {expandedSections.missing && (
              <div className="mb-4 space-y-1">
                {parseResult.missing_in_price_list.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded bg-gray-50 px-2.5 py-1.5 text-xs text-swing-gray-dark/50"
                  >
                    <span className="font-medium">
                      {item.portal_model} – {item.portal_size}
                    </span>
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
                        onClick={() => handleDelete(latestUpload.id)}
                        className="shrink-0 cursor-pointer rounded p-1 text-green-600/30 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={11} />
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

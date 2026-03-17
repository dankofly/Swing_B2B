"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AiInfoTooltip from "@/components/ui/AiInfoTooltip";
import { uploadPriceList, deleteAllCategoryUploads } from "@/lib/actions/price-uploads";
import { confirmPrices, type MatchedPriceItem } from "@/lib/actions/prices";
import {
  Upload,
  Trash2,
  Loader2,
  Check,
  Eye,
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

// ── Normalize strings for matching ──
function normalize(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[-\u2013\u2014]/g, "-")
    .replace(/['']/g, "'");
}

/** Normalize size: handle comma/dot decimals + common "one size" variants */
function normalizeSize(str: string | null | undefined): string {
  if (!str) return "einheitsgröße";
  const s = normalize(str);
  // Map common "one size" variants
  if (
    s === "" ||
    s === "one size" ||
    s === "onesize" ||
    s === "uni" ||
    s === "universal" ||
    s === "os" ||
    s === "one" ||
    s === "-"
  ) {
    return "einheitsgröße";
  }
  // Normalize decimal separators: "11,5" → "11.5"
  return s.replace(/,/g, ".");
}

// ── Match extracted items against portal products ──
/** Simple edit distance for short strings (model names) */
function editDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return matrix[a.length][b.length];
}

function matchExtractedToPortal(
  extracted: ExtractedItem[],
  portalProducts: PortalProduct[]
): { matched: MatchedItem[]; unmatchedCount: number } {
  const matched: MatchedItem[] = [];
  const matchedSizeIds = new Set<string>();
  let unmatchedCount = 0;

  function addMatch(pp: PortalProduct, item: ExtractedItem) {
    matched.push({
      product_size_id: pp.product_size_id,
      product_id: pp.product_id,
      portal_model: pp.model,
      portal_size: pp.size,
      sku: pp.sku,
      uvp_incl_vat: item.uvp_gross,
      ek_netto: item.dealer_net,
      pdf_product_raw: item.product,
      pdf_size_raw: item.size ?? "",
    });
    matchedSizeIds.add(pp.product_size_id);
  }

  for (const item of extracted) {
    const normProduct = normalize(item.product);
    const normSize = normalizeSize(item.size);

    // 1. Exact normalized match (with size normalization)
    const exactMatch = portalProducts.find(
      (pp) =>
        !matchedSizeIds.has(pp.product_size_id) &&
        normalize(pp.model) === normProduct &&
        normalizeSize(pp.size) === normSize
    );

    if (exactMatch) {
      addMatch(exactMatch, item);
      continue;
    }

    // 2. Fuzzy model name (contains), exact size
    const containsMatch = portalProducts.find((pp) => {
      if (matchedSizeIds.has(pp.product_size_id)) return false;
      const normModel = normalize(pp.model);
      return (
        (normModel.includes(normProduct) || normProduct.includes(normModel)) &&
        normalizeSize(pp.size) === normSize
      );
    });

    if (containsMatch) {
      addMatch(containsMatch, item);
      continue;
    }

    // 3. Levenshtein distance ≤ 2 on model name (catches typos like "Spirfire" vs "Spitfire")
    const typoMatch = portalProducts.find((pp) => {
      if (matchedSizeIds.has(pp.product_size_id)) return false;
      const normModel = normalize(pp.model);
      return (
        editDistance(normModel, normProduct) <= 2 &&
        normalizeSize(pp.size) === normSize
      );
    });

    if (typoMatch) {
      console.log(`[Matching] Typo match: "${item.product}" → "${typoMatch.model}" (distance: ${editDistance(normalize(typoMatch.model), normProduct)})`);
      addMatch(typoMatch, item);
      continue;
    }

    console.log(`[Matching] No match: "${item.product}" size "${item.size}" (normalized: "${normProduct}" / "${normSize}")`);
    unmatchedCount++;
  }

  return { matched, unmatchedCount };
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
  const router = useRouter();
  const dict = useDict();
  const locale = useLocale();
  const dl = getDateLocale(locale);
  const tp = dict.admin.priceLists;

  const [uploads, setUploads] = useState(initialUploads);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, category: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCategory(category);
    setError(null);

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

    // If PDF, extract → parse → match → save → redirect
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "pdf") {
      setParsing(true);

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
          extracted = Array.isArray(parsed) ? parsed : (parsed.products ?? parsed);
          if (!Array.isArray(extracted)) {
            throw new Error("Unexpected response format");
          }
        } catch {
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

        // Match against portal products (JavaScript, no Gemini)
        const portalProducts: PortalProduct[] = prepData.portal_products;
        const { matched, unmatchedCount } = matchExtractedToPortal(extracted, portalProducts);

        console.log(`[PriceListSection] Matched: ${matched.length}, Unmatched: ${unmatchedCount}`);

        // Auto-save matched prices and redirect to price overview
        if (matched.length > 0) {
          const items: MatchedPriceItem[] = matched.map((item) => ({
            product_size_id: item.product_size_id,
            product_id: item.product_id,
            portal_model: item.portal_model,
            portal_size: item.portal_size,
            sku: item.sku,
            uvp_incl_vat: item.uvp_incl_vat,
            ek_netto: item.ek_netto,
            pdf_model_raw: item.pdf_product_raw,
          }));

          const info = await confirmPrices(companyId, items);
          console.log(`[PriceListSection] Saved ${info.savedCount} prices for ${info.productCount} products`);
          setParsing(false);
          setUploadingCategory(null);
          e.target.value = "";
          router.push(`/admin/kunden/${companyId}/preise`);
          return;
        } else {
          setError(`Keine Zuordnungen gefunden. ${unmatchedCount} Produkte aus der PDF konnten nicht zugeordnet werden.`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : tp.networkError);
      } finally {
        setParsing(false);
      }
    }

    setUploadingCategory(null);
    e.target.value = "";

    if (ext !== "pdf") {
      window.location.reload();
    }
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

  // ──────────────────────────────────────────────
  // UPLOAD VIEW
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

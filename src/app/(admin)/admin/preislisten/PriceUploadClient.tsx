"use client";

import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Building2,
} from "lucide-react";
import { confirmPrices, type ParsedPriceItem } from "@/lib/actions/prices";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";

interface Company {
  id: string;
  name: string;
  contact_email: string;
  is_approved: boolean;
}

interface ParseResult {
  items: ParsedPriceItem[];
  summary: { total: number; matched: number; unmatched: number };
}

export default function PriceUploadClient({
  companies,
  skuCount,
}: {
  companies: Company[];
  skuCount: number;
}) {
  const dict = useDict();
  const locale = useLocale();
  const dl = getDateLocale(locale);
  const tp = dict.admin.priceLists;

  function eur(value: number) {
    return value.toLocaleString(dl, { style: "currency", currency: "EUR" });
  }

  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedInfo, setSavedInfo] = useState<{
    savedCount: number;
    productCount: number;
  } | null>(null);
  const [discounts, setDiscounts] = useState<Record<number, number>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file || !selectedCompany) return;

    setParsing(true);
    setError(null);
    setResult(null);
    setSavedInfo(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("company_id", selectedCompany);

      const res = await fetch("/api/parse-pricelist", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || tp.parseError);
        return;
      }

      setResult(data);
    } catch {
      setError(tp.networkError);
    } finally {
      setParsing(false);
    }
  }

  async function handleConfirm() {
    if (!result || !selectedCompany) return;

    setSaving(true);
    setError(null);

    try {
      const itemsWithDiscount = result.items.map((item, i) => ({
        ...item,
        discount: discounts[i] ?? 0,
        ek_netto: item.ek_netto * (1 - (discounts[i] ?? 0) / 100),
      }));
      const info = await confirmPrices(selectedCompany, itemsWithDiscount);
      setSavedInfo(info);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : tp.saveError
      );
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setError(null);
    setSavedInfo(null);
    setDiscounts({});
    if (fileRef.current) fileRef.current.value = "";
  }

  const company = companies.find((c) => c.id === selectedCompany);

  return (
    <div className="space-y-6">
      {/* Step 1: Select company */}
      <div className="rounded bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-swing-navy">
          <Building2 size={20} />
          {tp.selectDealer}
        </h2>
        <select
          value={selectedCompany}
          onChange={(e) => {
            setSelectedCompany(e.target.value);
            handleReset();
          }}
          className="w-full max-w-md rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
        >
          <option value="">{tp.selectDealerPlaceholder}</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {!c.is_approved ? ` ${tp.notApproved}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Upload PDF */}
      {selectedCompany && (
        <div className="rounded bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-swing-navy">
            <Upload size={20} />
            {tp.uploadTitle}
          </h2>
          <p className="mb-4 text-sm text-swing-gray-dark/60">
            {tp.uploadDescription
              .replace("{company}", company?.name ?? "")
              .replace("{count}", String(skuCount))}
          </p>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
                {tp.pdfFile}
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setResult(null);
                  setSavedInfo(null);
                  setError(null);
                }}
                className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-swing-navy file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-swing-navy/90"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || parsing}
              className="flex items-center gap-2 rounded bg-swing-gold px-6 py-2 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50"
            >
              {parsing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {tp.analyzing}
                </>
              ) : (
                <>
                  <FileText size={16} />
                  {tp.analyze}
                </>
              )}
            </button>
          </div>

          {file && !parsing && !result && (
            <p className="mt-3 text-sm text-swing-gray-dark/50">
              {tp.ready
                .replace("{fileName}", file.name)
                .replace("{size}", (file.size / 1024).toFixed(0))}
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded border border-red-200 bg-red-50 p-4">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="font-semibold text-red-800">{dict.admin.stock.error}</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Step 3: Preview results */}
      {result && !savedInfo && (
        <div className="rounded bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-swing-navy">
              {tp.result}
            </h2>
            <div className="mt-2 flex gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-green-700">
                <Check size={14} />
                {result.summary.matched} {tp.matched}
              </span>
              <span className="flex items-center gap-1.5 text-red-600">
                <X size={14} />
                {result.summary.unmatched} {tp.notFound}
              </span>
              <span className="text-swing-gray-dark/50">
                {result.summary.total} {tp.total}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase tracking-wider text-swing-gray-dark/50">
                <tr>
                  <th className="px-4 py-3">{tp.status}</th>
                  <th className="px-4 py-3">{tp.modelPdf}</th>
                  <th className="px-4 py-3">{tp.assignedTo}</th>
                  <th className="px-4 py-3">{tp.sizes}</th>
                  <th className="px-4 py-3 text-right">{tp.uvpGross}</th>
                  <th className="px-4 py-3 text-right">{tp.dealerNet}</th>
                  <th className="px-4 py-3 text-right">{tp.discount}</th>
                  <th className="px-4 py-3 text-right">{tp.finalPrice}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.items.map((item, i) => (
                  <tr
                    key={i}
                    className={
                      item.status === "unmatched" ? "bg-red-50/50" : ""
                    }
                  >
                    <td className="px-4 py-3">
                      {item.status === "matched" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <Check size={12} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          <X size={12} />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-swing-navy">
                      {item.modell_pdf}
                    </td>
                    <td className="px-4 py-3">
                      {item.product_name ? (
                        <span className="text-swing-gray-dark">
                          {item.product_name}
                          <span className="ml-1 text-xs text-swing-gray-dark/40">
                            ({item.product_sizes.length} SKUs)
                          </span>
                        </span>
                      ) : (
                        <span className="text-swing-gray-dark/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-swing-gray-dark/60">
                      {item.groessen}
                    </td>
                    <td className="px-4 py-3 text-right text-swing-gray-dark/60">
                      {eur(item.uvp_brutto)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-swing-navy">
                      {eur(item.ek_netto)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
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
                          className="w-14 rounded border border-gray-300 px-2 py-1 text-right text-xs focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
                        />
                        <span className="text-xs text-swing-gray-dark/50">%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-swing-navy">
                      {eur(item.ek_netto * (1 - (discounts[i] ?? 0) / 100))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <button
              onClick={handleReset}
              className="w-full rounded border border-gray-300 px-4 py-2 text-sm text-swing-gray-dark hover:bg-gray-50 sm:w-auto"
            >
              {dict.common.buttons.cancel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving || result.summary.matched === 0}
              className="flex w-full items-center justify-center gap-2 rounded bg-swing-gold px-6 py-2 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50 sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {dict.common.buttons.loading}
                </>
              ) : (
                <>
                  <Check size={16} />
                  {tp.applyPrices.replace("{count}", String(result.summary.matched))}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {savedInfo && (
        <div className="flex items-start gap-3 rounded border border-green-200 bg-green-50 p-6">
          <Check size={24} className="mt-0.5 shrink-0 text-green-600" />
          <div>
            <p className="text-lg font-semibold text-green-800">
              {tp.pricesSaved}
            </p>
            <p className="mt-1 text-sm text-green-700">
              {tp.pricesSavedMessage
                .replace("{count}", String(savedInfo.savedCount))
                .replace("{products}", String(savedInfo.productCount))
                .replace("{company}", company?.name ?? "")}
            </p>
            <button
              onClick={handleReset}
              className="mt-3 rounded bg-swing-gold px-4 py-2 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark"
            >
              {tp.uploadAnother}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

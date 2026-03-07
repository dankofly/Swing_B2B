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

function eur(value: number) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

export default function PriceUploadClient({
  companies,
  skuCount,
}: {
  companies: Company[];
  skuCount: number;
}) {
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
        setError(data.error || "Fehler beim Parsen");
        return;
      }

      setResult(data);
    } catch {
      setError("Netzwerkfehler beim Upload");
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
        err instanceof Error ? err.message : "Fehler beim Speichern"
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
      <div className="rounded bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-swing-navy">
          <Building2 size={20} />
          Händler auswählen
        </h2>
        <select
          value={selectedCompany}
          onChange={(e) => {
            setSelectedCompany(e.target.value);
            handleReset();
          }}
          className="w-full max-w-md rounded border border-gray-300 px-3 py-2 text-sm focus:border-swing-gold focus:outline-none focus:ring-1 focus:ring-swing-gold"
        >
          <option value="">Händler wählen...</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {!c.is_approved ? " (nicht freigeschaltet)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Step 2: Upload PDF */}
      {selectedCompany && (
        <div className="rounded bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-swing-navy">
            <Upload size={20} />
            Preisliste hochladen
          </h2>
          <p className="mb-4 text-sm text-swing-gray-dark/60">
            PDF-Preisliste für <strong>{company?.name}</strong> hochladen.
            Gemini erkennt Modellnamen, UVP und Händler-EK automatisch.
            Im System sind <strong>{skuCount} SKUs</strong> hinterlegt.
          </p>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-swing-gray-dark">
                PDF-Datei
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
                  Wird analysiert...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  PDF analysieren
                </>
              )}
            </button>
          </div>

          {file && !parsing && !result && (
            <p className="mt-3 text-sm text-swing-gray-dark/50">
              Bereit: {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded border border-red-200 bg-red-50 p-4">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="font-semibold text-red-800">Fehler</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Step 3: Preview results */}
      {result && !savedInfo && (
        <div className="rounded bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-swing-navy">
              Ergebnis der Analyse
            </h2>
            <div className="mt-2 flex gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-green-700">
                <Check size={14} />
                {result.summary.matched} zugeordnet
              </span>
              <span className="flex items-center gap-1.5 text-red-600">
                <X size={14} />
                {result.summary.unmatched} nicht gefunden
              </span>
              <span className="text-swing-gray-dark/50">
                {result.summary.total} gesamt
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase tracking-wider text-swing-gray-dark/50">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Modell (PDF)</th>
                  <th className="px-4 py-3">Zugeordnet</th>
                  <th className="px-4 py-3">Größen</th>
                  <th className="px-4 py-3 text-right">UVP inkl. MwSt.</th>
                  <th className="px-4 py-3 text-right">Händler EK netto</th>
                  <th className="px-4 py-3 text-right">DISCOUNT</th>
                  <th className="px-4 py-3 text-right">Endpreis netto</th>
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

          <div className="flex items-center justify-between border-t px-6 py-4">
            <button
              onClick={handleReset}
              className="rounded border border-gray-300 px-4 py-2 text-sm text-swing-gray-dark hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving || result.summary.matched === 0}
              className="flex items-center gap-2 rounded bg-swing-gold px-6 py-2 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Check size={16} />
                  {result.summary.matched} Produkt-Preise übernehmen
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
              Preise gespeichert
            </p>
            <p className="mt-1 text-sm text-green-700">
              {savedInfo.savedCount} Preise für {savedInfo.productCount} Produkte
              wurden für <strong>{company?.name}</strong> übernommen.
            </p>
            <button
              onClick={handleReset}
              className="mt-3 rounded bg-swing-gold px-4 py-2 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark"
            >
              Weitere Preisliste hochladen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

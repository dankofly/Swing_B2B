"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AiInfoTooltip from "@/components/ui/AiInfoTooltip";
import { uploadPriceList, deleteAllCategoryUploads } from "@/lib/actions/price-uploads";
import { extractPdfText } from "@/lib/pdf-extract";
import {
  Upload,
  Trash2,
  Loader2,
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

type ParseStep = "uploading" | "extracting" | "matching" | "saving" | null;

const STEP_LABELS: Record<Exclude<ParseStep, null>, string> = {
  uploading: "Datei wird hochgeladen...",
  extracting: "PDF wird analysiert...",
  matching: "Preise werden zugeordnet...",
  saving: "Preise werden gespeichert...",
};

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
  const [step, setStep] = useState<ParseStep>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, category: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCategory(category);
    setError(null);
    setStep("uploading");

    // Upload file to storage
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadPriceList(companyId, formData, category);
    if (!result.success) {
      setError(result.error || tp.uploadFailed);
      setUploadingCategory(null);
      setStep(null);
      e.target.value = "";
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "pdf") {
      try {
        // Step 1: Extract text from PDF in the browser (pdf.js)
        setStep("extracting");
        let pdfText: string;
        try {
          pdfText = await extractPdfText(file);
        } catch (extractErr) {
          setError(`PDF konnte nicht gelesen werden: ${extractErr instanceof Error ? extractErr.message : "Unbekannter Fehler"}`);
          setStep(null);
          setUploadingCategory(null);
          e.target.value = "";
          return;
        }

        if (!pdfText || pdfText.trim().length < 50) {
          setError("Das PDF enthält keinen extrahierbaren Text. Möglicherweise ist es ein gescanntes Dokument.");
          setStep(null);
          setUploadingCategory(null);
          e.target.value = "";
          return;
        }

        // Step 2: Send text to API (Gemini extraction + canonical key matching + save)
        setStep("matching");
        const res = await fetch("/api/parse-pricelist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company_id: companyId, pdf_text: pdfText }),
        });

        let data;
        try {
          data = await res.json();
        } catch {
          setError(`Server-Fehler (${res.status}): Antwort konnte nicht gelesen werden`);
          setStep(null);
          setUploadingCategory(null);
          e.target.value = "";
          return;
        }

        if (!res.ok) {
          setError(data.error || `Fehler ${res.status}`);
          setStep(null);
          setUploadingCategory(null);
          e.target.value = "";
          return;
        }

        setStep(null);
        setUploadingCategory(null);
        e.target.value = "";
        router.push(`/admin/kunden/${companyId}/preise`);
        return;
      } catch (err) {
        setError(err instanceof Error ? err.message : tp.networkError);
        setStep(null);
      }
    }

    setUploadingCategory(null);
    setStep(null);
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

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-swing-navy/30">Upload + KI-Zuordnung</span>
        <AiInfoTooltip
          action="Beim Upload einer PDF-Preisliste wird der Text automatisch extrahiert und per KI analysiert. Die Preise werden deterministisch den Katalog-Produkten zugeordnet."
          costNote="Pro PDF-Upload werden API-Tokens verbraucht, die Kosten verursachen können."
        />
      </div>
      {error && (
        <p className="mb-3 text-xs font-medium text-red-600">{error}</p>
      )}

      {step && (
        <div className="mb-3 flex items-center gap-2 rounded border border-swing-gold/30 bg-swing-gold/10 p-3">
          <Loader2 size={14} className="animate-spin text-swing-navy" />
          <p className="text-xs font-medium text-swing-navy">
            {STEP_LABELS[step]}
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
                          disabled={isUploading || step !== null}
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
                    disabled={isUploading || step !== null}
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

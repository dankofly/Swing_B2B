"use client";

import { useState } from "react";
import { Languages, Loader2, Check, AlertCircle } from "lucide-react";
import AiInfoTooltip from "@/components/ui/AiInfoTooltip";

type Status = "idle" | "translating" | "success" | "error";

export default function TranslateButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function handleTranslate() {
    if (status === "translating") return;

    setStatus("translating");
    setError("");

    try {
      // Load the German source dictionary dynamically
      setProgress("Lade DE-Quelldatei...");
      const deModule = await import("@/lib/i18n/locales/de");
      const sourceDict = deModule.default;

      const locales = ["en", "fr"] as const;

      for (const locale of locales) {
        setProgress(`Übersetze → ${locale.toUpperCase()}...`);
        const res = await fetch("/api/translate-i18n", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetLocale: locale, sourceDict }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Fehler bei ${locale.toUpperCase()}`);
        }

        const { translated } = await res.json();

        // Download the translated file
        const fileContent = `import type { Dictionary } from "../types";\n\nconst ${locale}: Dictionary = ${JSON.stringify(translated, null, 2)};\n\nexport default ${locale};\n`;
        const blob = new Blob([fileContent], { type: "text/typescript" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${locale}.ts`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setStatus("success");
      setProgress("EN + FR heruntergeladen!");
      setTimeout(() => {
        setStatus("idle");
        setProgress("");
      }, 4000);
    } catch (err: unknown) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setTimeout(() => {
        setStatus("idle");
        setError("");
        setProgress("");
      }, 5000);
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      <AiInfoTooltip
        dark
        action="Übersetzt alle UI-Texte automatisch von Deutsch nach Englisch und Französisch. Die übersetzten Dateien werden als Download bereitgestellt."
        costNote="Pro Sprache wird ein API-Aufruf gesendet. Es entstehen Token-Kosten für 2 Übersetzungen (EN + FR)."
      />
      <button
        type="button"
        onClick={handleTranslate}
        disabled={status === "translating"}
        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
          status === "translating"
            ? "animate-pulse bg-swing-gold/30 text-swing-navy/60"
            : status === "success"
              ? "bg-green-500/20 text-green-400"
              : status === "error"
                ? "bg-red-500/20 text-red-400"
                : "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white/70"
        }`}
        title="Alle Sprachen mit Gemini aktualisieren"
      >
        {status === "translating" ? (
          <Loader2 size={10} className="animate-spin" />
        ) : status === "success" ? (
          <Check size={10} />
        ) : status === "error" ? (
          <AlertCircle size={10} />
        ) : (
          <Languages size={10} />
        )}
        <span className="hidden sm:inline">
          {status === "translating"
            ? progress
            : status === "success"
              ? progress
              : status === "error"
                ? "Fehler"
                : "i18n"}
        </span>
      </button>
      {status === "error" && error && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded bg-red-900/90 px-3 py-2 text-[10px] text-red-200 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

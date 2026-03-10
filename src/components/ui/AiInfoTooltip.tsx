"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, Sparkles } from "lucide-react";
import { useDict } from "@/lib/i18n/context";

interface AiInfoTooltipProps {
  /** What happens when the user clicks the button */
  action: string;
  /** Which AI model is used */
  model?: string;
  /** Extra cost/token info */
  costNote?: string;
  /** Dark variant for use on dark backgrounds (e.g. header) */
  dark?: boolean;
}

export default function AiInfoTooltip({
  action,
  model = "Google Gemini 2.0 Flash",
  costNote,
  dark = false,
}: AiInfoTooltipProps) {
  const dict = useDict();
  const ai = dict.aiTooltip;
  const resolvedCostNote = costNote ?? ai.defaultCostNote;
  const [open, setOpen] = useState(false);
  const [alignLeft, setAlignLeft] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Decide alignment based on button position BEFORE tooltip renders
  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // tooltip is w-72 = 288px; if button is too close to left edge, align left
      setAlignLeft(rect.left < 288);
    }
    setOpen(!open);
  }

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onClick={handleToggle}
        className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
          dark
            ? "text-white/30 hover:bg-white/10 hover:text-white/60"
            : "text-swing-navy/30 hover:bg-swing-navy/5 hover:text-swing-navy/60"
        }`}
        title="AI-Info"
      >
        <HelpCircle size={14} />
      </button>
      {open && (
        <div className={`absolute top-full z-50 mt-1.5 w-72 rounded-lg border border-gray-200 bg-white p-3.5 shadow-xl ${alignLeft ? "left-0" : "right-0"}`}>
          <div className="mb-2 flex items-center gap-1.5">
            <Sparkles size={13} className="text-swing-gold" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-swing-navy/60">
              {ai.aiFeature}
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-swing-gray-dark/80">
            {action}
          </p>
          <div className="mt-2.5 rounded bg-amber-50 px-2.5 py-2">
            <p className="text-[11px] font-semibold text-amber-800">
              {ai.modelLabel}: {model}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700">
              {resolvedCostNote}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

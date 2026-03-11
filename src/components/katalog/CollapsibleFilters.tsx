"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

export default function CollapsibleFilters({
  children,
  label,
  activeCount,
}: {
  children: React.ReactNode;
  label: string;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-swing-navy/50">
          <SlidersHorizontal size={14} />
          {label}
          {activeCount > 0 && (
            <span className="rounded-full bg-swing-gold px-2 py-0.5 text-[10px] font-bold tabular-nums text-swing-navy">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`text-swing-navy/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Collapsible content */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

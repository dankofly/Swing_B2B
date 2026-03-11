"use client";

import { useEffect, useState, useRef } from "react";

interface NewsTickerProps {
  items: { id: string; message: string }[];
}

export default function NewsTicker({ items }: NewsTickerProps) {
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Nothing to show
  if (!items || items.length === 0) return null;

  // Build the ticker text: join all messages with separator
  const separator = " \u00A0\u00A0\u2022\u00A0\u00A0 ";
  const tickerText = items.map((i) => i.message).join(separator);

  return (
    <div
      className="relative overflow-hidden bg-swing-navy text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Gold top accent */}
      <div className="h-[1px] bg-swing-gold/40" />

      <div className="mx-auto max-w-7xl px-4 py-1.5 sm:px-6">
        <div className="relative overflow-hidden" ref={scrollRef}>
          <div
            className={`flex whitespace-nowrap ${paused ? "[animation-play-state:paused]" : ""}`}
            style={{
              animation: `ticker ${Math.max(items.length * 8, 16)}s linear infinite`,
            }}
          >
            <span className="inline-block text-[12px] font-medium tracking-wide text-white/80 sm:text-[13px]">
              {tickerText}
              {separator}
              {tickerText}
              {separator}
            </span>
          </div>
        </div>
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-swing-navy to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-swing-navy to-transparent" />
    </div>
  );
}

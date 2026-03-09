"use client";

import { useState, useEffect } from "react";

interface ActionCountdownProps {
  actionEnd: string;
  label: string;
}

export default function ActionCountdown({ actionEnd, label }: ActionCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    function calc() {
      const diff = new Date(actionEnd).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [actionEnd]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-orange-700/70">
        {label}
      </span>
      <div className="flex gap-1">
        {timeLeft.days > 0 && (
          <span className="rounded bg-swing-navy/90 px-2 py-1 text-xs font-bold tabular-nums text-white">
            {timeLeft.days}<span className="ml-0.5 text-[10px] font-normal text-white/60">T</span>
          </span>
        )}
        <span className="rounded bg-swing-navy/90 px-2 py-1 text-xs font-bold tabular-nums text-white">
          {String(timeLeft.hours).padStart(2, "0")}<span className="ml-0.5 text-[10px] font-normal text-white/60">h</span>
        </span>
        <span className="rounded bg-swing-navy/90 px-2 py-1 text-xs font-bold tabular-nums text-white">
          {String(timeLeft.minutes).padStart(2, "0")}<span className="ml-0.5 text-[10px] font-normal text-white/60">m</span>
        </span>
        <span className="rounded bg-swing-navy/90 px-2 py-1 text-xs font-bold tabular-nums text-white">
          {String(timeLeft.seconds).padStart(2, "0")}<span className="ml-0.5 text-[10px] font-normal text-white/60">s</span>
        </span>
      </div>
    </div>
  );
}

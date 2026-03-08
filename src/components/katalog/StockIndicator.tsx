"use client";

import { useDict } from "@/lib/i18n/context";

export default function StockIndicator({ quantity }: { quantity: number }) {
  const dict = useDict();

  if (quantity > 10) {
    return (
      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        {dict.common.stock.available}
      </span>
    );
  }

  if (quantity > 0) {
    return (
      <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
        {dict.common.stock.low}
      </span>
    );
  }

  return (
    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
      {dict.common.stock.outOfStock}
    </span>
  );
}

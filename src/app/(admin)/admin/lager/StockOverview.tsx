"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Package,
  Palette,
} from "lucide-react";

interface ProductSize {
  id: string;
  size_label: string;
  sku: string;
  stock_quantity: number;
  sort_order: number;
}

interface ProductColor {
  id: string;
  color_name: string;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sizes: ProductSize[];
  colors: ProductColor[];
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) {
    return (
      <span className="inline-flex min-w-[52px] items-center justify-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {qty}
      </span>
    );
  }
  if (qty <= 10) {
    return (
      <span className="inline-flex min-w-[52px] items-center justify-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {qty}
      </span>
    );
  }
  return (
    <span className="inline-flex min-w-[52px] items-center justify-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      {qty}
    </span>
  );
}

export default function StockOverview({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = products;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sizes.some(
            (s) =>
              s.sku.toLowerCase().includes(q) ||
              s.size_label.toLowerCase().includes(q)
          ) ||
          p.colors.some((c) => c.color_name.toLowerCase().includes(q))
      );
    }

    // Filter
    if (filter === "out") {
      result = result.filter((p) =>
        p.sizes.some((s) => (s.stock_quantity ?? 0) === 0)
      );
    } else if (filter === "low") {
      result = result.filter((p) =>
        p.sizes.some(
          (s) => (s.stock_quantity ?? 0) > 0 && (s.stock_quantity ?? 0) <= 10
        )
      );
    }

    return result;
  }, [products, search, filter]);

  // Reset page when filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleFilterChange(value: "all" | "low" | "out") {
    setFilter(value);
    setPage(0);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(0);
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    if (expanded.size === filtered.length) {
      setExpanded(new Set());
    } else {
      setExpanded(new Set(filtered.map((p) => p.id)));
    }
  }

  return (
    <div className="glass-card overflow-hidden rounded">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-swing-gray/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-swing-navy">
            Alle Produkte
          </h2>
          <span className="rounded bg-swing-gray-light px-2.5 py-0.5 text-xs font-bold text-swing-gray-dark/60">
            {filtered.length} Produkte
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter buttons */}
          <div className="flex rounded border border-swing-gray/40 text-[11px]">
            <button
              onClick={() => handleFilterChange("all")}
              className={`cursor-pointer px-3 py-1.5 font-semibold transition-colors ${
                filter === "all"
                  ? "bg-swing-navy text-white"
                  : "text-swing-gray-dark/50 hover:bg-swing-gray-light"
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => handleFilterChange("low")}
              className={`cursor-pointer border-l border-swing-gray/40 px-3 py-1.5 font-semibold transition-colors ${
                filter === "low"
                  ? "bg-amber-500 text-white"
                  : "text-swing-gray-dark/50 hover:bg-swing-gray-light"
              }`}
            >
              Niedrig
            </button>
            <button
              onClick={() => handleFilterChange("out")}
              className={`cursor-pointer border-l border-swing-gray/40 px-3 py-1.5 font-semibold transition-colors ${
                filter === "out"
                  ? "bg-red-500 text-white"
                  : "text-swing-gray-dark/50 hover:bg-swing-gray-light"
              }`}
            >
              Ausverkauft
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-swing-gray-dark/30"
            />
            <input
              type="text"
              placeholder="Suche..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-8 w-full rounded border border-swing-gray/40 pl-8 pr-3 text-xs text-swing-navy outline-none transition-colors focus:border-swing-gold sm:w-44"
            />
          </div>

          {/* Expand/Collapse */}
          <button
            onClick={expandAll}
            className="cursor-pointer rounded border border-swing-gray/40 px-3 py-1.5 text-[11px] font-semibold text-swing-gray-dark/50 transition-colors hover:bg-swing-gray-light"
          >
            {expanded.size === filtered.length ? "Alle zuklappen" : "Alle aufklappen"}
          </button>
        </div>
      </div>

      {/* Product List */}
      <div>
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-swing-gray-dark/40">
            Keine Produkte gefunden.
          </div>
        ) : (
          paged.map((product) => {
            const isExpanded = expanded.has(product.id);
            const sizes = [...(product.sizes ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order
            );
            const colors = [...(product.colors ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order
            );
            const totalQty = sizes.reduce(
              (s, sz) => s + (sz.stock_quantity ?? 0),
              0
            );
            const hasOutOfStock = sizes.some(
              (s) => (s.stock_quantity ?? 0) === 0
            );
            const hasLowStock = sizes.some(
              (s) =>
                (s.stock_quantity ?? 0) > 0 && (s.stock_quantity ?? 0) <= 10
            );

            return (
              <div key={product.id} className="border-b border-swing-gray/15 last:border-b-0">
                {/* Product Header Row */}
                <button
                  onClick={() => toggleExpand(product.id)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-swing-gray-light/50 sm:px-6"
                >
                  {isExpanded ? (
                    <ChevronDown size={16} className="shrink-0 text-swing-navy/40" />
                  ) : (
                    <ChevronRight size={16} className="shrink-0 text-swing-navy/40" />
                  )}
                  <Package size={14} className="shrink-0 text-swing-navy/30" />
                  <span className="flex-1 text-sm font-bold text-swing-navy">
                    {product.name}
                  </span>

                  {/* Quick size badges */}
                  <div className="hidden items-center gap-1.5 sm:flex">
                    {sizes.map((sz) => (
                      <StockBadge key={sz.id} qty={sz.stock_quantity ?? 0} />
                    ))}
                  </div>

                  {/* Mobile: summary only */}
                  <div className="flex items-center gap-2 sm:hidden">
                    {hasOutOfStock && (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    )}
                    {hasLowStock && !hasOutOfStock && (
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                    )}
                    {!hasOutOfStock && !hasLowStock && (
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                    )}
                  </div>

                  <span className="ml-2 min-w-[48px] text-right text-xs font-semibold text-swing-gray-dark/40">
                    {totalQty} Stk.
                  </span>
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-swing-gray/10 bg-swing-gray-light/30 px-4 pb-4 pt-3 sm:px-6">
                    {colors.length > 0 ? (
                      <>
                        {/* Design × Size Matrix */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-[10px] uppercase tracking-wider text-swing-gray-dark/35">
                                <th className="pb-2 pl-7 text-left font-semibold">
                                  <span className="flex items-center gap-1.5">
                                    <Palette size={11} className="text-swing-gray-dark/30" />
                                    Design
                                  </span>
                                </th>
                                {sizes.map((sz) => (
                                  <th key={sz.id} className="pb-2 text-center font-semibold">
                                    {sz.size_label}
                                  </th>
                                ))}
                                <th className="pb-2 text-right font-semibold pr-1">
                                  Gesamt
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-swing-gray/15">
                              {colors.map((color) => (
                                <tr key={color.id}>
                                  <td className="py-2.5 pl-7">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-swing-navy">
                                      <span className="h-2.5 w-2.5 rounded-sm bg-swing-navy/15 ring-1 ring-swing-navy/10" />
                                      {color.color_name}
                                    </span>
                                  </td>
                                  {sizes.map((sz) => (
                                    <td key={sz.id} className="py-2.5 text-center">
                                      <StockBadge qty={sz.stock_quantity ?? 0} />
                                    </td>
                                  ))}
                                  <td className="py-2.5 text-right pr-1">
                                    <span className="text-xs font-bold tabular-nums text-swing-navy/50">
                                      {sizes.reduce((s, sz) => s + (sz.stock_quantity ?? 0), 0)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* SKU Reference */}
                        <div className="mt-3 border-t border-swing-gray/15 pt-3 pl-7">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-swing-gray-dark/25">
                            SKUs:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                            {sizes.map((sz) => (
                              <span key={sz.id} className="text-[11px] text-swing-gray-dark/40">
                                {sz.size_label}:{" "}
                                <span className="font-mono">{sz.sku}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      /* No designs — simple size table */
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-wider text-swing-gray-dark/35">
                            <th className="pb-2 pl-7 text-left font-semibold">
                              Größe
                            </th>
                            <th className="pb-2 text-left font-semibold">SKU</th>
                            <th className="pb-2 text-right font-semibold">
                              Bestand
                            </th>
                            <th className="pb-2 text-right font-semibold">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-swing-gray/15">
                          {sizes.map((sz) => (
                            <tr key={sz.id}>
                              <td className="py-2 pl-7 font-semibold text-swing-navy">
                                {sz.size_label}
                              </td>
                              <td className="py-2 font-mono text-xs text-swing-gray-dark/50">
                                {sz.sku}
                              </td>
                              <td className="py-2 text-right font-bold tabular-nums text-swing-navy">
                                {sz.stock_quantity ?? 0}
                              </td>
                              <td className="py-2 text-right">
                                <StockBadge qty={sz.stock_quantity ?? 0} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-swing-gray/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-swing-gray-dark/40">Anzeigen:</span>
            {[10, 20, 50].map((size) => (
              <button
                key={size}
                onClick={() => handlePageSizeChange(size)}
                className={`cursor-pointer rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                  pageSize === size
                    ? "bg-swing-navy text-white"
                    : "bg-swing-gray-light text-swing-gray-dark/50 hover:bg-swing-gray"
                }`}
              >
                {size}
              </button>
            ))}
            <span className="ml-2 text-xs text-swing-gray-dark/30">
              {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, filtered.length)} von {filtered.length}
            </span>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={safePage === 0}
              className="cursor-pointer rounded px-2 py-1 text-xs font-semibold text-swing-gray-dark/40 transition-colors hover:bg-swing-gray-light disabled:cursor-default disabled:opacity-30"
            >
              Erste
            </button>
            <button
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 0}
              className="cursor-pointer rounded p-1 text-swing-gray-dark/40 transition-colors hover:bg-swing-gray-light disabled:cursor-default disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-semibold text-swing-navy">
              {safePage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(safePage + 1)}
              disabled={safePage >= totalPages - 1}
              className="cursor-pointer rounded p-1 text-swing-gray-dark/40 transition-colors hover:bg-swing-gray-light disabled:cursor-default disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={safePage >= totalPages - 1}
              className="cursor-pointer rounded px-2 py-1 text-xs font-semibold text-swing-gray-dark/40 transition-colors hover:bg-swing-gray-light disabled:cursor-default disabled:opacity-30"
            >
              Letzte
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

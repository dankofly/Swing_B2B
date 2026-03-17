"use client";

import { useState, useMemo } from "react";
import { Save, Loader2, Check, AlertTriangle, Search } from "lucide-react";
import { saveCustomerPrices } from "@/lib/actions/prices";

interface SizeData {
  id: string;
  label: string;
  sku: string;
  stock: number;
  ek_netto: number | null;
  uvp_incl_vat: number | null;
}

interface ProductData {
  id: string;
  name: string;
  category: string;
  uvp_brutto: number | null;
  sizes: SizeData[];
}

export default function PriceEditor({
  companyId,
  products,
}: {
  companyId: string;
  products: ProductData[];
}) {
  // Editable prices: keyed by size id
  const [prices, setPrices] = useState<
    Record<string, { ek: string; uvp: string }>
  >(() => {
    const initial: Record<string, { ek: string; uvp: string }> = {};
    for (const p of products) {
      for (const s of p.sizes) {
        initial[s.id] = {
          ek: s.ek_netto != null ? String(s.ek_netto) : "",
          uvp: s.uvp_incl_vat != null ? String(s.uvp_incl_vat) : "",
        };
      }
    }
    return initial;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterMissing, setFilterMissing] = useState(false);

  // Track which fields were modified
  const [dirty, setDirty] = useState(false);

  function updatePrice(sizeId: string, field: "ek" | "uvp", value: string) {
    setPrices((prev) => ({
      ...prev,
      [sizeId]: { ...prev[sizeId], [field]: value },
    }));
    setDirty(true);
    setSaved(false);
  }

  // Count missing prices
  const missingCount = useMemo(() => {
    let count = 0;
    for (const p of products) {
      for (const s of p.sizes) {
        const val = prices[s.id]?.ek;
        if (!val || val === "" || val === "0") count++;
      }
    }
    return count;
  }, [prices, products]);

  // Filter products
  const filtered = useMemo(() => {
    let result = products;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sizes.some((s) => s.sku.toLowerCase().includes(q))
      );
    }

    if (filterMissing) {
      result = result.filter((p) =>
        p.sizes.some((s) => {
          const val = prices[s.id]?.ek;
          return !val || val === "" || val === "0";
        })
      );
    }

    return result;
  }, [products, search, filterMissing, prices]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, ProductData[]>();
    for (const p of filtered) {
      const cat = p.category || "Sonstige";
      const arr = map.get(cat) ?? [];
      arr.push(p);
      map.set(cat, arr);
    }
    return map;
  }, [filtered]);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const items = Object.entries(prices).map(([sizeId, vals]) => ({
        product_size_id: sizeId,
        ek_netto: vals.ek && parseFloat(vals.ek) > 0 ? parseFloat(vals.ek) : null,
        uvp_incl_vat: vals.uvp && parseFloat(vals.uvp) > 0 ? parseFloat(vals.uvp) : null,
      }));

      await saveCustomerPrices(companyId, items);
      setSaved(true);
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  const totalSizes = products.reduce((sum, p) => sum + p.sizes.length, 0);
  const filledCount = totalSizes - missingCount;

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-0 z-20 mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-swing-gray-dark/30" />
              <input
                type="text"
                placeholder="Produkt oder SKU suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-gray-200 py-2 pl-8 pr-3 text-xs focus:border-swing-gold focus:outline-none"
              />
            </div>
            <button
              onClick={() => setFilterMissing(!filterMissing)}
              className={`flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-2 text-[11px] font-semibold transition-colors ${
                filterMissing
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-swing-gray-dark/50 hover:bg-gray-200"
              }`}
            >
              <AlertTriangle size={11} />
              {missingCount} fehlen
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-swing-gray-dark/40">
              {filledCount}/{totalSizes} Preise
            </span>

            {error && (
              <span className="text-xs font-medium text-red-600">{error}</span>
            )}

            {saved && !dirty && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <Check size={14} />
                Gespeichert
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex cursor-pointer items-center gap-1.5 rounded bg-swing-gold px-4 py-2 text-xs font-bold text-swing-navy transition-colors hover:bg-swing-gold-dark disabled:opacity-40"
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save size={13} />
                  Preise speichern
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Price table */}
      {Array.from(grouped.entries()).map(([category, prods]) => (
        <div key={category} className="mb-6">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/30">
            {category}
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-gray-50 text-[10px] uppercase tracking-wider text-swing-gray-dark/40">
                <tr>
                  <th className="px-3 py-2.5">Produkt</th>
                  <th className="px-2 py-2.5">Größe</th>
                  <th className="px-2 py-2.5">SKU</th>
                  <th className="px-2 py-2.5 text-center">Lager</th>
                  <th className="px-2 py-2.5 text-right">UVP inkl. MwSt.</th>
                  <th className="px-2 py-2.5 text-right">Händler EK netto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prods.map((product) =>
                  product.sizes.map((size, idx) => {
                    const priceVal = prices[size.id];
                    const ekMissing = !priceVal?.ek || priceVal.ek === "" || priceVal.ek === "0";

                    return (
                      <tr
                        key={size.id}
                        className={`transition-colors hover:bg-gray-50/50 ${ekMissing ? "bg-red-50/30" : ""}`}
                      >
                        {idx === 0 && (
                          <td
                            className="px-3 py-1.5 font-medium text-swing-navy"
                            rowSpan={product.sizes.length}
                          >
                            {product.name}
                          </td>
                        )}
                        <td className="px-2 py-1.5 font-medium">{size.label}</td>
                        <td className="px-2 py-1.5 font-mono text-[10px] text-swing-gray-dark/40">
                          {size.sku}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${
                              size.stock > 10
                                ? "bg-green-400"
                                : size.stock > 0
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                            }`}
                            title={`${size.stock} Stk.`}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={priceVal?.uvp ?? ""}
                            onChange={(e) => updatePrice(size.id, "uvp", e.target.value)}
                            placeholder="—"
                            className="w-24 rounded border border-gray-200 px-1.5 py-1 text-right text-[11px] text-swing-gray-dark/60 focus:border-swing-gold focus:outline-none"
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {ekMissing && (
                              <AlertTriangle size={12} className="shrink-0 text-red-400" />
                            )}
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={priceVal?.ek ?? ""}
                              onChange={(e) => updatePrice(size.id, "ek", e.target.value)}
                              placeholder="—"
                              className={`w-24 rounded border px-1.5 py-1 text-right text-[11px] font-semibold focus:border-swing-gold focus:outline-none ${
                                ekMissing
                                  ? "border-red-300 bg-red-50 text-red-700"
                                  : "border-gray-200 text-swing-navy"
                              }`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-swing-gray-dark/30">
          Keine Produkte gefunden
        </div>
      )}
    </div>
  );
}

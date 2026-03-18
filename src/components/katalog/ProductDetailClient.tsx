"use client";

import { useState } from "react";
import { ShoppingCart, ChevronDown, Check, Palette, Layers } from "lucide-react";
import type { ProductSize, ProductColor } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";

interface ProductDetailClientProps {
  productId: string;
  productName: string;
  sizes: ProductSize[];
  colors: ProductColor[];
  priceMap: Record<string, number>;
  discountMap: Record<string, number>;
  uvpBrutto: number | null;
  stockMap: Record<string, number>;
}

function stockDot(quantity: number) {
  if (quantity > 10) return "bg-emerald-500 stock-dot-available";
  if (quantity > 0) return "bg-amber-500 stock-dot-available";
  return "bg-red-500";
}

export default function ProductDetailClient({
  productId,
  productName,
  sizes,
  colors,
  priceMap,
  discountMap,
  uvpBrutto,
  stockMap,
}: ProductDetailClientProps) {
  const { addItem } = useCart();
  const dict = useDict();
  const locale = useLocale();
  const dl = getDateLocale(locale);
  const t = dict.katalog.detail;
  const ts = dict.common.stock;

  function eur(value: number) {
    return value.toLocaleString(dl, { style: "currency", currency: "EUR" });
  }

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);

  function toggleColor(id: string) {
    setSelectedColor(selectedColor === id ? null : id);
    setQuantities({});
    setAdded(false);
  }

  function handleAddToCart() {
    if (!selectedColor) return;
    const colorName = colors.find((c) => c.id === selectedColor)?.color_name ?? "";
    let count = 0;
    for (const size of sizes) {
      const qty = quantities[size.id] ?? 0;
      if (qty > 0) {
        addItem({
          productId,
          productName,
          sizeId: size.id,
          sizeLabel: size.size_label,
          colorId: selectedColor,
          colorName,
          quantity: qty,
          unitPrice: priceMap[size.id] ?? null,
        });
        count++;
      }
    }
    if (count > 0) {
      setAdded(true);
      setQuantities({});
      setTimeout(() => setAdded(false), 2000);
    }
  }

  const selectedColorName = colors.find((c) => c.id === selectedColor)?.color_name ?? "";
  const hasEkPrices = Object.keys(priceMap).length > 0;
  const hasUvp = uvpBrutto != null;
  const hasPrices = hasEkPrices || hasUvp;
  const totalQty = Object.values(quantities).reduce((s, q) => s + q, 0);

  return (
    <div className="space-y-4">
      {/* Color selector */}
      {colors.length > 0 && (
        <div className="overflow-hidden card ">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-swing-navy text-white">
              <Palette size={18} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-swing-navy">{t.colorDesigns}</h3>
              <p className="text-[11px] text-swing-gray-dark/35">
                {selectedColor ? t.designSelected.replace("{name}", selectedColorName) : t.chooseDesign}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 px-4 py-4 sm:flex sm:flex-wrap sm:gap-3 sm:px-6 sm:py-5">
            {colors.map((color) => {
              const isActive = selectedColor === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => toggleColor(color.id)}
                  className={`group relative flex w-full cursor-pointer flex-col items-center overflow-hidden rounded-xl p-2 transition-all duration-200 sm:w-auto sm:max-w-32 sm:p-3 ${
                    isActive
                      ? "bg-swing-navy/4 ring-2 ring-swing-navy/20 shadow-md shadow-black/5"
                      : "bg-gray-50/60 hover:bg-gray-50 hover:shadow-sm"
                  }`}
                >
                  {/* Gold top accent when active */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-swing-gold" />
                  )}
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                    {color.color_image_url ? (
                      <img
                        src={color.color_image_url}
                        alt={color.color_name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-swing-gold/10 text-center text-[8px] font-bold uppercase leading-tight tracking-wider text-swing-gold-dark">
                        Coming<br />Soon
                      </div>
                    )}
                    {color.is_limited && (
                      <span className="badge-shimmer absolute bottom-0 left-0 right-0 bg-swing-gold/90 py-0.5 text-center text-[8px] font-bold uppercase tracking-wider text-swing-navy">
                        Limited
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-2.5 text-[10px] font-bold uppercase tracking-[0.08em] ${
                      isActive ? "text-swing-navy" : "text-swing-navy/40"
                    }`}
                  >
                    {color.color_name}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`mt-1 transition-transform duration-200 ${
                      isActive
                        ? "rotate-180 text-swing-gold"
                        : "text-swing-navy/15"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sizes & availability table */}
      {selectedColor && sizes.length > 0 && (
        <div key={selectedColor} className="overflow-hidden card fade-in-up">
          {/* Section header */}
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-swing-gold/10">
                <Layers size={18} className="text-swing-gold-dark" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-swing-navy">
                  {t.sizesAvailability}
                </h3>
                <p className="text-[11px] text-swing-gray-dark/35">
                  {t.designSizes.replace("{name}", selectedColorName).replace("{count}", String(sizes.length))}
                </p>
              </div>
            </div>
            {totalQty > 0 && (
              <span className="rounded-lg bg-swing-gold/10 px-3 py-1.5 text-[11px] font-bold tabular-nums text-swing-gold-dark">
                {t.piecesChosen.replace("{count}", String(totalQty))}
              </span>
            )}
          </div>

          {/* Price disclaimer */}
          {hasPrices && (
            <p className="px-4 pb-2 text-[10px] leading-relaxed text-swing-navy/30 sm:px-6">
              {t.priceDisclaimer}
            </p>
          )}

          {/* Sizes — cards on mobile, table on md+ */}
          <div className="border-t border-gray-100">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/60 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                    <th className="px-5 py-2.5 text-left">{t.size}</th>
                    <th className="px-5 py-2.5 text-left">{t.stock}</th>
                    <th className="px-5 py-2.5 text-left">{t.deliveryTime}</th>
                    {hasUvp && <th className="px-5 py-2.5 text-right">{t.listPrice}</th>}
                    {hasEkPrices && (
                      <>
                        <th className="px-5 py-2.5 text-right">{t.yourPrice}</th>
                        <th className="px-5 py-2.5 text-right">{t.discount}</th>
                      </>
                    )}
                    <th className="px-5 py-2.5 text-right">{t.quantity}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sizes.map((size) => {
                    const ekNetto = priceMap[size.id];
                    const rabatt = discountMap[size.id] ?? 0;
                    const stockKey = `${selectedColorName}::${size.size_label}`;
                    const stock = stockKey in stockMap ? stockMap[stockKey] : size.stock_quantity;
                    const qty = quantities[size.id] ?? 0;
                    return (
                      <tr key={size.id} className={`transition-colors duration-150 hover:bg-swing-gold/4 ${qty > 0 ? "bg-swing-gold/3" : ""}`}>
                        <td className="px-5 py-3.5"><span className="font-bold text-swing-navy">{size.size_label}</span></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${stockDot(stock)}`} />
                            <span className={stock > 0 && stock <= 10 ? "font-semibold text-amber-700" : "text-swing-navy/50"}>
                              {stock > 10 ? ts.available : stock > 0 ? ts.onlyXLeft.replace("{count}", String(stock)) : ts.outOfStock}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-swing-navy/35">
                          {stock > 0 ? ts.immediate : size.delivery_days > 0 ? ts.weeksDelivery.replace("{weeks}", String(Math.round(size.delivery_days / 7))) : ts.onRequest}
                        </td>
                        {hasUvp && <td className="px-5 py-3.5 text-right tabular-nums text-swing-navy/40">{eur(uvpBrutto!)}</td>}
                        {hasEkPrices && (
                          <>
                            <td className="px-5 py-3.5 text-right text-lg font-extrabold tabular-nums text-swing-navy">
                              {ekNetto != null ? eur(ekNetto) : <span className="text-sm text-swing-navy/30">{ts.onRequest}</span>}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {rabatt > 0 ? <span className="rounded-lg bg-swing-gold/15 px-2.5 py-1 text-[11px] font-bold tabular-nums text-swing-gold-dark">-{rabatt}%</span> : <span className="text-[11px] text-swing-navy/15">—</span>}
                            </td>
                          </>
                        )}
                        <td className="px-5 py-3.5 text-right">
                          <input type="number" min={0} value={qty} onChange={(e) => setQuantities((prev) => ({ ...prev, [size.id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                            aria-label={`${t.quantity} ${size.size_label}`}
                            className={`w-16 rounded-lg border bg-white px-2 py-1.5 text-center text-sm tabular-nums transition-all duration-200 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20 ${qty > 0 ? "border-swing-gold/40 font-bold text-swing-navy" : "border-gray-200 text-swing-navy/40"}`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card layout */}
            <div className="divide-y divide-gray-50 md:hidden">
              {sizes.map((size) => {
                const ekNetto = priceMap[size.id];
                const rabatt = discountMap[size.id] ?? 0;
                const stockKey = `${selectedColorName}::${size.size_label}`;
                const stock = stockKey in stockMap ? stockMap[stockKey] : size.stock_quantity;
                const qty = quantities[size.id] ?? 0;
                return (
                  <div key={size.id} className={`px-5 py-4 ${qty > 0 ? "bg-swing-gold/3" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-swing-navy">{size.size_label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${stockDot(stock)}`} />
                        <span className={`text-xs ${stock > 0 && stock <= 10 ? "font-semibold text-amber-700" : "text-swing-navy/50"}`}>
                          {stock > 10 ? ts.available : stock > 0 ? ts.onlyXLeft.replace("{count}", String(stock)) : ts.outOfStock}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-swing-navy/35">
                      {stock > 0 ? ts.immediate : size.delivery_days > 0 ? ts.weeksDelivery.replace("{weeks}", String(Math.round(size.delivery_days / 7))) : ts.onRequest}
                    </div>
                    {(hasUvp || hasEkPrices) && (
                      <div className="mt-2 flex items-baseline gap-3">
                        {hasUvp && <span className="text-xs tabular-nums text-swing-navy/35">{t.listPrice} {eur(uvpBrutto!)}</span>}
                        {hasEkPrices && (
                          <>
                            {ekNetto != null ? (
                              <span className="text-lg font-extrabold tabular-nums text-swing-navy">{eur(ekNetto)}</span>
                            ) : (
                              <span className="text-sm text-swing-navy/30">{ts.onRequest}</span>
                            )}
                            {rabatt > 0 && <span className="rounded bg-swing-gold/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-swing-gold-dark">-{rabatt}%</span>}
                          </>
                        )}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-end">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-swing-navy/30">{t.quantity}</span>
                        <input type="number" min={0} value={qty} onChange={(e) => setQuantities((prev) => ({ ...prev, [size.id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                          aria-label={`${t.quantity} ${size.size_label}`}
                          className={`w-16 rounded-lg border bg-white px-2 py-2 text-center text-sm tabular-nums transition-all duration-200 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20 ${qty > 0 ? "border-swing-gold/40 font-bold text-swing-navy" : "border-gray-200 text-swing-navy/40"}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer with total + CTA */}
          <div className="relative flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-swing-gold/40" />
            <div>
              {hasEkPrices && totalQty > 0 && (
                <div className="flex items-baseline gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                    {t.subtotal}
                  </span>
                  <span className="text-base font-extrabold tabular-nums text-swing-navy">
                    {eur(
                      sizes.reduce((sum, s) => {
                        const q = quantities[s.id] ?? 0;
                        const p = priceMap[s.id] ?? 0;
                        return sum + q * p;
                      }, 0)
                    )}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={totalQty === 0}
              className={`btn-gold group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-swing-gold px-6 py-3 text-sm font-bold text-swing-navy shadow-sm transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none disabled:hover:bg-swing-gold sm:w-auto sm:py-2.5 ${
                added ? "bounce-in bg-emerald-500! text-white! hover:bg-emerald-600!" : ""
              }`}
            >
              {added ? (
                <>
                  <Check size={16} className="animate-[bounceIn_0.3s_ease]" />
                  {t.added}
                </>
              ) : (
                <>
                  <ShoppingCart size={16} className="transition-transform duration-200 group-hover:scale-110" />
                  {t.addToCart}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, Save } from "lucide-react";
import { updateColorSizeStock } from "@/lib/actions/stock";
import { useDict } from "@/lib/i18n/context";

interface SizeInfo {
  size_label: string;
  stock_quantity: number;
}

interface ColorInfo {
  color_name: string;
  color_image_url: string | null;
}

interface StockMatrixClientProps {
  productId: string;
  sizes: SizeInfo[];
  colors: ColorInfo[];
  stockMap: Record<string, number>;
}

export default function StockMatrixClient({
  productId,
  sizes,
  colors,
  stockMap: initialStockMap,
}: StockMatrixClientProps) {
  const dict = useDict();
  const ts = dict.admin.stock;
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const color of colors) {
      for (const size of sizes) {
        const key = `${color.color_name}::${size.size_label}`;
        if (key in initialStockMap) {
          init[key] = String(initialStockMap[key]);
        } else {
          init[key] = "";
        }
      }
    }
    return init;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const stockData: Array<{
        color_name: string;
        size_label: string;
        stock_quantity: number;
      }> = [];

      for (const color of colors) {
        for (const size of sizes) {
          const key = `${color.color_name}::${size.size_label}`;
          const val = values[key];
          if (val !== "") {
            stockData.push({
              color_name: color.color_name,
              size_label: size.size_label,
              stock_quantity: Math.max(0, parseInt(val) || 0),
            });
          }
        }
      }

      await updateColorSizeStock(productId, stockData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : ts.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-[11px] uppercase tracking-widest text-swing-gray-dark/50">
              <tr>
                <th className="px-6 py-3 font-semibold">{ts.colorDesign}</th>
                {sizes.map((size) => (
                  <th key={size.size_label} className="px-4 py-3 text-center font-semibold">
                    {size.size_label}
                    <div className="mt-0.5 text-[9px] font-normal normal-case tracking-normal text-swing-gray-dark/30">
                      {ts.defaultStock}: {size.stock_quantity}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {colors.map((color) => (
                <tr key={color.color_name} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {color.color_image_url ? (
                        <img
                          src={color.color_image_url}
                          alt={color.color_name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-swing-gold text-[6px] font-bold uppercase text-swing-navy">
                          CS
                        </div>
                      )}
                      <span className="font-medium text-swing-navy">
                        {color.color_name}
                      </span>
                    </div>
                  </td>
                  {sizes.map((size) => {
                    const key = `${color.color_name}::${size.size_label}`;
                    return (
                      <td key={key} className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          value={values[key]}
                          placeholder={String(size.stock_quantity)}
                          onChange={(e) =>
                            setValues((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="w-16 rounded border border-gray-200 bg-white px-2 py-1.5 text-center text-sm transition-all duration-200 placeholder:text-swing-gray-dark/20 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-swing-gray-dark/40">
            {ts.emptyFieldsHint}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-swing-gold px-5 py-2.5 text-sm font-bold text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {saved ? (
              <>
                <Check size={16} />
                {ts.saved}
              </>
            ) : (
              <>
                <Save size={16} />
                {saving ? ts.saving : dict.common.buttons.save}
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { updateInquiryStatus } from "@/lib/actions/inquiries";
import { Clock, FileText } from "lucide-react";

const statusOptions = [
  { value: "new", label: "Eingang", color: "bg-blue-100 text-blue-700" },
  { value: "in_progress", label: "In Bearbeitung", color: "bg-yellow-100 text-yellow-700" },
  { value: "shipped", label: "Versand", color: "bg-purple-100 text-purple-700" },
  { value: "completed", label: "Erledigt", color: "bg-green-100 text-green-700" },
] as const;

function eur(value: number) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

export default function InquiryList({ inquiries }: { inquiries: any[] }) {
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleStatusChange(inquiryId: string, status: string) {
    setUpdating(inquiryId);
    try {
      await updateInquiryStatus(
        inquiryId,
        status as "new" | "in_progress" | "shipped" | "completed"
      );
    } catch (e) {
      alert("Fehler beim Aktualisieren des Status");
    } finally {
      setUpdating(null);
    }
  }

  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText size={48} className="mb-4 text-swing-gray-dark/20" />
        <p className="text-lg font-semibold text-swing-navy">
          Noch keine Anfragen eingegangen
        </p>
        <p className="text-sm text-swing-gray-dark/60">
          Anfragen erscheinen hier, sobald Händler Bestellungen aufgeben.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => {
        const status = statusOptions.find((s) => s.value === inquiry.status) ?? statusOptions[0];
        const totalItems = (inquiry.items ?? []).reduce(
          (sum: number, i: any) => sum + i.quantity,
          0
        );
        const totalPrice = (inquiry.items ?? []).reduce(
          (sum: number, i: any) => sum + Number(i.unit_price) * i.quantity,
          0
        );

        return (
          <div key={inquiry.id} className="glass-card overflow-hidden rounded">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-swing-gray/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-swing-navy">
                  #{inquiry.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-sm text-swing-gray-dark/60">
                  {(inquiry.company as any)?.name ?? "—"}
                </span>
                <span className="text-xs text-swing-gray-dark/40">
                  {(inquiry.user as any)?.full_name || (inquiry.user as any)?.email}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-swing-gray-dark/50">
                  <Clock size={12} />
                  {new Date(inquiry.created_at).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <select
                  value={inquiry.status}
                  onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                  disabled={updating === inquiry.id}
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${status.color} cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-swing-gold`}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-swing-gray/30 bg-swing-gray-light/50 text-[11px] uppercase tracking-widest text-swing-gray-dark/40">
                  <tr>
                    <th className="px-6 py-2 text-left">Produkt</th>
                    <th className="px-6 py-2 text-left">Größe</th>
                    <th className="px-6 py-2 text-left">SKU</th>
                    <th className="px-6 py-2 text-left">Farbe</th>
                    <th className="px-6 py-2 text-right">Menge</th>
                    <th className="px-6 py-2 text-right">EK netto</th>
                    <th className="px-6 py-2 text-right">Summe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-swing-gray/20">
                  {(inquiry.items ?? []).map((item: any) => (
                    <tr key={item.id} className="transition-colors duration-150 hover:bg-swing-gray-light/30">
                      <td className="px-6 py-3 font-semibold text-swing-navy">
                        {(item.product_size as any)?.product?.name ?? "—"}
                      </td>
                      <td className="px-6 py-3">
                        {(item.product_size as any)?.size_label ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-swing-gray-dark/50">
                        {(item.product_size as any)?.sku ?? "—"}
                      </td>
                      <td className="px-6 py-3">
                        {(item.product_color as any)?.color_name ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-right">{item.quantity}</td>
                      <td className="px-6 py-3 text-right text-swing-gray-dark/60">
                        {eur(Number(item.unit_price))}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold">
                        {eur(Number(item.unit_price) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-swing-gray/30 px-6 py-3 text-sm">
              <span className="text-swing-gray-dark/50">
                {totalItems} Artikel
              </span>
              {totalPrice > 0 && (
                <span className="font-bold text-swing-navy">
                  Gesamt: {eur(totalPrice)}
                </span>
              )}
            </div>

            {inquiry.notes && (
              <div className="border-t border-swing-gray/30 px-6 py-3 text-sm text-swing-gray-dark/50">
                <span className="font-medium">Anmerkung:</span> {inquiry.notes}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { updateInquiryStatus, updateInquiryTracking } from "@/lib/actions/inquiries";
import { ChevronDown, Clock, ExternalLink, FileText, Truck } from "lucide-react";
import Link from "next/link";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<Record<string, { carrier: string; trackingNumber: string }>>({});

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

  function getTracking(id: string) {
    return trackingData[id] ?? { carrier: "", trackingNumber: "" };
  }

  async function handleTrackingSave(inquiryId: string) {
    const { carrier, trackingNumber } = getTracking(inquiryId);
    if (!trackingNumber.trim()) return;
    setUpdating(inquiryId);
    try {
      await updateInquiryTracking(inquiryId, carrier.trim(), trackingNumber.trim());
    } catch (e) {
      alert("Fehler beim Speichern der Trackingnummer");
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

        const isExpanded = expandedId === inquiry.id;

        return (
          <div key={inquiry.id} className="glass-card overflow-hidden rounded">
            <div
              className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-swing-gray-light/30"
              onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
            >
              <div className="flex items-center gap-3">
                <ChevronDown
                  size={16}
                  className={`text-swing-gray-dark/40 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                />
                <span className="text-sm font-bold text-swing-navy">
                  {(inquiry.company as any)?.name ?? "—"}
                </span>
                <span className="text-xs text-swing-gray-dark/40">
                  {(inquiry.user as any)?.full_name || (inquiry.user as any)?.email}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-swing-gray-dark/50">
                  {totalItems} Artikel
                </span>
                {totalPrice > 0 && (
                  <span className="text-xs font-bold text-swing-navy">
                    {eur(totalPrice)}
                  </span>
                )}
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
                <span className={`inline-flex w-28 items-center justify-center rounded px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>

            {isExpanded && <>
            <div className="border-t border-swing-gray/30 px-6 py-3">
              <div className="flex items-center justify-between">
                <select
                  value={inquiry.status}
                  onChange={(e) => { e.stopPropagation(); handleStatusChange(inquiry.id, e.target.value); }}
                  disabled={updating === inquiry.id}
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${status.color} cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-swing-gold`}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {inquiry.company_id && (
                  <Link
                    href={`/admin/kunden/${inquiry.company_id}`}
                    className="flex items-center gap-1.5 rounded bg-swing-navy/5 px-3 py-1.5 text-xs font-semibold text-swing-navy transition-colors hover:bg-swing-navy/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={12} />
                    Alle Bestellungen dieses Kunden
                  </Link>
                )}
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

            {inquiry.notes && (
              <div className="border-t border-swing-gray/30 px-6 py-3 text-sm text-swing-gray-dark/50">
                <span className="font-medium">Anmerkung:</span> {inquiry.notes}
              </div>
            )}

            {inquiry.status === "shipped" && (
              <div className="flex flex-wrap items-end gap-3 border-t border-swing-gray/30 bg-purple-50/50 px-6 py-4">
                <Truck size={18} className="mb-1 text-purple-600" />
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-swing-gray-dark/40">
                    Versanddienstleister
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. DHL, DPD, UPS"
                    value={getTracking(inquiry.id).carrier}
                    onChange={(e) =>
                      setTrackingData((prev) => ({
                        ...prev,
                        [inquiry.id]: { ...getTracking(inquiry.id), carrier: e.target.value },
                      }))
                    }
                    className="rounded border border-swing-gray/50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-swing-gold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-swing-gray-dark/40">
                    Trackingnummer
                  </label>
                  <input
                    type="text"
                    placeholder="Sendungsnummer"
                    value={getTracking(inquiry.id).trackingNumber}
                    onChange={(e) =>
                      setTrackingData((prev) => ({
                        ...prev,
                        [inquiry.id]: { ...getTracking(inquiry.id), trackingNumber: e.target.value },
                      }))
                    }
                    className="rounded border border-swing-gray/50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-swing-gold"
                  />
                </div>
                <button
                  onClick={() => handleTrackingSave(inquiry.id)}
                  disabled={updating === inquiry.id || !getTracking(inquiry.id).trackingNumber.trim()}
                  className="rounded bg-swing-gold px-4 py-1.5 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50"
                >
                  {updating === inquiry.id ? "Speichern…" : "Versendet"}
                </button>
              </div>
            )}

            {inquiry.status === "completed" && inquiry.tracking_number && (
              <div className="flex items-center gap-2 border-t border-swing-gray/30 bg-green-50/50 px-6 py-3 text-sm text-green-700">
                <Truck size={14} />
                <span className="font-medium">{inquiry.shipping_carrier}:</span>
                <span>{inquiry.tracking_number}</span>
              </div>
            )}
            </>}
          </div>
        );
      })}
    </div>
  );
}

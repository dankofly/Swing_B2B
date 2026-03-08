"use client";

import { useState } from "react";
import { updateInquiryStatus, updateInquiryTracking } from "@/lib/actions/inquiries";
import { ChevronDown, Clock, ExternalLink, FileText, Settings, Truck } from "lucide-react";
import Link from "next/link";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";

export default function InquiryList({ inquiries }: { inquiries: any[] }) {
  const dict = useDict();
  const locale = useLocale();
  const dl = getDateLocale(locale);
  const ti = dict.admin.inquiries;
  const ts = dict.common.status;

  const statusOptions = [
    { value: "new", label: ts.new, color: "bg-blue-100 text-blue-700" },
    { value: "in_progress", label: ts.in_progress, color: "bg-yellow-100 text-yellow-700" },
    { value: "shipped", label: ts.shipped, color: "bg-purple-100 text-purple-700" },
    { value: "completed", label: ts.completed, color: "bg-green-100 text-green-700" },
  ] as const;

  function eur(value: number) {
    return value.toLocaleString(dl, { style: "currency", currency: "EUR" });
  }

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
      alert(ti.statusError);
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
      alert(ti.trackingError);
    } finally {
      setUpdating(null);
    }
  }

  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText size={48} className="mb-4 text-swing-gray-dark/20" />
        <p className="text-lg font-semibold text-swing-navy">{ti.noInquiries}</p>
        <p className="text-sm text-swing-gray-dark/60">{ti.noInquiriesHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => {
        const status = statusOptions.find((s) => s.value === inquiry.status) ?? statusOptions[0];
        const totalItems = (inquiry.items ?? []).reduce((sum: number, i: any) => sum + i.quantity, 0);
        const totalPrice = (inquiry.items ?? []).reduce((sum: number, i: any) => sum + Number(i.unit_price) * i.quantity, 0);
        const isExpanded = expandedId === inquiry.id;

        return (
          <div key={inquiry.id} className="glass-card overflow-hidden rounded">
            <div
              className="flex min-h-11 cursor-pointer flex-col gap-2 px-4 py-3 transition-colors hover:bg-swing-gray-light/30 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4"
              onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
            >
              <div className="flex items-center gap-3">
                <ChevronDown size={16} className={`shrink-0 text-swing-gray-dark/40 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                <div className="min-w-0">
                  <span className="block truncate text-sm font-bold text-swing-navy">{(inquiry.company as any)?.name ?? "—"}</span>
                  <span className="block truncate text-xs text-swing-gray-dark/40 sm:hidden">{(inquiry.user as any)?.full_name || (inquiry.user as any)?.email}</span>
                </div>
                <span className="hidden text-xs text-swing-gray-dark/40 sm:inline">{(inquiry.user as any)?.full_name || (inquiry.user as any)?.email}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-7 sm:gap-3 sm:pl-0">
                <div className="flex items-center gap-1 text-xs text-swing-gray-dark/50">
                  <Clock size={12} />
                  {new Date(inquiry.created_at).toLocaleDateString(dl, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
                <span className="text-xs font-medium text-swing-gray-dark/50">{totalItems} {ti.items}</span>
                {totalPrice > 0 && <span className="text-xs font-bold text-swing-navy">{eur(totalPrice)}</span>}
                <span className={`inline-flex items-center justify-center rounded py-0.5 text-[10px] font-semibold w-24 ${status.color}`}>{status.label}</span>
                {inquiry.company_id && (
                  <Link href={`/admin/kunden/${inquiry.company_id}?inquiry=${inquiry.id}`} onClick={(e) => e.stopPropagation()} className="hidden rounded-lg p-1.5 text-swing-gray-dark/30 transition-colors hover:bg-swing-navy/5 hover:text-swing-navy sm:block" title={ti.openAtCustomer}>
                    <Settings size={14} />
                  </Link>
                )}
              </div>
            </div>

            {isExpanded && <>
            <div className="border-t border-swing-gray/30 px-4 py-3 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <select value={inquiry.status} onChange={(e) => { e.stopPropagation(); handleStatusChange(inquiry.id, e.target.value); }} disabled={updating === inquiry.id} className={`rounded px-2.5 py-2 text-xs font-semibold ${status.color} cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-swing-gold sm:py-1`}>
                  {statusOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
                {inquiry.company_id && (
                  <Link href={`/admin/kunden/${inquiry.company_id}`} className="flex items-center justify-center gap-1.5 rounded bg-swing-navy/5 px-3 py-2 text-xs font-semibold text-swing-navy transition-colors hover:bg-swing-navy/10 sm:py-1.5" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink size={12} />
                    <span className="hidden sm:inline">{ti.allOrdersCustomer}</span>
                    <span className="sm:hidden">{ti.toCustomer}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-swing-gray/30 bg-swing-gray-light/50 text-[11px] uppercase tracking-widest text-swing-gray-dark/40">
                  <tr>
                    <th className="px-6 py-2 text-left">{ti.product}</th>
                    <th className="px-6 py-2 text-left">{ti.size}</th>
                    <th className="px-6 py-2 text-left">{ti.sku}</th>
                    <th className="px-6 py-2 text-left">{ti.color}</th>
                    <th className="px-6 py-2 text-right">{ti.quantity}</th>
                    <th className="px-6 py-2 text-right">{ti.priceNet}</th>
                    <th className="px-6 py-2 text-right">{ti.sum}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-swing-gray/20">
                  {(inquiry.items ?? []).map((item: any) => (
                    <tr key={item.id} className="transition-colors duration-150 hover:bg-swing-gray-light/30">
                      <td className="px-6 py-3 font-semibold text-swing-navy">{(item.product_size as any)?.product?.name ?? "—"}</td>
                      <td className="px-6 py-3">{(item.product_size as any)?.size_label ?? "—"}</td>
                      <td className="px-6 py-3 text-swing-gray-dark/50">{(item.product_size as any)?.sku ?? "—"}</td>
                      <td className="px-6 py-3">{(item.product_color as any)?.color_name ?? "—"}</td>
                      <td className="px-6 py-3 text-right">{item.quantity}</td>
                      <td className="px-6 py-3 text-right text-swing-gray-dark/60">{eur(Number(item.unit_price))}</td>
                      <td className="px-6 py-3 text-right font-semibold">{eur(Number(item.unit_price) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {inquiry.notes && (
              <div className="border-t border-swing-gray/30 px-6 py-3 text-sm text-swing-gray-dark/50">
                <span className="font-medium">{ti.note}</span> {inquiry.notes}
              </div>
            )}

            {inquiry.status === "shipped" && (
              <div className="flex flex-wrap items-end gap-3 border-t border-swing-gray/30 bg-purple-50/50 px-6 py-4">
                <Truck size={18} className="mb-1 text-purple-600" />
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-swing-gray-dark/40">{ti.carrier}</label>
                  <input type="text" placeholder={ti.carrierPlaceholder} value={getTracking(inquiry.id).carrier} onChange={(e) => setTrackingData((prev) => ({ ...prev, [inquiry.id]: { ...getTracking(inquiry.id), carrier: e.target.value } }))} className="rounded border border-swing-gray/50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-swing-gold" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-widest text-swing-gray-dark/40">{ti.trackingNumber}</label>
                  <input type="text" placeholder={ti.trackingPlaceholder} value={getTracking(inquiry.id).trackingNumber} onChange={(e) => setTrackingData((prev) => ({ ...prev, [inquiry.id]: { ...getTracking(inquiry.id), trackingNumber: e.target.value } }))} className="rounded border border-swing-gray/50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-swing-gold" />
                </div>
                <button onClick={() => handleTrackingSave(inquiry.id)} disabled={updating === inquiry.id || !getTracking(inquiry.id).trackingNumber.trim()} className="rounded bg-swing-gold px-4 py-1.5 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50">
                  {updating === inquiry.id ? ti.saving : ti.markShipped}
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

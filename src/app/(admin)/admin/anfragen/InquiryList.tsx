"use client";

import { useState } from "react";
import { updateInquiryStatus, updateInquiryTracking } from "@/lib/actions/inquiries";
import { ChevronRight, ExternalLink, FileText, Search, Settings, Truck } from "lucide-react";
import Link from "next/link";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";
import { useToast } from "@/components/ui/Toast";

interface InquiryProduct {
  name: string;
}

interface InquirySize {
  size_label: string;
  sku: string;
  product: InquiryProduct | null;
}

interface InquiryColor {
  color_name: string;
}

interface InquiryItem {
  id: string;
  quantity: number;
  unit_price: number;
  product_size: InquirySize | null;
  product_color: InquiryColor | null;
}

interface InquiryCompany {
  name: string;
}

interface InquiryUser {
  full_name: string | null;
  email: string;
}

interface Inquiry {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
  company_id: string;
  tracking_number: string | null;
  shipping_carrier: string | null;
  company: InquiryCompany | null;
  user: InquiryUser | null;
  items: InquiryItem[];
}

export default function InquiryList({ inquiries }: { inquiries: Inquiry[] }) {
  const dict = useDict();
  const locale = useLocale();
  const dl = getDateLocale(locale);
  const ti = dict.admin.inquiries;
  const ts = dict.common.status;
  const { toast } = useToast();

  const statusOptions = [
    { value: "new", label: ts.new, bg: "bg-blue-50", color: "text-blue-700" },
    { value: "in_progress", label: ts.in_progress, bg: "bg-amber-50", color: "text-amber-700" },
    { value: "shipped", label: ts.shipped, bg: "bg-purple-50", color: "text-purple-700" },
    { value: "completed", label: ts.completed, bg: "bg-emerald-50", color: "text-emerald-700" },
  ] as const;

  function eur(value: number) {
    return value.toLocaleString(dl, { style: "currency", currency: "EUR" });
  }

  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<Record<string, { carrier: string; trackingNumber: string }>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [inquiryList, setInquiryList] = useState(inquiries);

  async function handleStatusChange(inquiryId: string, status: string) {
    const previousStatus = inquiryList.find((i) => i.id === inquiryId)?.status;
    setUpdating(inquiryId);
    // Optimistic update
    setInquiryList((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, status } : i))
    );
    try {
      await updateInquiryStatus(
        inquiryId,
        status as "new" | "in_progress" | "shipped" | "completed"
      );
    } catch {
      // Rollback on error
      if (previousStatus) {
        setInquiryList((prev) =>
          prev.map((i) => (i.id === inquiryId ? { ...i, status: previousStatus } : i))
        );
      }
      toast(ti.statusError, "error");
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
    } catch {
      toast(ti.trackingError, "error");
    } finally {
      setUpdating(null);
    }
  }

  // Filter inquiries
  const filtered = inquiryList.filter((inq) => {
    const companyName = (inq.company?.name ?? "").toLowerCase();
    const matchesSearch = !search || companyName.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (inquiryList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
          <FileText size={22} className="text-swing-navy/12" />
        </div>
        <p className="text-sm font-medium text-swing-navy/40">{ti.noInquiries}</p>
        <p className="mt-1 text-xs text-swing-gray-dark/25">{ti.noInquiriesHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-swing-navy/25" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ti.searchCustomer}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-all focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20"
          />
        </div>
        <div className="flex items-center gap-2">
          {[
            { value: "all", label: ti.filterAll },
            ...statusOptions,
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === opt.value
                  ? "bg-swing-navy text-white"
                  : "bg-gray-100 text-swing-navy/50 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-swing-navy/30">
        {ti.countOf.replace("{filtered}", String(filtered.length)).replace("{total}", String(inquiryList.length))}
      </p>

      {filtered.length === 0 && search && (
        <p className="py-8 text-center text-sm text-swing-navy/30">
          {ti.noResults.replace("{search}", search)}
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((inquiry) => {
        const status = statusOptions.find((s) => s.value === inquiry.status) ?? statusOptions[0];
        const itemCount = inquiry.items.length;
        const totalPrice = inquiry.items.reduce((sum: number, i) => sum + Number(i.unit_price) * i.quantity, 0);
        const isExpanded = expandedId === inquiry.id;
        const companyName = inquiry.company?.name ?? "—";

        return (
          <div
            key={inquiry.id}
            className={`overflow-hidden rounded-lg border transition-all duration-200 ${
              isExpanded
                ? "border-swing-gold/30 shadow-md shadow-swing-gold/5"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            {/* Collapsed row */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
              className="flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 bg-white px-4 py-3 text-left transition-colors duration-150 hover:bg-gray-50/40 sm:flex-nowrap sm:gap-4 sm:px-5 sm:py-4"
            >
              {/* Company + Date */}
              <span className="shrink-0 text-sm font-bold text-swing-navy sm:w-52 sm:truncate">
                {companyName}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-swing-navy/40">
                {new Date(inquiry.created_at).toLocaleDateString(dl, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>

              {/* Spacer */}
              <span className="hidden flex-1 sm:block" />
              {/* Mobile spacer */}
              <span className="flex-1 sm:hidden" />

              {/* Count */}
              <span className="shrink-0 text-xs tabular-nums text-swing-navy/40">
                {itemCount} {ti.items}
              </span>

              {/* Price */}
              <span className="shrink-0 text-right text-sm font-extrabold tabular-nums text-swing-navy sm:w-28">
                {eur(totalPrice)}
              </span>

              {/* Status badge */}
              <span
                className={`shrink-0 rounded py-0.5 text-center text-[10px] font-bold w-24 ${status.bg} ${status.color}`}
              >
                {status.label}
              </span>

              {/* Customer link */}
              {inquiry.company_id && (
                <Link
                  href={`/admin/kunden/${inquiry.company_id}?inquiry=${inquiry.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hidden shrink-0 rounded-lg p-1.5 text-swing-navy/20 transition-colors hover:bg-swing-navy/5 hover:text-swing-navy sm:block"
                  title={ti.openAtCustomer}
                >
                  <Settings size={14} />
                </Link>
              )}

              {/* Chevron */}
              <ChevronRight
                size={14}
                className={`shrink-0 text-swing-navy/15 transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50/40">
                {/* Status control + link */}
                <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <select
                    value={inquiry.status}
                    onChange={(e) => { e.stopPropagation(); handleStatusChange(inquiry.id, e.target.value); }}
                    disabled={updating === inquiry.id}
                    className={`cursor-pointer rounded px-2.5 py-2 text-xs font-semibold ${status.bg} ${status.color} border-none focus:outline-none focus:ring-2 focus:ring-swing-gold sm:py-1.5`}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {inquiry.company_id && (
                    <Link
                      href={`/admin/kunden/${inquiry.company_id}`}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-swing-navy transition-colors hover:bg-swing-navy/5 sm:py-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                      <span className="hidden sm:inline">{ti.allOrdersCustomer}</span>
                      <span className="sm:hidden">{ti.toCustomer}</span>
                    </Link>
                  )}
                </div>

                {/* Items table */}
                <div className="px-3 pb-4 sm:px-5 sm:pb-5">
                  <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                          <th className="px-4 py-2.5 text-left">{ti.product}</th>
                          <th className="px-4 py-2.5 text-left">{ti.size}</th>
                          <th className="hidden px-4 py-2.5 text-left sm:table-cell">{ti.sku}</th>
                          <th className="hidden px-4 py-2.5 text-left sm:table-cell">{ti.color}</th>
                          <th className="px-4 py-2.5 text-right">{ti.quantity}</th>
                          <th className="hidden px-4 py-2.5 text-right sm:table-cell">{ti.priceNet}</th>
                          <th className="px-4 py-2.5 text-right">{ti.sum}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiry.items.map((item, i: number) => (
                          <tr
                            key={item.id}
                            className={i < inquiry.items.length - 1 ? "border-b border-gray-50" : ""}
                          >
                            <td className="px-4 py-3 font-semibold text-swing-navy">{item.product_size?.product?.name ?? "—"}</td>
                            <td className="px-4 py-3 text-swing-navy/40">{item.product_size?.size_label ?? "—"}</td>
                            <td className="hidden px-4 py-3 text-swing-navy/40 sm:table-cell">{item.product_size?.sku ?? "—"}</td>
                            <td className="hidden px-4 py-3 text-swing-navy/40 sm:table-cell">{item.product_color?.color_name ?? "—"}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-swing-navy">{item.quantity}</td>
                            <td className="hidden px-4 py-3 text-right tabular-nums text-swing-navy/40 sm:table-cell">{eur(Number(item.unit_price))}</td>
                            <td className="px-4 py-3 text-right font-semibold tabular-nums text-swing-navy">{eur(Number(item.unit_price) * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Total bar with gold accent */}
                    <div className="relative flex items-center justify-between border-t border-gray-100 px-4 py-3">
                      <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-swing-gold/40" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                        {ti.sum}
                      </span>
                      <span className="text-base font-extrabold tabular-nums text-swing-navy">
                        {eur(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {inquiry.notes && (
                    <div className="mt-3 rounded-lg border border-gray-100 bg-white px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                        {ti.note}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-swing-navy/50">
                        {inquiry.notes}
                      </p>
                    </div>
                  )}

                  {/* Tracking input — shipped status */}
                  {inquiry.status === "shipped" && (
                    <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-purple-100 bg-purple-50/40 px-4 py-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                        <Truck size={16} className="text-purple-600" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-purple-400">{ti.carrier}</label>
                        <input
                          type="text"
                          placeholder={ti.carrierPlaceholder}
                          value={getTracking(inquiry.id).carrier}
                          onChange={(e) => setTrackingData((prev) => ({ ...prev, [inquiry.id]: { ...getTracking(inquiry.id), carrier: e.target.value } }))}
                          className="rounded border border-purple-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-swing-gold"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-purple-400">{ti.trackingNumber}</label>
                        <input
                          type="text"
                          placeholder={ti.trackingPlaceholder}
                          value={getTracking(inquiry.id).trackingNumber}
                          onChange={(e) => setTrackingData((prev) => ({ ...prev, [inquiry.id]: { ...getTracking(inquiry.id), trackingNumber: e.target.value } }))}
                          className="rounded border border-purple-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-swing-gold"
                        />
                      </div>
                      <button
                        onClick={() => handleTrackingSave(inquiry.id)}
                        disabled={updating === inquiry.id || !getTracking(inquiry.id).trackingNumber.trim()}
                        className="rounded bg-swing-gold px-4 py-1.5 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50"
                      >
                        {updating === inquiry.id ? ti.saving : ti.markShipped}
                      </button>
                    </div>
                  )}

                  {/* Tracking display — completed status */}
                  {inquiry.status === "completed" && inquiry.tracking_number && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                        <Truck size={16} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-400">{dict.inquiries.tracking}</p>
                        <p className="mt-0.5 font-mono text-xs text-emerald-700">
                          {inquiry.shipping_carrier} &middot; {inquiry.tracking_number}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}

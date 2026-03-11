"use client";

import { useState, useRef, useEffect } from "react";
import { updateInquiryStatus, updateInquiryNotes, updateInquiryTracking } from "@/lib/actions/inquiries";
import {
  Inbox,
  Settings,
  Truck,
  CheckCircle,
  Package,
  ChevronRight,
  Copy,
  Check,
  Send,
} from "lucide-react";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";

type Status = "new" | "in_progress" | "shipped" | "completed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InquiryItem = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Inquiry = Record<string, any>;

export default function KanbanBoard({
  inquiries: initialInquiries,
}: {
  inquiries: Inquiry[];
}) {
  const dict = useDict();
  const locale = useLocale();
  const dl = getDateLocale(locale);
  const tk = dict.admin.kanban;

  const STEPS: { key: Status; label: string; icon: typeof Inbox; bg: string; text: string }[] = [
    { key: "new", label: tk.statusNew, icon: Inbox, bg: "bg-blue-100", text: "text-blue-700" },
    { key: "in_progress", label: tk.statusInProgress, icon: Settings, bg: "bg-amber-100", text: "text-amber-700" },
    { key: "shipped", label: tk.statusShipped, icon: Truck, bg: "bg-purple-100", text: "text-purple-700" },
    { key: "completed", label: tk.statusCompleted, icon: CheckCircle, bg: "bg-green-100", text: "text-green-700" },
  ];

  const STATUS_BADGE: Record<Status, { bg: string; text: string; label: string }> = {
    new: { bg: "bg-blue-100", text: "text-blue-700", label: tk.statusNew },
    in_progress: { bg: "bg-amber-100", text: "text-amber-700", label: tk.statusInProgress },
    shipped: { bg: "bg-purple-100", text: "text-purple-700", label: tk.statusShipped },
    completed: { bg: "bg-green-100", text: "text-green-700", label: tk.statusCompleted },
  };

  function eur(value: number) {
    return value.toLocaleString(dl, { style: "currency", currency: "EUR" });
  }

  const [inquiries, setInquiries] = useState(initialInquiries);
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("inquiry");
    }
    return null;
  });

  useEffect(() => {
    if (expandedId) {
      const el = document.getElementById(`inquiry-${expandedId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const notesTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const carrierInputs = useRef<Record<string, string>>({});
  const trackingInputs = useRef<Record<string, string>>({});

  function totalValue(items: InquiryItem[]) {
    return items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  }

  async function handleStatusChange(inquiryId: string, newStatus: Status) {
    const inquiry = inquiries.find((i) => i.id === inquiryId);
    if (!inquiry || inquiry.status === newStatus) return;

    setUpdatingId(inquiryId);

    // Optimistic update
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === inquiryId
          ? {
              ...i,
              status: newStatus,
              status_timestamps: {
                ...(i.status_timestamps ?? {}),
                [newStatus]: new Date().toISOString(),
              },
            }
          : i
      )
    );

    try {
      await updateInquiryStatus(inquiryId, newStatus);
    } catch {
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === inquiryId ? { ...i, status: inquiry.status } : i
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (inquiries.length === 0) {
    return (
      <div className="flex items-center justify-center rounded border border-dashed border-gray-200 bg-white p-12">
        <div className="text-center">
          <Package size={32} className="mx-auto mb-2 text-swing-navy/20" />
          <p className="text-sm font-medium text-swing-navy/40">{tk.noInquiries}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {inquiries.map((inquiry) => {
        const isExpanded = expandedId === inquiry.id;
        const badge = STATUS_BADGE[inquiry.status as Status];
        const currentStepIndex = STEPS.findIndex((s) => s.key === inquiry.status);

        return (
          <div
            key={inquiry.id}
            id={`inquiry-${inquiry.id}`}
            className={`overflow-hidden rounded-lg border transition-all duration-200 ${
              isExpanded
                ? "border-swing-gold/30 shadow-md shadow-swing-gold/5"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            {/* Row header — always visible */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
              className="flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 bg-white px-4 py-3 text-left transition-colors duration-150 hover:bg-gray-50/40 sm:flex-nowrap sm:gap-4 sm:px-5 sm:py-4"
            >
              {/* Date */}
              <span className="whitespace-nowrap text-sm font-bold text-swing-navy">
                {tk.inquiryFrom}{" "}
                {new Date(inquiry.created_at).toLocaleDateString(dl, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>

              {/* Count */}
              <span className="shrink-0 text-xs tabular-nums text-swing-navy/40">
                {inquiry.items.length} {tk.pos}
              </span>

              {/* Spacer */}
              <span className="hidden flex-1 sm:block" />

              {/* Tracking pill — only when completed */}
              {inquiry.status === "completed" && inquiry.shipping_carrier && inquiry.tracking_number && (
                <span className="hidden shrink-0 items-center gap-1.5 rounded bg-purple-50 px-2.5 py-1 text-[11px] font-medium text-purple-600 sm:flex">
                  <Truck size={12} />
                  {inquiry.shipping_carrier} {inquiry.tracking_number}
                  <span
                    role="button"
                    tabIndex={0}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded transition-colors hover:bg-purple-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(inquiry.tracking_number);
                      setCopiedId(inquiry.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        navigator.clipboard.writeText(inquiry.tracking_number);
                        setCopiedId(inquiry.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }
                    }}
                  >
                    {copiedId === inquiry.id ? (
                      <Check size={11} className="text-emerald-500" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </span>
                </span>
              )}

              {/* Mobile spacer */}
              <span className="flex-1 sm:hidden" />

              {/* Status badge */}
              <span className={`shrink-0 rounded py-0.5 text-center text-[10px] font-bold w-20 sm:w-24 ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>

              {/* Price */}
              <span className="shrink-0 text-right text-sm font-extrabold tabular-nums text-swing-navy sm:w-28">
                {eur(totalValue(inquiry.items))}
              </span>

              {/* Chevron */}
              <ChevronRight
                size={14}
                className={`shrink-0 text-swing-navy/15 transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50/40">
                {/* Status Kanban track */}
                <div className="mx-3 mt-4 mb-3 grid grid-cols-2 gap-1 rounded-lg bg-white p-1 sm:mx-5 sm:grid-cols-4">
                  {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = inquiry.status === step.key;
                    const isPast = idx < currentStepIndex;
                    const isUpdating = updatingId === inquiry.id;
                    const timestamps = inquiry.status_timestamps ?? {};
                    const timestamp = timestamps[step.key];

                    return (
                      <button
                        key={step.key}
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(inquiry.id, step.key)}
                        className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded px-2 py-2 transition-all sm:px-3 ${
                          isActive
                            ? `${step.bg} ${step.text} shadow-sm`
                            : isPast
                              ? "bg-white text-swing-navy/60 shadow-sm"
                              : "text-swing-navy/30 hover:bg-white hover:text-swing-navy/50"
                        } ${isUpdating ? "opacity-50" : "cursor-pointer"}`}
                      >
                        <span className="flex items-center gap-1 text-[11px] font-semibold sm:gap-1.5 sm:text-xs">
                          <Icon size={14} />
                          {step.label}
                        </span>
                        {timestamp && (
                          <span className="text-[9px] font-normal opacity-60 sm:text-[10px]">
                            {new Date(timestamp).toLocaleDateString(dl, {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Items table */}
                <div className="px-3 pb-4 sm:px-5 sm:pb-5">
                  <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                          <th className="px-4 py-2.5 text-left">{tk.product}</th>
                          <th className="px-4 py-2.5 text-left">{tk.size}</th>
                          <th className="px-4 py-2.5 text-right">{tk.quantity}</th>
                          <th className="hidden px-4 py-2.5 text-right sm:table-cell">{tk.unitPrice}</th>
                          <th className="px-4 py-2.5 text-right">{tk.total}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiry.items.map((item: InquiryItem, i: number) => (
                          <tr key={item.id} className={i < inquiry.items.length - 1 ? "border-b border-gray-50" : ""}>
                            <td className="px-4 py-3 font-semibold text-swing-navy">
                              {item.product_size?.product?.name || tk.product}
                            </td>
                            <td className="px-4 py-3 text-swing-navy/40">
                              {item.product_size?.size_label}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-swing-navy">
                              {item.quantity}
                            </td>
                            <td className="hidden px-4 py-3 text-right tabular-nums text-swing-navy/40 sm:table-cell">
                              {eur(Number(item.unit_price))}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold tabular-nums text-swing-navy">
                              {eur(item.quantity * item.unit_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Total bar with gold accent */}
                    <div className="relative flex items-center justify-between border-t border-gray-100 px-4 py-3">
                      <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-swing-gold/40" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                        {tk.sum}
                      </span>
                      <span className="text-base font-extrabold tabular-nums text-swing-navy">
                        {eur(totalValue(inquiry.items))}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-3 rounded-lg border border-gray-100 bg-white px-4 py-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                      {tk.note}
                    </label>
                    <input
                      type="text"
                      defaultValue={inquiry.notes ?? ""}
                      placeholder={tk.internalNotePlaceholder}
                      className="mt-1 w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs text-swing-navy placeholder:text-swing-navy/30 focus:border-swing-navy/30 focus:outline-none"
                      onChange={(e) => {
                        const val = e.target.value;
                        clearTimeout(notesTimers.current[inquiry.id]);
                        notesTimers.current[inquiry.id] = setTimeout(async () => {
                          setSavingField(`notes-${inquiry.id}`);
                          try {
                            await updateInquiryNotes(inquiry.id, val);
                            setInquiries((prev) =>
                              prev.map((i) => (i.id === inquiry.id ? { ...i, notes: val } : i))
                            );
                          } catch { /* silent */ }
                          setSavingField(null);
                        }, 800);
                      }}
                    />
                    {savingField === `notes-${inquiry.id}` && (
                      <span className="text-[10px] text-swing-navy/30">{tk.saving}</span>
                    )}
                  </div>

                  {/* Tracking input — shipped status */}
                  {inquiry.status === "shipped" && (
                    <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-purple-100 bg-purple-50/40 px-4 py-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                        <Truck size={16} className="text-purple-600" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-purple-400">{tk.service}</label>
                        <select
                          defaultValue={inquiry.shipping_carrier ?? ""}
                          className="rounded border border-purple-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-swing-gold"
                          onChange={(e) => { carrierInputs.current[inquiry.id] = e.target.value; }}
                        >
                          <option value="" disabled>{tk.service}</option>
                          <option value="DPD">DPD</option>
                          <option value="DHL">DHL</option>
                          <option value="UPS">UPS</option>
                          <option value="GLS">GLS</option>
                          <option value="FedEx">FedEx</option>
                          <option value="Post AT">Post AT</option>
                          <option value="Andere">{tk.other}</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-purple-400">{tk.trackingSection}</label>
                        <input
                          type="text"
                          defaultValue={inquiry.tracking_number ?? ""}
                          placeholder={tk.trackingPlaceholder}
                          className="rounded border border-purple-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-swing-gold"
                          onChange={(e) => { trackingInputs.current[inquiry.id] = e.target.value; }}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={savingField === `tracking-${inquiry.id}`}
                        className="rounded bg-swing-gold px-4 py-1.5 text-sm font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50"
                        onClick={async () => {
                          const carrier = carrierInputs.current[inquiry.id];
                          const number = trackingInputs.current[inquiry.id];
                          if (!carrier || !number) return;
                          setSavingField(`tracking-${inquiry.id}`);
                          try {
                            await updateInquiryTracking(inquiry.id, carrier, number);
                            setInquiries((prev) =>
                              prev.map((i) =>
                                i.id === inquiry.id
                                  ? {
                                      ...i,
                                      shipping_carrier: carrier,
                                      tracking_number: number,
                                      status: "completed",
                                      status_timestamps: {
                                        ...(i.status_timestamps ?? {}),
                                        completed: new Date().toISOString(),
                                      },
                                    }
                                  : i
                              )
                            );
                          } catch { /* silent */ }
                          setSavingField(null);
                        }}
                      >
                        <Send size={12} className="inline mr-1" />
                        {savingField === `tracking-${inquiry.id}` ? "..." : tk.ship}
                      </button>
                    </div>
                  )}

                  {/* Tracking display — completed status */}
                  {inquiry.status === "completed" && inquiry.tracking_number && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                        <Truck size={16} className="text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-400">{tk.trackingSection}</p>
                        <p className="mt-0.5 font-mono text-xs text-emerald-700">
                          {inquiry.shipping_carrier} &middot; {inquiry.tracking_number}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-emerald-400 transition-colors duration-150 hover:bg-emerald-100 hover:text-emerald-600"
                        onClick={() => {
                          navigator.clipboard.writeText(inquiry.tracking_number);
                          setCopiedId(inquiry.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                      >
                        {copiedId === inquiry.id ? (
                          <Check size={16} className="text-emerald-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

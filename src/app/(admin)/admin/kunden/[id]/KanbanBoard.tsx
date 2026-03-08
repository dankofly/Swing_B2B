"use client";

import { useState, useRef, useEffect } from "react";
import { updateInquiryStatus, updateInquiryNotes, updateInquiryTracking } from "@/lib/actions/inquiries";
import {
  Inbox,
  Settings,
  Truck,
  CheckCircle,
  Package,
  ChevronDown,
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
            className="rounded border border-gray-200 bg-white transition-shadow hover:shadow-sm"
          >
            {/* Row header — always visible */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedId(isExpanded ? null : inquiry.id); } }}
              className="flex w-full min-h-11 cursor-pointer flex-col gap-1.5 px-4 py-3 text-left sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-swing-navy/30 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
                <span className="min-w-0 shrink text-sm text-swing-navy">
                  {tk.inquiryFrom}{" "}
                  {new Date(inquiry.created_at).toLocaleDateString(dl, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pl-7 sm:flex-1 sm:justify-end sm:gap-3 sm:pl-0">
                {inquiry.status === "completed" && inquiry.shipping_carrier && inquiry.tracking_number && (
                  <span className="hidden items-center gap-1.5 text-[11px] text-swing-navy/50 sm:flex">
                    <Truck size={12} className="shrink-0" />
                    <span className="shrink-0 font-semibold">{inquiry.shipping_carrier}</span>
                    <span className="truncate font-mono">{inquiry.tracking_number}</span>
                    <button
                      type="button"
                      className="shrink-0 rounded p-0.5 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(inquiry.tracking_number);
                        setCopiedId(inquiry.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                    >
                      {copiedId === inquiry.id ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                    </button>
                  </span>
                )}

                <span className="text-xs text-swing-navy/40">
                  {inquiry.items.length} {tk.pos}
                </span>

                <span className="text-sm font-semibold text-swing-navy">
                  {eur(totalValue(inquiry.items))}
                </span>

                <span className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-[11px] font-semibold ${badge.bg} ${badge.text}`}>
                  {badge.label}
                </span>
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                {/* Status Kanban track */}
                <div className="mb-4 grid grid-cols-2 gap-1 rounded bg-gray-50 p-1 sm:grid-cols-4">
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
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-swing-navy/40">
                      <th className="pb-2 text-left">{tk.product}</th>
                      <th className="pb-2 text-left">{tk.size}</th>
                      <th className="pb-2 text-right">{tk.quantity}</th>
                      <th className="pb-2 text-right">{tk.unitPrice}</th>
                      <th className="pb-2 text-right">{tk.total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiry.items.map((item: InquiryItem) => (
                      <tr key={item.id} className="border-b border-gray-50">
                        <td className="py-1.5 text-swing-navy">
                          {item.product_size?.product?.name || tk.product}
                        </td>
                        <td className="py-1.5 text-swing-navy/60">
                          {item.product_size?.size_label}
                        </td>
                        <td className="py-1.5 text-right text-swing-navy">
                          {item.quantity}
                        </td>
                        <td className="py-1.5 text-right text-swing-navy/60">
                          {eur(Number(item.unit_price))}
                        </td>
                        <td className="py-1.5 text-right font-medium text-swing-navy">
                          {eur(item.quantity * item.unit_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td colSpan={4} className="pt-2 text-right text-xs font-bold uppercase tracking-widest text-swing-navy/40">
                        {tk.sum}
                      </td>
                      <td className="pt-2 text-right font-bold text-swing-navy">
                        {eur(totalValue(inquiry.items))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                </div>

                {/* Notes & Tracking */}
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-4">
                  {/* Notiz */}
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-swing-navy/40">
                      {tk.note}
                    </label>
                    <input
                      type="text"
                      defaultValue={inquiry.notes ?? ""}
                      placeholder={tk.internalNotePlaceholder}
                      className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs text-swing-navy placeholder:text-swing-navy/30 focus:border-swing-navy/30 focus:outline-none"
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

                  {/* Sendung — Eingabe nur bei "shipped", Anzeige nur bei "completed" */}
                  {inquiry.status === "shipped" && (
                    <div className="shrink-0">
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-swing-navy/40">
                        {tk.trackingSection}
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <select
                          defaultValue={inquiry.shipping_carrier ?? ""}
                          className="rounded border border-gray-200 px-2 py-2 text-xs text-swing-navy focus:border-swing-navy/30 focus:outline-none sm:py-1.5"
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
                        <input
                          type="text"
                          defaultValue={inquiry.tracking_number ?? ""}
                          placeholder={tk.trackingPlaceholder}
                          className="min-w-0 flex-1 rounded border border-gray-200 px-2.5 py-2 text-xs text-swing-navy placeholder:text-swing-navy/30 focus:border-swing-navy/30 focus:outline-none sm:w-48 sm:flex-none sm:py-1.5"
                          onChange={(e) => { trackingInputs.current[inquiry.id] = e.target.value; }}
                        />
                        <button
                          type="button"
                          disabled={savingField === `tracking-${inquiry.id}`}
                          className="flex items-center gap-1 rounded bg-swing-gold px-2.5 py-1.5 text-xs font-semibold text-swing-navy hover:bg-swing-gold-dark disabled:opacity-50"
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
                          <Send size={12} />
                          {savingField === `tracking-${inquiry.id}` ? "..." : tk.ship}
                        </button>
                      </div>
                    </div>
                  )}
                  {inquiry.status === "completed" && inquiry.tracking_number && (
                    <div className="shrink-0">
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-swing-navy/40">
                        {tk.trackingSection}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-green-50 px-2 py-1.5 text-xs font-semibold text-green-700">
                          {inquiry.shipping_carrier}
                        </span>
                        <span className="font-mono text-xs text-swing-navy">
                          {inquiry.tracking_number}
                        </span>
                        <button
                          type="button"
                          className="rounded p-1 text-swing-navy/30 hover:bg-gray-100 hover:text-swing-navy/60"
                          onClick={() => {
                            navigator.clipboard.writeText(inquiry.tracking_number);
                            setCopiedId(inquiry.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                        >
                          {copiedId === inquiry.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
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
  );
}

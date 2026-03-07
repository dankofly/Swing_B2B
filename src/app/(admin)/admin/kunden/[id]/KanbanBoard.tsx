"use client";

import { useState, useRef } from "react";
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

type Status = "new" | "in_progress" | "shipped" | "completed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InquiryItem = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Inquiry = Record<string, any>;

const STEPS: { key: Status; label: string; icon: typeof Inbox; bg: string; text: string }[] = [
  { key: "new", label: "Eingang", icon: Inbox, bg: "bg-blue-100", text: "text-blue-700" },
  { key: "in_progress", label: "In Bearbeitung", icon: Settings, bg: "bg-amber-100", text: "text-amber-700" },
  { key: "shipped", label: "Im Versand", icon: Truck, bg: "bg-purple-100", text: "text-purple-700" },
  { key: "completed", label: "Versendet", icon: CheckCircle, bg: "bg-green-100", text: "text-green-700" },
];

const STATUS_BADGE: Record<Status, { bg: string; text: string; label: string }> = {
  new: { bg: "bg-blue-100", text: "text-blue-700", label: "Eingang" },
  in_progress: { bg: "bg-amber-100", text: "text-amber-700", label: "In Bearbeitung" },
  shipped: { bg: "bg-purple-100", text: "text-purple-700", label: "Im Versand" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Versendet" },
};

export default function KanbanBoard({
  inquiries: initialInquiries,
}: {
  inquiries: Inquiry[];
}) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
          <p className="text-sm font-medium text-swing-navy/40">Keine Anfragen vorhanden</p>
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
            className="rounded border border-gray-200 bg-white transition-shadow hover:shadow-sm"
          >
            {/* Row header — always visible */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
              className="flex w-full items-center gap-4 px-4 py-3 text-left"
            >
              <ChevronDown
                size={16}
                className={`shrink-0 text-swing-navy/30 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />

              <span className="min-w-0 flex-1 text-sm text-swing-navy">
                Anfrage vom{" "}
                {new Date(inquiry.created_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                <span className="ml-2 text-swing-navy/40">
                  ({inquiry.items.length} Positionen)
                </span>
              </span>

              {inquiry.shipping_carrier && inquiry.tracking_number && (
                <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-swing-navy/50">
                  <Truck size={12} />
                  <span className="font-semibold">{inquiry.shipping_carrier}</span>
                  <span className="font-mono">{inquiry.tracking_number}</span>
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-gray-100"
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

              <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>

              <span className="w-24 shrink-0 text-right text-sm font-semibold text-swing-navy">
                {totalValue(inquiry.items).toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                {/* Status Kanban track */}
                <div className="mb-4 grid grid-cols-4 gap-1 rounded bg-gray-50 p-1">
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
                        className={`flex flex-col items-center justify-center gap-0.5 rounded px-3 py-2 transition-all ${
                          isActive
                            ? `${step.bg} ${step.text} shadow-sm`
                            : isPast
                              ? "bg-white text-swing-navy/60 shadow-sm"
                              : "text-swing-navy/30 hover:bg-white hover:text-swing-navy/50"
                        } ${isUpdating ? "opacity-50" : "cursor-pointer"}`}
                      >
                        <span className="flex items-center gap-1.5 text-xs font-semibold">
                          <Icon size={14} />
                          {step.label}
                        </span>
                        {timestamp && (
                          <span className="text-[10px] font-normal opacity-60">
                            {new Date(timestamp).toLocaleDateString("de-DE", {
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-swing-navy/40">
                      <th className="pb-2 text-left">Produkt</th>
                      <th className="pb-2 text-left">Größe</th>
                      <th className="pb-2 text-right">Menge</th>
                      <th className="pb-2 text-right">Stückpreis</th>
                      <th className="pb-2 text-right">Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiry.items.map((item: InquiryItem) => (
                      <tr key={item.id} className="border-b border-gray-50">
                        <td className="py-1.5 text-swing-navy">
                          {item.product_size?.product?.name || "Produkt"}
                        </td>
                        <td className="py-1.5 text-swing-navy/60">
                          {item.product_size?.size_label}
                        </td>
                        <td className="py-1.5 text-right text-swing-navy">
                          {item.quantity}
                        </td>
                        <td className="py-1.5 text-right text-swing-navy/60">
                          {Number(item.unit_price).toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </td>
                        <td className="py-1.5 text-right font-medium text-swing-navy">
                          {(item.quantity * item.unit_price).toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td colSpan={4} className="pt-2 text-right text-xs font-bold uppercase tracking-widest text-swing-navy/40">
                        Summe
                      </td>
                      <td className="pt-2 text-right font-bold text-swing-navy">
                        {totalValue(inquiry.items).toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Notes & Tracking */}
                <div className="mt-3 flex gap-4">
                  {/* Notiz */}
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-swing-navy/40">
                      Notiz
                    </label>
                    <input
                      type="text"
                      defaultValue={inquiry.notes ?? ""}
                      placeholder="Interne Notiz..."
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
                      <span className="text-[10px] text-swing-navy/30">Speichert...</span>
                    )}
                  </div>

                  {/* Sendung */}
                  <div className="shrink-0">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-swing-navy/40">
                      Sendungsverfolgung
                    </label>
                    {inquiry.tracking_number && inquiry.shipping_carrier ? (
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-purple-50 px-2 py-1.5 text-xs font-semibold text-purple-700">
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
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <select
                          defaultValue={inquiry.shipping_carrier ?? ""}
                          className="rounded border border-gray-200 px-2 py-1.5 text-xs text-swing-navy focus:border-swing-navy/30 focus:outline-none"
                          onChange={(e) => { carrierInputs.current[inquiry.id] = e.target.value; }}
                        >
                          <option value="" disabled>Dienst</option>
                          <option value="DPD">DPD</option>
                          <option value="DHL">DHL</option>
                          <option value="UPS">UPS</option>
                          <option value="GLS">GLS</option>
                          <option value="FedEx">FedEx</option>
                          <option value="Post AT">Post AT</option>
                          <option value="Andere">Andere</option>
                        </select>
                        <input
                          type="text"
                          defaultValue={inquiry.tracking_number ?? ""}
                          placeholder="Sendungsnummer..."
                          className="w-48 rounded border border-gray-200 px-2.5 py-1.5 text-xs text-swing-navy placeholder:text-swing-navy/30 focus:border-swing-navy/30 focus:outline-none"
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
                          {savingField === `tracking-${inquiry.id}` ? "..." : "Versenden"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

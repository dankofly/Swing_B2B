"use client";

import { useState } from "react";
import {
  Inbox,
  Settings,
  Truck,
  Package,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";

type Status = "new" | "in_progress" | "shipped" | "completed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InquiryItem = Record<string, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Inquiry = Record<string, any>;

const STATUS_COLORS: Record<Status, { color: string; bg: string }> = {
  new: { color: "text-blue-700", bg: "bg-blue-50" },
  in_progress: { color: "text-amber-700", bg: "bg-amber-50" },
  shipped: { color: "text-purple-700", bg: "bg-purple-50" },
  completed: { color: "text-emerald-700", bg: "bg-emerald-50" },
};

export default function InquiryBoard({
  inquiries,
}: {
  inquiries: Inquiry[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dict = useDict();
  const locale = useLocale();
  const dl = getDateLocale(locale);

  const statusLabels: Record<string, string> = dict.common.status as Record<string, string>;

  const STEPS: { key: Status; label: string; icon: typeof Inbox }[] = [
    { key: "new", label: statusLabels.new, icon: Inbox },
    { key: "in_progress", label: statusLabels.in_progress, icon: Settings },
    { key: "shipped", label: statusLabels.shipped, icon: Package },
    { key: "completed", label: statusLabels.completed, icon: Truck },
  ];

  function formatTimestamp(ts: string | undefined) {
    if (!ts) return null;
    const d = new Date(ts);
    return d.toLocaleDateString(dl, {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function totalValue(items: InquiryItem[]) {
    return items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  }

  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
          <Package size={22} className="text-swing-navy/10" />
        </div>
        <p className="text-sm font-medium text-swing-navy/40">{dict.inquiries.empty}</p>
        <p className="mt-1 text-xs text-swing-gray-dark/20">
          {dict.inquiries.emptyHint}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {inquiries.map((inquiry) => {
        const isExpanded = expandedId === inquiry.id;
        const sc = STATUS_COLORS[inquiry.status as Status] ?? STATUS_COLORS.new;
        const status = { label: statusLabels[inquiry.status] || inquiry.status, ...sc };
        const currentStepIndex = STEPS.findIndex((s) => s.key === inquiry.status);

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
              {/* Gold accent line when expanded */}
              {isExpanded && (
                <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-swing-gold" />
              )}

              {/* Date */}
              <span className="shrink-0 text-sm font-bold text-swing-navy sm:w-44">
                {new Date(inquiry.created_at).toLocaleDateString(dl, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {/* Count */}
              <span className="shrink-0 text-xs tabular-nums text-swing-navy/40 sm:w-28">
                {inquiry.items.length} {inquiry.items.length === 1 ? dict.inquiries.position : dict.inquiries.positions}
              </span>
              {/* Spacer — push right items on desktop */}
              <span className="hidden flex-1 sm:block" />

              {/* Tracking pill — only show when completed */}
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

              {/* Mobile spacer — push badge + value to right on second line */}
              <span className="flex-1 sm:hidden" />

              {/* Status badge */}
              <span
                className={`shrink-0 rounded py-0.5 text-[10px] font-bold text-center w-20 sm:w-24 ${status.bg} ${status.color}`}
              >
                {status.label}
              </span>

              {/* Value */}
              <span className="shrink-0 text-right text-sm font-extrabold tabular-nums text-swing-navy sm:w-28">
                {totalValue(inquiry.items).toLocaleString(dl, {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>

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
                {/* Flight-path stepper */}
                <div className="px-3 pt-4 pb-2 sm:px-6 sm:pt-6">
                  <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-0">
                    {STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const isActive = inquiry.status === step.key;
                      const isPast = idx < currentStepIndex;
                      const isDone = isPast || isActive;

                      return (
                        <div key={step.key} className="contents">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all sm:h-12 sm:w-12 ${
                                isActive && step.key === "completed"
                                  ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                                  : isActive
                                    ? "border-swing-gold bg-swing-gold text-swing-navy shadow-md shadow-swing-gold/25"
                                    : isPast
                                      ? "border-swing-navy/15 bg-swing-navy/5 text-swing-navy/50"
                                      : "border-gray-200 bg-white text-swing-navy/15"
                              }`}
                            >
                              <Icon size={16} className="sm:h-5 sm:w-5" />
                            </div>
                            <span
                              className={`mt-1.5 text-[9px] font-bold uppercase tracking-wider sm:mt-2 sm:text-[10px] ${
                                isActive
                                  ? "text-swing-navy"
                                  : isDone
                                    ? "text-swing-navy/40"
                                    : "text-swing-navy/15"
                              }`}
                            >
                              {step.label}
                            </span>
                            {isDone && inquiry.status_timestamps?.[step.key] && (
                              <span className="mt-0.5 text-[9px] tabular-nums text-swing-navy/30">
                                {formatTimestamp(inquiry.status_timestamps[step.key])}
                              </span>
                            )}
                          </div>
                          {/* Connector — gold when past */}
                          {idx < STEPS.length - 1 && (
                            <div className="mt-4 flex items-center self-start px-1 sm:mt-5 sm:px-2">
                              <div
                                className={`h-0.5 w-full min-w-6 rounded-full sm:min-w-10 ${
                                  idx < currentStepIndex
                                    ? "bg-swing-gold/30"
                                    : "bg-gray-200"
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items table */}
                <div className="px-3 pb-4 sm:px-5 sm:pb-5">
                  <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                          <th className="px-4 py-2.5 text-left">{dict.inquiries.product}</th>
                          <th className="px-4 py-2.5 text-left">{dict.inquiries.size}</th>
                          <th className="px-4 py-2.5 text-right">{dict.cart.quantity}</th>
                          <th className="hidden px-4 py-2.5 text-right sm:table-cell">
                            {dict.inquiries.unitPrice}
                          </th>
                          <th className="px-4 py-2.5 text-right">{dict.inquiries.total}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiry.items.map((item: InquiryItem, i: number) => (
                          <tr
                            key={item.id}
                            className={
                              i < inquiry.items.length - 1
                                ? "border-b border-gray-50"
                                : ""
                            }
                          >
                            <td className="px-4 py-3 font-semibold text-swing-navy">
                              {item.product_size?.product?.name || dict.inquiries.product}
                            </td>
                            <td className="px-4 py-3 text-swing-navy/40">
                              {item.product_size?.size_label}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-swing-navy">
                              {item.quantity}
                            </td>
                            <td className="hidden px-4 py-3 text-right tabular-nums text-swing-navy/40 sm:table-cell">
                              {Number(item.unit_price).toLocaleString(dl, {
                                style: "currency",
                                currency: "EUR",
                              })}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold tabular-nums text-swing-navy">
                              {(item.quantity * item.unit_price).toLocaleString(
                                dl,
                                {
                                  style: "currency",
                                  currency: "EUR",
                                }
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Total bar with gold accent */}
                    <div className="relative flex items-center justify-between border-t border-gray-100 px-4 py-3">
                      <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-swing-gold/40" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                        {dict.inquiries.sum}
                      </span>
                      <span className="text-base font-extrabold tabular-nums text-swing-navy">
                        {totalValue(inquiry.items).toLocaleString(dl, {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Tracking card — only show when completed */}
                  {inquiry.status === "completed" && inquiry.shipping_carrier && inquiry.tracking_number && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-purple-100 bg-purple-50/40 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                        <Truck size={16} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-purple-400">
                          {dict.inquiries.tracking}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-purple-700">
                          {inquiry.shipping_carrier} &middot;{" "}
                          {inquiry.tracking_number}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-purple-400 transition-colors duration-150 hover:bg-purple-100 hover:text-purple-600"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            inquiry.tracking_number
                          );
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

                  {/* Notes */}
                  {inquiry.notes && (
                    <div className="mt-3 rounded-lg border border-gray-100 bg-white px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                        {dict.inquiries.note}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-swing-navy/50">
                        {inquiry.notes}
                      </p>
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

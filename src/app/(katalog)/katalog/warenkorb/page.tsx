"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingCart, Send, ArrowLeft, FileText } from "lucide-react";
import { useCart } from "@/lib/cart";
import { submitInquiry } from "@/lib/actions/inquiries";
import { useRouter } from "next/navigation";

function eur(value: number) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

export default function WarenkorbPage() {
  const { items, removeItem, updateQuantity, clearCart, itemCount } = useCart();
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    if (items.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitInquiry(
        items.map((i) => ({
          sizeId: i.sizeId,
          colorId: i.colorId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        notes
      );
      clearCart();
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Absenden");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="dash-hero rounded-xl px-8 py-9">
          <div className="relative z-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Bestellung
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Anfrage gesendet
            </h1>
          </div>
        </div>

        <div className="card bounce-in p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <Send size={28} className="text-emerald-600" />
          </div>
          <h2 className="mb-2 text-xl font-extrabold text-swing-navy">
            Erfolgreich übermittelt
          </h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-swing-gray-dark/50">
            Ihre Bestellanfrage wurde an das SWING-Vertriebsteam gesendet.
            Sie erhalten eine Bestätigung per E-Mail.
          </p>

          <div className="mx-auto mt-6 max-w-xs rounded-lg bg-gray-50 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
              Was passiert jetzt?
            </p>
            <ul className="mt-2 space-y-1.5 text-left text-xs text-swing-gray-dark/50">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-swing-gold" />
                Prüfung durch unser Vertriebsteam
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-swing-gold" />
                Angebot per E-Mail innerhalb von 1–2 Werktagen
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-swing-gold" />
                Status jederzeit unter &quot;Anfragen&quot; einsehbar
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/katalog/anfragen"
              className="btn-gold inline-flex items-center gap-2 rounded-lg bg-swing-gold px-6 py-2.5 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20"
            >
              Zu meinen Anfragen
              <ArrowLeft size={14} className="rotate-180" />
            </Link>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-swing-navy/40 transition-colors hover:text-swing-navy"
            >
              <ArrowLeft size={14} />
              Weiter einkaufen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="dash-hero rounded-xl px-8 py-9">
          <div className="relative z-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Bestellung
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Warenkorb
            </h1>
          </div>
        </div>

        <div className="card py-20 text-center ">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
            <ShoppingCart size={24} className="text-swing-navy/20" />
          </div>
          <p className="text-[15px] font-bold text-swing-navy/40">
            Ihr Warenkorb ist leer
          </p>
          <p className="mt-1 text-sm text-swing-gray-dark/40">
            Fügen Sie Produkte aus dem Katalog hinzu.
          </p>
          <Link
            href="/katalog"
            className="mt-5 inline-block rounded-lg bg-swing-gold px-6 py-2.5 text-sm font-bold tracking-wide text-swing-navy transition-all duration-200 hover:bg-swing-gold-dark"
          >
            Zum Katalog
          </Link>
        </div>
      </div>
    );
  }

  // Group items by product
  const grouped = items.reduce<
    Record<string, typeof items>
  >((acc, item) => {
    const key = `${item.productId}-${item.colorId}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const total = items.reduce(
    (sum, i) => sum + (i.unitPrice ?? 0) * i.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Bestellung
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Warenkorb
            </h1>
            <p className="mt-1.5 text-sm text-white/40 tabular-nums">
              {itemCount} {itemCount === 1 ? "Artikel" : "Artikel"}
            </p>
          </div>
          <Link
            href="/katalog"
            className="hidden items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white sm:inline-flex"
          >
            <ArrowLeft size={14} />
            Zurück zum Katalog
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        {/* Cart items */}
        <div className="space-y-4">
          {Object.entries(grouped).map(([key, groupItems]) => (
            <div key={key} className="overflow-hidden card">
              <div className="border-b border-gray-50 px-5 py-3.5 sm:px-6">
                <h3 className="text-[15px] font-bold text-swing-navy">
                  {groupItems[0].productName}{" "}
                  <span className="font-normal text-swing-gray-dark/40">
                    — {groupItems[0].colorName}
                  </span>
                </h3>
              </div>

              {/* Desktop table */}
              <table className="hidden w-full text-sm sm:table">
                <thead>
                  <tr className="bg-gray-50/60 text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
                    <th className="px-6 py-2.5 text-left">Größe</th>
                    <th className="px-6 py-2.5 text-right">EK netto</th>
                    <th className="px-6 py-2.5 text-right">Menge</th>
                    <th className="px-6 py-2.5 text-right">Summe</th>
                    <th className="px-6 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {groupItems.map((item) => (
                    <tr key={`${item.sizeId}-${item.colorId}`} className="hover:bg-swing-gold/4 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-swing-navy">{item.sizeLabel}</td>
                      <td className="px-6 py-3.5 text-right text-swing-gray-dark/50 tabular-nums">{item.unitPrice != null ? eur(item.unitPrice) : "—"}</td>
                      <td className="px-6 py-3.5 text-right">
                        <input type="number" min={1} value={item.quantity} onChange={(e) => updateQuantity(item.sizeId, item.colorId, parseInt(e.target.value) || 0)}
                          className="w-16 rounded-lg border border-gray-150 bg-white px-2 py-1.5 text-center text-sm tabular-nums transition-all duration-200 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20" />
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold text-swing-navy tabular-nums">{item.unitPrice != null ? eur(item.unitPrice * item.quantity) : "—"}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button onClick={() => removeItem(item.sizeId, item.colorId)} className="cursor-pointer p-1 text-swing-navy/15 transition-colors duration-200 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile card layout */}
              <div className="divide-y divide-gray-50 sm:hidden">
                {groupItems.map((item) => (
                  <div key={`${item.sizeId}-${item.colorId}`} className="px-5 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-swing-navy">{item.sizeLabel}</span>
                      <button onClick={() => removeItem(item.sizeId, item.colorId)} className="cursor-pointer p-2 text-swing-navy/20 transition-colors hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                    <div className="mt-1 flex items-baseline gap-3">
                      {item.unitPrice != null && <span className="text-sm font-semibold tabular-nums text-swing-navy">{eur(item.unitPrice * item.quantity)}</span>}
                      {item.unitPrice != null && <span className="text-xs tabular-nums text-swing-gray-dark/40">({eur(item.unitPrice)} × {item.quantity})</span>}
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-swing-navy/30">Menge</span>
                      <input type="number" min={1} value={item.quantity} onChange={(e) => updateQuantity(item.sizeId, item.colorId, parseInt(e.target.value) || 0)}
                        className="w-16 rounded-lg border border-gray-150 bg-white px-2 py-2 text-center text-sm tabular-nums transition-all duration-200 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary sidebar */}
        <div className="sticky top-24 h-fit card border-t-[3px] border-t-swing-gold p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-swing-gold/10">
              <FileText size={18} className="text-swing-gold-dark" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-swing-navy">
                Bestellanfrage
              </h3>
              <p className="text-[11px] text-swing-gray-dark/35">
                Unverbindliche Anfrage
              </p>
            </div>
          </div>

          <div className="mb-5 space-y-2.5 border-b border-gray-50 pb-5 text-sm">
            <div className="flex justify-between">
              <span className="text-swing-navy/40">Positionen</span>
              <span className="font-semibold tabular-nums">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-swing-navy/40">Gesamtmenge</span>
              <span className="font-semibold tabular-nums">{itemCount}</span>
            </div>
            {total > 0 && (
              <div className="flex justify-between pt-2 text-base">
                <span className="font-bold text-swing-navy">
                  Gesamt netto
                </span>
                <span className="font-bold text-swing-navy tabular-nums">{eur(total)}</span>
              </div>
            )}
          </div>

          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-swing-navy/40">
            Anmerkungen (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="z.B. gewünschter Liefertermin..."
            className="mb-5 w-full rounded-lg border border-gray-150 bg-white px-3 py-2.5 text-sm transition-all duration-200 focus:border-swing-gold focus:outline-none focus:ring-2 focus:ring-swing-gold/20"
          />

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-gold group flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-swing-gold px-6 py-3 text-sm font-bold tracking-wide text-swing-navy shadow-sm transition-all duration-200 hover:bg-swing-gold-dark hover:shadow-lg hover:shadow-swing-gold/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
          >
            <Send size={16} />
            {submitting ? "Wird gesendet..." : "Anfrage absenden"}
          </button>

          <p className="mt-3 text-center text-[11px] text-swing-navy/40">
            Dies ist eine unverbindliche Bestellanfrage, kein Kaufvertrag.
          </p>
        </div>
      </div>
    </div>
  );
}

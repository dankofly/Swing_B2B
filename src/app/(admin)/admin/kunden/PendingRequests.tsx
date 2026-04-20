"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  CheckCircle,
  XCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useDict, useLocale } from "@/lib/i18n/context";
import { getDateLocale } from "@/lib/i18n/shared";
import { toggleCompanyApproval, deleteCompany } from "@/lib/actions/customers";
import { useToast } from "@/components/ui/Toast";

interface PendingCompany {
  id: string;
  name: string;
  contact_email: string;
  phone: string | null;
  address: string | null;
  is_approved: boolean;
  created_at: string;
  company_type: string | null;
  contact_person: string | null;
  vat_id: string | null;
  profiles: Array<{
    id: string;
    email: string;
    full_name: string | null;
    role: string;
  }>;
}

export default function PendingRequests({
  requests,
}: {
  requests: PendingCompany[];
}) {
  const dict = useDict();
  const t = dict.pendingRequests;
  const locale = useLocale();
  const dl = getDateLocale(locale);
  const router = useRouter();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(requests.length <= 3 ? requests.map((r) => r.id) : [])
  );

  const companyTypes: Record<string, string> = {
    dealer: dict.common.companyTypes.dealer,
    importer: dict.common.companyTypes.importer,
    importer_network: dict.common.companyTypes.importer_network,
    customer: dict.common.companyTypes.customer,
  };

  async function handleApprove(companyId: string) {
    setUpdating(companyId);
    try {
      const result = await toggleCompanyApproval(companyId, true);
      if (!result.success) {
        toast(result.error || t.approveError, "error");
      }
    } catch {
      toast(t.approveError, "error");
    } finally {
      setUpdating(null);
      router.refresh();
    }
  }

  async function handleReject(companyId: string) {
    setUpdating(companyId);
    try {
      const result = await deleteCompany(companyId);
      if (!result.success) {
        toast(result.error || t.rejectError, "error");
      }
    } catch {
      toast(t.rejectError, "error");
    } finally {
      setUpdating(null);
      router.refresh();
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function timeAgo(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffH < 1) return t.justNow;
    if (diffH < 24) return t.hoursAgo.replace("{n}", String(diffH));
    if (diffD === 1) return t.yesterday;
    return t.daysAgo.replace("{n}", String(diffD));
  }

  return (
    <div className="overflow-hidden rounded border-2 border-swing-gold/30 bg-swing-gold/5">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-swing-gold/20 bg-swing-gold/10 px-4 py-3 sm:px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-swing-gold/20">
          <UserPlus size={16} className="text-swing-gold-dark" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-swing-navy">
            {t.title}
          </h2>
          <p className="text-[11px] text-swing-navy/50">
            {requests.length}{" "}
            {requests.length === 1
              ? t.singularWaiting
              : t.pluralWaiting}
          </p>
        </div>
      </div>

      {/* Request Cards */}
      <div className="divide-y divide-swing-gold/15">
        {requests.map((req) => {
          const isExpanded = expanded.has(req.id);
          const profile = req.profiles[0];

          return (
            <div key={req.id} className="bg-white/50">
              {/* Collapsed Row */}
              <button
                onClick={() => toggleExpand(req.id)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-swing-gold/5 sm:px-6"
              >
                {isExpanded ? (
                  <ChevronDown
                    size={14}
                    className="shrink-0 text-swing-navy/30"
                  />
                ) : (
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-swing-navy/30"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-swing-navy truncate">
                      {req.name}
                    </span>
                    {req.company_type && (
                      <span className="hidden rounded bg-swing-navy/8 px-2 py-0.5 text-[10px] font-semibold text-swing-navy/60 sm:inline">
                        {companyTypes[req.company_type] || req.company_type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-swing-navy/40 truncate">
                    {req.contact_person || profile?.full_name || req.contact_email}
                    {" · "}
                    {timeAgo(req.created_at)}
                  </p>
                </div>

                {/* Quick Actions (stop propagation) */}
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={updating === req.id}
                    className="flex h-9 cursor-pointer items-center gap-1.5 rounded bg-emerald-500 px-3 text-xs font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50 sm:px-4"
                  >
                    <CheckCircle size={14} />
                    <span className="hidden sm:inline">{t.approve}</span>
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={updating === req.id}
                    className="flex h-9 cursor-pointer items-center gap-1.5 rounded bg-red-50 px-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    <span className="hidden sm:inline">{t.reject}</span>
                  </button>
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-swing-gold/10 bg-white/80 px-4 pb-4 pt-3 sm:px-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Company Info */}
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2">
                        <Building2
                          size={13}
                          className="mt-0.5 shrink-0 text-swing-navy/30"
                        />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-swing-navy/30">
                            {t.company}
                          </p>
                          <p className="text-sm font-semibold text-swing-navy">
                            {req.name}
                          </p>
                          {req.company_type && (
                            <p className="text-xs text-swing-navy/50">
                              {companyTypes[req.company_type] || req.company_type}
                            </p>
                          )}
                          {req.vat_id && (
                            <p className="mt-0.5 font-mono text-xs text-swing-navy/40">
                              USt-ID: {req.vat_id}
                            </p>
                          )}
                        </div>
                      </div>

                      {req.address && (
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={13}
                            className="mt-0.5 shrink-0 text-swing-navy/30"
                          />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-swing-navy/30">
                              {t.address}
                            </p>
                            <p className="text-sm text-swing-navy/70">
                              {req.address}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2">
                        <Mail
                          size={13}
                          className="mt-0.5 shrink-0 text-swing-navy/30"
                        />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-swing-navy/30">
                            {t.contact}
                          </p>
                          {req.contact_person && (
                            <p className="text-sm font-semibold text-swing-navy">
                              {req.contact_person}
                            </p>
                          )}
                          {profile?.full_name &&
                            profile.full_name !== req.contact_person && (
                              <p className="text-sm text-swing-navy">
                                {profile.full_name}
                              </p>
                            )}
                          <a
                            href={`mailto:${req.contact_email}`}
                            className="text-sm text-swing-navy/70 hover:text-swing-gold-dark"
                          >
                            {req.contact_email}
                          </a>
                        </div>
                      </div>

                      {req.phone && (
                        <div className="flex items-start gap-2">
                          <Phone
                            size={13}
                            className="mt-0.5 shrink-0 text-swing-navy/30"
                          />
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-swing-navy/30">
                              {t.phone}
                            </p>
                            <a
                              href={`tel:${req.phone}`}
                              className="text-sm text-swing-navy/70 hover:text-swing-gold-dark"
                            >
                              {req.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <Clock
                          size={13}
                          className="mt-0.5 shrink-0 text-swing-navy/30"
                        />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-swing-navy/30">
                            {t.registeredAt}
                          </p>
                          <p className="text-sm text-swing-navy/70">
                            {new Date(req.created_at).toLocaleDateString(dl, {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Link to full detail */}
                  <div className="mt-3 border-t border-swing-gray/15 pt-3">
                    <Link
                      href={`/admin/kunden/${req.id}`}
                      className="text-xs font-semibold text-swing-navy/40 transition-colors hover:text-swing-gold-dark"
                    >
                      {t.viewFullProfile}
                    </Link>
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

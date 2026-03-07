"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, CheckCircle, XCircle, Search, Plus } from "lucide-react";
import DeleteCompanyButton from "./DeleteCompanyButton";

interface Company {
  id: string;
  name: string;
  contact_email: string;
  phone: string | null;
  address: string | null;
  is_approved: boolean;
  created_at: string;
  profiles: Array<{
    id: string;
    email: string;
    full_name: string | null;
    role: string;
  }>;
}

export default function KundenList({ companies }: { companies: Company[] }) {
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  async function toggleApproval(companyId: string, approved: boolean) {
    setUpdating(companyId);
    const supabase = createClient();
    await supabase
      .from("companies")
      .update({ is_approved: !approved })
      .eq("id", companyId);
    setUpdating(null);
    router.refresh();
  }

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-swing-gray-dark/30"
          />
          <input
            type="text"
            placeholder="Kunde suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-swing-gray bg-white/80 py-2.5 pl-9 pr-3 text-sm backdrop-blur-sm transition-all duration-200 focus:border-swing-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-swing-gold/20"
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <span className="text-sm text-swing-gray-dark/50">
            {filtered.length} Kunden
          </span>
          <Link
            href="/admin/kunden/neu"
            className="flex items-center gap-1.5 rounded bg-swing-gold px-4 py-2.5 text-sm font-semibold text-swing-navy transition-colors hover:bg-swing-gold-dark"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Neuer Kunde</span>
            <span className="sm:hidden">Neu</span>
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Users size={48} className="mb-4 text-swing-gray-dark/20" />
          <p className="text-lg font-semibold text-swing-navy">
            Keine Kunden gefunden
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((company) => (
            <div key={company.id} className="glass-card rounded transition-all duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/kunden/${company.id}`}
                      className="text-sm font-bold text-swing-navy transition-colors hover:text-swing-gold"
                    >
                      {company.name}
                    </Link>
                    {company.is_approved ? (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Freigeschaltet
                      </span>
                    ) : (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                        Nicht freigeschaltet
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-swing-gray-dark/60">
                    {company.contact_email}
                    {company.phone && ` | ${company.phone}`}
                  </p>
                  {company.address && (
                    <p className="text-xs text-swing-gray-dark/40">
                      {company.address}
                    </p>
                  )}
                  {company.profiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {company.profiles.map((p) => (
                        <span
                          key={p.id}
                          className="rounded bg-gray-100 px-2 py-0.5 text-xs text-swing-gray-dark/60"
                        >
                          {p.full_name || p.email}{" "}
                          <span className="text-swing-gray-dark/30">
                            ({p.role})
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="hidden text-xs text-swing-gray-dark/40 sm:inline">
                    seit{" "}
                    {new Date(company.created_at).toLocaleDateString("de-DE")}
                  </span>
                  <button
                    onClick={() =>
                      toggleApproval(company.id, company.is_approved)
                    }
                    disabled={updating === company.id}
                    className={`flex cursor-pointer items-center gap-1 rounded px-3 py-2 text-xs font-bold transition-all duration-200 ${
                      company.is_approved
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    } disabled:opacity-50`}
                  >
                    {company.is_approved ? (
                      <>
                        <XCircle size={14} />
                        Sperren
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        Freischalten
                      </>
                    )}
                  </button>
                  <DeleteCompanyButton
                    companyId={company.id}
                    companyName={company.name}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

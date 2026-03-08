"use client";

import Link from "next/link";
import { Eye, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDict } from "@/lib/i18n/context";

export default function ViewingAsClientBanner() {
  const searchParams = useSearchParams();
  const als = searchParams.get("als");
  const dict = useDict();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!als) return;
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin" && profile?.role !== "superadmin") return;
      setIsAdmin(true);

      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("id", als)
        .single();
      if (company) setCompanyName(company.name);
    }
    load();
  }, [als]);

  if (!als || !isAdmin || !companyName) return null;

  // Build close URL: current path without "als" param
  const closeParams = new URLSearchParams(searchParams.toString());
  closeParams.delete("als");
  const closeHref = `/katalog${closeParams.toString() ? `?${closeParams.toString()}` : ""}`;

  return (
    <div className="mx-auto mb-0 max-w-7xl px-4 pt-6 sm:px-6">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-swing-gold/30 bg-swing-gold/10 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-swing-gold/20">
            <Eye size={15} className="text-swing-navy" />
          </div>
          <p className="text-sm font-semibold text-swing-navy">
            {dict.katalog.viewingAs}{" "}
            <Link
              href={`/admin/kunden/${als}`}
              className="font-bold text-swing-navy underline decoration-swing-gold/40 underline-offset-2 hover:decoration-swing-gold"
            >
              {companyName}
            </Link>
          </p>
        </div>
        <Link
          href={closeHref}
          className="flex items-center gap-1.5 rounded bg-swing-navy/10 px-3 py-1.5 text-xs font-bold text-swing-navy transition-colors hover:bg-swing-navy/20"
        >
          <X size={12} />
          {dict.katalog.viewingAsClose}
        </Link>
      </div>
    </div>
  );
}

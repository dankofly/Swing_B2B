import { createAdminClient } from "@/lib/supabase/server";
import PriceUploadClient from "./PriceUploadClient";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PreislistenPage() {
  const supabase = createAdminClient();

  // Fetch companies
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, contact_email, is_approved")
    .order("name");

  // Fetch all product sizes for reference
  const { data: sizes } = await supabase
    .from("product_sizes")
    .select("id, sku, size_label, product_id, products(name)")
    .order("sku");

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
            Verwaltung
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Preislisten-Verwaltung
          </h1>
        </div>
      </div>

      {!companies || companies.length === 0 ? (
        <div className="card p-12 text-center ">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
            <FileText size={24} className="text-swing-navy/25" />
          </div>
          <p className="text-sm font-bold text-swing-navy/25">
            Noch keine Händler registriert
          </p>
          <p className="mt-1 text-[13px] text-swing-gray-dark/25">
            Händler müssen sich zuerst registrieren, bevor Preislisten hochgeladen werden können.
          </p>
        </div>
      ) : (
        <PriceUploadClient
          companies={companies}
          skuCount={sizes?.length ?? 0}
        />
      )}
    </div>
  );
}

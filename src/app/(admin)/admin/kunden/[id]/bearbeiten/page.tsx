import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import KundenForm from "../../KundenForm";

export const dynamic = "force-dynamic";

export default async function KundenBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (!company) notFound();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10 flex items-center gap-4">
          <Link
            href={`/admin/kunden/${id}`}
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Kunde bearbeiten
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {company.name}
            </h1>
          </div>
        </div>
      </div>

      <KundenForm company={company} />
    </div>
  );
}

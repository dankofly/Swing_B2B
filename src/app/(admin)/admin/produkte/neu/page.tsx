import { createAdminClient } from "@/lib/supabase/server";
import { createProduct } from "@/lib/actions/products";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NeuesProduktPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-8 py-9">
        <div className="relative z-10 flex items-center gap-4">
          <Link
            href="/admin/produkte"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Produkte
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Neues Produkt
            </h1>
          </div>
        </div>
      </div>

      <ProductForm action={createProduct} categories={categories || []} />
    </div>
  );
}

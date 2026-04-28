import { createAdminClient } from "@/lib/supabase/server";
import { updateProduct } from "@/lib/actions/products";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";


export default async function ProduktBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: product }, { data: categories }, { data: relations }] = await Promise.all([
    supabase
      .from("products")
      .select(`
        *,
        sizes:product_sizes(*),
        colors:product_colors(*)
      `)
      .eq("id", id)
      .single(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("product_relations")
      .select("related_product_id, relation_type, sort_order, related:products!product_relations_related_product_id_fkey(name)")
      .eq("product_id", id)
      .order("sort_order"),
  ]);

  if (!product) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateProduct(id, formData);
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="dash-hero rounded-xl px-5 py-7 sm:px-8 sm:py-9">
        <div className="relative z-10 flex items-center gap-4">
          <Link
            href="/admin/produkte"
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Produkt bearbeiten
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {product.name}
            </h1>
          </div>
        </div>
      </div>

      <ProductForm
        action={handleUpdate}
        categories={categories || []}
        product={product}
        sizes={product.sizes}
        colors={product.colors}
        relations={(relations || []).map((r) => {
          const related = r.related as
            | { name: string }
            | { name: string }[]
            | null
            | undefined;
          const name = Array.isArray(related)
            ? related[0]?.name
            : related?.name;
          return {
            related_product_id: r.related_product_id,
            relation_type: r.relation_type as "similar" | "accessory",
            sort_order: r.sort_order,
            name: name || r.related_product_id,
          };
        })}
      />
    </div>
  );
}

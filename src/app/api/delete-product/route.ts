import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, guardAdmin } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    await guardAdmin();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Keine Berechtigung" },
      { status: 403 }
    );
  }

  let productId: string;
  try {
    const body = await request.json();
    productId = body.productId;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  if (!productId || !isValidUUID(productId)) {
    return NextResponse.json({ error: "Ungültige Produkt-ID" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch product + color images BEFORE deleting (cascade will remove colors)
  const { data: product } = await supabase
    .from("products")
    .select("id, name, images")
    .eq("id", productId)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });
  }

  const { data: colors } = await supabase
    .from("product_colors")
    .select("image_url")
    .eq("product_id", productId);

  // Delete the product (cascades to sizes, colors, relations, customer_prices)
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: `Fehler beim Löschen: ${error.message}` },
      { status: 500 }
    );
  }

  // Clean up storage images (best-effort, don't fail if storage cleanup fails)
  try {
    if (product.images && product.images.length > 0) {
      const paths = product.images
        .map((url: string) => {
          const match = url.match(/product-images\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];

      if (paths.length > 0) {
        await supabase.storage.from("product-images").remove(paths);
      }
    }

    if (colors && colors.length > 0) {
      const colorPaths = colors
        .map((c) => {
          if (!c.image_url) return null;
          const match = c.image_url.match(/color-images\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];

      if (colorPaths.length > 0) {
        await supabase.storage.from("color-images").remove(colorPaths);
      }
    }
  } catch (storageErr) {
    console.error("Storage cleanup error (non-fatal):", storageErr);
  }

  revalidatePath("/admin/produkte");
  revalidatePath("/katalog");

  return NextResponse.json({ success: true, name: product.name });
}

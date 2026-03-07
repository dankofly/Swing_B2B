"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createProduct(formData: FormData) {
  const supabase = createAdminClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string;
  const is_active = formData.get("is_active") === "on";
  const is_coming_soon = formData.get("is_coming_soon") === "on";
  const is_preorder = formData.get("is_preorder") === "on";
  const is_fade_out = formData.get("is_fade_out") === "on";
  const en_class = formData.get("en_class") as string;
  const classification = formData.get("classification") as string;
  const use_case = formData.get("use_case") as string;
  const website_url = formData.get("website_url") as string;
  const imagesJson = formData.get("images") as string;
  const images = imagesJson ? JSON.parse(imagesJson) : [];

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name,
      slug: generateSlug(name),
      description: description || null,
      category_id: category_id || null,
      is_active,
      is_coming_soon,
      is_preorder,
      is_fade_out,
      tech_specs: en_class ? { en_class } : {},
      classification: classification || null,
      use_case: use_case || null,
      website_url: website_url || null,
      images,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Save sizes
  const sizesJson = formData.get("sizes") as string;
  if (sizesJson) {
    const sizes = JSON.parse(sizesJson) as Array<{
      size_label: string;
      sku: string;
      delivery_weeks: number;
      sort_order: number;
    }>;
    if (sizes.length > 0) {
      const { error: sizesError } = await supabase
        .from("product_sizes")
        .insert(sizes.map(({ delivery_weeks, ...s }) => ({
          ...s,
          delivery_days: (delivery_weeks || 2) * 7,
          product_id: product.id,
        })));
      if (sizesError) {
        // Clean up the product if sizes fail
        await supabase.from("products").delete().eq("id", product.id);
        if (sizesError.code === "23505") {
          const dupSku = sizes.map((s) => s.sku).join(", ");
          throw new Error(`SKU bereits vergeben. Bitte eindeutige SKUs verwenden: ${dupSku}`);
        }
        throw new Error(sizesError.message);
      }
    }
  }

  // Save colors
  const colorsJson = formData.get("colors") as string;
  if (colorsJson) {
    const colors = JSON.parse(colorsJson) as Array<{
      color_name: string;
      color_image_url: string | null;
      is_limited: boolean;
      sort_order: number;
    }>;
    if (colors.length > 0) {
      const { error: colorsError } = await supabase
        .from("product_colors")
        .insert(colors.map((c) => ({ ...c, product_id: product.id })));
      if (colorsError) throw new Error(colorsError.message);
    }
  }

  revalidatePath("/admin/produkte");
  revalidatePath("/katalog");
  redirect("/admin/produkte");
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = createAdminClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string;
  const is_active = formData.get("is_active") === "on";
  const is_coming_soon = formData.get("is_coming_soon") === "on";
  const is_preorder = formData.get("is_preorder") === "on";
  const is_fade_out = formData.get("is_fade_out") === "on";
  const en_class = formData.get("en_class") as string;
  const classification = formData.get("classification") as string;
  const use_case = formData.get("use_case") as string;
  const website_url = formData.get("website_url") as string;
  const imagesJson = formData.get("images") as string;
  const images = imagesJson ? JSON.parse(imagesJson) : [];

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug: generateSlug(name),
      description: description || null,
      category_id: category_id || null,
      is_active,
      is_coming_soon,
      is_preorder,
      is_fade_out,
      tech_specs: en_class ? { en_class } : {},
      classification: classification || null,
      use_case: use_case || null,
      website_url: website_url || null,
      images,
    })
    .eq("id", productId);

  if (error) throw new Error(error.message);

  // Replace sizes: delete existing, insert new
  const sizesJson = formData.get("sizes") as string;
  if (sizesJson) {
    const { error: deleteSizesError } = await supabase.from("product_sizes").delete().eq("product_id", productId);
    if (deleteSizesError) {
      throw new Error(`Größen konnten nicht gelöscht werden: ${deleteSizesError.message}`);
    }
    const sizes = JSON.parse(sizesJson) as Array<{
      size_label: string;
      sku: string;
      delivery_weeks: number;
      sort_order: number;
    }>;
    if (sizes.length > 0) {
      const { error: sizesError } = await supabase
        .from("product_sizes")
        .insert(sizes.map(({ delivery_weeks, ...s }) => ({
          ...s,
          delivery_days: (delivery_weeks || 2) * 7,
          product_id: productId,
        })));
      if (sizesError) {
        if (sizesError.code === "23505") {
          const dupSku = sizes.map((s) => s.sku).join(", ");
          throw new Error(`SKU bereits vergeben. Bitte eindeutige SKUs verwenden: ${dupSku}`);
        }
        throw new Error(sizesError.message);
      }
    }
  }

  // Replace colors
  const colorsJson = formData.get("colors") as string;
  if (colorsJson) {
    const { error: deleteColorsError } = await supabase.from("product_colors").delete().eq("product_id", productId);
    if (deleteColorsError) {
      throw new Error(`Farben konnten nicht gelöscht werden: ${deleteColorsError.message}`);
    }
    const colors = JSON.parse(colorsJson) as Array<{
      color_name: string;
      color_image_url: string | null;
      is_limited: boolean;
      sort_order: number;
    }>;
    if (colors.length > 0) {
      const { error: colorsError } = await supabase
        .from("product_colors")
        .insert(colors.map((c) => ({ ...c, product_id: productId })));
      if (colorsError) throw new Error(colorsError.message);
    }
  }

  revalidatePath("/admin/produkte");
  revalidatePath("/katalog");
  redirect("/admin/produkte");
}

export async function deleteProduct(productId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/produkte");
  revalidatePath("/katalog");
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/produkte");
  revalidatePath("/katalog");
}

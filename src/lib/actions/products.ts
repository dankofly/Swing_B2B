"use server";

import { createAdminClient, guardAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isValidUUID } from "@/lib/rate-limit";

function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

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

/** Extract shared product fields from FormData (used by create + update). */
function parseProductFormData(formData: FormData) {
  const name = (formData.get("name") as string || "").slice(0, 200);
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string;
  const is_active = formData.get("is_active") === "on";
  const is_coming_soon = formData.get("is_coming_soon") === "on";
  const is_preorder = formData.get("is_preorder") === "on";
  const is_fade_out = formData.get("is_fade_out") === "on";
  const is_action = formData.get("is_action") === "on";
  const action_text = formData.get("action_text") as string;
  const action_start = formData.get("action_start") as string;
  const action_end = formData.get("action_end") as string;
  const en_class = formData.get("en_class") as string;
  const en_class_custom = formData.get("en_class_custom") as string;
  const classification = formData.get("classification") as string;
  const use_case = formData.get("use_case") as string;
  const website_url = formData.get("website_url") as string;
  const images = safeJsonParse<string[]>(formData.get("images") as string, []);
  const name_en = formData.get("name_en") as string;
  const name_fr = formData.get("name_fr") as string;
  const description_en = formData.get("description_en") as string;
  const description_fr = formData.get("description_fr") as string;
  const use_case_en = formData.get("use_case_en") as string;
  const use_case_fr = formData.get("use_case_fr") as string;
  const action_text_en = formData.get("action_text_en") as string;
  const action_text_fr = formData.get("action_text_fr") as string;
  const website_url_en = formData.get("website_url_en") as string;
  const website_url_fr = formData.get("website_url_fr") as string;
  // German number format: strip thousand-dots first, then convert decimal comma.
  // Handles "2.390,00" → 2390, "2390,00" → 2390, "2390" → 2390.
  // A placeholder of "2.118,52" that gets replace(",", ".") alone would yield
  // "2.118.52" and parseFloat stops at the second dot, silently saving 2.118.
  const uvpRaw = formData.get("uvp_brutto") as string;
  const uvp_brutto = uvpRaw
    ? parseFloat(uvpRaw.trim().replace(/\./g, "").replace(",", "."))
    : null;

  return {
    name, description, category_id,
    is_active, is_coming_soon, is_preorder, is_fade_out, is_action,
    action_text, action_start, action_end,
    en_class, en_class_custom, classification, use_case, website_url,
    images, uvp_brutto,
    name_en, name_fr, description_en, description_fr,
    use_case_en, use_case_fr, action_text_en, action_text_fr,
    website_url_en, website_url_fr,
  };
}

/** Build the DB row object from parsed form data. */
function buildProductRow(fields: ReturnType<typeof parseProductFormData>) {
  return {
    name: fields.name,
    slug: generateSlug(fields.name),
    description: fields.description || null,
    category_id: fields.category_id || null,
    is_active: fields.is_active,
    is_coming_soon: fields.is_coming_soon,
    is_preorder: fields.is_preorder,
    is_fade_out: fields.is_fade_out,
    is_action: fields.is_action,
    action_text: fields.action_text || null,
    action_start: fields.action_start || null,
    action_end: fields.action_end || null,
    en_class: fields.en_class || null,
    en_class_custom: fields.en_class_custom || null,
    tech_specs: {},
    classification: fields.classification || null,
    use_case: fields.use_case || null,
    website_url: fields.website_url || null,
    images: fields.images,
    uvp_brutto: fields.uvp_brutto && !isNaN(fields.uvp_brutto) ? fields.uvp_brutto : null,
    name_en: fields.name_en || null,
    name_fr: fields.name_fr || null,
    description_en: fields.description_en || null,
    description_fr: fields.description_fr || null,
    use_case_en: fields.use_case_en || null,
    use_case_fr: fields.use_case_fr || null,
    action_text_en: fields.action_text_en || null,
    action_text_fr: fields.action_text_fr || null,
    website_url_en: fields.website_url_en || null,
    website_url_fr: fields.website_url_fr || null,
  };
}

export async function createProduct(formData: FormData): Promise<{ error?: string }> {
  try {
    await guardAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Keine Berechtigung" };
  }
  const supabase = createAdminClient();

  const fields = parseProductFormData(formData);
  if (!fields.name.trim()) return { error: "Produktname ist erforderlich" };
  if (fields.category_id && !isValidUUID(fields.category_id)) return { error: "Ungültige Kategorie-ID" };

  const { data: product, error } = await supabase
    .from("products")
    .insert(buildProductRow(fields))
    .select()
    .single();

  if (error) return { error: error.message };

  // Save sizes
  const sizesJson = formData.get("sizes") as string;
  if (sizesJson) {
    const sizes = safeJsonParse<Array<{
      size_label: string;
      sku: string;
      delivery_weeks: number;
      sort_order: number;
    }>>(sizesJson, []);
    if (sizes.length > 0) {
      const { error: sizesError } = await supabase
        .from("product_sizes")
        .insert(sizes.map(({ delivery_weeks, ...s }) => ({
          ...s,
          delivery_days: (delivery_weeks || 5) * 7,
          product_id: product.id,
        })));
      if (sizesError) {
        // Clean up the product if sizes fail
        await supabase.from("products").delete().eq("id", product.id);
        if (sizesError.code === "23505") {
          const dupSku = sizes.map((s) => s.sku).join(", ");
          return { error: `SKU bereits vergeben. Bitte eindeutige SKUs verwenden: ${dupSku}` };
        }
        return { error: sizesError.message };
      }
    }
  }

  // Save colors
  const colorsJson = formData.get("colors") as string;
  if (colorsJson) {
    const colors = safeJsonParse<Array<{
      color_name: string;
      color_image_url: string | null;
      is_limited: boolean;
      sort_order: number;
    }>>(colorsJson, []);
    if (colors.length > 0) {
      const { error: colorsError } = await supabase
        .from("product_colors")
        .insert(colors.map((c) => ({ ...c, product_id: product.id })));
      if (colorsError) return { error: colorsError.message };
    }
  }

  // Save relations
  const relationsJson = formData.get("relations") as string;
  if (relationsJson) {
    const relations = safeJsonParse<Array<{
      related_product_id: string;
      relation_type: string;
      sort_order: number;
    }>>(relationsJson, []);
    if (relations.length > 0) {
      const { error: relError } = await supabase
        .from("product_relations")
        .insert(relations.map((r) => ({ ...r, product_id: product.id })));
      if (relError) console.error("Relations insert error:", relError);
    }
  }

  revalidatePath("/admin/produkte");
  revalidatePath("/katalog");
  return {};
}

export async function updateProduct(productId: string, formData: FormData): Promise<{ error?: string }> {
  if (!isValidUUID(productId)) return { error: "Ungültige Produkt-ID" };
  try {
    await guardAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Keine Berechtigung" };
  }
  const supabase = createAdminClient();

  const fields = parseProductFormData(formData);
  if (!fields.name.trim()) return { error: "Produktname ist erforderlich" };
  if (fields.category_id && !isValidUUID(fields.category_id)) return { error: "Ungültige Kategorie-ID" };

  const { error } = await supabase
    .from("products")
    .update(buildProductRow(fields))
    .eq("id", productId);

  if (error) return { error: error.message };

  // Replace sizes: delete existing, insert new
  const sizesJson = formData.get("sizes") as string;
  if (sizesJson) {
    const { error: deleteSizesError } = await supabase.from("product_sizes").delete().eq("product_id", productId);
    if (deleteSizesError) {
      return { error: `Größen konnten nicht gelöscht werden: ${deleteSizesError.message}` };
    }
    const sizes = safeJsonParse<Array<{
      size_label: string;
      sku: string;
      delivery_weeks: number;
      sort_order: number;
    }>>(sizesJson, []);
    if (sizes.length > 0) {
      const { error: sizesError } = await supabase
        .from("product_sizes")
        .insert(sizes.map(({ delivery_weeks, ...s }) => ({
          ...s,
          delivery_days: (delivery_weeks || 5) * 7,
          product_id: productId,
        })));
      if (sizesError) {
        if (sizesError.code === "23505") {
          const dupSku = sizes.map((s) => s.sku).join(", ");
          return { error: `SKU bereits vergeben. Bitte eindeutige SKUs verwenden: ${dupSku}` };
        }
        return { error: sizesError.message };
      }
    }
  }

  // Replace colors
  const colorsJson = formData.get("colors") as string;
  if (colorsJson) {
    const { error: deleteColorsError } = await supabase.from("product_colors").delete().eq("product_id", productId);
    if (deleteColorsError) {
      return { error: `Farben konnten nicht gelöscht werden: ${deleteColorsError.message}` };
    }
    const colors = safeJsonParse<Array<{
      color_name: string;
      color_image_url: string | null;
      is_limited: boolean;
      sort_order: number;
    }>>(colorsJson, []);
    if (colors.length > 0) {
      const { error: colorsError } = await supabase
        .from("product_colors")
        .insert(colors.map((c) => ({ ...c, product_id: productId })));
      if (colorsError) return { error: colorsError.message };
    }
  }

  // Replace relations
  const relationsJson = formData.get("relations") as string;
  if (relationsJson) {
    const { error: delRelErr } = await supabase.from("product_relations").delete().eq("product_id", productId);
    if (delRelErr) console.error("Relations delete error:", delRelErr);
    const relations = safeJsonParse<Array<{
      related_product_id: string;
      relation_type: string;
      sort_order: number;
    }>>(relationsJson, []);
    if (relations.length > 0) {
      const { error: relError } = await supabase
        .from("product_relations")
        .insert(relations.map((r) => ({ ...r, product_id: productId })));
      if (relError) console.error("Relations insert error:", relError);
    }
  }

  revalidatePath("/admin/produkte");
  revalidatePath("/katalog");
  return {};
}

export async function duplicateProduct(productId: string): Promise<{ error?: string; newId?: string }> {
  if (!isValidUUID(productId)) return { error: "Ungültige Produkt-ID" };
  try {
    await guardAdmin();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Keine Berechtigung" };
  }
  const supabase = createAdminClient();

  // Fetch original product with sizes, colors, relations
  const { data: original, error: fetchError } = await supabase
    .from("products")
    .select("*, sizes:product_sizes(*), colors:product_colors(*)")
    .eq("id", productId)
    .single();

  if (fetchError || !original) return { error: fetchError?.message || "Produkt nicht gefunden" };

  // Create copy with "(Kopie)" suffix
  const { sizes, colors, id, created_at, updated_at, slug, ...productData } = original;
  const newName = `${productData.name} (Kopie)`;

  const { data: newProduct, error: insertError } = await supabase
    .from("products")
    .insert({
      ...productData,
      name: newName,
      slug: generateSlug(newName),
      is_active: false,
    })
    .select()
    .single();

  if (insertError) return { error: insertError.message };

  // Duplicate sizes with new SKUs
  if (sizes && sizes.length > 0) {
    const { error: sizesError } = await supabase
      .from("product_sizes")
      .insert(sizes.map(({ id: _id, product_id: _pid, created_at: _ca, ...s }: Record<string, unknown>) => ({
        ...s,
        sku: `${s.sku}-KOPIE`,
        product_id: newProduct.id,
      })));
    if (sizesError) console.error("Duplicate sizes error:", sizesError);
  }

  // Duplicate colors
  if (colors && colors.length > 0) {
    const { error: colorsError } = await supabase
      .from("product_colors")
      .insert(colors.map(({ id: _id, product_id: _pid, created_at: _ca, ...c }: Record<string, unknown>) => ({
        ...c,
        product_id: newProduct.id,
      })));
    if (colorsError) console.error("Duplicate colors error:", colorsError);
  }

  // Duplicate relations
  const { data: relations } = await supabase
    .from("product_relations")
    .select("related_product_id, relation_type, sort_order")
    .eq("product_id", productId);

  if (relations && relations.length > 0) {
    const { error: relError } = await supabase
      .from("product_relations")
      .insert(relations.map((r) => ({ ...r, product_id: newProduct.id })));
    if (relError) console.error("Duplicate relations error:", relError);
  }

  revalidatePath("/admin/produkte");
  return { newId: newProduct.id };
}

export async function deleteProduct(productId: string) {
  if (!isValidUUID(productId)) throw new Error("Ungültige Produkt-ID");
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/produkte");
  revalidatePath("/katalog");
}

export async function updateProductSortOrder(orderedIds: string[]) {
  await guardAdmin();
  const supabase = createAdminClient();

  const updates = orderedIds.map((id, index) =>
    supabase.from("products").update({ sort_order: index }).eq("id", id)
  );

  await Promise.all(updates);

  revalidatePath("/admin/produkte");
  revalidatePath("/katalog");
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  if (!isValidUUID(productId)) throw new Error("Ungültige Produkt-ID");
  await guardAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/produkte");
  revalidatePath("/katalog");
}

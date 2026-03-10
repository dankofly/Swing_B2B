import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import {
  buildExtractionAndMatchingPrompt,
  type PortalProductForMatching,
} from "@/lib/gemini-prompts";

/**
 * Gemini response shape – mirrors the JSON schema in the prompt.
 */
interface GeminiMatchedItem {
  portal_product_id: string;
  portal_model: string;
  portal_size: string;
  pdf_category: string;
  pdf_model_raw: string;
  pdf_model_normalized: string;
  pdf_size_raw: string;
  pdf_size_normalized: string;
  uvp_incl_vat_eur: string;
  dealer_net_eur: string;
  confidence: string;
  match_basis: string;
}

interface GeminiPdfProduct {
  category: string;
  model_raw: string;
  model_normalized: string;
  size_raw: string;
  size_normalized: string;
  uvp_incl_vat_eur: string;
  dealer_net_eur: string;
}

interface GeminiReviewItem {
  pdf_product: GeminiPdfProduct;
  portal_candidates: PortalProductForMatching[];
  reason: string;
}

interface GeminiNoMatchItem {
  pdf_product: GeminiPdfProduct;
  reason: string;
}

interface GeminiMissingItem {
  portal_product_id: string;
  portal_model: string;
  portal_size: string;
  reason: string;
}

interface GeminiResponse {
  matched: GeminiMatchedItem[];
  review_needed: GeminiReviewItem[];
  no_match: GeminiNoMatchItem[];
  missing_in_price_list: GeminiMissingItem[];
}

export async function POST(request: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const companyId = formData.get("company_id") as string;

    if (!file || !companyId) {
      return NextResponse.json(
        { error: "file and company_id are required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Fetch all active products with their sizes for portal matching
    const { data: allProducts } = await supabase
      .from("products")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name");

    const { data: allSizes } = await supabase
      .from("product_sizes")
      .select("id, sku, size_label, product_id")
      .order("sort_order");

    // Build portal products list for Gemini (one entry per product+size)
    const productMap = new Map(
      (allProducts ?? []).map((p) => [p.id, p])
    );

    const portalProducts: PortalProductForMatching[] = (allSizes ?? [])
      .filter((s) => productMap.has(s.product_id))
      .map((s) => ({
        portal_product_id: s.id, // product_size_id is the unique key
        portal_model: productMap.get(s.product_id)!.name,
        portal_size: s.size_label,
      }));

    // Build prompt and call Gemini
    const prompt = buildExtractionAndMatchingPrompt(portalProducts);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const geminiResult = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: file.type || "application/pdf",
          data: base64,
        },
      },
    ]);

    const responseText = geminiResult.response.text().trim();

    let parsed: GeminiResponse;
    try {
      const jsonStr = responseText
        .replace(/^```json?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "LLM-Antwort konnte nicht geparst werden", raw: responseText },
        { status: 422 }
      );
    }

    // Enrich matched items with product_id (we use product_size_id as portal_product_id)
    const sizeMap = new Map(
      (allSizes ?? []).map((s) => [s.id, s])
    );

    const matched = (parsed.matched ?? []).map((item) => {
      const size = sizeMap.get(item.portal_product_id);
      return {
        ...item,
        product_size_id: item.portal_product_id,
        product_id: size?.product_id ?? null,
        sku: size?.sku ?? null,
        uvp_incl_vat: parsePrice(item.uvp_incl_vat_eur),
        ek_netto: parsePrice(item.dealer_net_eur),
      };
    });

    const summary = {
      total_pdf: (parsed.matched?.length ?? 0) +
        (parsed.review_needed?.length ?? 0) +
        (parsed.no_match?.length ?? 0),
      matched: parsed.matched?.length ?? 0,
      review_needed: parsed.review_needed?.length ?? 0,
      no_match: parsed.no_match?.length ?? 0,
      missing_in_price_list: parsed.missing_in_price_list?.length ?? 0,
    };

    return NextResponse.json({
      matched,
      review_needed: parsed.review_needed ?? [],
      no_match: parsed.no_match ?? [],
      missing_in_price_list: parsed.missing_in_price_list ?? [],
      summary,
    });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Fehler beim Parsen der Preisliste" },
      { status: 500 }
    );
  }
}

/** Parse a price string like "3590.00" or "1 960,92" to a number. Returns null for "auf Anfrage" etc. */
function parsePrice(value: string): number | null {
  if (!value) return null;
  // Remove spaces, replace comma with dot
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

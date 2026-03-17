import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { buildExtractionPrompt } from "@/lib/gemini-prompts";

/**
 * Prepares the Gemini extraction prompt and returns portal products for
 * client-side matching. The client calls Gemini directly (avoids serverless timeout).
 */
export async function POST(request: NextRequest) {
  try {
    // Auth guard
    const authClient = await createAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }
    const { data: profile } = await authClient.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !["superadmin", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
    }

    const body = await request.json();
    const { company_id: companyId, pdf_text: pdfText } = body;

    if (!companyId || !pdfText) {
      return NextResponse.json({ error: "company_id and pdf_text are required" }, { status: 400 });
    }

    if (pdfText.length < 50) {
      return NextResponse.json(
        { error: "Das PDF enthält zu wenig Text." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch products + sizes for client-side matching
    const [{ data: allProducts }, { data: allSizes }] = await Promise.all([
      supabase.from("products").select("id, name, slug").eq("is_active", true).order("name"),
      supabase.from("product_sizes").select("id, sku, size_label, product_id").order("sort_order"),
    ]);

    const productMap = new Map((allProducts ?? []).map((p) => [p.id, p]));

    // Build extraction-only prompt (no portal products embedded)
    const prompt = buildExtractionPrompt(pdfText);

    // Return prompt + API key + portal products for client-side matching
    return NextResponse.json({
      prompt,
      gemini_key: process.env.GEMINI_API_KEY,
      portal_products: (allSizes ?? [])
        .filter((s) => productMap.has(s.product_id))
        .map((s) => ({
          product_size_id: s.id,
          product_id: s.product_id,
          model: productMap.get(s.product_id)!.name,
          size: s.size_label,
          sku: s.sku,
        })),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Fehler: ${msg}` }, { status: 500 });
  }
}

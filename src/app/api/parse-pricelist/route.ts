import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { canonicalKey } from "@/lib/canonical-keys";
import { buildFallbackMatchingPrompt } from "@/lib/gemini-prompts";

interface ExtractedItem {
  product: string;
  size: string;
  uvp_gross: number | null;
  dealer_net: number | null;
  canonical_key: string;
}

interface ProductSizeRow {
  id: string;
  product_id: string;
  size_label: string;
  sku: string;
  canonical_key: string | null;
  product: { name: string } | null;
}

/**
 * New pipeline: receives PDF file, sends to Python pdfplumber service,
 * matches via canonical keys, optional Gemini fallback, saves prices.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth guard
    const authClient = await createAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }
    const { data: profile } = await authClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !["superadmin", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("company_id") as string | null;

    if (!file || !companyId) {
      return NextResponse.json(
        { error: "file and company_id are required" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Nur PDF-Dateien werden unterstützt" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ── Step 1: Send PDF to Python pdfplumber service ──
    const parserUrl = process.env.PDF_PARSER_URL;
    if (!parserUrl) {
      return NextResponse.json(
        { error: "PDF_PARSER_URL nicht konfiguriert" },
        { status: 500 }
      );
    }

    const pdfFormData = new FormData();
    pdfFormData.append("file", file);

    const parserRes = await fetch(`${parserUrl}/extract`, {
      method: "POST",
      body: pdfFormData,
    });

    if (!parserRes.ok) {
      const errText = await parserRes.text();
      return NextResponse.json(
        { error: `PDF-Parser Fehler: ${errText.slice(0, 300)}` },
        { status: 422 }
      );
    }

    const parserData = await parserRes.json();
    const extracted: ExtractedItem[] = parserData.items ?? [];

    if (extracted.length === 0) {
      return NextResponse.json(
        { error: "Keine Preisdaten im PDF erkannt" },
        { status: 422 }
      );
    }

    // ── Step 2: Load product_sizes with canonical keys ──
    const { data: allSizes } = await supabase
      .from("product_sizes")
      .select("id, product_id, size_label, sku, canonical_key, product:products(name)")
      .order("sort_order");

    const sizeRows: ProductSizeRow[] = (allSizes ?? []) as unknown as ProductSizeRow[];
    const keyMap = new Map<string, ProductSizeRow>();
    for (const row of sizeRows) {
      if (row.canonical_key) {
        keyMap.set(row.canonical_key, row);
      }
    }

    // ── Step 3: Canonical key matching ──
    interface MatchedPrice {
      product_size_id: string;
      product_id: string;
      portal_model: string;
      portal_size: string;
      sku: string;
      uvp_incl_vat: number | null;
      ek_netto: number | null;
      pdf_model_raw: string;
    }

    const matched: MatchedPrice[] = [];
    const unmatched: ExtractedItem[] = [];
    const rejected: Array<{ product: string; size: string; reason: string }> = [];

    for (const item of extracted) {
      // Validate
      if (!item.product || item.product.trim().length === 0) {
        rejected.push({ product: "", size: item.size, reason: "empty_product" });
        continue;
      }
      if (item.dealer_net == null || item.dealer_net <= 0) {
        // Keep items with only UVP if they have a valid product
        if (item.uvp_gross == null || item.uvp_gross <= 0) {
          rejected.push({ product: item.product, size: item.size, reason: "no_valid_price" });
          continue;
        }
      }

      // Generate canonical key (use the one from Python or re-generate in TS)
      const ck = item.canonical_key || canonicalKey(item.product, item.size);

      const row = keyMap.get(ck);
      if (row) {
        matched.push({
          product_size_id: row.id,
          product_id: row.product_id,
          portal_model: (row.product as unknown as { name: string })?.name ?? "",
          portal_size: row.size_label,
          sku: row.sku,
          uvp_incl_vat: item.uvp_gross,
          ek_netto: item.dealer_net,
          pdf_model_raw: item.product,
        });
      } else {
        unmatched.push(item);
      }
    }

    // ── Step 4: Gemini fallback for unmatched items ──
    if (unmatched.length > 0 && process.env.GEMINI_API_KEY) {
      const portalList = sizeRows.map((r) => ({
        canonical_key: r.canonical_key,
        model: (r.product as unknown as { name: string })?.name ?? "",
        size: r.size_label,
      }));

      const prompt = buildFallbackMatchingPrompt(unmatched, portalList);

      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                maxOutputTokens: 4096,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (responseText) {
            const llmMatches: Array<{ pdf_product: string; pdf_size: string; canonical_key: string }> =
              JSON.parse(responseText);

            for (const lm of llmMatches) {
              if (!lm.canonical_key) continue;
              const row = keyMap.get(lm.canonical_key);
              if (!row) continue;

              // Find the original unmatched item
              const orig = unmatched.find(
                (u) => u.product === lm.pdf_product && u.size === lm.pdf_size
              );
              if (!orig) continue;

              matched.push({
                product_size_id: row.id,
                product_id: row.product_id,
                portal_model: (row.product as unknown as { name: string })?.name ?? "",
                portal_size: row.size_label,
                sku: row.sku,
                uvp_incl_vat: orig.uvp_gross,
                ek_netto: orig.dealer_net,
                pdf_model_raw: orig.product,
              });
            }
          }
        }
      } catch (err) {
        console.error("[parse-pricelist] Gemini fallback error:", err);
        // Non-fatal: continue without LLM matches
      }
    }

    // ── Step 5: Save prices ──
    if (matched.length === 0) {
      return NextResponse.json({
        error: "Keine Zuordnungen gefunden",
        total_extracted: extracted.length,
        unmatched: unmatched.length,
        rejected: rejected.length,
      }, { status: 422 });
    }

    // Delete existing prices
    await supabase
      .from("customer_prices")
      .delete()
      .eq("company_id", companyId);

    // Batch update UVP on product level
    const uvpUpdates = new Map<string, number>();
    for (const item of matched) {
      if (item.uvp_incl_vat && item.uvp_incl_vat > 0) {
        uvpUpdates.set(item.product_id, item.uvp_incl_vat);
      }
    }
    await Promise.all(
      Array.from(uvpUpdates.entries()).map(([productId, uvp]) =>
        supabase.from("products").update({ uvp_brutto: uvp }).eq("id", productId)
      )
    );

    // Insert new prices
    const rows = matched
      .filter((m) => m.ek_netto != null && m.ek_netto > 0)
      .map((m) => ({
        company_id: companyId,
        product_size_id: m.product_size_id,
        unit_price: m.ek_netto,
        uvp_incl_vat: m.uvp_incl_vat,
      }));

    if (rows.length > 0) {
      const { error: insertErr } = await supabase.from("customer_prices").insert(rows);
      if (insertErr) {
        return NextResponse.json(
          { error: `Preise konnten nicht gespeichert werden: ${insertErr.message}` },
          { status: 500 }
        );
      }
    }

    // ── Step 6: Save parse result log ──
    const parseResult = {
      total_extracted: extracted.length,
      matched: matched.length,
      saved: rows.length,
      unmatched: unmatched.length,
      rejected: rejected.length,
      unmatched_items: unmatched.map((u) => ({
        product: u.product,
        size: u.size,
        canonical_key: u.canonical_key,
      })),
      rejected_items: rejected,
    };

    // Update the most recent price_upload for this company with parse_result
    const { data: latestUpload } = await supabase
      .from("price_uploads")
      .select("id")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latestUpload) {
      await supabase
        .from("price_uploads")
        .update({ parse_result: parseResult })
        .eq("id", latestUpload.id);
    }

    return NextResponse.json({
      success: true,
      ...parseResult,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[parse-pricelist] Error:", msg);
    return NextResponse.json({ error: `Fehler: ${msg}` }, { status: 500 });
  }
}

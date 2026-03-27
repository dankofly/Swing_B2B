import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { canonicalKey } from "@/lib/canonical-keys";
import { buildExtractionPrompt, buildFallbackMatchingPrompt } from "@/lib/gemini-prompts";
import { createRateLimiter } from "@/lib/rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

const checkLimit = createRateLimiter("gemini", 10, 60_000);

interface ExtractedItem {
  product: string;
  size: string;
  uvp_gross: number | null;
  dealer_net: number | null;
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
 * Streaming pipeline: receives PDF text (extracted client-side via pdf.js),
 * uses Gemini for structured extraction, canonical keys for matching,
 * Gemini fallback for unmatched, saves prices.
 *
 * Returns an NDJSON stream so the connection stays alive through Netlify's
 * serverless timeout (streaming functions get up to 15 min).
 */
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      }

      function sendError(error: string, status?: number) {
        send({ error, status: status ?? 500 });
        controller.close();
      }

      try {
        // Auth guard
        const authClient = await createAuthClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) { sendError("Nicht autorisiert", 401); return; }

        const { data: profile } = await authClient
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (!profile || !["superadmin", "admin"].includes(profile.role)) {
          sendError("Keine Berechtigung", 403); return;
        }

        if (checkLimit(user.id)) {
          sendError("Zu viele Anfragen. Bitte warten Sie eine Minute.", 429); return;
        }

        const body = await request.json();
        const { company_id: companyId, pdf_text: pdfText } = body;

        if (!companyId || !pdfText) {
          sendError("company_id und pdf_text sind erforderlich", 400); return;
        }
        if (pdfText.length < 50) {
          sendError("Das PDF enthält zu wenig Text.", 400); return;
        }

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // ── Step 1: Gemini extraction ──
        send({ step: "extracting", message: "KI analysiert PDF..." });

        const extractionPrompt = buildExtractionPrompt(pdfText);

        let responseText: string;
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
          const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json", maxOutputTokens: 16384 }
          });
          const geminiResult = await model.generateContent([{ text: extractionPrompt }]);
          responseText = geminiResult.response.text().trim();
        } catch (geminiErr) {
          const errMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
          sendError(`Gemini-Fehler: ${errMsg.slice(0, 300)}`); return;
        }

        if (!responseText) { sendError("Gemini hat keine Antwort geliefert"); return; }

        let extracted: ExtractedItem[];
        try {
          const parsed = JSON.parse(responseText);
          extracted = Array.isArray(parsed) ? parsed : (parsed.products ?? parsed);
          if (!Array.isArray(extracted)) throw new Error("Unexpected format");
        } catch {
          const arrStart = responseText.indexOf("[");
          const arrEnd = responseText.lastIndexOf("]");
          if (arrStart !== -1 && arrEnd > arrStart) {
            try {
              extracted = JSON.parse(responseText.slice(arrStart, arrEnd + 1));
            } catch {
              sendError("KI-Antwort konnte nicht gelesen werden"); return;
            }
          } else {
            sendError("Kein gültiges JSON in der KI-Antwort"); return;
          }
        }

        if (extracted.length === 0) { sendError("Keine Preisdaten im PDF erkannt"); return; }

        send({ step: "matching", message: `${extracted.length} Positionen erkannt, ordne zu...` });

        // ── Step 2: Load product_sizes ──
        const { data: allSizes } = await supabase
          .from("product_sizes")
          .select("id, product_id, size_label, sku, canonical_key, product:products(name)")
          .order("sort_order");

        const sizeRows: ProductSizeRow[] = (allSizes ?? []) as unknown as ProductSizeRow[];
        const keyMap = new Map<string, ProductSizeRow>();
        for (const row of sizeRows) {
          if (row.canonical_key) keyMap.set(row.canonical_key, row);
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
          if (!item.product || item.product.trim().length === 0) {
            rejected.push({ product: "", size: item.size, reason: "empty_product" });
            continue;
          }
          if ((item.dealer_net == null || item.dealer_net <= 0) &&
              (item.uvp_gross == null || item.uvp_gross <= 0)) {
            rejected.push({ product: item.product, size: item.size, reason: "no_valid_price" });
            continue;
          }

          const ck = canonicalKey(item.product, item.size);
          const row = keyMap.get(ck);

          if (row) {
            const productName = (row.product as unknown as { name: string })?.name ?? "";
            matched.push({
              product_size_id: row.id,
              product_id: row.product_id,
              portal_model: productName,
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

        // ── Step 4: Gemini fallback for unmatched ──
        if (unmatched.length > 0 && process.env.GEMINI_API_KEY) {
          send({ step: "fallback", message: `${unmatched.length} nicht zugeordnet, KI-Fallback...` });

          const portalList = sizeRows.map((r) => ({
            canonical_key: r.canonical_key,
            model: (r.product as unknown as { name: string })?.name ?? "",
            size: r.size_label,
          }));

          const prompt = buildFallbackMatchingPrompt(unmatched, portalList);

          try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
            const model = genAI.getGenerativeModel({
              model: "gemini-2.0-flash",
              generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096 }
            });
            const fallbackResult = await model.generateContent([{ text: prompt }]);
            const fallbackText = fallbackResult.response.text().trim();

            if (fallbackText) {
              const llmMatches: Array<{ pdf_product: string; pdf_size: string; canonical_key: string }> =
                JSON.parse(fallbackText);

              for (const lm of llmMatches) {
                if (!lm.canonical_key) continue;
                const row = keyMap.get(lm.canonical_key);
                if (!row) continue;
                const orig = unmatched.find(
                  (u) => u.product === lm.pdf_product && u.size === lm.pdf_size
                );
                if (!orig) continue;
                const productName = (row.product as unknown as { name: string })?.name ?? "";
                matched.push({
                  product_size_id: row.id,
                  product_id: row.product_id,
                  portal_model: productName,
                  portal_size: row.size_label,
                  sku: row.sku,
                  uvp_incl_vat: orig.uvp_gross,
                  ek_netto: orig.dealer_net,
                  pdf_model_raw: orig.product,
                });
              }
            }
          } catch (err) {
            console.error("[parse-pricelist] Gemini fallback error:", err);
          }
        }

        // ── Step 5: Save prices ──
        if (matched.length === 0) {
          sendError("Keine Zuordnungen gefunden"); return;
        }

        send({ step: "saving", message: `${matched.length} Preise werden gespeichert...` });

        const { error: deleteErr } = await supabase
          .from("customer_prices")
          .delete()
          .eq("company_id", companyId);
        if (deleteErr) console.error("[parse-pricelist] Delete error:", deleteErr);

        // Batch update UVP
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

        // Deduplicate
        const seenSizeIds = new Set<string>();
        const rows = matched
          .filter((m) => m.ek_netto != null && m.ek_netto > 0)
          .filter((m) => {
            if (seenSizeIds.has(m.product_size_id)) return false;
            seenSizeIds.add(m.product_size_id);
            return true;
          })
          .map((m) => ({
            company_id: companyId,
            product_size_id: m.product_size_id,
            unit_price: m.ek_netto,
            uvp_incl_vat: m.uvp_incl_vat,
          }));

        if (rows.length > 0) {
          const { error: insertErr } = await supabase.from("customer_prices").insert(rows);
          if (insertErr) {
            sendError(`Preise konnten nicht gespeichert werden: ${insertErr.message}`); return;
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
            canonical_key: canonicalKey(u.product, u.size),
          })),
          rejected_items: rejected,
        };

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

        // Final result
        send({ success: true, ...parseResult });
        controller.close();
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[parse-pricelist] Error:", msg);
        send({ error: `Fehler: ${msg}`, status: 500 });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}

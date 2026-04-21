import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import {
  normalizeModel,
  normalizeSize,
  normalizeDesign,
  modelSizeKey,
  isValidSize,
} from "@/lib/canonical-keys";
import {
  parseStockCSV,
  type AggregatedVariant,
} from "@/lib/stock-csv-parser";
import { createRateLimiter } from "@/lib/rate-limit";

// Allow up to 60s (for rare LLM fallback cases)
export const maxDuration = 60;

const checkLimit = createRateLimiter("gemini", 10, 60_000);

// ─── Types ───────────────────────────────────────────────────────────

interface PortalVariant {
  product_id: string;
  product_name: string;
  size_id: string;
  size_label: string;
  color_id: string | null;
  color_name: string | null;
  current_stock: number;
  match_key: string;
  model_size_key: string;
  design_normalized: string;
}

interface MatchedItem {
  bezeichnung: string;
  product_id: string;
  product_name: string;
  size_label: string;
  size_id: string;
  color_name: string | null;
  color_id: string | null;
  count: number;
  current_stock: number | null;
  matched: boolean;
  color_matched: boolean;
  match_basis: string;
}

interface ReviewItem {
  bezeichnung: string;
  model_raw: string;
  design_raw: string | null;
  size_raw: string;
  stock_total: number;
  reason: string;
  portal_candidates: Array<{
    product_name: string;
    design: string | null;
    size: string;
  }>;
}

interface MissingItem {
  product_id: string;
  product_name: string;
  design: string | null;
  size: string;
}

interface IgnoredItem {
  bezeichnung: string;
  model_raw: string;
  design_raw: string | null;
  size_raw: string;
  stock_total: number;
  reason: string;
}

interface CreatedLockedItem {
  model: string;
  design: string | null;
  size: string;
  stock: number;
  product_id: string;
  reason: string;
}

// ─── Route Handler ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Auth guard
    const authClient = await createAuthClient();
    const authResult = await authClient.auth.getUser();
    const user = authResult.data?.user;
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

    if (checkLimit(user.id)) return NextResponse.json({ error: "Zu viele Anfragen. Bitte warten Sie eine Minute." }, { status: 429 });

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Datei ist erforderlich" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Datei zu groß (max. 50 MB)" }, { status: 413 });
    }

    const csvText = await file.text();

    // ── Phases 1-5: Deterministic CSV parsing ──
    const { aggregated, csvRowCount, filteredCount } = parseStockCSV(csvText);

    if (aggregated.length === 0) {
      return NextResponse.json({
        items: [],
        review_needed: [],
        missing_in_csv: [],
        ignored: [],
        created_locked: [],
        summary: {
          total: 0,
          matched: 0,
          review_needed: 0,
          missing_in_csv: 0,
          ignored: 0,
          created_locked: 0,
          csv_rows: csvRowCount,
          filtered_items: filteredCount,
          llm_fallback_used: false,
          llm_fallback_count: 0,
        },
      });
    }

    // ── Phase 6: Load & normalize portal products ──
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const [{ data: allProducts }, { data: allSizes }, { data: allColors }] =
      await Promise.all([
        supabase.from("products").select("id, name, slug, is_active, source").order("name"),
        supabase.from("product_sizes").select("id, product_id, size_label, sku, stock_quantity").order("sort_order"),
        supabase.from("product_colors").select("id, product_id, color_name").order("sort_order"),
      ]);

    // Build portal variant list: one entry per product × size × color
    const portalVariants: PortalVariant[] = [];
    // Also track model+size groups for partial matching
    const portalByModelSize = new Map<string, PortalVariant[]>();

    for (const product of allProducts ?? []) {
      const productSizes = (allSizes ?? []).filter((s) => s.product_id === product.id);
      const productColors = (allColors ?? []).filter((c) => c.product_id === product.id);

      for (const size of productSizes) {
        if (productColors.length === 0) {
          // Product has no colors — create variant without color
          const msKey = modelSizeKey(product.name, size.size_label);
          const designNorm = normalizeDesign(null);
          const mKey = `${normalizeModel(product.name)}||${designNorm}||${normalizeSize(size.size_label)}`;
          const variant: PortalVariant = {
            product_id: product.id,
            product_name: product.name,
            size_id: size.id,
            size_label: size.size_label,
            color_id: null,
            color_name: null,
            current_stock: size.stock_quantity,
            match_key: mKey,
            model_size_key: msKey,
            design_normalized: designNorm,
          };
          portalVariants.push(variant);
          const group = portalByModelSize.get(msKey) ?? [];
          group.push(variant);
          portalByModelSize.set(msKey, group);
        } else {
          for (const color of productColors) {
            const msKey = modelSizeKey(product.name, size.size_label);
            const designNorm = normalizeDesign(color.color_name);
            const mKey = `${normalizeModel(product.name)}||${designNorm}||${normalizeSize(size.size_label)}`;
            const variant: PortalVariant = {
              product_id: product.id,
              product_name: product.name,
              size_id: size.id,
              size_label: size.size_label,
              color_id: color.id,
              color_name: color.color_name,
              current_stock: size.stock_quantity,
              match_key: mKey,
              model_size_key: msKey,
              design_normalized: designNorm,
            };
            portalVariants.push(variant);
            const group = portalByModelSize.get(msKey) ?? [];
            group.push(variant);
            portalByModelSize.set(msKey, group);
          }
        }
      }
    }

    // Build exact match key → portal variant map
    const portalByKey = new Map<string, PortalVariant[]>();
    for (const pv of portalVariants) {
      const arr = portalByKey.get(pv.match_key) ?? [];
      arr.push(pv);
      portalByKey.set(pv.match_key, arr);
    }

    // ── Phase 7: Matching engine ──
    const matchedItems: MatchedItem[] = [];
    const reviewItems: ReviewItem[] = [];
    const ignoredItems: IgnoredItem[] = [];
    const designMismatches: Array<{
      csv: AggregatedVariant;
      candidates: PortalVariant[];
    }> = [];

    // Track which portal variants received a match
    const matchedPortalKeys = new Set<string>();

    for (const csv of aggregated) {
      // Phase 8: Safety — reject invalid rows
      if (csv.stock_total < 0 || !csv.model_normalized || !csv.size_normalized) {
        ignoredItems.push({
          bezeichnung: csv.bezeichnung,
          model_raw: csv.model_raw,
          design_raw: csv.design_raw,
          size_raw: csv.size_raw,
          stock_total: csv.stock_total,
          reason: "invalid_data",
        });
        continue;
      }

      // Validate size against known valid sizes
      if (!isValidSize(csv.size_normalized)) {
        reviewItems.push({
          bezeichnung: csv.bezeichnung,
          model_raw: csv.model_raw,
          design_raw: csv.design_raw,
          size_raw: csv.size_raw,
          stock_total: csv.stock_total,
          reason: "unknown_size",
          portal_candidates: [],
        });
        continue;
      }

      // Tier 1: Exact match
      const exactMatches = portalByKey.get(csv.match_key);
      if (exactMatches && exactMatches.length === 1) {
        const pv = exactMatches[0];
        matchedItems.push(buildMatchedItem(csv, pv, "exact"));
        matchedPortalKeys.add(`${pv.product_id}||${pv.size_label}||${pv.color_name ?? ""}`);
        continue;
      }
      if (exactMatches && exactMatches.length > 1) {
        // Ambiguous exact match — multiple portal variants with same key
        reviewItems.push({
          bezeichnung: csv.bezeichnung,
          model_raw: csv.model_raw,
          design_raw: csv.design_raw,
          size_raw: csv.size_raw,
          stock_total: csv.stock_total,
          reason: "ambiguous_exact_match",
          portal_candidates: exactMatches.map((pv) => ({
            product_name: pv.product_name,
            design: pv.color_name,
            size: pv.size_label,
          })),
        });
        continue;
      }

      // Tier 2: Partial match (model + size, ignoring design)
      const msGroup = portalByModelSize.get(csv.model_size_key);
      if (!msGroup || msGroup.length === 0) {
        // No portal product matches this model+size at all
        ignoredItems.push({
          bezeichnung: csv.bezeichnung,
          model_raw: csv.model_raw,
          design_raw: csv.design_raw,
          size_raw: csv.size_raw,
          stock_total: csv.stock_total,
          reason: "no_matching_portal_product",
        });
        continue;
      }

      // Model+size matched — check design
      if (msGroup.length === 1 && !csv.design_normalized) {
        // Only 1 portal variant and CSV has no design — auto-match
        const pv = msGroup[0];
        matchedItems.push(buildMatchedItem(csv, pv, "model_size_only"));
        matchedPortalKeys.add(`${pv.product_id}||${pv.size_label}||${pv.color_name ?? ""}`);
        continue;
      }

      if (msGroup.length === 1 && csv.design_normalized) {
        const pv = msGroup[0];
        // Only auto-match if the single portal design matches the CSV design
        // or if the portal variant has no design at all
        if (!pv.design_normalized || pv.design_normalized === csv.design_normalized) {
          matchedItems.push(buildMatchedItem(csv, pv, "single_design_auto"));
          matchedPortalKeys.add(`${pv.product_id}||${pv.size_label}||${pv.color_name ?? ""}`);
          continue;
        }
        // Design mismatch with single portal option — queue for LLM or review
        designMismatches.push({ csv, candidates: msGroup });
        continue;
      }

      // Multiple designs exist for this model+size
      // Try normalized design matching against portal candidates
      const designMatch = msGroup.find(
        (pv) => pv.design_normalized === csv.design_normalized && csv.design_normalized !== "",
      );
      if (designMatch) {
        matchedItems.push(buildMatchedItem(csv, designMatch, "design_normalized"));
        matchedPortalKeys.add(`${designMatch.product_id}||${designMatch.size_label}||${designMatch.color_name ?? ""}`);
        continue;
      }

      // No design match found — queue for LLM fallback
      if (csv.design_raw) {
        designMismatches.push({ csv, candidates: msGroup });
      } else {
        // No design in CSV, multiple in portal — ambiguous
        reviewItems.push({
          bezeichnung: csv.bezeichnung,
          model_raw: csv.model_raw,
          design_raw: csv.design_raw,
          size_raw: csv.size_raw,
          stock_total: csv.stock_total,
          reason: "no_design_multiple_options",
          portal_candidates: msGroup.map((pv) => ({
            product_name: pv.product_name,
            design: pv.color_name,
            size: pv.size_label,
          })),
        });
      }
    }

    // ── Phase 7 Tier 3: LLM fallback for design resolution ──
    let llmFallbackUsed = false;
    let llmFallbackCount = 0;

    if (designMismatches.length > 0 && process.env.GEMINI_API_KEY) {
      llmFallbackUsed = true;
      llmFallbackCount = designMismatches.length;

      try {
        const resolved = await resolveDesignsWithLLM(designMismatches);

        for (let i = 0; i < designMismatches.length; i++) {
          const { csv, candidates } = designMismatches[i];
          const resolution = resolved[i];

          if (resolution && resolution.confidence >= 0.95) {
            // Find the portal variant matching the LLM's answer
            const pv = candidates.find(
              (c) => c.color_name?.toLowerCase() === resolution.design_match?.toLowerCase(),
            );
            if (pv) {
              matchedItems.push(buildMatchedItem(csv, pv, "llm_design_resolved"));
              matchedPortalKeys.add(`${pv.product_id}||${pv.size_label}||${pv.color_name ?? ""}`);
              continue;
            }
          }

          // LLM couldn't resolve or low confidence
          reviewItems.push({
            bezeichnung: csv.bezeichnung,
            model_raw: csv.model_raw,
            design_raw: csv.design_raw,
            size_raw: csv.size_raw,
            stock_total: csv.stock_total,
            reason: resolution
              ? `llm_low_confidence_${resolution.confidence.toFixed(2)}`
              : "llm_no_match",
            portal_candidates: candidates.map((pv) => ({
              product_name: pv.product_name,
              design: pv.color_name,
              size: pv.size_label,
            })),
          });
        }
      } catch (llmErr) {
        console.error("[stock-csv] LLM fallback failed:", llmErr);
        // Move all design mismatches to review
        for (const { csv, candidates } of designMismatches) {
          reviewItems.push({
            bezeichnung: csv.bezeichnung,
            model_raw: csv.model_raw,
            design_raw: csv.design_raw,
            size_raw: csv.size_raw,
            stock_total: csv.stock_total,
            reason: "llm_fallback_failed",
            portal_candidates: candidates.map((pv) => ({
              product_name: pv.product_name,
              design: pv.color_name,
              size: pv.size_label,
            })),
          });
        }
      }
    } else if (designMismatches.length > 0) {
      // No API key — move all to review
      for (const { csv, candidates } of designMismatches) {
        reviewItems.push({
          bezeichnung: csv.bezeichnung,
          model_raw: csv.model_raw,
          design_raw: csv.design_raw,
          size_raw: csv.size_raw,
          stock_total: csv.stock_total,
          reason: "design_mismatch_no_llm",
          portal_candidates: candidates.map((pv) => ({
            product_name: pv.product_name,
            design: pv.color_name,
            size: pv.size_label,
          })),
        });
      }
    }

    // ── Phase 9: Missing in CSV ──
    const missingItems: MissingItem[] = [];
    for (const pv of portalVariants) {
      const key = `${pv.product_id}||${pv.size_label}||${pv.color_name ?? ""}`;
      if (!matchedPortalKeys.has(key)) {
        missingItems.push({
          product_id: pv.product_id,
          product_name: pv.product_name,
          design: pv.color_name,
          size: pv.size_label,
        });
      }
    }

    // ── Phase 10: Portal-only policy ─────────────────────────────────
    // NO auto-creation. Items without a matching portal product are reported
    // in `ignored` for admin visibility. Admin must manually add the product
    // + size + color via the product admin if they want stock tracking. This
    // mirrors the /api/sync-stock invariant #1 (portal-only).
    const createdLocked: CreatedLockedItem[] = [];
    const remainingIgnored: IgnoredItem[] = ignoredItems;

    // ── Response ──
    return NextResponse.json({
      items: matchedItems,
      review_needed: reviewItems,
      missing_in_csv: missingItems,
      ignored: remainingIgnored,
      created_locked: createdLocked,
      summary: {
        total: aggregated.length,
        matched: matchedItems.length,
        review_needed: reviewItems.length,
        missing_in_csv: missingItems.length,
        ignored: remainingIgnored.length,
        created_locked: createdLocked.length,
        csv_rows: csvRowCount,
        filtered_items: filteredCount,
        llm_fallback_used: llmFallbackUsed,
        llm_fallback_count: llmFallbackCount,
      },
    });
  } catch (error) {
    console.error("Stock CSV parse error:", error);
    return NextResponse.json(
      { error: "Fehler beim Parsen der Bestandsliste" },
      { status: 500 },
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function buildMatchedItem(
  csv: AggregatedVariant,
  pv: PortalVariant,
  basis: string,
): MatchedItem {
  return {
    bezeichnung: csv.bezeichnung,
    product_id: pv.product_id,
    product_name: pv.product_name,
    size_label: pv.size_label,
    size_id: pv.size_id,
    color_name: pv.color_name,
    color_id: pv.color_id,
    count: csv.stock_total,
    current_stock: pv.current_stock,
    matched: true,
    color_matched: !!pv.color_id,
    match_basis: basis,
  };
}

// ─── LLM Design Resolution (Tier 3 fallback) ────────────────────────

interface DesignResolution {
  design_match: string | null;
  confidence: number;
}

async function resolveDesignsWithLLM(
  mismatches: Array<{ csv: AggregatedVariant; candidates: PortalVariant[] }>,
): Promise<DesignResolution[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0,
    },
  });

  const queries = mismatches.map(({ csv, candidates }) => ({
    csv_design: csv.design_raw,
    csv_bezeichnung: csv.bezeichnung,
    portal_designs: [...new Set(candidates.map((c) => c.color_name).filter(Boolean))],
    product_name: candidates[0]?.product_name ?? csv.model_raw,
  }));

  const prompt = `You are a color/design name matcher for paraglider products.

For each query, determine which portal_design (if any) matches the csv_design.
The csv_design comes from an ERP system and may be in German or use different naming.
The portal_designs are the official design names in our catalog.

RULES:
- Return ONLY one of the portal_designs values, or null if no match
- confidence must be >= 0.95 for a match
- NEVER guess or create new values
- Common translations: Blau=Blue, Rot=Red, Grün=Green, Gelb=Yellow, Schwarz=Black, Weiß=White
- Some designs are abstract names (Cosmic, Energy, Berry) — match only if clearly the same

QUERIES:
${JSON.stringify(queries, null, 2)}

Return a JSON array with one entry per query:
[{"design_match": "string|null", "confidence": 0.0}]`;

  const result = await model.generateContent([{ text: prompt }]);
  const responseText = result.response.text().trim();

  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("[stock-csv] LLM design resolution returned no JSON array");
    return mismatches.map(() => ({ design_match: null, confidence: 0 }));
  }

  const parsed: DesignResolution[] = JSON.parse(jsonMatch[0]);

  // Ensure array length matches
  while (parsed.length < mismatches.length) {
    parsed.push({ design_match: null, confidence: 0 });
  }

  return parsed;
}

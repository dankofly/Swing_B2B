import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import { parseStockCSV } from "@/lib/stock-csv-parser";
import { stockMatchKey } from "@/lib/canonical-keys";

export const maxDuration = 60;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Machine-to-machine stock sync endpoint.
 *
 * Used by a scheduled task on the WinLine machine to push the daily
 * Bestandsliste CSV without needing a human in the loop. Token auth only —
 * no cookies, no Supabase user context. Deterministic matching (no Gemini
 * fallback); items that don't match exactly are returned in `unmatched` for
 * the next manual review instead of silently dropped.
 *
 * Auth: `Authorization: Bearer ${STOCK_SYNC_TOKEN}` header.
 * Body: multipart/form-data with `file` field (CSV) OR raw text/csv body.
 */
export async function POST(request: NextRequest) {
  try {
    const token = process.env.STOCK_SYNC_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "sync endpoint is not configured" },
        { status: 503 },
      );
    }

    const authHeader = request.headers.get("authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "missing bearer token" }, { status: 401 });
    }
    const presented = authHeader.slice("Bearer ".length).trim();

    // Constant-time comparison
    const a = Buffer.from(presented);
    const b = Buffer.from(token);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }

    // Accept either multipart upload (field: `file`) or raw text/csv body
    let csvText: string;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "file field is required" }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "file too large (max 50 MB)" }, { status: 413 });
      }
      csvText = await file.text();
    } else if (contentType.startsWith("text/csv") || contentType.startsWith("text/plain")) {
      const buf = await request.arrayBuffer();
      if (buf.byteLength > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "body too large (max 50 MB)" }, { status: 413 });
      }
      csvText = new TextDecoder("utf-8").decode(buf);
    } else {
      return NextResponse.json(
        { error: "unsupported content-type (expected multipart/form-data or text/csv)" },
        { status: 415 },
      );
    }

    if (!csvText || csvText.trim().length < 20) {
      return NextResponse.json({ error: "empty or too short CSV" }, { status: 400 });
    }

    // ─── Parse CSV (deterministic pipeline, no LLM) ────────────────────
    const { aggregated, csvRowCount, filteredCount } = parseStockCSV(csvText);

    const started = Date.now();

    if (aggregated.length === 0) {
      return NextResponse.json({
        success: true,
        synced: 0,
        unmatched: 0,
        csv_rows: csvRowCount,
        filtered_items: filteredCount,
        unmatched_items: [],
        duration_ms: Date.now() - started,
      });
    }

    // ─── Load portal variants and build match-key map ──────────────────
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const [
      { data: products, error: pErr },
      { data: sizes, error: sErr },
      { data: colors, error: cErr },
    ] = await Promise.all([
      supabase.from("products").select("id, name, is_active"),
      supabase.from("product_sizes").select("id, product_id, size_label, stock_quantity"),
      supabase.from("product_colors").select("id, product_id, color_name"),
    ]);

    if (pErr || sErr || cErr) {
      return NextResponse.json(
        { error: `failed to load portal data: ${pErr?.message || sErr?.message || cErr?.message}` },
        { status: 500 },
      );
    }

    interface PortalSize {
      size_id: string;
      product_id: string;
      product_name: string;
      size_label: string;
      current_stock: number;
    }

    // Build two maps:
    //   - keyed by (model + design + size)   — preferred (if product has color variants)
    //   - keyed by (model + size)            — fallback (if product has no colors)
    const byFullKey = new Map<string, PortalSize>();
    const byModelSize = new Map<string, PortalSize>();

    for (const product of products ?? []) {
      const productSizes = (sizes ?? []).filter((s) => s.product_id === product.id);
      const productColors = (colors ?? []).filter((c) => c.product_id === product.id);

      for (const size of productSizes) {
        const portalSize: PortalSize = {
          size_id: size.id,
          product_id: product.id,
          product_name: product.name,
          size_label: size.size_label,
          current_stock: size.stock_quantity ?? 0,
        };
        const msKey = stockMatchKey(product.name, null, size.size_label);
        byModelSize.set(msKey, portalSize);

        if (productColors.length === 0) {
          // Product without colors — single entry, key both with and without design
          byFullKey.set(msKey, portalSize);
        } else {
          // Product with colors — one entry per color
          for (const color of productColors) {
            const fullKey = stockMatchKey(product.name, color.color_name, size.size_label);
            byFullKey.set(fullKey, portalSize);
          }
        }
      }
    }

    // ─── Match + collect updates (deduplicate by size_id) ─────────────
    interface UnmatchedItem {
      model: string;
      design: string | null;
      size: string;
      stock: number;
      match_key: string;
    }

    const updateBySizeId = new Map<string, number>();
    const unmatched: UnmatchedItem[] = [];

    for (const item of aggregated) {
      // Try exact (model+design+size) first, then model+size fallback
      const hit = byFullKey.get(item.match_key) ?? byModelSize.get(item.model_size_key);
      if (hit) {
        // Aggregate across rows that resolve to the same size
        const prev = updateBySizeId.get(hit.size_id) ?? 0;
        updateBySizeId.set(hit.size_id, prev + item.stock_total);
      } else {
        unmatched.push({
          model: item.model_raw,
          design: item.design_raw,
          size: item.size_raw,
          stock: item.stock_total,
          match_key: item.match_key,
        });
      }
    }

    // ─── Bulk update stock_quantity ────────────────────────────────────
    // Only update rows whose value actually changed — cheaper and safer.
    const currentBySizeId = new Map<string, number>(
      (sizes ?? []).map((s) => [s.id, s.stock_quantity ?? 0]),
    );

    const updates: Array<{ size_id: string; new_stock: number; old_stock: number }> = [];
    for (const [sizeId, newStock] of updateBySizeId) {
      const oldStock = currentBySizeId.get(sizeId) ?? 0;
      if (oldStock !== newStock) {
        updates.push({ size_id: sizeId, new_stock: newStock, old_stock: oldStock });
      }
    }

    // Execute updates in parallel (bounded)
    const BATCH_SIZE = 10;
    let updateErrors = 0;
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((u) =>
          supabase
            .from("product_sizes")
            .update({ stock_quantity: u.new_stock })
            .eq("id", u.size_id),
        ),
      );
      updateErrors += results.filter((r) => r.error).length;
    }

    return NextResponse.json({
      success: true,
      synced: updates.length,
      unchanged: updateBySizeId.size - updates.length,
      unmatched: unmatched.length,
      update_errors: updateErrors,
      csv_rows: csvRowCount,
      filtered_items: filteredCount,
      unmatched_items: unmatched.slice(0, 50), // cap response size
      duration_ms: Date.now() - started,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[sync-stock] Error:", msg);
    return NextResponse.json({ error: msg.slice(0, 500) }, { status: 500 });
  }
}

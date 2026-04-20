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
 * fallback); items that don't match exactly are returned in
 * `items_not_in_portal` for the next manual review instead of silently dropped.
 *
 * ─── INVARIANTS ────────────────────────────────────────────────────────
 * 1. Portal-only: only product_sizes rows that already exist in the B2B
 *    portal are ever touched. WinLine items with no matching portal product
 *    are collected into `items_not_in_portal` and reported — no INSERT,
 *    no new-product creation, no schema changes.
 * 2. Idempotent: re-running with the same CSV produces zero updates.
 * 3. No cascade: `products`, `product_colors`, `customer_prices`, etc. are
 *    never modified by this route.
 * ──────────────────────────────────────────────────────────────────────
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
        portal_updated: 0,
        portal_unchanged: 0,
        portal_untouched: 0,
        items_not_in_portal: 0,
        csv_rows: csvRowCount,
        filtered_items: filteredCount,
        items_not_in_portal_sample: [],
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

    // ─── Match CSV items against portal products ──────────────────────
    // By construction `byFullKey` and `byModelSize` contain ONLY portal
    // product_sizes — a CSV item can therefore only resolve to a
    // size_id that already exists in the B2B portal.
    interface ItemNotInPortal {
      model: string;
      design: string | null;
      size: string;
      stock: number;
      match_key: string;
    }

    const portalSizeIds = new Set<string>((sizes ?? []).map((s) => s.id));
    const updateBySizeId = new Map<string, number>();
    const itemsNotInPortal: ItemNotInPortal[] = [];

    for (const item of aggregated) {
      const hit = byFullKey.get(item.match_key) ?? byModelSize.get(item.model_size_key);
      if (hit) {
        const prev = updateBySizeId.get(hit.size_id) ?? 0;
        updateBySizeId.set(hit.size_id, prev + item.stock_total);
      } else {
        itemsNotInPortal.push({
          model: item.model_raw,
          design: item.design_raw,
          size: item.size_raw,
          stock: item.stock_total,
          match_key: item.match_key,
        });
      }
    }

    // ─── Bulk update stock_quantity ────────────────────────────────────
    // Only portal-known size_ids + only rows whose value actually changed.
    const currentBySizeId = new Map<string, number>(
      (sizes ?? []).map((s) => [s.id, s.stock_quantity ?? 0]),
    );

    const updates: Array<{ size_id: string; new_stock: number; old_stock: number }> = [];
    for (const [sizeId, newStock] of updateBySizeId) {
      // Defensive guard: invariant #1 — reject anything that somehow
      // slipped through without being a known portal size_id.
      if (!portalSizeIds.has(sizeId)) continue;
      const oldStock = currentBySizeId.get(sizeId) ?? 0;
      if (oldStock !== newStock) {
        updates.push({ size_id: sizeId, new_stock: newStock, old_stock: oldStock });
      }
    }

    const touchedSizeIds = new Set(updateBySizeId.keys());
    const portalUntouchedCount = portalSizeIds.size - touchedSizeIds.size;

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
      // Portal-only accounting — only products that exist in the B2B portal:
      portal_total: portalSizeIds.size,
      portal_updated: updates.length,
      portal_unchanged: updateBySizeId.size - updates.length,
      portal_untouched: portalUntouchedCount, // in portal but missing from CSV
      // CSV items that have no corresponding portal product — NOT updated:
      items_not_in_portal: itemsNotInPortal.length,
      items_not_in_portal_sample: itemsNotInPortal.slice(0, 50),
      update_errors: updateErrors,
      csv_rows: csvRowCount,
      filtered_items: filteredCount,
      duration_ms: Date.now() - started,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[sync-stock] Error:", msg);
    return NextResponse.json({ error: msg.slice(0, 500) }, { status: 500 });
  }
}

#!/usr/bin/env node
/**
 * One-shot verification script: parses a real WinLine Bestandsliste CSV
 * through the same pipeline the /api/sync-stock endpoint uses, and prints
 * what the parser extracted. Useful for debugging without hitting the API.
 *
 * Usage:
 *   node scripts/winline-sync/verify-parse.mjs path/to/export.csv
 */

import { readFileSync } from "node:fs";
import { argv, exit } from "node:process";

const file = argv[2];
if (!file) {
  console.error("usage: node scripts/winline-sync/verify-parse.mjs <csv-path>");
  exit(1);
}

// Import the parser directly — use the compiled JS from .next? No, use ts import.
// Easiest: use esbuild-register or tsx. For a one-shot script, just run via tsx.

const csv = readFileSync(file, "utf-8");

const { parseStockCSV } = await import(
  new URL("../../src/lib/stock-csv-parser.ts", import.meta.url).href
);
const result = parseStockCSV(csv);

console.log(`\n── Input ─────────────────────────────────`);
console.log(`CSV rows (data):       ${result.csvRowCount}`);
console.log(`Passed filter:         ${result.filteredCount}`);
console.log(`Aggregated variants:   ${result.aggregated.length}`);

const totalStock = result.aggregated.reduce((s, v) => s + v.stock_total, 0);
console.log(`Total stock units:     ${totalStock}`);

console.log(`\n── Top 20 variants (by stock) ────────────`);
const sorted = [...result.aggregated].sort((a, b) => b.stock_total - a.stock_total);
for (const v of sorted.slice(0, 20)) {
  console.log(
    `  ${String(v.stock_total).padStart(3)}x  ${v.model_normalized.padEnd(22)} | ${String(v.design_normalized || "—").padEnd(12)} | ${v.size_normalized.padEnd(6)}  ← ${v.source_count} rows`,
  );
}

// Group by model+size (ignoring color) to simulate product_sizes aggregation
const bySize = new Map();
for (const v of result.aggregated) {
  const key = v.model_size_key;
  const entry = bySize.get(key) ?? { model: v.model_normalized, size: v.size_normalized, total: 0, colors: [] };
  entry.total += v.stock_total;
  entry.colors.push(`${v.design_normalized || "—"}:${v.stock_total}`);
  bySize.set(key, entry);
}

console.log(`\n── Model+Size aggregation (portal product_sizes view) ──`);
console.log(`Unique (model, size) keys: ${bySize.size}`);
const sortedSizes = [...bySize.values()].sort((a, b) => b.total - a.total);
for (const e of sortedSizes.slice(0, 15)) {
  console.log(
    `  ${String(e.total).padStart(3)}x  ${e.model.padEnd(22)} | ${e.size.padEnd(6)}  ← colors: ${e.colors.join(", ")}`,
  );
}

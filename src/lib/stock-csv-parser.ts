/**
 * Deterministic stock CSV parser for WinLine ERP exports.
 * Pure functions — no API calls, no DB access.
 *
 * Pipeline: Filter → Extract → Aggregate → Normalize → Match Keys
 */

import {
  normalizeModel,
  normalizeSize,
  normalizeDesign,
  stockMatchKey,
  modelSizeKey,
  isValidSize,
} from "./canonical-keys";

// ─── Types ───────────────────────────────────────────────────────────

export interface CSVFormat {
  artikelCol: number;       // "Artikel" or article number column
  bezeichnungCol: number;   // "Artikel Bezeichnung" column
  artikelgruppeCol: number | null; // "Artikelgruppe" (category filter)
  aug2Col: number | null;   // "AUG 2" (model hint)
  aug3Col: number | null;   // "AUG 3" (size hint)
  lagerstandCol: number | null; // "Lagerstand" (stock quantity)
}

export interface CSVRow {
  artikelNr: string;
  bezeichnung: string;
  artikelgruppe: string | null;
  aug2: string | null;
  aug3: string | null;
  lagerstand: number | null;
}

export interface ExtractedVariant {
  model_raw: string;
  design_raw: string | null;
  size_raw: string;
  stock_raw: number;
  bezeichnung: string;
}

export interface NormalizedVariant extends ExtractedVariant {
  model_normalized: string;
  design_normalized: string;
  size_normalized: string;
  match_key: string;
  model_size_key: string;
}

export interface AggregatedVariant extends NormalizedVariant {
  stock_total: number;
  source_count: number;
}

// ─── Constants ───────────────────────────────────────────────────────

const EXCLUDE_PATTERNS = [
  /unverk[aä]uflich/i,
  /NICHT verkaufen/i,
  /Proto[- ]/i,
  /^Proto,/i,
  /Vorserie/i,
  /ACHTUNG/i,
  /Lasttest/i,
];

/**
 * Artikelgruppe values that indicate spare parts, components, or accessories
 * that should NOT be synced into the B2B portal. Umlaut-stripped variants
 * included because the WinLine export encoding is inconsistent (CP1252/UTF-8
 * round-trips that lose non-ASCII characters).
 */
const SKIP_ARTIKELGRUPPE = new Set([
  "zubehr", "zubehor", "zubehör",
  "motoren u. zubehr", "motoren u. zubehor", "motoren u. zubehör",
  "e-motor zubehr", "e-motor zubehor", "e-motor zubehör",
  "landeschirm bauteil",
  "pasa",
  "versand",
]);

/** Known size labels — order matters (longer first to avoid partial matches). */
const SIZE_LABELS = [
  "XXS", "XXL", "XS", "XL", "SM", "ML", "S", "M", "L",
];

/** Prefixes to strip from Bezeichnung before parsing. */
const STRIP_PREFIXES = [
  /^Gleitschirm\b/i,
  /^Gurtzeug\b/i,
  /^Rettungsger[aä]t\b/i,
  /^Rettung\b/i,
  /^Speedflyer\b/i,
  /^Miniwing\b/i,
  /^Tandem\b/i,
  /^Parakite\b/i,
];

// ─── Phase 1: CSV Parsing & Filtering ────────────────────────────────

/** Parse a single semicolon-delimited CSV line, handling quoted fields. */
export function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ";" && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

/** Detect CSV format by inspecting the header row. */
export function detectCSVFormat(headerLine: string): CSVFormat {
  const cols = parseCSVLine(headerLine).map((c) => c.trim().toLowerCase());

  // Find key columns by header name
  let artikelCol = -1;
  let bezeichnungCol = -1;
  let artikelgruppeCol: number | null = null;
  let aug2Col: number | null = null;
  let aug3Col: number | null = null;
  let lagerstandCol: number | null = null;

  for (let i = 0; i < cols.length; i++) {
    const c = cols[i];
    if (c === "artikel" || c === "artikel nummer" || c === "artikelnr" || c === "artikelnummer") {
      // Prefer "artikel nummer" over "artikel" (the former is the SKU, the latter is a display string).
      // If we already have a column, only overwrite for a more specific header name.
      if (artikelCol === -1 || c === "artikel nummer" || c === "artikelnummer" || c === "artikelnr") {
        artikelCol = i;
      }
    } else if (c === "artikel bezeichnung" || c === "bezeichnung" || c === "artikelbezeichnung") {
      bezeichnungCol = i;
    } else if (c === "artikelgruppe" || c === "warengruppe") {
      artikelgruppeCol = i;
    } else if (c === "aug 2" || c === "aug2") {
      aug2Col = i;
    } else if (c === "aug 3" || c === "aug3") {
      aug3Col = i;
    } else if (c === "lagerstand" || c === "bestand" || c === "lager" || c === "menge") {
      // Prefer the first "Lagerstand" (main warehouse) over "Lagerstand 2" etc.
      if (lagerstandCol === null) lagerstandCol = i;
    }
  }

  // Fallback: assume old 3-column format (index, artikelNr, bezeichnung)
  if (artikelCol === -1) artikelCol = 1;
  if (bezeichnungCol === -1) bezeichnungCol = 2;

  return { artikelCol, bezeichnungCol, artikelgruppeCol, aug2Col, aug3Col, lagerstandCol };
}

/** Check if a row should be excluded based on patterns. */
function shouldExclude(bezeichnung: string): boolean {
  return EXCLUDE_PATTERNS.some((p) => p.test(bezeichnung));
}

/** Clean a Bezeichnung string for processing.
 *
 * Cuts off freetext comments that WinLine operators append to the article
 * description. Observed patterns in real exports:
 *   - `Model Size Color; free text`               → split on ";"
 *   - `Model Size Color, free text`               → split on ","
 *   - `Model Size Color - Stückprüfung 21.5.2025` → strip "- …prüfung …"
 *   - `Model Size Color ** internal note`         → strip "** …"
 * Colors in the SWING catalogue never contain `,` or `;`, so cutting on
 * them is safe (verified against real WinLine exports, 260+ rows).
 */
function cleanBezeichnung(raw: string): string {
  let cleaned = raw.split(";")[0].split(",")[0].trim();
  cleaned = cleaned.replace(/\*{2,}.*$/, "").trim();
  cleaned = cleaned.replace(/\s*-\s*\w+pr[uü]fung.*$/i, "").trim();
  cleaned = cleaned.replace(/\s*-\s*St[uü]ckpr[uü]fung.*$/i, "").trim();
  return cleaned;
}

/** Parse German number format: "1,00" → 1, "30,00" → 30, "0,00" → 0. */
function parseGermanNumber(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.trim().replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.floor(num);
}

/** Filter CSV lines to relevant NL/NE rows and parse them. */
export function filterRelevantRows(
  lines: string[],
  format: CSVFormat,
): { rows: CSVRow[]; csvRowCount: number } {
  const rows: CSVRow[] = [];
  const dataLines = lines.slice(1); // skip header

  for (const line of dataLines) {
    const cols = parseCSVLine(line);
    if (cols.length <= Math.max(format.artikelCol, format.bezeichnungCol)) continue;

    const artikelNr = cols[format.artikelCol]?.trim() ?? "";
    const bezeichnung = cols[format.bezeichnungCol]?.trim() ?? "";

    if (!artikelNr || !bezeichnung) continue;
    if (!/-NL-/i.test(artikelNr) && !/-NE-/i.test(artikelNr)) continue;
    if (shouldExclude(bezeichnung)) continue;

    const artikelgruppe = format.artikelgruppeCol !== null
      ? (cols[format.artikelgruppeCol]?.trim() || null)
      : null;

    // Skip spare parts / components / accessories — they don't belong in the B2B portal.
    if (artikelgruppe && SKIP_ARTIKELGRUPPE.has(artikelgruppe.toLowerCase())) continue;

    const aug2 = format.aug2Col !== null ? (cols[format.aug2Col]?.trim() || null) : null;
    const aug3 = format.aug3Col !== null ? (cols[format.aug3Col]?.trim() || null) : null;
    const lagerstand = format.lagerstandCol !== null
      ? parseGermanNumber(cols[format.lagerstandCol] ?? "")
      : null;

    rows.push({
      artikelNr,
      bezeichnung: cleanBezeichnung(bezeichnung),
      artikelgruppe,
      aug2,
      aug3,
      lagerstand,
    });
  }

  return { rows, csvRowCount: dataLines.length };
}

// ─── Phase 2: Extraction ─────────────────────────────────────────────

/** Parse Bezeichnung into model, size, design using rule-based extraction. */
function parseBezeichnung(bezeichnung: string): {
  model: string;
  size: string;
  design: string | null;
} {
  let text = bezeichnung.trim();

  // Strip known prefixes
  for (const prefix of STRIP_PREFIXES) {
    text = text.replace(prefix, "").trim();
  }

  // Remove parenthetical notes (rescue device weight ranges like "(22)", "(30)")
  text = text.replace(/\s*\([^)]*\)\s*/g, " ").trim();

  // Tokenize
  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { model: text, size: "", design: null };

  // Find size token (scan from right)
  let sizeIndex = -1;
  let sizeValue = "";

  for (let i = tokens.length - 1; i >= 0; i--) {
    const upper = tokens[i].toUpperCase();
    // Check known size labels
    if (SIZE_LABELS.includes(upper)) {
      sizeIndex = i;
      sizeValue = upper;
      break;
    }
    // Check numeric sizes (e.g., "11", "9,5", "8.5") — must be standalone number
    if (/^\d+([.,]\d+)?$/.test(tokens[i])) {
      sizeIndex = i;
      sizeValue = tokens[i];
      break;
    }
  }

  // Special case: Spitfire-style "3.11" or "3.9,5" — dot-separated model.size
  // If no explicit size found, look for dotted version number
  if (sizeIndex === -1) {
    for (let i = 0; i < tokens.length; i++) {
      const match = tokens[i].match(/^(\d+)[.](\d+(?:[.,]\d+)?)$/);
      if (match) {
        // Split: model gets the first part, size gets the second
        tokens.splice(i, 1, match[1], match[2]);
        sizeIndex = i + 1;
        sizeValue = match[2];
        break;
      }
    }
  }

  if (sizeIndex === -1) {
    // No size found — entire text is model, no design
    return { model: text, size: "", design: null };
  }

  // Everything before size = model, everything after size = design
  const modelTokens = tokens.slice(0, sizeIndex);
  const designTokens = tokens.slice(sizeIndex + 1);

  const model = modelTokens.join(" ");
  const design = designTokens.length > 0 ? designTokens.join(" ") : null;

  return { model, size: sizeValue, design };
}

/** Extract size from AUG 3 by stripping the AUG 2 model prefix.
 *
 * AUG 3 contains "model size" (e.g. "Mito 2 RS ML"), NOT just size.
 * We strip the AUG 2 prefix to get the actual size part.
 *
 * Examples:
 *   aug2="Mito 2 RS",  aug3="Mito 2 RS ML"   → "ML"
 *   aug2="Spitfire 3",  aug3="Spitfire 3.9,5" → "9,5"
 *   aug2="ESCAPE",      aug3="Escape 30"       → "30"
 */
function extractSizeFromAug3(aug2: string, aug3: string): string | null {
  const aug2Clean = aug2.trim();
  const aug3Clean = aug3.trim();

  // Case-insensitive prefix match
  if (aug3Clean.toLowerCase().startsWith(aug2Clean.toLowerCase())) {
    const remainder = aug3Clean.slice(aug2Clean.length);
    // Strip leading dots, spaces, hyphens (e.g. "Spitfire 3.9,5" → ".9,5" → "9,5")
    const size = remainder.replace(/^[.\s-]+/, "").trim();
    return size || null;
  }

  return null;
}

/** Pick the best model name from AUG 2 vs. parsed Bezeichnung.
 *
 * Three cases observed in real WinLine exports:
 *
 * (A) AUG 2 == parsed.model                  → either works, pick AUG 2 (ERP-canonical)
 *     "Miura 2 RS" / "Miura 2 RS"
 *
 * (B) parsed.model extends AUG 2 with variant → pick parsed (more specific)
 *     AUG 2 "Wave RS" / parsed "Wave RS D-Lite" — Bezeichnung has "D-Lite", AUG 2 is incomplete
 *
 * (C) AUG 2 is a category label, unrelated   → pick parsed
 *     AUG 2 "Gurtzeugzubehr" / parsed "Airbag Brave" — AUG 2 is not in Bezeichnung at all
 *
 * (D) AUG 2 appears in Bezeichnung, no extension → pick AUG 2 (ERP-canonical)
 *     AUG 2 "ESCAPE" / parsed "Escape" — AUG 2 preserves the casing
 */
function pickModel(aug2: string | null, parsedModel: string, bezeichnung: string): string {
  if (!aug2) return parsedModel;
  if (!parsedModel) return aug2;

  const aug2Lower = aug2.toLowerCase();
  const parsedLower = parsedModel.toLowerCase();
  const bezLower = bezeichnung.toLowerCase();

  // Case B: parsed model is a more specific version of AUG 2 (adds variant like "D-Lite")
  if (parsedLower !== aug2Lower && parsedLower.startsWith(aug2Lower + " ")) {
    return parsedModel;
  }

  // Case A or D: AUG 2 appears in Bezeichnung → trust AUG 2 (ERP-canonical spelling)
  if (bezLower.includes(aug2Lower)) {
    return aug2;
  }

  // Case C: AUG 2 is unrelated to Bezeichnung (category label) → ignore AUG 2
  return parsedModel;
}

/** Extract variants from parsed CSV rows. */
export function extractVariants(rows: CSVRow[]): ExtractedVariant[] {
  const variants: ExtractedVariant[] = [];

  for (const row of rows) {
    const parsed = parseBezeichnung(row.bezeichnung);

    const model = pickModel(row.aug2, parsed.model, row.bezeichnung);

    // Determine size: AUG 3 contains "model size" — extract just the size part
    let size: string;
    if (row.aug3 && row.aug2) {
      const extracted = extractSizeFromAug3(row.aug2, row.aug3);
      size = extracted || parsed.size;
    } else if (row.aug3) {
      size = row.aug3;
    } else {
      size = parsed.size;
    }

    const design = parsed.design;
    const stock = row.lagerstand ?? 1; // fallback: each row = 1 unit

    if (!model || !size) continue; // safety: skip if model or size is empty

    // Skip rows whose size is garbage (e.g. "(diverse)", "Zellen/24Ah").
    // AUG 3 sometimes carries category placeholders instead of a real size.
    if (!isValidSize(normalizeSize(size))) continue;

    variants.push({
      model_raw: model,
      design_raw: design,
      size_raw: size,
      stock_raw: stock,
      bezeichnung: row.bezeichnung,
    });
  }

  return variants;
}

// ─── Phase 3: Aggregation ────────────────────────────────────────────

/** Aggregate identical variants (same model+design+size), summing stock. */
export function aggregateVariants(variants: NormalizedVariant[]): AggregatedVariant[] {
  const groups = new Map<string, { variant: NormalizedVariant; total: number; count: number }>();

  for (const v of variants) {
    const key = v.match_key;
    const existing = groups.get(key);
    if (existing) {
      existing.total += v.stock_raw;
      existing.count++;
    } else {
      groups.set(key, { variant: v, total: v.stock_raw, count: 1 });
    }
  }

  return Array.from(groups.values()).map(({ variant, total, count }) => ({
    ...variant,
    stock_total: total,
    source_count: count,
  }));
}

// ─── Phase 4-5: Normalization & Key Generation ───────────────────────

/** Normalize extracted variants and generate match keys. */
export function normalizeVariants(variants: ExtractedVariant[]): NormalizedVariant[] {
  return variants.map((v) => ({
    ...v,
    model_normalized: normalizeModel(v.model_raw),
    design_normalized: normalizeDesign(v.design_raw),
    size_normalized: normalizeSize(v.size_raw),
    match_key: stockMatchKey(v.model_raw, v.design_raw, v.size_raw),
    model_size_key: modelSizeKey(v.model_raw, v.size_raw),
  }));
}

// ─── Full Pipeline (Phases 1-5) ──────────────────────────────────────

export interface ParseResult {
  aggregated: AggregatedVariant[];
  csvRowCount: number;
  filteredCount: number;
}

/** Run the full deterministic parsing pipeline (Phases 1-5). */
export function parseStockCSV(csvText: string): ParseResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return { aggregated: [], csvRowCount: 0, filteredCount: 0 };
  }

  // Phase 1: Filter
  const format = detectCSVFormat(lines[0]);
  const { rows, csvRowCount } = filterRelevantRows(lines, format);

  // Phase 2: Extract
  const extracted = extractVariants(rows);

  // Phase 4-5: Normalize (before aggregation so keys are consistent)
  const normalized = normalizeVariants(extracted);

  // Phase 3: Aggregate (after normalization to group by normalized keys)
  const aggregated = aggregateVariants(normalized);

  return {
    aggregated,
    csvRowCount,
    filteredCount: rows.length,
  };
}

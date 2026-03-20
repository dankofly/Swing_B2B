/**
 * Canonical key generation for deterministic product matching.
 * MUST produce identical keys as services/pdf-parser/normalizer.py.
 */

/** Normalize a product model name to canonical form.
 *
 * "Miura 2 RS D-Lite" -> "miura2d-lite"
 * "Spitfire 3"        -> "spitfire3"
 * "Connect Race Lite" -> "connectracelite"
 */
export function normalizeModel(name: string): string {
  if (!name) return "";
  let s = name.trim().toLowerCase();
  // Normalize unicode (ü -> u, etc.)
  s = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  // Keep "RS" — it is a meaningful part of the canonical product name
  // (e.g., "Miura 2 RS" ≠ "Miura 2")
  // Remove all whitespace
  s = s.replace(/\s+/g, "");
  // Remove special chars except hyphen (needed for "d-lite")
  s = s.replace(/[^a-z0-9\-]/g, "");
  // Remove trailing hyphens
  s = s.replace(/^-+|-+$/g, "");
  return s;
}

/** Normalize a size label to canonical form.
 *
 * "S"             -> "s"
 * "8,5"           -> "8.5"
 * "Einheitsgröße" -> "uni"
 * null            -> "uni"
 */
export function normalizeSize(size: string | null | undefined): string {
  if (!size) return "uni";
  let s = size.trim().toLowerCase();
  // Replace ß before NFKD (ß doesn't decompose with NFKD)
  s = s.replace(/ß/g, "ss");
  // Normalize unicode
  s = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  // Map "one size" variants to "uni"
  const uniVariants = new Set([
    "", "einheitsgrosse", "einheitsgröße", "one size", "onesize",
    "uni", "universal", "os", "one", "-", "unisize",
  ]);
  if (uniVariants.has(s)) return "uni";
  // Comma -> dot for decimal sizes
  s = s.replace(/,/g, ".");
  return s;
}

/** Generate a canonical key from model name and size. */
export function canonicalKey(model: string, size: string | null | undefined): string {
  return `${normalizeModel(model)}_${normalizeSize(size)}`;
}

/** Deterministic German→English color translation map. */
export const DE_EN_COLOR_MAP: Record<string, string> = {
  blau: "blue",
  rot: "red",
  weiss: "white",
  "weiß": "white",
  gruen: "green",
  "grün": "green",
  grun: "green",
  gelb: "yellow",
  schwarz: "black",
  lila: "purple",
  violett: "violet",
  orange: "orange",
  silber: "silver",
  grau: "grey",
  braun: "brown",
  rosa: "pink",
  tuerkis: "turquoise",
  "türkis": "turquoise",
  turkis: "turquoise",
  hellblau: "light blue",
  dunkelblau: "dark blue",
  hellgruen: "light green",
  hellgrun: "light green",
  dunkelgruen: "dark green",
  dunkelgrun: "dark green",
  petrol: "petrol",
  lime: "lime",
  mint: "mint",
  berry: "berry",
  coral: "coral",
  sand: "sand",
  ocean: "ocean",
  forest: "forest",
  cosmic: "cosmic",
  energy: "energy",
  gold: "gold",
};

/** Normalize a design/color name to canonical form.
 *
 * "Blau"    -> "blue"
 * "Cosmic"  -> "cosmic"
 * "GRÜN"    -> "green"
 * null      -> ""
 */
export function normalizeDesign(design: string | null | undefined): string {
  if (!design) return "";
  let s = design.trim().toLowerCase();
  // Replace ß before NFKD (ß doesn't decompose with NFKD)
  s = s.replace(/ß/g, "ss");
  // Normalize unicode (ü -> u, etc.)
  s = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  // Strip trailing punctuation (CSV typos like "Blau:")
  s = s.replace(/[^a-z0-9\s]+$/g, "").trim();
  // Apply deterministic DE→EN map
  const mapped = DE_EN_COLOR_MAP[s];
  if (mapped) return mapped;
  // Clean up whitespace
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/** Known text-based size labels (normalized form). */
const VALID_TEXT_SIZES = new Set([
  "xxs", "xs", "s", "sm", "m", "ml", "l", "xl", "xxl",
  "small", "medium", "large",
  "uni", "unisex",
]);

/** Check if a normalized size is valid.
 *
 * Valid sizes are either:
 * - Known text labels (XS, S, SM, M, ML, L, XL, etc.)
 * - Numeric values in range 7–50 (covers speedflyer, kite, area, and tandem sizes)
 * - "uni" / "unisex"
 */
export function isValidSize(sizeNormalized: string): boolean {
  if (VALID_TEXT_SIZES.has(sizeNormalized)) return true;
  // Accept reasonable numeric sizes (7–50, with optional .5 decimal)
  const num = parseFloat(sizeNormalized);
  if (!isNaN(num) && num >= 7 && num <= 50 && /^\d+(\.\d+)?$/.test(sizeNormalized)) return true;
  return false;
}

/** Generate a stock match key from model, design, and size. */
export function stockMatchKey(
  model: string,
  design: string | null | undefined,
  size: string | null | undefined,
): string {
  return `${normalizeModel(model)}||${normalizeDesign(design)}||${normalizeSize(size)}`;
}

/** Generate a model+size only key (ignoring design) for partial matching. */
export function modelSizeKey(
  model: string,
  size: string | null | undefined,
): string {
  return `${normalizeModel(model)}||${normalizeSize(size)}`;
}

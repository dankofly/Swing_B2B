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
  // Remove "rs" as standalone word (but keep "d-lite" to distinguish models)
  s = s.replace(/\brs\b/g, "");
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

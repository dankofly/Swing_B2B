"""
Normalization utilities for canonical key generation.
Must produce identical keys as src/lib/canonical-keys.ts in TypeScript.
"""

import re
import unicodedata


def normalize_model(name: str) -> str:
    """Normalize a product model name to a canonical form.

    Examples:
        "Miura 2 RS D-Lite" -> "miura2rsd-lite"
        "Spitfire 3"        -> "spitfire3"
        "Connect Race Lite" -> "connectracelite"
        "Brave 5"           -> "brave5"
    """
    if not name:
        return ""
    s = name.strip().lower()
    # Normalize unicode (ü -> u etc.)
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    # Remove "rs" as standalone word (but keep "d-lite" since it distinguishes models)
    s = re.sub(r"\brs\b", "", s)
    # Collapse whitespace and remove spaces
    s = re.sub(r"\s+", "", s)
    # Remove special chars except hyphen (needed for "d-lite")
    s = re.sub(r"[^a-z0-9\-]", "", s)
    # Remove trailing hyphens
    s = s.strip("-")
    return s


def normalize_size(size: str | None) -> str:
    """Normalize a size label to a canonical form.

    Examples:
        "S"              -> "s"
        "8,5"            -> "8.5"
        "Einheitsgröße"  -> "uni"
        None             -> "uni"
        "One Size"       -> "uni"
        "SM"             -> "sm"
    """
    if not size:
        return "uni"
    s = size.strip().lower()
    # Normalize unicode
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    # Map common "one size" variants to "uni"
    uni_variants = {
        "", "einheitsgrosse", "einheitsgröße", "one size", "onesize",
        "uni", "universal", "os", "one", "-", "unisize",
    }
    if s in uni_variants:
        return "uni"
    # Comma -> dot for decimal sizes
    s = s.replace(",", ".")
    return s


def canonical_key(model: str, size: str | None) -> str:
    """Generate a canonical key from model name and size."""
    return f"{normalize_model(model)}_{normalize_size(size)}"

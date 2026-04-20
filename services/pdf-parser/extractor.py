"""
PDF table extraction using pdfplumber.
Handles German price lists with various table formats.
"""

import re
import pdfplumber


# Common header patterns (German price lists)
HEADER_PATTERNS = {
    "product": re.compile(
        r"(modell|produkt|artikel|bezeichnung|beschreibung|name|type|typ)", re.I
    ),
    "size": re.compile(
        r"(gr[öo]ße|size|variante|ausf[üu]hrung)", re.I
    ),
    "uvp": re.compile(
        r"(uvp|unverbindlich|empfohl|brutto|retail|rrp|vk\s*preis|vk-preis|end.?verbraucher)", re.I
    ),
    "dealer_net": re.compile(
        r"(h[äa]ndler|ek|einkauf|netto|dealer|net|wholesale|h[äa]ndlerpreis|ek\s*netto|ek-netto)", re.I
    ),
}


def parse_price(value: str | None) -> float | None:
    """Parse a German-formatted price string to a float.

    Examples:
        "2.190,00 €"  -> 2190.00
        "1.177,82"    -> 1177.82
        "899.00"      -> 899.00
        "auf Anfrage" -> None
    """
    if not value:
        return None
    s = str(value).strip()
    # Skip non-price values
    if re.search(r"(anfrage|request|call|tbd|n/a|-{2,})", s, re.I):
        return None
    # Remove currency symbols and whitespace
    s = re.sub(r"[€$£\s]", "", s)
    if not s:
        return None
    # Detect format: "1.234,56" (German) vs "1,234.56" (English) vs "1234.56"
    if re.match(r"^\d{1,3}(\.\d{3})+(,\d{1,2})?$", s):
        # German: 1.234,56 -> remove dots, comma to dot
        s = s.replace(".", "").replace(",", ".")
    elif "," in s and "." not in s:
        # Simple comma decimal: 1234,56
        s = s.replace(",", ".")
    elif "," in s and "." in s:
        # Ambiguous: check position
        last_comma = s.rfind(",")
        last_dot = s.rfind(".")
        if last_comma > last_dot:
            # German: 1.234,56
            s = s.replace(".", "").replace(",", ".")
        # else English: 1,234.56 -> just remove commas
        else:
            s = s.replace(",", "")
    try:
        val = float(s)
        return val if val > 0 else None
    except ValueError:
        return None


def detect_columns(header_row: list[str | None]) -> dict[str, int | None]:
    """Map header cells to column indices."""
    mapping: dict[str, int | None] = {
        "product": None,
        "size": None,
        "uvp": None,
        "dealer_net": None,
    }
    for idx, cell in enumerate(header_row):
        if not cell:
            continue
        text = str(cell).strip()
        for field, pattern in HEADER_PATTERNS.items():
            if pattern.search(text) and mapping[field] is None:
                mapping[field] = idx
                break
    return mapping


def is_header_row(row: list[str | None]) -> bool:
    """Check if a row looks like a table header."""
    text = " ".join(str(c) for c in row if c)
    matches = sum(1 for p in HEADER_PATTERNS.values() if p.search(text))
    return matches >= 2


def extract_tables_from_pdf(pdf_bytes: bytes) -> list[dict]:
    """Extract price data from a PDF using pdfplumber.

    Returns a list of dicts: [{ product, size, uvp_gross, dealer_net }]
    """
    results: list[dict] = []
    current_product: str | None = None

    with pdfplumber.open(pdf_bytes) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            if not tables:
                # Fallback: try extracting text lines
                text = page.extract_text()
                if text:
                    results.extend(_parse_text_lines(text))
                continue

            for table in tables:
                if not table or len(table) < 2:
                    continue

                # Find header row
                col_map: dict[str, int | None] | None = None
                data_start = 0

                for i, row in enumerate(table):
                    if row and is_header_row(row):
                        col_map = detect_columns(row)
                        data_start = i + 1
                        break

                if not col_map or col_map["dealer_net"] is None:
                    # Try heuristic: assume columns based on position
                    col_map = _guess_columns(table)
                    data_start = 1 if table and is_header_row(table[0]) else 0

                if not col_map:
                    continue

                # Extract data rows
                for row in table[data_start:]:
                    if not row or all(c is None or str(c).strip() == "" for c in row):
                        continue

                    item = _extract_row(row, col_map, current_product)
                    if item:
                        if item.get("product"):
                            current_product = item["product"]
                        elif current_product:
                            item["product"] = current_product
                        results.append(item)

    return _deduplicate(results)


def _extract_row(
    row: list[str | None],
    col_map: dict[str, int | None],
    fallback_product: str | None,
) -> dict | None:
    """Extract a single data row using the column mapping."""
    def get_cell(field: str) -> str | None:
        idx = col_map.get(field)
        if idx is None or idx >= len(row):
            return None
        val = row[idx]
        return str(val).strip() if val else None

    product = get_cell("product")
    size = get_cell("size")
    uvp_raw = get_cell("uvp")
    dealer_raw = get_cell("dealer_net")

    uvp = parse_price(uvp_raw)
    dealer_net = parse_price(dealer_raw)

    # Skip rows with no price data at all
    if uvp is None and dealer_net is None:
        return None

    # If product cell is empty, it might be a continuation row
    if not product and fallback_product:
        product = fallback_product

    return {
        "product": product or "",
        "size": size or "",
        "uvp_gross": uvp,
        "dealer_net": dealer_net,
    }


def _guess_columns(table: list[list[str | None]]) -> dict[str, int | None] | None:
    """Try to guess column mapping when no clear header is found."""
    if not table or not table[0]:
        return None

    num_cols = len(table[0])
    if num_cols < 2:
        return None

    # Common layouts:
    # [Product, Size, UVP, EK] or [Product, UVP, EK] or [Product/Size, UVP, EK]
    # Try to detect by looking at data types in non-header rows
    price_cols: list[int] = []
    text_cols: list[int] = []

    for col_idx in range(num_cols):
        price_count = 0
        text_count = 0
        for row in table[1:min(6, len(table))]:
            if col_idx >= len(row) or not row[col_idx]:
                continue
            val = str(row[col_idx]).strip()
            if parse_price(val) is not None:
                price_count += 1
            elif val and not val.replace(" ", "").replace("-", "").isdigit():
                text_count += 1
        if price_count > text_count:
            price_cols.append(col_idx)
        elif text_count > 0:
            text_cols.append(col_idx)

    if len(price_cols) < 1:
        return None

    mapping: dict[str, int | None] = {
        "product": text_cols[0] if text_cols else None,
        "size": text_cols[1] if len(text_cols) > 1 else None,
        "uvp": price_cols[0] if len(price_cols) > 1 else None,
        "dealer_net": price_cols[-1],
    }
    return mapping


def _parse_text_lines(text: str) -> list[dict]:
    """Fallback: parse price data from plain text lines."""
    results: list[dict] = []
    lines = text.split("\n")
    current_product = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Look for lines with price patterns
        prices = re.findall(r"[\d.,]+(?:\s*€)?", line)
        if len(prices) >= 1:
            # Try to extract product/size from the non-price part
            non_price = re.sub(r"[\d.,]+\s*€?", "", line).strip()
            non_price = re.sub(r"\s+", " ", non_price).strip(" -|")

            if non_price and len(non_price) > 2:
                current_product = non_price

            parsed_prices = [parse_price(p) for p in prices]
            valid_prices = [p for p in parsed_prices if p is not None]

            if valid_prices and current_product:
                results.append({
                    "product": current_product,
                    "size": "",
                    "uvp_gross": valid_prices[0] if len(valid_prices) > 1 else None,
                    "dealer_net": valid_prices[-1] if valid_prices else None,
                })

    return results


def _deduplicate(items: list[dict]) -> list[dict]:
    """Remove duplicate entries (same product + size)."""
    seen: set[str] = set()
    result: list[dict] = []
    for item in items:
        key = f"{item.get('product', '')}|{item.get('size', '')}"
        if key not in seen:
            seen.add(key)
            result.append(item)
    return result

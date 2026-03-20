import { describe, test, expect } from "vitest";
import {
  parseCSVLine,
  detectCSVFormat,
  filterRelevantRows,
  extractVariants,
  aggregateVariants,
  normalizeVariants,
  parseStockCSV,
  type CSVFormat,
  type ExtractedVariant,
  type NormalizedVariant,
} from "../stock-csv-parser";

describe("parseCSVLine", () => {
  test("parses simple semicolon-delimited line", () => {
    const result = parseCSVLine("A;B;C");
    expect(result).toEqual(["A", "B", "C"]);
  });

  test("handles quoted fields with semicolons", () => {
    const result = parseCSVLine('A;"B;C";D');
    expect(result).toEqual(["A", "B;C", "D"]);
  });

  test("handles escaped quotes", () => {
    const result = parseCSVLine('A;"B""C";D');
    expect(result).toEqual(["A", 'B"C', "D"]);
  });

  test("handles empty fields", () => {
    const result = parseCSVLine("A;;C");
    expect(result).toEqual(["A", "", "C"]);
  });
});

describe("detectCSVFormat", () => {
  test("detects standard CSV format", () => {
    const header = "Artikel;Artikel Bezeichnung;AUG 2;AUG 3;Lagerstand";
    const format = detectCSVFormat(header);
    expect(format).toEqual({
      artikelCol: 0,
      bezeichnungCol: 1,
      aug2Col: 2,
      aug3Col: 3,
      lagerstandCol: 4,
    });
  });

  test("detects format with variations in headers", () => {
    const header = "Artikelnummer;Bezeichnung;Bestand";
    const format = detectCSVFormat(header);
    expect(format).toEqual({
      artikelCol: 0,
      bezeichnungCol: 1,
      aug2Col: null,
      aug3Col: null,
      lagerstandCol: 2,
    });
  });

  test("falls back to old format when headers not found", () => {
    const header = "Index;Number;Description";
    const format = detectCSVFormat(header);
    expect(format).toEqual({
      artikelCol: 1,
      bezeichnungCol: 2,
      aug2Col: null,
      aug3Col: null,
      lagerstandCol: null,
    });
  });
});

describe("filterRelevantRows", () => {
  const format: CSVFormat = {
    artikelCol: 0,
    bezeichnungCol: 1,
    aug2Col: null,
    aug3Col: null,
    lagerstandCol: null,
  };

  test("filters NL and NE rows", () => {
    const lines = [
      "Artikel;Bezeichnung",
      "123-NL-456;Mirage 2 RS S",
      "789-NE-012;Escape 30 M",
      "999-XX-111;Other Product", // Should be excluded
    ];

    const result = filterRelevantRows(lines, format);

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].artikelNr).toBe("123-NL-456");
    expect(result.rows[1].artikelNr).toBe("789-NE-012");
    expect(result.csvRowCount).toBe(3);
  });

  test("excludes blacklisted patterns", () => {
    const lines = [
      "Artikel;Bezeichnung",
      "123-NL-456;Mirage 2 RS S",
      "789-NL-012;Proto Escape 30 M", // Should be excluded (Proto)
      "111-NE-222;NICHT verkaufen Test", // Should be excluded
    ];

    const result = filterRelevantRows(lines, format);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].artikelNr).toBe("123-NL-456");
  });

  test("handles missing data gracefully", () => {
    const lines = [
      "Artikel;Bezeichnung",
      ";", // Empty fields
      "123;", // Missing bezeichnung
    ];

    const result = filterRelevantRows(lines, format);

    expect(result.rows).toHaveLength(0);
  });
});

describe("extractVariants", () => {
  test("extracts basic model and size from Bezeichnung", () => {
    const rows = [
      {
        artikelNr: "123-NL-456",
        bezeichnung: "Mirage 2 RS S",
        aug2: null,
        aug3: null,
        lagerstand: null,
      },
    ];

    const result = extractVariants(rows);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      model_raw: "Mirage 2 RS",
      size_raw: "S",
      design_raw: null,
      stock_raw: 1,
    });
  });

  test("prefers AUG2 for model name", () => {
    const rows = [
      {
        artikelNr: "123-NL-456",
        bezeichnung: "Gleitschirm Mirage 2 RS S Blue",
        aug2: "Mirage 2 RS",
        aug3: "Mirage 2 RS S",
        lagerstand: 5,
      },
    ];

    const result = extractVariants(rows);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      model_raw: "Mirage 2 RS", // From AUG2, not parsed Bezeichnung
      size_raw: "S", // Extracted from AUG3
      design_raw: "Blue",
      stock_raw: 5,
    });
  });

  test("extracts numeric sizes", () => {
    const rows = [
      {
        artikelNr: "123-NL-456",
        bezeichnung: "Escape 30",
        aug2: null,
        aug3: null,
        lagerstand: null,
      },
    ];

    const result = extractVariants(rows);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      model_raw: "Escape",
      size_raw: "30",
      design_raw: null,
      stock_raw: 1,
    });
  });

  test("handles Spitfire dot-notation", () => {
    const rows = [
      {
        artikelNr: "123-NL-456",
        bezeichnung: "Spitfire 3.9,5",
        aug2: null,
        aug3: null,
        lagerstand: null,
      },
    ];

    const result = extractVariants(rows);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      model_raw: "Spitfire 3",
      size_raw: "9,5",
      design_raw: null,
    });
  });
});

describe("normalizeVariants", () => {
  test("normalizes extracted variants with keys", () => {
    const variants: ExtractedVariant[] = [
      {
        model_raw: "Mirage 2 RS",
        design_raw: "Blue",
        size_raw: "S",
        stock_raw: 5,
        bezeichnung: "Mirage 2 RS S Blue",
      },
    ];

    const result = normalizeVariants(variants);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      model_raw: "Mirage 2 RS",
      design_raw: "Blue",
      size_raw: "S",
      stock_raw: 5,
      model_normalized: "mirage2rs",
      design_normalized: "blue",
      size_normalized: "s",
      match_key: "mirage2rs||blue||s",
      model_size_key: "mirage2rs||s",
    });
  });
});

describe("aggregateVariants", () => {
  test("aggregates variants with same match key", () => {
    const variants: NormalizedVariant[] = [
      {
        model_raw: "Mirage 2 RS",
        design_raw: "Blue",
        size_raw: "S",
        stock_raw: 3,
        bezeichnung: "Mirage 2 RS S Blue",
        model_normalized: "mirage2rs",
        design_normalized: "blue",
        size_normalized: "s",
        match_key: "mirage2rs||blue||s",
        model_size_key: "mirage2rs||s",
      },
      {
        model_raw: "Mirage 2 RS",
        design_raw: "Blue",
        size_raw: "S",
        stock_raw: 2,
        bezeichnung: "Mirage 2 RS S Blue",
        model_normalized: "mirage2rs",
        design_normalized: "blue",
        size_normalized: "s",
        match_key: "mirage2rs||blue||s",
        model_size_key: "mirage2rs||s",
      },
    ];

    const result = aggregateVariants(variants);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      match_key: "mirage2rs||blue||s",
      stock_total: 5,
      source_count: 2,
    });
  });

  test("keeps variants with different match keys separate", () => {
    const variants: NormalizedVariant[] = [
      {
        model_raw: "Mirage 2 RS",
        design_raw: "Blue",
        size_raw: "S",
        stock_raw: 3,
        bezeichnung: "Mirage 2 RS S Blue",
        model_normalized: "mirage2rs",
        design_normalized: "blue",
        size_normalized: "s",
        match_key: "mirage2rs||blue||s",
        model_size_key: "mirage2rs||s",
      },
      {
        model_raw: "Mirage 2 RS",
        design_raw: "Red",
        size_raw: "S",
        stock_raw: 2,
        bezeichnung: "Mirage 2 RS S Red",
        model_normalized: "mirage2rs",
        design_normalized: "red",
        size_normalized: "s",
        match_key: "mirage2rs||red||s",
        model_size_key: "mirage2rs||s",
      },
    ];

    const result = aggregateVariants(variants);

    expect(result).toHaveLength(2);
  });
});

describe("parseStockCSV", () => {
  test("parses complete CSV with pipeline", () => {
    const csv = `Artikel;Artikel Bezeichnung;Lagerstand
123-NL-456;Mirage 2 RS S Blue;5,00
789-NE-012;Escape 30;10,00
999-XX-111;Other Product;1,00`;

    const result = parseStockCSV(csv);

    expect(result.csvRowCount).toBe(3);
    expect(result.filteredCount).toBe(2);
    expect(result.aggregated).toHaveLength(2);

    const mirage = result.aggregated.find(v => v.model_normalized === "mirage2rs");
    expect(mirage).toBeDefined();
    expect(mirage?.stock_total).toBe(5);

    const escape = result.aggregated.find(v => v.model_normalized === "escape");
    expect(escape).toBeDefined();
    expect(escape?.stock_total).toBe(10);
  });

  test("handles empty CSV gracefully", () => {
    const result = parseStockCSV("");
    expect(result).toEqual({
      aggregated: [],
      csvRowCount: 0,
      filteredCount: 0,
    });
  });

  test("handles CSV with only headers", () => {
    const result = parseStockCSV("Artikel;Bezeichnung");
    expect(result).toEqual({
      aggregated: [],
      csvRowCount: 0,
      filteredCount: 0,
    });
  });
});
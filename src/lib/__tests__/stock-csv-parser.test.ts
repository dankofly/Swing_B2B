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
      artikelgruppeCol: null,
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
      artikelgruppeCol: null,
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
      artikelgruppeCol: null,
      aug2Col: null,
      aug3Col: null,
      lagerstandCol: null,
    });
  });

  test("detects Artikelgruppe + prefers 'Artikel Nummer' over 'Artikel' + first 'Lagerstand'", () => {
    const header =
      "Artikel;Artikel Nummer;Artikel Bezeichnung;Artikelgruppe;Colli Einkauf;Colli Verkauf;AUG 1;AUG 2;AUG 3;AUG 4;AUG 5;Lagerstand;Lagerstand 2;Lagerbewertung";
    const format = detectCSVFormat(header);
    expect(format).toEqual({
      artikelCol: 1,           // "Artikel Nummer" (SKU), not "Artikel" (display text)
      bezeichnungCol: 2,
      artikelgruppeCol: 3,
      aug2Col: 7,
      aug3Col: 8,
      lagerstandCol: 11,       // first "Lagerstand", not "Lagerstand 2"
    });
  });
});

describe("filterRelevantRows", () => {
  const format: CSVFormat = {
    artikelCol: 0,
    bezeichnungCol: 1,
    artikelgruppeCol: null,
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
        artikelgruppe: null,
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
        artikelgruppe: null,
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
        artikelgruppe: null,
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
        artikelgruppe: null,
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

  test("prefers parsed model over AUG 2 when parsed extends AUG 2 with a variant", () => {
    // Real WinLine case: AUG 2 stored as "Wave RS" but actual model is "Wave RS D-Lite"
    const rows = [
      {
        artikelNr: "106 11-LN-S-NE-74895",
        bezeichnung: "Wave RS D-Lite 15 Lime",
        artikelgruppe: "Parakite",
        aug2: "Wave RS",
        aug3: "Wave RS 15",
        lagerstand: 1,
      },
    ];

    const result = extractVariants(rows);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      model_raw: "Wave RS D-Lite", // NOT just "Wave RS" from AUG 2
      size_raw: "15",
      design_raw: "Lime",
    });
  });

  test("falls back to parsed model when AUG 2 is an unrelated category label", () => {
    // AUG 2 = "Zubehor" is a category label, not in Bezeichnung. pickModel should
    // ignore it and keep the parsed "Airbag Brave". Size is extracted cleanly from
    // AUG 3 so the row is NOT rejected by the size validator.
    const rows = [
      {
        artikelNr: "191-NL-AD-21-0333",
        bezeichnung: "Airbag Brave S",
        artikelgruppe: null,
        aug2: "Zubehor",
        aug3: "Zubehor S",
        lagerstand: 1,
      },
    ];

    const result = extractVariants(rows);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      model_raw: "Airbag Brave", // NOT "Zubehor"
      size_raw: "S",
    });
  });

  test("skips rows whose extracted size is garbage (e.g. AUG 3 carries '(diverse)')", () => {
    // Real case from WinLine: AUG 3 = "Gurtzeugzubehr (diverse)" — no real size
    // encoded. isValidSize rejects "(diverse)" so the variant is dropped.
    const rows = [
      {
        artikelNr: "191 885-NL-AD-21-0333",
        bezeichnung: "Airbag Brave 4",
        artikelgruppe: null,
        aug2: "Gurtzeugzubehr",
        aug3: "Gurtzeugzubehr (diverse)",
        lagerstand: 1,
      },
    ];

    const result = extractVariants(rows);

    expect(result).toHaveLength(0);
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

  test("cuts freetext comments after comma in Bezeichnung", () => {
    // Real WinLine sample: "Wave RS D-Lite 13 Red, Bremse nicht final, PM 12.11.2025"
    // Before the fix, the color came out as "Red, Bremse nicht final, PM 12.11.2025".
    const csv = `Artikel;Artikel Bezeichnung;AUG 2;AUG 3;Lagerstand
106 11-RW-XS-NL-74989;Wave RS D-Lite 13 Red, Bremse nicht final, PM 12.11.2025;Wave RS;Wave RS 13;1,00`;

    const result = parseStockCSV(csv);

    expect(result.aggregated).toHaveLength(1);
    expect(result.aggregated[0]).toMatchObject({
      model_raw: "Wave RS D-Lite",
      size_raw: "13",
      design_raw: "Red",
      design_normalized: "red",
      stock_total: 1,
    });
  });

  test("aggregates multiple serial rows into a single (model,color,size) total", () => {
    // Each row in a WinLine Bestandsliste = 1 physical unit with a serial suffix.
    // Two rows with same model+color+size should sum to 2 stück.
    const csv = `Artikel;Artikel Bezeichnung;AUG 2;AUG 3;Lagerstand
101 22-LR-S-NL-74805;Miura 2 RS S Spicy;Miura 2 RS;Miura 2 RS S;1,00
101 22-LR-S-NL-75088;Miura 2 RS S Spicy;Miura 2 RS;Miura 2 RS S;1,00
101 22-RL-S-NL-74808;Miura 2 RS S Chili;Miura 2 RS;Miura 2 RS S;1,00`;

    const result = parseStockCSV(csv);

    expect(result.aggregated).toHaveLength(2); // Spicy + Chili
    const spicy = result.aggregated.find((v) => v.design_normalized === "spicy");
    const chili = result.aggregated.find((v) => v.design_normalized === "chili");
    expect(spicy?.stock_total).toBe(2);
    expect(spicy?.source_count).toBe(2);
    expect(chili?.stock_total).toBe(1);
  });

  test("filters rows by Artikelgruppe (spare parts, accessories, components)", () => {
    const csv = `Artikel;Artikel Nummer;Artikel Bezeichnung;Artikelgruppe;AUG 2;AUG 3;Lagerstand
A;101 22-LR-S-NL-74805;Miura 2 RS S Spicy;Gleitschirm;Miura 2 RS;Miura 2 RS S;1,00
B;191 885-NL-AD-21-0333;Airbag Brave 4;Zubehr;Gurtzeugzubehr;Gurtzeugzubehr (diverse);1,00
C;509 00-NL-0908008;LiIo Akku 14 Zellen;Motoren u. Zubehr;Akku;LiIo;1,00
D;50A13010M02009-00-NL-XX;Airbag Luna NG Vorne;PASA;Landedmpfer;Landedmpfer (diverse);1,00`;

    const result = parseStockCSV(csv);

    // Only the Miura row (Artikelgruppe = Gleitschirm) should survive.
    expect(result.aggregated).toHaveLength(1);
    expect(result.aggregated[0].model_normalized).toBe("miura2rs");
  });
});
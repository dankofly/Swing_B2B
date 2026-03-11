import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";

// Words that indicate an item should be excluded
const EXCLUDE_PATTERNS = [
  /unverk[aä]uflich/i,
  /NICHT verkaufen/i,
  /Proto[- ]/i,
  /^Proto,/i,
  /Vorserie/i,
  /ACHTUNG/i,
  /Lasttest/i,
];

function parseCSVLine(line: string): string[] {
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

function shouldExclude(bezeichnung: string): boolean {
  return EXCLUDE_PATTERNS.some((p) => p.test(bezeichnung));
}

function cleanBezeichnung(raw: string): string {
  // Remove trailing notes after semicolons (inside quoted fields they appear as part of the text)
  let cleaned = raw.split(";")[0].trim();
  // Remove trailing status markers like "***", trailing dates, etc.
  cleaned = cleaned.replace(/\*{2,}.*$/, "").trim();
  // Remove trailing serial-like suffixes that come after the color (e.g. " - Stückprüfung 21.5.2025")
  cleaned = cleaned.replace(/\s*-\s*\w+prfung.*$/i, "").trim();
  cleaned = cleaned.replace(/\s*-\s*Stckprfung.*$/i, "").trim();
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    // Auth guard: admin only
    const authClient = await createAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }
    const { data: profile } = await authClient.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !["superadmin", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());

    // Skip header
    const dataLines = lines.slice(1);

    // Parse and filter: only NL or NE items
    const filteredItems: Array<{ artikelNr: string; bezeichnung: string }> = [];

    for (const line of dataLines) {
      const cols = parseCSVLine(line);
      if (cols.length < 3) continue;

      const artikelNr = cols[1]?.trim(); // Column B: Artikel Nummer
      const bezeichnung = cols[2]?.trim(); // Column C: Artikel Bezeichnung

      if (!artikelNr || !bezeichnung) continue;

      // Filter: only NL or NE in article number
      if (!/-NL-/.test(artikelNr) && !/-NE-/.test(artikelNr)) continue;

      // Exclude prototypes, unsellable items, etc.
      if (shouldExclude(bezeichnung)) continue;

      filteredItems.push({ artikelNr, bezeichnung: cleanBezeichnung(bezeichnung) });
    }

    // Group by cleaned bezeichnung and count
    const grouped = new Map<string, number>();
    for (const item of filteredItems) {
      grouped.set(item.bezeichnung, (grouped.get(item.bezeichnung) || 0) + 1);
    }

    const groupedList = Array.from(grouped.entries()).map(
      ([bezeichnung, count]) => ({ bezeichnung, count })
    );

    if (groupedList.length === 0) {
      return NextResponse.json({
        items: [],
        summary: { total: 0, matched: 0, unmatched: 0, filtered_out: dataLines.length },
      });
    }

    // Fetch all products, sizes, and colors in parallel
    const [{ data: allProducts }, { data: allSizes }, { data: allColors }] =
      await Promise.all([
        supabase.from("products").select("id, name, slug").eq("is_active", true).order("name"),
        supabase.from("product_sizes").select("id, product_id, size_label, sku, stock_quantity").order("sort_order"),
        supabase.from("product_colors").select("id, product_id, color_name").order("sort_order"),
      ]);

    // Build context for Gemini
    const productContext = (allProducts ?? []).map((p) => {
      const sizes = (allSizes ?? [])
        .filter((s) => s.product_id === p.id)
        .map((s) => s.size_label);
      const colors = (allColors ?? [])
        .filter((c) => c.product_id === p.id)
        .map((c) => c.color_name);
      return `${p.name} (Größen: ${sizes.join(", ") || "keine"} | Farben: ${colors.join(", ") || "keine"})`;
    }).join("\n");

    const bezeichnungen = groupedList
      .map((g) => `"${g.bezeichnung}" (${g.count}x)`)
      .join("\n");

    // Call Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 65536,
      },
    });

    const prompt = `Du bist ein Assistent für Lagerbestand-Zuordnung bei SWING PARAGLIDERS.

Ich gebe dir eine Liste von Artikelbezeichnungen aus dem ERP-System (Mesonic WinLine) mit Stückzahlen.
Ordne jede Bezeichnung dem passenden Produkt, der Größe und der Farbe aus unserem Katalog zu.

UNSERE PRODUKTE IM KATALOG:
${productContext}

ARTIKELBEZEICHNUNGEN AUS DEM ERP (mit Stückzahl):
${bezeichnungen}

REGELN:
- Extrahiere aus jeder Bezeichnung: Produktname, Größe und Farbe
- "Stellar RS L Blau" → product_name: "Stellar RS", size_label: "L", color_name: "Blau"
- "Miura 2 RS D-Lite M Rot" → product_name: "Miura 2 RS D-Lite", size_label: "M", color_name: "Rot"
- "Rettungsgerät Escape M (22)" → product_name: "Escape", size_label: "M", color_name: null
- "Gurtzeug Connect Reverse 3 L" → product_name: "Connect Reverse 3", size_label: "L", color_name: null
- "Gurtzeug Connect Race Lite L" → product_name: "Connect Race Lite", size_label: "L", color_name: null
- Bei Rettungsgeräten: "Escape L (30)" hat Größe "L", bei "Escape M (22)" Größe "M"
- Die Farbe ist immer das LETZTE Wort der Bezeichnung (nach der Größe), wenn es keine Zahl/Klammer ist
- Prefixe wie "Gurtzeug", "Rettungsgerät" weglassen beim product_name
- Bei Speed Flyern: "Spitfire 3.11 Lime" → product_name: "Spitfire 3", size_label: "11", color_name: "Lime"
- Bei Speed Flyern: "Spitfire 3.9,5 Blue" → product_name: "Spitfire 3", size_label: "9,5", color_name: "Blue"
- Matche den product_name gegen die PRODUKTE IM KATALOG (case-insensitive)
- Wenn kein Produkt im Katalog passt, setze matched: false
- count ist die Stückzahl aus der ERP-Liste

Antworte NUR mit einem JSON-Array:
[{"bezeichnung": "Stellar RS L Blau", "product_name": "Stellar RS", "size_label": "L", "color_name": "Blau", "count": 3, "matched": true}, {"bezeichnung": "Gurtzeug Connect Race Lite L", "product_name": "Connect Race Lite", "size_label": "L", "color_name": null, "count": 1, "matched": true}]`;

    const result = await model.generateContent([{ text: prompt }]);
    const candidate = result.response.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const responseText = result.response.text().trim();

    console.log("Gemini finish reason:", finishReason, "| Response length:", responseText.length);

    let parsed: Array<{
      bezeichnung: string;
      product_name: string;
      size_label: string;
      color_name: string | null;
      count: number;
      matched: boolean;
    }>;

    try {
      // If response was truncated, try to repair the JSON by closing the array
      let jsonText = responseText;
      if (finishReason === "MAX_TOKENS" || finishReason === "RECITATION") {
        // Find last complete object (last '}') and close the array
        const lastBrace = jsonText.lastIndexOf("}");
        if (lastBrace > 0) {
          jsonText = jsonText.substring(0, lastBrace + 1) + "\n]";
        }
      }

      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("Gemini raw response (last 200 chars):", responseText.slice(-200));
      console.error("Parse error:", parseErr);
      return NextResponse.json(
        {
          error: `Gemini-Antwort konnte nicht geparst werden (${responseText.length} Zeichen, finishReason: ${finishReason})`,
          raw: responseText.substring(0, 1000),
          rawEnd: responseText.slice(-500),
        },
        { status: 422 }
      );
    }

    // Enrich with DB IDs
    const productMap = new Map(
      (allProducts ?? []).map((p) => [p.name.toLowerCase(), p])
    );

    const items = parsed.map((row) => {
      // Find product
      let product = productMap.get(row.product_name.toLowerCase());
      if (!product) {
        for (const [key, val] of productMap) {
          if (
            key.includes(row.product_name.toLowerCase()) ||
            row.product_name.toLowerCase().includes(key)
          ) {
            product = val;
            break;
          }
        }
      }

      // Find size
      const size = product
        ? (allSizes ?? []).find(
            (s) =>
              s.product_id === product!.id &&
              s.size_label.toLowerCase() === row.size_label.toLowerCase()
          )
        : null;

      // Find color
      const color =
        product && row.color_name
          ? (allColors ?? []).find(
              (c) =>
                c.product_id === product!.id &&
                c.color_name.toLowerCase() === row.color_name!.toLowerCase()
            )
          : null;

      return {
        bezeichnung: row.bezeichnung,
        product_id: product?.id ?? null,
        product_name: product?.name ?? row.product_name,
        size_label: size?.size_label ?? row.size_label,
        size_id: size?.id ?? null,
        color_name: color?.color_name ?? row.color_name,
        color_id: color?.id ?? null,
        count: row.count,
        current_stock: size?.stock_quantity ?? null,
        matched: !!(product && size),
        color_matched: !!color,
      };
    });

    const matched = items.filter((i) => i.matched).length;

    return NextResponse.json({
      items,
      summary: {
        total: items.length,
        matched,
        unmatched: items.length - matched,
        csv_rows: dataLines.length,
        filtered_items: filteredItems.length,
      },
    });
  } catch (error) {
    console.error("Stock CSV parse error:", error);
    return NextResponse.json(
      { error: "Fehler beim Parsen der Bestandsliste" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const companyId = formData.get("company_id") as string;

    if (!file || !companyId) {
      return NextResponse.json(
        { error: "file and company_id are required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Fetch all products with their sizes for name-based matching
    const { data: allProducts } = await supabase
      .from("products")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name");

    const productNames = (allProducts ?? []).map((p) => p.name).join(", ");

    // Call Gemini to parse the PDF — match by model name, extract UVP + EK
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Du bist ein Assistent für B2B-Preislisten-Parsing für SWING PARAGLIDERS.
Analysiere dieses PDF-Dokument und extrahiere ALLE Produktzeilen mit Preisen.

Für jede Produktzeile extrahiere:
- "modell": Der Modellname des Produkts (z.B. "MITO 2 RS", "NYOS 2 RS", "CONNECT REVERSE 3", "ESCAPE M")
- "uvp_brutto": Der UVP inkl. MwSt. als Zahl (nur Zahl, kein €-Zeichen)
- "ek_netto": Der Händler EK netto als Zahl (nur Zahl, kein €-Zeichen)
- "groessen": Die verfügbaren Größen als String (z.B. "XS, S, SM, ML, L")

Bekannte Modelle in unserem System: ${productNames}

Wichtige Regeln:
- Extrahiere jedes Modell nur EINMAL (nicht pro Größe, außer der Preis ist pro Größe unterschiedlich wie bei Wave RS)
- Wenn ein Modell mehrere Größen mit UNTERSCHIEDLICHEN Preisen hat (z.B. Wave RS D-Lite), erstelle eine Zeile pro Preis
- Ignoriere Packsäcke, Sonderfarben, Sonderdesigns, Einzelpreise und Protektoren
- Ignoriere Modelle mit "(phase-out model)" im Namen
- Bei Rettungsschirmen (Escape, Cross): Jede Größe hat einen eigenen Preis → eine Zeile pro Größe mit Größe im Modellnamen (z.B. "ESCAPE M", "CROSS L")

Antworte NUR mit einem JSON-Array. Kein Markdown, kein Codeblock, nur das Array:
[{"modell": "...", "uvp_brutto": 3590.00, "ek_netto": 1960.92, "groessen": "XS, S, SM, ML, L"}, ...]

Wenn keine Preisdaten gefunden werden, antworte mit: []`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: file.type || "application/pdf",
          data: base64,
        },
      },
    ]);

    const responseText = result.response.text().trim();

    let parsed: Array<{
      modell: string;
      uvp_brutto: number;
      ek_netto: number;
      groessen: string;
    }>;
    try {
      const jsonStr = responseText
        .replace(/^```json?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "LLM-Antwort konnte nicht geparst werden", raw: responseText },
        { status: 422 }
      );
    }

    // Build a name-based matching map (lowercase for fuzzy matching)
    const productMap = new Map(
      (allProducts ?? []).map((p) => [p.name.toLowerCase(), p])
    );

    // Also fetch all sizes grouped by product
    const { data: allSizes } = await supabase
      .from("product_sizes")
      .select("id, sku, size_label, product_id")
      .order("sort_order");

    const sizesByProduct = new Map<
      string,
      Array<{ id: string; sku: string; size_label: string }>
    >();
    for (const s of allSizes ?? []) {
      const arr = sizesByProduct.get(s.product_id) ?? [];
      arr.push(s);
      sizesByProduct.set(s.product_id, arr);
    }

    const items = parsed.map((row) => {
      // Try exact match first, then fuzzy
      let product = productMap.get(row.modell.toLowerCase());
      if (!product) {
        // Try partial match (e.g. "STING RS" matches "Sting RS")
        for (const [key, val] of productMap) {
          if (
            key.includes(row.modell.toLowerCase()) ||
            row.modell.toLowerCase().includes(key)
          ) {
            product = val;
            break;
          }
        }
      }

      const productSizes = product
        ? sizesByProduct.get(product.id) ?? []
        : [];

      return {
        modell_pdf: row.modell,
        uvp_brutto: row.uvp_brutto,
        ek_netto: row.ek_netto,
        groessen: row.groessen,
        discount: 0,
        status: product
          ? ("matched" as const)
          : ("unmatched" as const),
        product_id: product?.id ?? null,
        product_name: product?.name ?? null,
        product_sizes: productSizes,
      };
    });

    const matched = items.filter((i) => i.status === "matched").length;

    return NextResponse.json({
      items,
      summary: {
        total: items.length,
        matched,
        unmatched: items.length - matched,
      },
    });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Fehler beim Parsen der Preisliste" },
      { status: 500 }
    );
  }
}

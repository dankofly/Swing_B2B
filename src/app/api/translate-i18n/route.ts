import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAdminUser } from "@/lib/auth-api";
import { createRateLimiter } from "@/lib/rate-limit";

const SYSTEM_PROMPT = `Du bist ein erfahrener Sales-Experte und professioneller Gleitschirm-Pilot, der mehrere Sprachen auf C2-Niveau beherrscht. Du kennst die gesamte Fachsprache der Paragliding-Szene in allen Sprachen perfekt — von EN-Klassifizierungen über Gurtzeuge bis hin zu Flugmanövern.

Deine Aufgabe: Übersetze die gegebene deutsche (DE) i18n-JSON-Datei eines B2B-Händlerportals für Paragleiter in die Zielsprache.

WICHTIGE REGELN:
1. Übersetze ALLE String-Werte, behalte aber die JSON-Struktur und alle Keys exakt bei
2. Verwende die in der Paragliding-Branche übliche Fachterminologie der Zielsprache
3. Behalte Platzhalter wie {count}, {name}, {query}, {weeks}, {company}, {products}, {saved}, {positions}, {pieces}, {fileName}, {size} exakt bei
4. Begriffe die international gleich sind (z.B. "Coming Soon", "Fade Out", "Limited", "Design", "Dashboard", "SKU", "WhatsApp", "PDF") bleiben unübersetzt
5. Firmenname "SWING Flugsportgeräte GmbH", "SWING PARAGLIDERS", "Günther Wörl" und alle Adressen/Kontaktdaten bleiben EXAKT gleich
6. Rechtliche Texte (Impressum, Datenschutz) müssen juristisch korrekt übersetzt werden
7. Verwende die formelle Anrede (Sie/vous/you) passend zum B2B-Kontext
8. EN-Klassen (EN-A, EN-B, etc.) bleiben unverändert
9. Gewichtsklassen (N-LITE, D-LITE, U-LITE) bleiben unverändert
10. Antworte NUR mit dem JSON-Objekt, kein Markdown, keine Erklärungen`;

const checkLimit = createRateLimiter("gemini", 10, 60_000);

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdminUser();
    if ("response" in guard) return guard.response;
    const { user } = guard;

    if (checkLimit(user.id)) return NextResponse.json({ error: "Zu viele Anfragen. Bitte warten Sie eine Minute." }, { status: 429 });

    const { targetLocale, sourceDict } = await request.json();

    if (!targetLocale || !sourceDict) {
      return NextResponse.json(
        { error: "targetLocale and sourceDict are required" },
        { status: 400 }
      );
    }

    const localeNames: Record<string, string> = {
      en: "Englisch (British English)",
      fr: "Französisch (Frankreich)",
    };

    const localeName = localeNames[targetLocale];
    if (!localeName) {
      return NextResponse.json(
        { error: `Unsupported locale: ${targetLocale}` },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const prompt = `${SYSTEM_PROMPT}

Zielsprache: ${localeName}

Hier ist die deutsche Quelldatei (JSON):
${JSON.stringify(sourceDict, null, 2)}

Übersetze alle String-Werte in ${localeName}. Antworte NUR mit dem vollständigen JSON-Objekt.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse the JSON response
    let translated;
    try {
      translated = JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        translated = JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error("Failed to parse Gemini response as JSON");
      }
    }

    return NextResponse.json({ translated, locale: targetLocale });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Translation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

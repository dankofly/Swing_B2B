import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { adminName, stats, locale, isFullGreeting } = await req.json();

    const firstName = (adminName || "Admin").split(" ")[0];
    const now = new Date();
    const hour = now.getUTCHours() + 1; // CET rough
    const timeOfDay =
      hour < 10 ? "morgens" : hour < 14 ? "mittags" : hour < 18 ? "nachmittags" : "abends";
    const weekday = now.toLocaleDateString("de-DE", { weekday: "long" });

    const briefingData = `
Aktuelle Daten:
- Aktive Produkte: ${stats.activeProducts}
- Coming Soon: ${stats.comingSoonProducts}
- Vorbestellung: ${stats.preorderProducts}
- Auf Lager (>5): ${stats.inStockSizes}
- Wenig Lager (1-5): ${stats.lowStockSizes}
- Kein Bestand: ${stats.noStockSizes}
- Neue Anfragen: ${stats.newInquiries}
- In Bearbeitung: ${stats.inProgressInquiries}
- Im Versand: ${stats.shippedInquiries}
- Erledigt (Monat): ${stats.completedMonthly}
- Händler: ${stats.dealerCount}
- Importeure: ${stats.importerCount}
- Importeur-Netzwerke: ${stats.importerNetworkCount}
    `.trim();

    const prompt = isFullGreeting
      ? `Du bist der freundliche KI-Assistent im B2B-Portal von SWING Flugsportgeräte (Paragleiter-Hersteller).
Es ist ${weekday} ${timeOfDay}. Begrüße ${firstName} persönlich, freundlich und mit einem Hauch Humor (Paragleiter/Flug-Bezug erlaubt).
Dann gib ein kurzes Tages-Briefing basierend auf den Daten.

${briefingData}

Antworte als JSON:
{
  "greeting": "Persönliche Begrüßung (1-2 Sätze, warm und lustig)",
  "briefing": ["Punkt 1", "Punkt 2", "Punkt 3"],
  "emoji": "ein passendes Emoji"
}

Regeln:
- Maximal 3 Briefing-Punkte, kurz und knackig
- Hebe nur Wichtiges hervor (neue Anfragen, Lagerprobleme, Erfolge)
- Wenn nichts auffällig ist, sag dass alles rund läuft
- Sprache: ${locale === "en" ? "Englisch" : locale === "fr" ? "Französisch" : "Deutsch"}`
      : `Du bist der KI-Assistent im SWING B2B-Portal. Erstelle einen kompakten Überblick.

${briefingData}

Antworte als JSON:
{
  "briefing": ["Punkt 1", "Punkt 2"],
  "emoji": "📊"
}

Regeln:
- Maximal 2 Punkte, nur das Wichtigste
- Kurz und sachlich
- Sprache: ${locale === "en" ? "Englisch" : locale === "fr" ? "Französisch" : "Deutsch"}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.9,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error("Admin briefing error:", e);
    return NextResponse.json(
      { greeting: "", briefing: ["Dashboard geladen."], emoji: "📊" },
      { status: 200 }
    );
  }
}

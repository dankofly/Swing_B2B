import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // Auth guard
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !["superadmin", "admin", "testadmin"].includes(profile.role)) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
    }

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

    const lang = locale === "en" ? "Englisch" : locale === "fr" ? "Französisch" : "Deutsch";

    const prompt = isFullGreeting
      ? `Formuliere ein kurzes internes Briefing für ein B2B-Portal im Bereich Gleitschirmvertrieb. Der Text soll natürlich und menschlich klingen, nicht generisch oder nach KI.

Ton: sachlich, ruhig, leicht direkt, minimal trockener Humor, professionell, keine Floskeln, keine Übertreibungen.

Anrede: Variiere die Anrede jedes Mal. Name: ${firstName}. Es ist ${weekday} ${timeOfDay}.
Beispiele für Stilrichtung: "Guten Morgen Daniel, hoffe dir geht's gut." / "Hallo Daniel, kurzer Überblick für dich." / "Hi Daniel, hier der aktuelle Stand."
Keine verspielten oder kindischen Formulierungen.

${briefingData}

Antworte als JSON:
{"greeting":"Individuelle natürliche Anrede (1 Satz)","briefing":["Punkt 1","Punkt 2","Punkt 3"],"emoji":"ein passendes Emoji"}

Regeln:
- Maximal 3 Briefing-Punkte, kurze klare Sätze
- Maximal 4-5 Zeilen insgesamt
- Hebe nur Wichtiges hervor (neue Anfragen, Lagerprobleme, Handlungsbedarf)
- Wenn nichts auffällig ist, sag dass alles rund läuft
- Keine Emojis im Text, keine Marketing-Sprache, keine Standard-KI-Phrasen
- Sprache: ${lang}`
      : `Kompakter Statusüberblick für B2B-Gleitschirmportal. Sachlich, keine Floskeln.

${briefingData}

Antworte als JSON:
{"briefing":["Punkt 1","Punkt 2"],"emoji":"ein passendes Emoji"}

Regeln:
- Maximal 2 Punkte, nur das Wichtigste, kurze klare Sätze
- Keine Emojis im Text, keine Marketing-Sprache
- Sprache: ${lang}`;

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
  } catch (e: unknown) {
    console.error("Admin briefing error:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { greeting: "", briefing: ["Dashboard geladen."], emoji: "📊" },
      { status: 200 }
    );
  }
}

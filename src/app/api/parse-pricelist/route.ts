import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth-api";
import { buildExtractionPrompt } from "@/lib/gemini-prompts";
import { createRateLimiter } from "@/lib/rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

const checkLimit = createRateLimiter("gemini", 10, 60_000);

/**
 * Step 1: Extract structured price data from PDF text using Gemini.
 * Returns extracted items without any DB writes (fast, stays within timeout).
 */
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdminUser();
    if ("response" in guard) return guard.response;
    const { user } = guard;

    if (checkLimit(user.id)) {
      return NextResponse.json({ error: "Zu viele Anfragen. Bitte warten Sie eine Minute." }, { status: 429 });
    }

    const body = await request.json();
    const { pdf_text: pdfText } = body;

    if (!pdfText) return NextResponse.json({ error: "pdf_text ist erforderlich" }, { status: 400 });
    if (pdfText.length < 50) return NextResponse.json({ error: "Das PDF enthält zu wenig Text." }, { status: 400 });

    // Call Gemini for extraction
    const extractionPrompt = buildExtractionPrompt(pdfText);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 16384 }
    });
    const geminiResult = await model.generateContent([{ text: extractionPrompt }]);
    const responseText = geminiResult.response.text().trim();

    if (!responseText) return NextResponse.json({ error: "Gemini hat keine Antwort geliefert" }, { status: 422 });

    // Parse response
    let extracted;
    try {
      const parsed = JSON.parse(responseText);
      extracted = Array.isArray(parsed) ? parsed : (parsed.products ?? parsed);
      if (!Array.isArray(extracted)) throw new Error("Unexpected format");
    } catch {
      const arrStart = responseText.indexOf("[");
      const arrEnd = responseText.lastIndexOf("]");
      if (arrStart !== -1 && arrEnd > arrStart) {
        try {
          extracted = JSON.parse(responseText.slice(arrStart, arrEnd + 1));
        } catch {
          return NextResponse.json({ error: "KI-Antwort konnte nicht gelesen werden" }, { status: 422 });
        }
      } else {
        return NextResponse.json({ error: "Kein gültiges JSON in der KI-Antwort" }, { status: 422 });
      }
    }

    if (extracted.length === 0) return NextResponse.json({ error: "Keine Preisdaten im PDF erkannt" }, { status: 422 });

    return NextResponse.json({ extracted });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[parse-pricelist] Error:", msg);
    return NextResponse.json({ error: `Gemini-Fehler: ${msg.slice(0, 300)}` }, { status: 500 });
  }
}

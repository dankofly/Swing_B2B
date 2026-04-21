import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAdminUser } from "@/lib/auth-api";
import { createRateLimiter } from "@/lib/rate-limit";
import { generateWithRetry, GeminiRateLimitError } from "@/lib/gemini";

export const maxDuration = 30;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const checkLimit = createRateLimiter("gemini", 10, 60_000);

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdminUser();
    if ("response" in guard) return guard.response;
    const { user } = guard;

    if (checkLimit(user.id)) return NextResponse.json({ error: "Zu viele Anfragen. Bitte warten Sie eine Minute." }, { status: 429 });

    const { name, description, use_case, action_text, targetLocale } =
      await req.json();

    if (!targetLocale || !["en", "fr"].includes(targetLocale)) {
      return NextResponse.json(
        { error: "Invalid target locale" },
        { status: 400 }
      );
    }

    const langName = targetLocale === "en" ? "English" : "French";

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const fieldsToTranslate: Record<string, string> = {};
    if (name) fieldsToTranslate.name = name;
    if (description) fieldsToTranslate.description = description;
    if (use_case) fieldsToTranslate.use_case = use_case;
    if (action_text) fieldsToTranslate.action_text = action_text;

    if (Object.keys(fieldsToTranslate).length === 0) {
      return NextResponse.json({ translated: {} });
    }

    const prompt = `You are a professional paragliding pilot and sales expert who speaks ${langName} at C2 level. You know all paragliding terminology, the scene's jargon, and how to communicate with B2B dealers professionally.

Translate the following product data from German to ${langName}. Keep brand names, model names, and technical designations (like EN-A, EN-B, sizes) unchanged. Use the correct paragliding terminology in ${langName}.

For product names: Keep the model name as-is (e.g., "Mirage 2 RS" stays "Mirage 2 RS"). Only translate descriptive parts if any.
For descriptions: Translate naturally and professionally, keeping the tone suitable for B2B dealers.
For use_case: Use the standard ${langName} paragliding terminology (e.g., "XC & Wettbewerb" → "XC & Competition" in English).

Input JSON:
${JSON.stringify(fieldsToTranslate, null, 2)}

Return a JSON object with the same keys, translated to ${langName}.`;

    const result = await generateWithRetry(model, prompt);
    const text = result.response.text();

    let translated: Record<string, string>;
    try {
      translated = JSON.parse(text);
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      translated = match ? JSON.parse(match[1]) : JSON.parse(text);
    }

    return NextResponse.json({ translated });
  } catch (err) {
    if (err instanceof GeminiRateLimitError) {
      console.warn("Product translation rate-limited after retries:", err.message);
      return NextResponse.json(
        {
          error:
            "Google KI-Übersetzung ist gerade überlastet (Tages- oder Minuten-Kontingent ausgeschöpft). " +
            "Bitte in ein paar Minuten nochmal versuchen.",
        },
        { status: 429 },
      );
    }
    console.error("Product translation error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Translation failed",
      },
      { status: 500 }
    );
  }
}

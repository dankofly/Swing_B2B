import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    // Auth guard: admin only
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }
    const { data: profile } = await authClient.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || !["superadmin", "admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, name_en, name_fr");

    if (error) throw new Error(error.message);
    if (!categories || categories.length === 0) {
      return NextResponse.json({ message: "No categories found" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    // Build a map of names to translate
    const names: Record<string, string> = {};
    for (const cat of categories) {
      names[cat.id] = cat.name;
    }

    const prompt = `You are a professional paragliding pilot who speaks English and French at C2 level. You know all paragliding terminology perfectly.

Translate these paragliding product category names from German to English and French. Use the correct paragliding terminology.

Categories to translate:
${JSON.stringify(names, null, 2)}

Return a JSON object where each key is the category ID, and the value is an object with "en" and "fr" translations.
Example: { "id-1": { "en": "Paragliders", "fr": "Parapentes" } }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let translations: Record<string, { en: string; fr: string }>;
    try {
      translations = JSON.parse(text);
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      translations = match ? JSON.parse(match[1]) : JSON.parse(text);
    }

    // Update each category with translations
    let updated = 0;
    for (const cat of categories) {
      const t = translations[cat.id];
      if (t) {
        await supabase
          .from("categories")
          .update({
            name_en: t.en || cat.name_en,
            name_fr: t.fr || cat.name_fr,
          })
          .eq("id", cat.id);
        updated++;
      }
    }

    return NextResponse.json({
      message: `${updated} categories translated`,
      translations,
    });
  } catch (err) {
    console.error("Category translation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Übersetzung fehlgeschlagen" },
      { status: 500 }
    );
  }
}

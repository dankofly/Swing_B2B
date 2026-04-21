import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth-api";

export async function POST(request: NextRequest) {
  const guard = await requireAdminUser();
  if ("response" in guard) return guard.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Datei zu groß (max. 10MB)" }, { status: 400 });
    }

    // Validate MIME type
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Ungültiger Dateityp. Erlaubt: PNG, JPEG, WebP" }, { status: 400 });
    }

    const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/webp" ? "webp" : "png";
    const fileName = `${crypto.randomUUID()}.${ext}`;

    // Use service role client for storage upload (bypasses RLS)
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await serviceClient.storage
      .from("color-images")
      .upload(fileName, buffer, { contentType: file.type });

    if (error) {
      console.error("[upload-color-image] Storage error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = serviceClient.storage
      .from("color-images")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("[upload-color-image] Error:", err);
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 });
  }
}

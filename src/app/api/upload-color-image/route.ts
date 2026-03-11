import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["superadmin", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
    }

    const fileName = `${crypto.randomUUID()}.png`;

    // Use service role client for storage upload (bypasses RLS)
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await serviceClient.storage
      .from("color-images")
      .upload(fileName, buffer, { contentType: "image/png" });

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

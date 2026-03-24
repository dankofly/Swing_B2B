import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, buildPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://swingparagliders.pro";

    // Generate recovery link server-side
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      // Don't reveal whether the email exists — always return success
      console.error("[forgot-password] generateLink error:", linkError?.message);
      return NextResponse.json({ success: true });
    }

    // Build a custom verification URL that goes directly to our app
    // This bypasses Supabase's redirect URL allowlist entirely
    const token = linkData.properties.hashed_token;
    const verifyUrl = `${siteUrl}/auth/verify?token_hash=${encodeURIComponent(token)}&type=recovery`;

    // Send branded password reset email via Resend
    const html = buildPasswordResetEmail(verifyUrl);
    await sendEmail(email, "Passwort zurücksetzen \u2014 SWING B2B Portal", html);

    // Always return success (don't reveal whether email exists)
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password] Unexpected error:", err);
    return NextResponse.json({ success: true });
  }
}

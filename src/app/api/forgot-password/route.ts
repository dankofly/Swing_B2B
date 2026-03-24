import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, buildPasswordResetEmail } from "@/lib/email";
import { createRateLimiter } from "@/lib/rate-limit";

const isRateLimited = createRateLimiter("forgot-password", 3, 300_000); // 3 requests per 5 min

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      // Still return success to not reveal anything
      return NextResponse.json({ success: true });
    }

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
    const token = linkData.properties.hashed_token;
    const verifyUrl = `${siteUrl}/auth/verify?token_hash=${encodeURIComponent(token)}&type=recovery`;

    // Send branded password reset email via Resend
    const html = buildPasswordResetEmail(verifyUrl);
    console.log(`[forgot-password] Attempting to send reset email to ${email}, verifyUrl: ${verifyUrl.slice(0, 80)}...`);
    const sent = await sendEmail(email, "Passwort zurücksetzen \u2014 SWING B2B Portal", html);

    if (!sent) {
      console.error(`[forgot-password] Email send FAILED for ${email}`);
      return NextResponse.json({ success: false, error: "email_failed" });
    }

    console.log(`[forgot-password] Email sent successfully to ${email}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password] Unexpected error:", err);
    return NextResponse.json({ success: false, error: "server_error" });
  }
}

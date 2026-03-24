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

    // Generate recovery link server-side (bypasses redirect allowlist)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    if (linkError || !linkData?.properties?.action_link) {
      // Don't reveal whether the email exists — always return success
      console.error("[forgot-password] generateLink error:", linkError?.message);
      return NextResponse.json({ success: true });
    }

    // Rewrite the redirect_to in the action link to point to our auth callback
    const actionLink = linkData.properties.action_link.replace(
      /redirect_to=[^&]*/,
      `redirect_to=${encodeURIComponent(`${siteUrl}/auth/callback?type=recovery`)}`
    );

    // Send branded password reset email via Resend
    const html = buildPasswordResetEmail(actionLink);
    await sendEmail(email, "Passwort zurücksetzen — SWING B2B Portal", html);

    // Always return success (don't reveal whether email exists)
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password] Unexpected error:", err);
    return NextResponse.json({ success: true });
  }
}

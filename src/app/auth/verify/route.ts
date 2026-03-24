import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Custom token verification endpoint.
 * Verifies the hashed_token from admin.generateLink() directly,
 * bypassing Supabase's redirect URL allowlist.
 *
 * Flow: Email link → /auth/verify?token_hash=XXX&type=recovery
 *       → verifyOtp() → session created → redirect to /reset-password
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "recovery" | "email" | "invite" | undefined;

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=invalid_token`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    console.error("[auth/verify] verifyOtp error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=token_expired`);
  }

  // Token verified, session is now active
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  return NextResponse.redirect(`${origin}/katalog`);
}

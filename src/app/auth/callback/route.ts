import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the PKCE auth callback from Supabase.
 * Supabase redirects here with ?code=... after email confirmation,
 * password reset, or magic link. We exchange the code for a session
 * and then redirect to the intended destination.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Validate `next` to prevent open redirect attacks
  const rawNext = searchParams.get("next") ?? "/katalog";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/katalog";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const type = searchParams.get("type");
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

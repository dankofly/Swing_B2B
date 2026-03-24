import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

  const cookieStore = await cookies();

  // Collect cookies that Supabase wants to set during verifyOtp
  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Buffer cookies — we'll apply them to the redirect response
          pendingCookies.push(...cookiesToSet);
        },
      },
    }
  );

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    console.error("[auth/verify] verifyOtp error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=token_expired`);
  }

  // Set locale from invitation link if provided
  const locale = searchParams.get("locale");

  // Build redirect and attach session cookies
  const redirectUrl = type === "recovery" ? `${origin}/reset-password` : `${origin}/katalog`;
  const response = NextResponse.redirect(redirectUrl);

  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  }

  // Set locale cookie so the portal renders in the correct language
  if (locale && ["de", "en", "fr"].includes(locale)) {
    response.cookies.set("locale", locale, { path: "/", maxAge: 365 * 24 * 60 * 60 });
  }

  return response;
}

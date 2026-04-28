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

  // Extract locale early so it can be applied to success AND error redirects
  const locale = searchParams.get("locale");
  const isValidLocale = locale && ["de", "en", "fr"].includes(locale);

  /** Build a redirect that carries the locale cookie so the destination
   *  page (login / reset-password / katalog) renders in the correct language
   *  even when the customer hit this route from a branded invitation email. */
  function buildRedirect(path: string): NextResponse {
    const res = NextResponse.redirect(`${origin}${path}`);
    if (isValidLocale) {
      res.cookies.set("locale", locale!, { path: "/", maxAge: 365 * 24 * 60 * 60 });
    }
    return res;
  }

  if (!tokenHash || !type) {
    return buildRedirect("/login?error=invalid_token");
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
    return buildRedirect("/login?error=token_expired");
  }

  // Build redirect and attach session cookies
  const redirectUrl = type === "recovery" ? "/reset-password" : "/katalog";
  const response = buildRedirect(redirectUrl);

  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  }

  return response;
}

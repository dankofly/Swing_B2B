/**
 * API-route-friendly auth guards.
 *
 * `guardAdmin()` in `server.ts` is designed for Server Actions — it throws,
 * relies on caller to catch. API route handlers want to return HTTP responses
 * (401 / 403) instead of throwing. These helpers centralize the repeated
 * 6-line "check user, check role, bail with NextResponse" dance that every
 * admin-only route was previously duplicating.
 *
 * Usage:
 *   const guard = await requireAdminUser();
 *   if ("response" in guard) return guard.response;
 *   const { user } = guard;  // { id, email }
 *   // ... do admin-only work
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type AdminGuardResult =
  | { user: { id: string; email: string | undefined } }
  | { response: NextResponse };

/**
 * Require a logged-in admin (superadmin | admin). Testadmin is rejected.
 * Returns the `user` if allowed, or a pre-built 401/403 NextResponse.
 */
export async function requireAdminUser(): Promise<AdminGuardResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      response: NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 }),
    };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["superadmin", "admin"].includes(profile.role)) {
    return {
      response: NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 }),
    };
  }
  return { user: { id: user.id, email: user.email } };
}

/**
 * Variant that also allows `testadmin` (read-only admin). Use this for routes
 * that must be reachable from the testadmin persona, e.g. read-only catalog
 * tooling or the admin briefing fetch. Still rejects buyers.
 */
export async function requireAdminOrTestadmin(): Promise<AdminGuardResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
      response: NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 }),
    };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["superadmin", "admin", "testadmin"].includes(profile.role)) {
    return {
      response: NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 }),
    };
  }
  return { user: { id: user.id, email: user.email } };
}

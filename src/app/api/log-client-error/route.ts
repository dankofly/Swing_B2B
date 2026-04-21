import { NextRequest, NextResponse } from "next/server";

/**
 * Client-side error sink. React error boundaries fire-and-forget POST here
 * so we get a server-side log of errors that otherwise only surface in the
 * user's browser console.
 *
 * No auth required — this is a write-only diagnostic stream. Input is size-
 * capped and truncated to prevent log flooding. Output is just "ok" so the
 * client doesn't re-throw.
 */
export async function POST(request: NextRequest) {
  try {
    // 32 KB cap — more than enough for a stack trace, prevents abuse
    const raw = await request.text();
    if (raw.length > 32_000) {
      console.warn("[client-error] payload too large:", raw.length);
      return NextResponse.json({ ok: true, truncated: true });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw);
    } catch {
      console.warn("[client-error] invalid JSON:", raw.slice(0, 200));
      return NextResponse.json({ ok: true });
    }

    const trim = (v: unknown, max: number) =>
      typeof v === "string" ? v.slice(0, max) : v;

    console.error("[client-error]", {
      message: trim(body.message, 500),
      digest: trim(body.digest, 64),
      pathname: trim(body.pathname, 200),
      userAgent: trim(body.userAgent, 200),
      stack: trim(body.stack, 4000),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Never fail — this is diagnostic infrastructure, not business logic
    console.error("[client-error] sink failed:", err);
    return NextResponse.json({ ok: true });
  }
}

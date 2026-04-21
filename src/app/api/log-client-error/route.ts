import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rate-limit";

/**
 * Client-side error sink. React error boundaries fire-and-forget POST here
 * so we get a server-side log of errors that otherwise only surface in the
 * user's browser console.
 *
 * No auth required — this is a write-only diagnostic stream. Hardening:
 *   - IP rate-limit (100 / min) prevents log flooding + Netlify log cost abuse
 *   - Content-Length header checked pre-read to reject oversized bodies early
 *   - Body cap (32 KB) and per-field truncation prevent log bloat
 *   - `pathname` is stripped of query string before logging (als=<uuid> PII)
 *   - Output is always `{ ok: true }` so the client never re-throws
 */
const limit = createRateLimiter("client-error", 100, 60_000);
const MAX_BYTES = 32_000;

export async function POST(request: NextRequest) {
  try {
    // Per-IP rate-limit — Netlify forwards client IP in x-nf-client-connection-ip,
    // fall back to x-forwarded-for, finally "anon"
    const ip =
      request.headers.get("x-nf-client-connection-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anon";
    if (limit(ip)) {
      return NextResponse.json({ ok: true, rate_limited: true }, { status: 429 });
    }

    // Early rejection based on Content-Length header before reading the body
    const contentLength = parseInt(request.headers.get("content-length") ?? "0", 10);
    if (contentLength > MAX_BYTES) {
      return NextResponse.json({ ok: true, too_large: true }, { status: 413 });
    }

    const raw = await request.text();
    if (raw.length > MAX_BYTES) {
      return NextResponse.json({ ok: true, truncated: true });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: true });
    }

    const trim = (v: unknown, max: number) =>
      typeof v === "string" ? v.slice(0, max) : v;

    // Strip query string from pathname — `als=<uuid>` or other query params
    // are PII-ish and shouldn't be persisted in long-retention function logs.
    const rawPath = typeof body.pathname === "string" ? body.pathname : "";
    const pathname = rawPath.split("?")[0].slice(0, 200);

    console.error("[client-error]", {
      message: trim(body.message, 500),
      digest: trim(body.digest, 64),
      pathname,
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

/**
 * Shared helpers for Gemini calls.
 *
 * Why: the Gemini SDK does not auto-retry on transient 429 (rate limit /
 * quota exhausted). A single bad second can fail a translate request even
 * when the per-minute budget is otherwise fine. We wrap generateContent
 * with a small exponential backoff so those transient blips don't surface
 * as scary error banners to the admin.
 *
 * Persistent 429s (daily quota) still bubble up — those need a human
 * decision (wait / upgrade API key). Callers should catch `GeminiRateLimitError`
 * and return HTTP 429 with a friendly message to the client.
 */

import type { GenerativeModel } from "@google/generative-ai";

export class GeminiRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiRateLimitError";
  }
}

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|rate[- ]?limit|quota|resource[- ]?exhausted|too many requests/i.test(msg);
}

interface RetryOptions {
  /** Maximum total attempts (including first). Default: 3. */
  maxAttempts?: number;
  /** Base delay for exponential backoff in ms. Default: 2000. */
  baseDelayMs?: number;
}

/**
 * Call model.generateContent with exponential backoff on transient 429s.
 * Throws GeminiRateLimitError if all attempts fail with rate-limit errors.
 * Non-rate-limit errors bubble up unchanged on the first failure.
 */
export async function generateWithRetry(
  model: GenerativeModel,
  prompt: string,
  { maxAttempts = 3, baseDelayMs = 2000 }: RetryOptions = {},
): Promise<Awaited<ReturnType<GenerativeModel["generateContent"]>>> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      lastErr = err;
      if (!isRateLimitError(err) || attempt === maxAttempts) break;
      const delay = baseDelayMs * Math.pow(2, attempt - 1); // 2s, 4s, 8s...
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  if (isRateLimitError(lastErr)) {
    const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
    throw new GeminiRateLimitError(msg);
  }
  throw lastErr;
}

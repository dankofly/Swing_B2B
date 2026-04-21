import { isValidUUID } from "@/lib/rate-limit";

/**
 * Resolves the "viewing as" query-string parameter into an effective
 * company_id, with two hard constraints:
 *
 *   1. Caller must be admin/superadmin (isAdmin flag — the calling page
 *      is responsible for determining this from the session).
 *   2. The raw `als` value must be a valid UUID. Anything else is dropped
 *      silently. This prevents attacker-controlled arbitrary strings from
 *      flowing into queries that use `createAdminClient()` (which bypasses
 *      RLS entirely).
 *
 * Returns the company_id if allowed, otherwise undefined.
 *
 * Centralizes what was previously repeated in 5 catalog pages as:
 *   const viewingAsCompanyId = als && isAdmin ? als : undefined;
 * The old pattern missed the UUID check and made it easy for a future
 * page to forget the isAdmin guard entirely.
 */
export function getEffectiveCompanyId(
  als: string | undefined,
  isAdmin: boolean,
): string | undefined {
  if (!als || !isAdmin) return undefined;
  if (!isValidUUID(als)) return undefined;
  return als;
}

/**
 * RLS smoke test — catches regressions in dealer-facing read paths.
 *
 * Why this exists:
 *   The general smoke-test.mjs runs anonymous-only checks (landing page,
 *   login form renders, anon redirects to /login). It cannot detect RLS
 *   policy regressions, because the catalog endpoints only return data
 *   when the request is made by an authenticated dealer with the right
 *   role and company linkage.
 *
 *   We learned this the hard way: a REVOKE EXECUTE on the RLS helper
 *   functions made every authenticated SELECT return zero rows in
 *   production, and the anonymous smoke test did not catch it.
 *
 * What this script does:
 *   1. Signs in as a configured test buyer using the public anon key
 *      and dealer credentials from the environment.
 *   2. Runs the same shape of query the catalog SSR runs against
 *      products / categories / customer_prices.
 *   3. Asserts that each query returns at least one row (or, for
 *      customer_prices, ≥ 0 without an error — a dealer may legitimately
 *      have no prices configured yet).
 *   4. Exits 1 on any failure so CI / pre-deploy hooks block on it.
 *
 * Setup (one-time):
 *   The test buyer should be a real Supabase auth user linked to a real
 *   dealer company in the `companies` and `profiles` tables. Use a
 *   sentinel email like `b2b-rls-smoketest@swing.de` and store the
 *   credentials only in environment / secret manager.
 *
 *   Required env vars (all four must be set):
 *     NEXT_PUBLIC_SUPABASE_URL        — same as the app uses
 *     NEXT_PUBLIC_SUPABASE_ANON_KEY   — same as the app uses
 *     SMOKE_BUYER_EMAIL               — test buyer's email
 *     SMOKE_BUYER_PASSWORD            — test buyer's password
 *
 *   When the env vars are missing, the script exits 0 with a SKIPPED
 *   notice. That makes it safe to wire into pre-commit / CI without
 *   forcing every developer to have the credentials.
 *
 * Usage:
 *   node scripts/smoke-rls.mjs
 *
 * Exit codes:
 *   0 — all checks passed (or skipped due to missing env)
 *   1 — at least one check failed
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUYER_EMAIL = process.env.SMOKE_BUYER_EMAIL;
const BUYER_PASSWORD = process.env.SMOKE_BUYER_PASSWORD;

const checks = [];

function pass(name, detail = "") {
  checks.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.error(`✗ ${name} — ${detail}`);
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log(
      "SKIPPED — NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
    );
    process.exit(0);
  }
  if (!BUYER_EMAIL || !BUYER_PASSWORD) {
    console.log(
      "SKIPPED — SMOKE_BUYER_EMAIL / SMOKE_BUYER_PASSWORD not set. " +
        "Configure a real test dealer account to enable RLS regression coverage."
    );
    process.exit(0);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Sign in as the test dealer.
  const { data: session, error: signInError } = await supabase.auth
    .signInWithPassword({ email: BUYER_EMAIL, password: BUYER_PASSWORD });
  if (signInError || !session?.user) {
    fail(
      "Sign in as test dealer",
      signInError?.message || "no session returned"
    );
    summarizeAndExit();
    return;
  }
  pass("Sign in as test dealer", `uid=${session.user.id}`);

  // 2. profiles_select — RLS policy: ((auth.uid() = id) OR private.is_admin_or_testadmin())
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, company_id")
    .eq("id", session.user.id)
    .single();
  if (profileError || !profile) {
    fail("Read own profile", profileError?.message || "no row returned");
  } else if (!profile.company_id) {
    fail("Read own profile", "profile.company_id is null — test user not linked to a dealer");
  } else {
    pass("Read own profile", `role=${profile.role}, company=${profile.company_id}`);
  }

  // 3. products_select_active — RLS policy:
  //    ((is_active = true) OR private.is_admin_or_testadmin())
  //    Catalog SSR uses this exact filter.
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, is_active")
    .eq("is_active", true)
    .limit(50);
  if (productsError) {
    fail("List active products", productsError.message);
  } else if (!products || products.length === 0) {
    fail(
      "List active products",
      "0 rows returned — RLS or data issue (DB has 22 active products)"
    );
  } else {
    pass("List active products", `${products.length} row(s)`);
  }

  // 4. customer_prices_select — RLS policy:
  //    ((company_id = private.user_company_id()) OR private.is_admin_or_testadmin())
  //    The query must succeed; row count may be 0 for a freshly seeded dealer.
  const { error: pricesError } = await supabase
    .from("customer_prices")
    .select("product_size_id, unit_price")
    .limit(5);
  if (pricesError) {
    fail("Read own customer_prices", pricesError.message);
  } else {
    pass("Read own customer_prices", "query succeeded");
  }

  // 5. companies_select — RLS policy:
  //    ((id = private.user_company_id()) OR private.is_admin_or_testadmin())
  //    Dealer should see exactly one company row (their own).
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, name");
  if (companiesError) {
    fail("Read own company", companiesError.message);
  } else if (!companies || companies.length === 0) {
    fail("Read own company", "0 rows — dealer cannot see their own company");
  } else {
    pass("Read own company", `${companies.length} row(s)`);
  }

  await supabase.auth.signOut();

  summarizeAndExit();
}

function summarizeAndExit() {
  const failed = checks.filter((c) => !c.ok);
  console.log(
    `\n=== SUMMARY: ${checks.length - failed.length}/${checks.length} passed ===`
  );
  if (failed.length > 0) {
    console.log("\nFailed checks:");
    for (const c of failed) console.log(`  - ${c.name}: ${c.detail}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("Fatal error in smoke-rls:", e);
  process.exit(1);
});

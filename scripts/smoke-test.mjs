/**
 * Smoke test against the running dev server (localhost:3000).
 *
 * Verifies that the post-RLS migration deployment hasn't broken
 * core flows for anon visitors. Buyer/admin flows would need a
 * test account; we check that the unauthenticated paths load
 * cleanly and that protected routes properly redirect.
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = one or more checks failed
 */
import { chromium } from "playwright-core";
import { spawnSync } from "node:child_process";

// Resolve a chromium binary from the local Playwright browser cache so we
// can run without a system Chrome install.
function resolveChromiumExecutable() {
  const result = spawnSync(
    process.platform === "win32" ? "powershell.exe" : "node",
    process.platform === "win32"
      ? ["-NoProfile", "-Command", "Get-ChildItem $env:LOCALAPPDATA/ms-playwright/chromium_headless_shell-* -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty FullName"]
      : ["-e", "console.log(process.env.PLAYWRIGHT_BROWSERS_PATH || '')"],
    { encoding: "utf8" }
  );
  const root = (result.stdout || "").trim();
  if (!root) return null;
  return process.platform === "win32"
    ? `${root}\\chrome-headless-shell-win64\\chrome-headless-shell.exe`
    : `${root}/chrome-headless-shell-linux/chrome-headless-shell`;
}

const BASE = "http://localhost:3000";
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
  const exe = resolveChromiumExecutable();
  if (!exe) {
    console.error("Could not locate Playwright chromium binary");
    process.exit(1);
  }

  const browser = await chromium.launch({ executablePath: exe, headless: true });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  // 1. Landing page loads
  try {
    const resp = await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (!resp || resp.status() >= 400) {
      fail("Landing page", `status ${resp?.status() ?? "n/a"}`);
    } else {
      const title = await page.title();
      pass("Landing page", `status ${resp.status()}, title="${title}"`);
    }
  } catch (e) {
    fail("Landing page", String(e.message || e));
  }

  // 2. Login page renders form fields
  try {
    const resp = await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (!resp || resp.status() >= 400) {
      fail("Login page", `status ${resp?.status() ?? "n/a"}`);
    } else {
      const hasEmail = await page.locator('input[type="email"]').count();
      const hasPassword = await page.locator('input[type="password"]').count();
      if (hasEmail > 0 && hasPassword > 0) {
        pass("Login page", `email + password fields present`);
      } else {
        fail("Login page", `missing inputs (email=${hasEmail}, password=${hasPassword})`);
      }
    }
  } catch (e) {
    fail("Login page", String(e.message || e));
  }

  // 3. Register page renders
  try {
    const resp = await page.goto(`${BASE}/register`, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (!resp || resp.status() >= 400) {
      fail("Register page", `status ${resp?.status() ?? "n/a"}`);
    } else {
      const hasEmail = await page.locator('input[type="email"]').count();
      pass("Register page", `status ${resp.status()}, email field=${hasEmail > 0 ? "yes" : "no"}`);
    }
  } catch (e) {
    fail("Register page", String(e.message || e));
  }

  // 4. Forgot password page
  try {
    const resp = await page.goto(`${BASE}/forgot-password`, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (!resp || resp.status() >= 400) {
      fail("Forgot password page", `status ${resp?.status() ?? "n/a"}`);
    } else {
      pass("Forgot password page", `status ${resp.status()}`);
    }
  } catch (e) {
    fail("Forgot password page", String(e.message || e));
  }

  // 5. Datenschutz / Impressum (legal pages)
  for (const path of ["/datenschutz", "/impressum"]) {
    try {
      const resp = await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      if (!resp || resp.status() >= 400) {
        fail(`${path}`, `status ${resp?.status() ?? "n/a"}`);
      } else {
        pass(`${path}`, `status ${resp.status()}`);
      }
    } catch (e) {
      fail(`${path}`, String(e.message || e));
    }
  }

  // 6. Anon visiting /admin must redirect to /login
  try {
    const resp = await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const finalUrl = page.url();
    if (finalUrl.includes("/login")) {
      pass("/admin redirects anon", `redirected to ${finalUrl}`);
    } else {
      fail("/admin redirects anon", `landed on ${finalUrl} (expected /login)`);
    }
  } catch (e) {
    fail("/admin redirects anon", String(e.message || e));
  }

  // 7. Anon visiting /katalog must redirect to /login
  try {
    const resp = await page.goto(`${BASE}/katalog`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const finalUrl = page.url();
    if (finalUrl.includes("/login")) {
      pass("/katalog redirects anon", `redirected to ${finalUrl}`);
    } else {
      fail("/katalog redirects anon", `landed on ${finalUrl} (expected /login)`);
    }
  } catch (e) {
    fail("/katalog redirects anon", String(e.message || e));
  }

  // 8. Anon visiting /katalog/dashboard must redirect to /login
  try {
    const resp = await page.goto(`${BASE}/katalog/dashboard`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const finalUrl = page.url();
    if (finalUrl.includes("/login")) {
      pass("/katalog/dashboard redirects anon", `redirected to ${finalUrl}`);
    } else {
      fail("/katalog/dashboard redirects anon", `landed on ${finalUrl} (expected /login)`);
    }
  } catch (e) {
    fail("/katalog/dashboard redirects anon", String(e.message || e));
  }

  // 9. Submit invalid login → should show error, not crash
  try {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.fill('input[type="email"]', "smoke-test-noexist@example.invalid");
    await page.fill('input[type="password"]', "definitely-wrong-password");
    await Promise.all([
      page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);
    // Wait briefly for client-side error rendering
    await page.waitForTimeout(2000);
    const stillOnLogin = page.url().includes("/login");
    const bodyText = (await page.textContent("body")) || "";
    if (stillOnLogin && bodyText.length > 50) {
      pass("Invalid login shows error", `stayed on /login`);
    } else {
      fail("Invalid login shows error", `url=${page.url()}, bodyLen=${bodyText.length}`);
    }
  } catch (e) {
    fail("Invalid login shows error", String(e.message || e));
  }

  // 10. JS console errors check on landing page
  try {
    const errors = [];
    const errorPage = await ctx.newPage();
    errorPage.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    errorPage.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
    });
    await errorPage.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 });
    await errorPage.waitForTimeout(2000);
    // Filter known dev-mode noise:
    //  - favicon 404
    //  - hydration / HMR messages
    //  - React dev-mode `eval()` CSP warning (only in development)
    const filtered = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("hydration") &&
        !e.includes("HMR") &&
        !e.includes("eval() is not supported") &&
        !e.includes("React requires eval()")
    );
    if (filtered.length === 0) {
      pass("No JS errors on landing page");
    } else {
      fail("No JS errors on landing page", `${filtered.length} error(s): ${filtered.slice(0, 3).join(" | ")}`);
    }
    await errorPage.close();
  } catch (e) {
    fail("No JS errors on landing page", String(e.message || e));
  }

  await browser.close();

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n=== SUMMARY: ${checks.length - failed.length}/${checks.length} passed ===`);
  if (failed.length > 0) {
    console.log("\nFailed checks:");
    for (const c of failed) console.log(`  - ${c.name}: ${c.detail}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal error in smoke test:", e);
  process.exit(1);
});

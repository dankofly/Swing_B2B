import { chromium } from "@playwright/test";

const BASE = "http://localhost:3099";
const MOBILE = { width: 375, height: 812 }; // iPhone 13

const pages = [
  { name: "landing", path: "/" },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
  { name: "impressum", path: "/impressum" },
  { name: "datenschutz", path: "/datenschutz" },
  { name: "forgot-password", path: "/forgot-password" },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: MOBILE,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  });

  for (const pg of pages) {
    const page = await context.newPage();
    console.log(`📱 ${pg.name}: ${pg.path}`);
    await page.goto(`${BASE}${pg.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);

    // Full page screenshot
    await page.screenshot({
      path: `mobile-${pg.name}.png`,
      fullPage: true,
    });

    // Also capture viewport-only for above-the-fold
    await page.screenshot({
      path: `mobile-${pg.name}-fold.png`,
      fullPage: false,
    });

    await page.close();
  }

  await browser.close();
  console.log("✅ Done — screenshots saved");
})();

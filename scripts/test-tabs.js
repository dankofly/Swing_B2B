const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3847';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto(TARGET_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });

  await page.fill('input[name="email"]', 'daniel.kofler@swing.de');
  await page.fill('input[name="password"]', 'Swing12345');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/katalog**', { timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'katalog-tabs-desktop.png', fullPage: false });
  console.log('Desktop screenshot saved');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'katalog-tabs-mobile.png', fullPage: false });
  console.log('Mobile screenshot saved');

  await browser.close();
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('NET FAIL:', req.url(), req.failure()?.errorText));

  await page.goto('https://swing-b2b-portal.netlify.app/login', { waitUntil: 'networkidle', timeout: 20000 });
  console.log('Page loaded, URL:', page.url());

  await page.fill('input#email', 'daniel.kofler@swing.de');
  await page.fill('input#password', 'Swing12345');
  await page.click('button[type="submit"]');

  // Wait for navigation or error
  try {
    await page.waitForURL('**/katalog**', { timeout: 10000 });
    console.log('SUCCESS - Redirected to:', page.url());
  } catch (e) {
    console.log('TIMEOUT - Still on:', page.url());
    const errorEl = await page.$('.text-red-600');
    if (errorEl) console.log('ERROR MSG:', await errorEl.textContent());
  }

  await page.screenshot({ path: '/tmp/netlify-login-test.png', fullPage: true });
  console.log('Screenshot saved to /tmp/netlify-login-test.png');
  await browser.close();
})();

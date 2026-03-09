const { chromium } = require('playwright');

const TARGET_URL = 'https://swing-b2b-portal.netlify.app';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push('[pageerror] ' + err.message));
  page.on('response', resp => {
    if (resp.status() >= 500) errors.push(`[http ${resp.status()}] ${resp.url()}`);
  });

  // Login as info@swing.de (superadmin, known password)
  console.log('=== Logging in as info@swing.de ===');
  await page.goto(TARGET_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input#email', 'info@swing.de');
  await page.fill('input#password', 'Swing1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log('After login URL:', page.url());

  if (page.url().includes('/login')) {
    // Check for error message
    const errMsg = await page.textContent('.text-red-600').catch(() => 'no error element');
    console.log('Login error:', errMsg);
    await page.screenshot({ path: 'c:/Users/DanKof/projects/swing-b2b/deployed-login-error.png', fullPage: true });
    await browser.close();
    return;
  }

  // Test admin dashboard
  console.log('\n=== Testing Admin Dashboard ===');
  errors.length = 0;
  const adminResp = await page.goto(TARGET_URL + '/admin', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('Admin status:', adminResp.status());
  console.log('Admin URL:', page.url());
  const adminBody = await page.textContent('body');
  console.log('Admin body (300 chars):', adminBody.substring(0, 300));
  if (errors.length) console.log('Admin errors:', errors.join('\n'));
  await page.screenshot({ path: 'c:/Users/DanKof/projects/swing-b2b/deployed-admin.png', fullPage: true });

  // Test customer dashboard
  console.log('\n=== Testing Customer Dashboard ===');
  errors.length = 0;
  const custResp = await page.goto(TARGET_URL + '/katalog/dashboard', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('Customer status:', custResp.status());
  console.log('Customer URL:', page.url());
  const custBody = await page.textContent('body');
  console.log('Customer body (300 chars):', custBody.substring(0, 300));
  if (errors.length) console.log('Customer errors:', errors.join('\n'));
  await page.screenshot({ path: 'c:/Users/DanKof/projects/swing-b2b/deployed-customer.png', fullPage: true });

  await browser.close();
})();

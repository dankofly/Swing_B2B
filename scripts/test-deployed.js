const { chromium } = require('playwright');

const TARGET_URL = 'https://swing-b2b-portal.netlify.app';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('[console] ' + msg.text());
  });
  page.on('pageerror', err => errors.push('[pageerror] ' + err.message));
  page.on('response', resp => {
    if (resp.status() >= 400) errors.push(`[http ${resp.status()}] ${resp.url()}`);
  });

  // Login as danielkofler@gmail.com (superadmin WITH company)
  console.log('=== Logging in as danielkofler@gmail.com ===');
  await page.goto(TARGET_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input#email', 'danielkofler@gmail.com');
  await page.fill('input#password', 'Swing1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log('After login URL:', page.url());

  if (page.url().includes('/login')) {
    // Try other password
    console.log('Login failed, trying with different password...');
    await page.fill('input#password', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    console.log('After 2nd attempt URL:', page.url());
  }

  // Try admin dashboard
  console.log('\n=== Testing Admin Dashboard ===');
  errors.length = 0;
  try {
    const resp = await page.goto(TARGET_URL + '/admin', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('Admin status:', resp.status());
    console.log('Admin URL:', page.url());
    const body = await page.textContent('body');
    console.log('Admin body (200 chars):', body.substring(0, 200));
    if (errors.length) console.log('Errors:', errors.join('\n'));
  } catch (e) {
    console.log('Admin error:', e.message);
  }
  await page.screenshot({ path: 'c:/Users/DanKof/projects/swing-b2b/deployed-admin.png', fullPage: true });

  // Try customer dashboard
  console.log('\n=== Testing Customer Dashboard ===');
  errors.length = 0;
  try {
    const resp = await page.goto(TARGET_URL + '/katalog/dashboard', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('Customer status:', resp.status());
    console.log('Customer URL:', page.url());
    const body = await page.textContent('body');
    console.log('Customer body (200 chars):', body.substring(0, 200));
    if (errors.length) console.log('Errors:', errors.join('\n'));
  } catch (e) {
    console.log('Customer error:', e.message);
  }
  await page.screenshot({ path: 'c:/Users/DanKof/projects/swing-b2b/deployed-customer.png', fullPage: true });

  await browser.close();
})();

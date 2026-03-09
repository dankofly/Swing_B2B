const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3847';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Collect errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push('[console] ' + msg.text());
  });
  page.on('pageerror', err => errors.push('[pageerror] ' + err.message));

  // Step 1: Login as admin
  console.log('=== Logging in as info@swing.de ===');
  await page.goto(TARGET_URL + '/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.fill('input#email', 'info@swing.de');
  await page.fill('input#password', 'Swing1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('After login, URL:', page.url());

  // Step 2: Visit admin dashboard
  console.log('\n=== Testing Admin Dashboard ===');
  errors.length = 0;
  const adminResp = await page.goto(TARGET_URL + '/admin', { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log('Admin status:', adminResp.status());
  console.log('Admin URL:', page.url());
  const adminContent = await page.textContent('body');
  console.log('Admin content (first 300):', adminContent.substring(0, 300));
  if (errors.length > 0) console.log('Admin errors:', errors.join('\n'));
  await page.screenshot({ path: 'c:/Users/DanKof/projects/swing-b2b/admin-dashboard-test.png', fullPage: true });

  // Step 3: Visit customer dashboard
  console.log('\n=== Testing Customer Dashboard ===');
  errors.length = 0;
  const custResp = await page.goto(TARGET_URL + '/katalog/dashboard', { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(3000);
  console.log('Customer status:', custResp.status());
  console.log('Customer URL:', page.url());
  const custContent = await page.textContent('body');
  console.log('Customer content (first 300):', custContent.substring(0, 300));
  if (errors.length > 0) console.log('Customer errors:', errors.join('\n'));
  await page.screenshot({ path: 'c:/Users/DanKof/projects/swing-b2b/customer-dashboard-test.png', fullPage: true });

  await browser.close();
})();

const { chromium } = require('playwright');

const TARGET_URL = 'https://swing-b2b-portal.netlify.app';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Login
  await page.goto(TARGET_URL + '/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input#email', 'info@swing.de');
  await page.fill('input#password', 'Swing1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log('After login:', page.url());

  // Admin dashboard
  console.log('\n=== Admin Dashboard ===');
  await page.goto(TARGET_URL + '/admin', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());
  const adminBody = await page.textContent('body');
  // Check if "Noch keine Anfragen" still appears
  console.log('Has "Noch keine Anfragen":', adminBody.includes('Noch keine Anfragen'));
  console.log('Has "Letzte Anfragen":', adminBody.includes('Letzte Anfragen'));
  // Check for company names in the inquiry list
  console.log('Has company names:', adminBody.includes('Flugschule') || adminBody.includes('Paragliding'));
  await page.screenshot({ path: 'c:/Users/DanKof/projects/swing-b2b/deployed-admin-v2.png', fullPage: true });

  // Customer dashboard
  console.log('\n=== Customer Dashboard ===');
  await page.goto(TARGET_URL + '/katalog/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());
  const isOnDashboard = page.url().includes('/dashboard');
  console.log('On dashboard page:', isOnDashboard);
  if (isOnDashboard) {
    const custBody = await page.textContent('body');
    console.log('Has welcome:', custBody.includes('Willkommen'));
    console.log('Has company:', custBody.includes('Flugschule Tirol'));
    console.log('Body (200 chars):', custBody.substring(0, 200));
  } else {
    console.log('Redirected away from dashboard!');
  }
  await page.screenshot({ path: 'c:/Users/DanKof/projects/swing-b2b/deployed-customer-v2.png', fullPage: true });

  await browser.close();
})();

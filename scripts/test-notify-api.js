const { chromium } = require('playwright');

const TARGET_URL = 'https://swing-b2b-portal.netlify.app';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Loading site...');
  await page.goto(TARGET_URL, { timeout: 30000 });
  console.log('Page loaded:', await page.title());

  console.log('\n--- Testing /api/notify-registration ---');
  try {
    const response = await page.request.post(TARGET_URL + '/api/notify-registration', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        companyName: 'Test Paragliding GmbH',
        companyType: 'dealer',
        fullName: 'Max Mustermann',
        email: 'max@test-paragliding.de',
        phone: '+49 123 456789',
        phoneWhatsapp: true,
        addressStreet: 'Bergstr. 12',
        addressZip: '82290',
        addressCity: 'Landsberied',
        addressCountry: 'Deutschland',
        vatId: 'DE123456789',
        sellsParagliders: true,
        sellsMiniwings: false,
        sellsParakites: false,
      },
      timeout: 30000,
    });

    console.log('Status:', response.status());
    const body = await response.json();
    console.log('Response:', JSON.stringify(body, null, 2));

    if (response.ok()) {
      console.log('\nAPI is working!');
      if (body.skipped) {
        console.log('RESEND_API_KEY not set - email was logged only');
      } else {
        console.log('Email was sent!');
      }
    } else {
      console.log('\nAPI error:', response.status());
    }
  } catch (e) {
    console.log('API request failed:', e.message);
  }

  await page.waitForTimeout(2000);
  await browser.close();
})();

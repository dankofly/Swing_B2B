const { chromium } = require('playwright');

const TARGET_URL = 'https://swing-b2b-portal.netlify.app';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(TARGET_URL);
  console.log('Page loaded:', await page.title());

  console.log('\n--- Testing /api/notify-registration ---');
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
  });

  console.log('Status:', response.status());
  const body = await response.json();
  console.log('Response:', JSON.stringify(body, null, 2));

  if (response.ok()) {
    console.log('\nAPI erreichbar und antwortet');
    if (body.skipped) {
      console.log('RESEND_API_KEY nicht gesetzt - Email wird nur geloggt');
    } else {
      console.log('Email wurde versendet!');
    }
  } else {
    console.log('\nAPI Fehler:', response.status());
  }

  console.log('\n--- Alle API Routes pruefen ---');
  const routes = [
    '/api/notify-registration',
    '/api/parse-pricelist',
    '/api/parse-stock-csv',
    '/api/upload-color-image',
  ];

  for (const route of routes) {
    try {
      const r = await page.request.post(TARGET_URL + route, {
        headers: { 'Content-Type': 'application/json' },
        data: {},
      });
      console.log('  ' + route + ' -> ' + r.status() + ' ' + r.statusText());
    } catch (e) {
      console.log('  ' + route + ' -> ERROR: ' + e.message);
    }
  }

  await page.waitForTimeout(2000);
  await browser.close();
})();

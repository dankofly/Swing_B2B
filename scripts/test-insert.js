const { createClient } = require('@supabase/supabase-js');
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2JrY3pvZXBjdm53dHFueGFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMzMTMwMywiZXhwIjoyMDg1OTA3MzAzfQ.ulErL1j3t0SHY1vXlEpErx7wLXLKv55Ooe7wNITyR90';

(async () => {
  // Try inserting directly via REST to see if tables exist but cache is stale
  const res = await fetch('https://igkbkczoepcvnwtqnxao.supabase.co/rest/v1/companies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ name: 'Test GmbH', contact_email: 'test@test.de' })
  });
  console.log('Insert companies status:', res.status);
  const body = await res.text();
  console.log('Response:', body.substring(0, 300));

  // Also try the OpenAPI spec again with cache-busting
  const res2 = await fetch('https://igkbkczoepcvnwtqnxao.supabase.co/rest/v1/?_t=' + Date.now(), {
    headers: { 'apikey': SERVICE_KEY }
  });
  const spec = await res2.json();
  const paths = Object.keys(spec.paths || {}).filter(p => p !== '/');
  console.log('\nAll tables:', paths.join(', '));
})();

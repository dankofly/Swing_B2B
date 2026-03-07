const { createClient } = require('@supabase/supabase-js');
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2JrY3pvZXBjdm53dHFueGFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMzMTMwMywiZXhwIjoyMDg1OTA3MzAzfQ.ulErL1j3t0SHY1vXlEpErx7wLXLKv55Ooe7wNITyR90';

// Try different schemas
const schemas = ['public', 'auth', 'storage', 'extensions'];

(async () => {
  for (const schema of schemas) {
    const supabase = createClient('https://igkbkczoepcvnwtqnxao.supabase.co', SERVICE_KEY, {
      db: { schema }
    });
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    console.log(`${schema}.profiles:`, error ? error.message : 'FOUND (' + data.length + ' rows)');
  }

  // Also check what schemas expose profiles via default client
  const supabase = createClient('https://igkbkczoepcvnwtqnxao.supabase.co', SERVICE_KEY);

  // Check the OpenAPI spec for exposed schemas
  const res = await fetch('https://igkbkczoepcvnwtqnxao.supabase.co/rest/v1/', {
    headers: { 'apikey': SERVICE_KEY }
  });
  const spec = await res.json();
  console.log('\nExposed schemas:', spec.info ? spec.info.description : 'unknown');
  console.log('Paths:', Object.keys(spec.paths || {}).filter(p => p !== '/').join(', '));
})();

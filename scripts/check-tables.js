const { createClient } = require('@supabase/supabase-js');
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlna2JrY3pvZXBjdm53dHFueGFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMzMTMwMywiZXhwIjoyMDg1OTA3MzAzfQ.ulErL1j3t0SHY1vXlEpErx7wLXLKv55Ooe7wNITyR90';
const supabase = createClient('https://igkbkczoepcvnwtqnxao.supabase.co', SERVICE_KEY);

(async () => {
  const tables = ['companies', 'profiles', 'categories', 'products', 'product_sizes', 'product_colors', 'customer_prices', 'inquiries', 'inquiry_items'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('id').limit(1);
    console.log(t + ':', error ? 'MISSING (' + error.message + ')' : 'OK (' + (data ? data.length : 0) + ' rows)');
  }

  // Check profiles columns
  const { data: profile, error: pErr } = await supabase.from('profiles').select('id,role,company_id').limit(1);
  console.log('\nprofiles columns test:', pErr ? pErr.message : JSON.stringify(profile));
})();

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read env vars
const env = {};
readFileSync('.env.local', 'utf-8').split('\n').forEach(line => {
  const [k, ...rest] = line.split('=');
  if (k && rest.length) env[k.trim()] = rest.join('=').trim();
});

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// Test write to en_class
const { data: products } = await sb.from('products').select('id, tech_specs').limit(1);
if (!products || products.length === 0) {
  console.log('no products found');
  process.exit(1);
}

const p = products[0];
const enVal = p.tech_specs?.['EN-Zertifizierung'] || 'TEST';

const { error } = await sb.from('products').update({ en_class: enVal }).eq('id', p.id);
if (error) {
  console.log('ERROR: en_class column does not exist.');
  console.log('Please run this SQL in Supabase Dashboard -> SQL Editor:');
  console.log('');
  console.log('  ALTER TABLE products ADD COLUMN IF NOT EXISTS en_class VARCHAR(30);');
  console.log('');
  console.log('Then run this script again to migrate data.');
  process.exit(1);
}

console.log('en_class column exists! Migrating data from tech_specs...');

// Migrate all products
const { data: allProducts } = await sb.from('products').select('id, tech_specs, en_class');
let migrated = 0;
for (const prod of allProducts || []) {
  const enCert = prod.tech_specs?.['EN-Zertifizierung'];
  if (enCert && !prod.en_class) {
    await sb.from('products').update({ en_class: enCert }).eq('id', prod.id);
    migrated++;
  }
}

console.log(`Migrated ${migrated} products' EN class from tech_specs to en_class column.`);

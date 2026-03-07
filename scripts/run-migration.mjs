import pg from 'pg';
const { Client } = pg;

// Direct connection to Supabase PostgreSQL
const client = new Client({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.igkbkczoepcvnwtqnxao',
  password: process.argv[2],
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL');

  // Add en_class column
  await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS en_class VARCHAR(30)');
  console.log('Added en_class column');

  // Migrate data from tech_specs
  const result = await client.query(`
    UPDATE products
    SET en_class = tech_specs->>'EN-Zertifizierung'
    WHERE tech_specs->>'EN-Zertifizierung' IS NOT NULL
      AND en_class IS NULL
  `);
  console.log(`Migrated ${result.rowCount} products`);

  // Verify
  const { rows } = await client.query('SELECT name, en_class FROM products WHERE en_class IS NOT NULL LIMIT 5');
  console.log('Sample data:', rows);

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await client.end();
}

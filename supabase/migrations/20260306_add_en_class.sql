-- Add en_class column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS en_class VARCHAR(30);

-- Migrate existing EN-Zertifizierung from tech_specs JSONB to the new column
UPDATE products
SET en_class = tech_specs->>'EN-Zertifizierung'
WHERE tech_specs->>'EN-Zertifizierung' IS NOT NULL
  AND en_class IS NULL;

-- Ensure classification, use_case, website_url columns exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS classification VARCHAR(30);
ALTER TABLE products ADD COLUMN IF NOT EXISTS use_case VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS website_url TEXT;

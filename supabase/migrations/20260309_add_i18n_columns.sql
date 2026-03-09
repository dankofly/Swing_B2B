-- Add EN/FR translation columns to products and categories
-- German (DE) remains the primary/source language in the existing columns

-- Categories: translated names
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_fr VARCHAR(255);

-- Products: translated fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_fr VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_fr TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS use_case_en VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS use_case_fr VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS action_text_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS action_text_fr TEXT;

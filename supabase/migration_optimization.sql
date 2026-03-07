-- ============================================================
-- SWING B2B Haendlerportal - Database Optimization Migration
-- ============================================================
-- Generated: 2026-03-05
-- Status: REVIEW ONLY - Do NOT execute without reviewing each section
--
-- This migration addresses:
--   1. RLS enablement (CRITICAL - most tables have RLS disabled in production)
--   2. Missing RLS policies (most schema.sql policies were never applied)
--   3. Missing indexes for query performance
--   4. Missing constraints for data integrity
--   5. Schema drift between schema.sql and live database
--   6. Missing stock_imports table
--   7. updated_at auto-trigger
-- ============================================================


-- ============================================================
-- SECTION 0: FINDINGS SUMMARY
-- ============================================================
--
-- CRITICAL ISSUES:
--
-- 1. RLS IS DISABLED on ALL tables except company_notes.
--    The schema.sql has ALTER TABLE ... ENABLE ROW LEVEL SECURITY
--    for 8 tables, but NONE of them are actually enabled in production.
--    This means ALL authenticated users can read/write ALL data
--    regardless of role or company. This is a security emergency.
--
-- 2. RLS POLICIES are almost entirely missing. Only 1 policy exists
--    in production (on company_notes). The schema.sql defines 15+
--    policies that were never applied. Even after enabling RLS,
--    without policies all access will be DENIED (default deny).
--
-- 3. Schema drift:
--    - Live DB: products.uvp_brutto is INTEGER (should be DECIMAL(10,2))
--    - Live DB: products missing en_class column
--    - Live DB: product_colors has extra columns: slogan, classification
--    - Live DB: customer_prices has extra column: discount
--    - Live DB: inquiries has extra columns: tracking_number, shipping_carrier
--    - Live DB: price_uploads differs significantly from schema.sql
--      (missing: uploaded_by, matched_count, total_count, parsed_data, error_log)
--      (extra: file_name, category)
--    - Live DB: profiles.id default is gen_random_uuid() instead of
--      referencing auth.users(id) - FK may also be missing
--    - Live DB: companies has legacy 'address' TEXT column alongside
--      the structured address_* columns
--    - Missing table: stock_imports (defined in schema.sql, not in live DB)
--    - Extra table: company_notes (in live DB, not in schema.sql)
--
-- 4. No secondary indexes exist at all. Only PK and UNIQUE indexes.
--    Foreign key columns have no indexes, which means:
--    - JOINs on FK columns do sequential scans
--    - RLS subqueries on profiles.company_id do sequential scans
--    - Cascade deletes scan full tables
--
-- 5. Missing CHECK constraints:
--    - inquiry_items.quantity > 0 (in schema.sql, not verified live)
--    - profiles.role CHECK constraint missing
--    - price_uploads.status and file_type CHECK constraints missing
--    - customer_prices.unit_price > 0 not enforced
--    - product_sizes.stock_quantity >= 0 not enforced
--
-- 6. No updated_at trigger on any table (companies has the column but
--    no auto-update mechanism).


-- ============================================================
-- SECTION 1: ENABLE ROW LEVEL SECURITY (CRITICAL)
-- ============================================================
-- Without RLS enabled, any authenticated Supabase client can
-- read and modify ALL rows in ALL tables. This must be fixed
-- before anything else.
--
-- WARNING: Enabling RLS without policies will DENY all access
-- to non-superuser roles. Apply Section 2 (policies) immediately
-- after this section.

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_items ENABLE ROW LEVEL SECURITY;
-- company_notes already has RLS enabled


-- ============================================================
-- SECTION 2: RLS POLICIES
-- ============================================================
-- These policies match the schema.sql definitions plus additions
-- for tables/scenarios not originally covered.
--
-- Pattern used throughout:
--   - Buyers see only their own company's data
--   - Admins/superadmins have full access via FOR ALL
--   - Product catalog (products, sizes, colors, categories) is
--     readable by all authenticated users
--
-- IMPORTANT: The admin check subquery
--   (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin','admin'))
-- will be executed on every row access. The index on profiles(id)
-- (PK) makes this efficient, but consider a helper function for
-- cleaner policy definitions (see Section 7).

-- -- Helper function to avoid repeating admin check in every policy
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('superadmin', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's company_id
CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ---- PROFILES ----

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "profiles_all_admin"
  ON profiles FOR ALL
  USING (public.is_admin());


-- ---- COMPANIES ----

CREATE POLICY "companies_select_own"
  ON companies FOR SELECT
  USING (id = public.user_company_id());

CREATE POLICY "companies_all_admin"
  ON companies FOR ALL
  USING (public.is_admin());


-- ---- CATEGORIES ----
-- Categories are public catalog data, readable by all authenticated users.
-- Only admins can manage them.

CREATE POLICY "categories_select_authenticated"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "categories_all_admin"
  ON categories FOR ALL
  USING (public.is_admin());


-- ---- PRODUCTS ----

CREATE POLICY "products_select_active"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "products_all_admin"
  ON products FOR ALL
  USING (public.is_admin());


-- ---- PRODUCT_SIZES ----

CREATE POLICY "product_sizes_select_authenticated"
  ON product_sizes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "product_sizes_all_admin"
  ON product_sizes FOR ALL
  USING (public.is_admin());


-- ---- PRODUCT_COLORS ----

CREATE POLICY "product_colors_select_authenticated"
  ON product_colors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "product_colors_all_admin"
  ON product_colors FOR ALL
  USING (public.is_admin());


-- ---- CUSTOMER_PRICES ----

CREATE POLICY "customer_prices_select_own"
  ON customer_prices FOR SELECT
  USING (company_id = public.user_company_id());

CREATE POLICY "customer_prices_all_admin"
  ON customer_prices FOR ALL
  USING (public.is_admin());


-- ---- PRICE_UPLOADS ----

CREATE POLICY "price_uploads_select_own"
  ON price_uploads FOR SELECT
  USING (company_id = public.user_company_id());

CREATE POLICY "price_uploads_all_admin"
  ON price_uploads FOR ALL
  USING (public.is_admin());


-- ---- INQUIRIES ----

CREATE POLICY "inquiries_select_own"
  ON inquiries FOR SELECT
  USING (company_id = public.user_company_id());

CREATE POLICY "inquiries_insert_own"
  ON inquiries FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "inquiries_all_admin"
  ON inquiries FOR ALL
  USING (public.is_admin());


-- ---- INQUIRY_ITEMS ----

CREATE POLICY "inquiry_items_select_own"
  ON inquiry_items FOR SELECT
  USING (
    inquiry_id IN (
      SELECT id FROM inquiries WHERE company_id = public.user_company_id()
    )
  );

CREATE POLICY "inquiry_items_insert_own"
  ON inquiry_items FOR INSERT
  WITH CHECK (
    inquiry_id IN (
      SELECT id FROM inquiries WHERE company_id = public.user_company_id()
    )
  );

CREATE POLICY "inquiry_items_all_admin"
  ON inquiry_items FOR ALL
  USING (public.is_admin());


-- ---- COMPANY_NOTES ----
-- Already has one admin policy. Adding it here for completeness
-- in case you want to drop and recreate all policies cleanly.
-- The existing policy "Admins can manage company_notes" covers FOR ALL.
-- No buyer access needed for internal notes.


-- ============================================================
-- SECTION 3: INDEXES FOR QUERY PERFORMANCE
-- ============================================================
-- Currently only PK and UNIQUE constraint indexes exist.
-- All foreign key columns and frequently filtered columns need indexes.

-- -- Foreign key indexes (critical for JOIN performance and cascade deletes)

CREATE INDEX IF NOT EXISTS idx_profiles_company_id
  ON profiles (company_id);

CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON products (category_id);

CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id
  ON product_sizes (product_id);

CREATE INDEX IF NOT EXISTS idx_product_colors_product_id
  ON product_colors (product_id);

CREATE INDEX IF NOT EXISTS idx_customer_prices_company_id
  ON customer_prices (company_id);

CREATE INDEX IF NOT EXISTS idx_customer_prices_product_size_id
  ON customer_prices (product_size_id);

CREATE INDEX IF NOT EXISTS idx_inquiry_items_inquiry_id
  ON inquiry_items (inquiry_id);

CREATE INDEX IF NOT EXISTS idx_inquiry_items_product_size_id
  ON inquiry_items (product_size_id);

CREATE INDEX IF NOT EXISTS idx_inquiry_items_product_color_id
  ON inquiry_items (product_color_id);

CREATE INDEX IF NOT EXISTS idx_inquiries_company_id
  ON inquiries (company_id);

CREATE INDEX IF NOT EXISTS idx_inquiries_user_id
  ON inquiries (user_id);

CREATE INDEX IF NOT EXISTS idx_price_uploads_company_id
  ON price_uploads (company_id);

CREATE INDEX IF NOT EXISTS idx_company_notes_company_id
  ON company_notes (company_id);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id
  ON categories (parent_id);

-- -- Filter/sort indexes (for common query patterns)

-- Products: filter by is_active (catalog listing), lookup by slug (detail page)
CREATE INDEX IF NOT EXISTS idx_products_is_active
  ON products (is_active) WHERE is_active = true;

-- Inquiries: filter by status (admin dashboard), sort by created_at
CREATE INDEX IF NOT EXISTS idx_inquiries_status
  ON inquiries (status);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at
  ON inquiries (created_at DESC);

-- Customer prices: lookup current valid price for a company+size combo
-- The unique constraint covers (company_id, product_size_id, valid_from)
-- but we also need efficient lookup of currently valid prices
CREATE INDEX IF NOT EXISTS idx_customer_prices_valid_range
  ON customer_prices (company_id, product_size_id, valid_from DESC)
  WHERE valid_until IS NULL OR valid_until >= CURRENT_DATE;

-- Profiles: lookup by role (admin checks in RLS)
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON profiles (role) WHERE role IN ('superadmin', 'admin');

-- Product sizes: stock queries for "Lagerampel" display
CREATE INDEX IF NOT EXISTS idx_product_sizes_stock
  ON product_sizes (stock_quantity);

-- Price uploads: filter by status (admin review queue)
CREATE INDEX IF NOT EXISTS idx_price_uploads_status
  ON price_uploads (status);

-- Categories: sort order for display
CREATE INDEX IF NOT EXISTS idx_categories_sort_order
  ON categories (parent_id, sort_order);


-- ============================================================
-- SECTION 4: MISSING CONSTRAINTS
-- ============================================================

-- profiles.role should be constrained to valid values
-- Check if constraint already exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('superadmin', 'admin', 'buyer'));
  END IF;
END $$;

-- customer_prices.unit_price must be positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'customer_prices_unit_price_positive'
  ) THEN
    ALTER TABLE customer_prices
      ADD CONSTRAINT customer_prices_unit_price_positive
      CHECK (unit_price > 0);
  END IF;
END $$;

-- product_sizes.stock_quantity must be non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'product_sizes_stock_non_negative'
  ) THEN
    ALTER TABLE product_sizes
      ADD CONSTRAINT product_sizes_stock_non_negative
      CHECK (stock_quantity >= 0);
  END IF;
END $$;

-- product_sizes.delivery_days must be non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'product_sizes_delivery_days_non_negative'
  ) THEN
    ALTER TABLE product_sizes
      ADD CONSTRAINT product_sizes_delivery_days_non_negative
      CHECK (delivery_days >= 0);
  END IF;
END $$;

-- inquiry_items.quantity > 0 (may already exist from schema.sql)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'inquiry_items_quantity_check'
  ) THEN
    ALTER TABLE inquiry_items
      ADD CONSTRAINT inquiry_items_quantity_check
      CHECK (quantity > 0);
  END IF;
END $$;

-- inquiry_items.unit_price must be non-negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'inquiry_items_unit_price_non_negative'
  ) THEN
    ALTER TABLE inquiry_items
      ADD CONSTRAINT inquiry_items_unit_price_non_negative
      CHECK (unit_price >= 0);
  END IF;
END $$;

-- customer_prices: valid_until must be >= valid_from when set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'customer_prices_valid_range'
  ) THEN
    ALTER TABLE customer_prices
      ADD CONSTRAINT customer_prices_valid_range
      CHECK (valid_until IS NULL OR valid_until >= valid_from);
  END IF;
END $$;

-- Make FK columns NOT NULL where they should never be null
-- (inquiry_items must always reference an inquiry)
ALTER TABLE inquiry_items ALTER COLUMN inquiry_id SET NOT NULL;

-- product_sizes must always reference a product
ALTER TABLE product_sizes ALTER COLUMN product_id SET NOT NULL;

-- product_colors must always reference a product
ALTER TABLE product_colors ALTER COLUMN product_id SET NOT NULL;

-- customer_prices must always reference company and product_size
ALTER TABLE customer_prices ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE customer_prices ALTER COLUMN product_size_id SET NOT NULL;

-- inquiries must always have a company and user
ALTER TABLE inquiries ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE inquiries ALTER COLUMN user_id SET NOT NULL;

-- company_notes must always reference a company
ALTER TABLE company_notes ALTER COLUMN company_id SET NOT NULL;


-- ============================================================
-- SECTION 5: SCHEMA DRIFT FIXES
-- ============================================================

-- 5a. products.uvp_brutto is INTEGER in live DB, should be DECIMAL(10,2)
--     This handles the case where prices like 4299.99 need decimal precision.
ALTER TABLE products ALTER COLUMN uvp_brutto TYPE DECIMAL(10,2);

-- 5b. products.en_class column is missing from live DB
--     Used for EN certification class (e.g., EN-A, EN-B, EN-C)
ALTER TABLE products ADD COLUMN IF NOT EXISTS en_class VARCHAR(30);

-- 5c. Missing stock_imports table (defined in schema.sql, not in live DB)
CREATE TABLE IF NOT EXISTS stock_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID REFERENCES profiles(id),
  file_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'processing'
    CHECK (status IN ('processing', 'review', 'completed', 'failed')),
  matched_count INT DEFAULT 0,
  total_count INT DEFAULT 0,
  parsed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stock_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_imports_all_admin"
  ON stock_imports FOR ALL
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_stock_imports_status
  ON stock_imports (status);

-- 5d. price_uploads: add missing columns from schema.sql
--     The live table was created differently; add columns that
--     the application code may need.
ALTER TABLE price_uploads ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES profiles(id);
ALTER TABLE price_uploads ADD COLUMN IF NOT EXISTS matched_count INT DEFAULT 0;
ALTER TABLE price_uploads ADD COLUMN IF NOT EXISTS total_count INT DEFAULT 0;
ALTER TABLE price_uploads ADD COLUMN IF NOT EXISTS parsed_data JSONB;
ALTER TABLE price_uploads ADD COLUMN IF NOT EXISTS error_log TEXT;


-- ============================================================
-- SECTION 6: UPDATED_AT AUTO-TRIGGER
-- ============================================================
-- The companies table has an updated_at column but no trigger.
-- Add a reusable trigger function and apply it.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to companies (already has updated_at column)
DROP TRIGGER IF EXISTS set_companies_updated_at ON companies;
CREATE TRIGGER set_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Optionally add updated_at to other tables that benefit from it:
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE customer_prices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
DROP TRIGGER IF EXISTS set_customer_prices_updated_at ON customer_prices;
CREATE TRIGGER set_customer_prices_updated_at
  BEFORE UPDATE ON customer_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
DROP TRIGGER IF EXISTS set_inquiries_updated_at ON inquiries;
CREATE TRIGGER set_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- SECTION 7: PERFORMANCE HELPER VIEWS
-- ============================================================
-- These views simplify common queries and reduce N+1 risks.

-- Catalog view: product with all sizes pre-joined
CREATE OR REPLACE VIEW public.v_product_catalog AS
SELECT
  p.id AS product_id,
  p.name,
  p.slug,
  p.description,
  p.images,
  p.is_active,
  p.uvp_brutto,
  p.en_class,
  p.classification,
  p.use_case,
  p.website_url,
  c.id AS category_id,
  c.name AS category_name,
  c.slug AS category_slug,
  COALESCE(
    json_agg(
      json_build_object(
        'size_id', ps.id,
        'size_label', ps.size_label,
        'sku', ps.sku,
        'stock_quantity', ps.stock_quantity,
        'delivery_days', ps.delivery_days
      ) ORDER BY ps.sort_order
    ) FILTER (WHERE ps.id IS NOT NULL),
    '[]'::json
  ) AS sizes
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
LEFT JOIN product_sizes ps ON ps.product_id = p.id
GROUP BY p.id, c.id;

-- Inquiry overview for admin dashboard
CREATE OR REPLACE VIEW public.v_inquiry_overview AS
SELECT
  i.id AS inquiry_id,
  i.status,
  i.notes,
  i.created_at,
  i.tracking_number,
  i.shipping_carrier,
  co.id AS company_id,
  co.name AS company_name,
  pr.full_name AS user_name,
  pr.email AS user_email,
  COUNT(ii.id) AS item_count,
  SUM(ii.quantity * ii.unit_price) AS total_value
FROM inquiries i
JOIN companies co ON co.id = i.company_id
JOIN profiles pr ON pr.id = i.user_id
LEFT JOIN inquiry_items ii ON ii.inquiry_id = i.id
GROUP BY i.id, co.id, co.name, pr.full_name, pr.email;


-- ============================================================
-- SECTION 8: SYNC schema.sql WITH LIVE STATE
-- ============================================================
-- This is a reminder: after applying this migration, update
-- supabase/schema.sql to reflect the actual live state including:
--   - company_notes table
--   - product_colors.slogan, product_colors.classification columns
--   - customer_prices.discount column
--   - inquiries.tracking_number, inquiries.shipping_carrier columns
--   - price_uploads.file_name, price_uploads.category columns
--   - products.en_class, products.updated_at columns
--   - customer_prices.updated_at, inquiries.updated_at columns
--   - stock_imports table
--   - All new indexes
--   - All RLS policies (using helper functions)
--   - The updated_at trigger function
--   - The is_admin() and user_company_id() helper functions
--   - The v_product_catalog and v_inquiry_overview views


-- ============================================================
-- END OF MIGRATION
-- ============================================================

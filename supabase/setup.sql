-- ============================================
-- SWING B2B - Setup (idempotent, safe to re-run)
-- ============================================

-- B2B-Kunden (Händler)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produktkategorien
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produkte (Paragleiter-Modelle)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  tech_specs JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Größenvarianten
CREATE TABLE IF NOT EXISTS product_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size_label VARCHAR(20) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  stock_quantity INT DEFAULT 0,
  delivery_days INT DEFAULT 14,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farbdesigns
CREATE TABLE IF NOT EXISTS product_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  color_name VARCHAR(100) NOT NULL,
  color_image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kundenindividuelle Preise
CREATE TABLE IF NOT EXISTS customer_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  product_size_id UUID REFERENCES product_sizes(id) ON DELETE CASCADE,
  unit_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, product_size_id, valid_from)
);

-- Preislisten-Upload-Log
CREATE TABLE IF NOT EXISTS price_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  uploaded_by UUID REFERENCES profiles(id),
  file_url TEXT NOT NULL,
  file_type VARCHAR(10) DEFAULT 'pdf' CHECK (file_type IN ('pdf', 'csv')),
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'review', 'completed', 'failed')),
  matched_count INT DEFAULT 0,
  total_count INT DEFAULT 0,
  parsed_data JSONB,
  error_log TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lagerstand-Import-Log
CREATE TABLE IF NOT EXISTS stock_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by UUID REFERENCES profiles(id),
  file_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'review', 'completed', 'failed')),
  matched_count INT DEFAULT 0,
  total_count INT DEFAULT 0,
  parsed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bestellanfragen
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'quoted', 'accepted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anfrage-Positionen
CREATE TABLE IF NOT EXISTS inquiry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  product_size_id UUID REFERENCES product_sizes(id),
  product_color_id UUID REFERENCES product_colors(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_items ENABLE ROW LEVEL SECURITY;

-- Products: All authenticated users can view active products
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view products" ON products
    FOR SELECT TO authenticated USING (is_active = TRUE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Product sizes: All authenticated can view
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view sizes" ON product_sizes
    FOR SELECT TO authenticated USING (TRUE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage sizes" ON product_sizes
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Product colors: All authenticated can view
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view colors" ON product_colors
    FOR SELECT TO authenticated USING (TRUE);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage colors" ON product_colors
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Customer prices
DO $$ BEGIN
  CREATE POLICY "Users can view own company prices" ON customer_prices
    FOR SELECT USING (
      company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage prices" ON customer_prices
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Companies
DO $$ BEGIN
  CREATE POLICY "Users can view own company" ON companies
    FOR SELECT USING (
      id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage companies" ON companies
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Inquiries
DO $$ BEGIN
  CREATE POLICY "Users can view own inquiries" ON inquiries
    FOR SELECT USING (
      company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create inquiries" ON inquiries
    FOR INSERT WITH CHECK (
      company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage inquiries" ON inquiries
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Inquiry items
DO $$ BEGIN
  CREATE POLICY "Users can view own inquiry items" ON inquiry_items
    FOR SELECT USING (
      inquiry_id IN (
        SELECT id FROM inquiries WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create inquiry items" ON inquiry_items
    FOR INSERT WITH CHECK (
      inquiry_id IN (
        SELECT id FROM inquiries WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage inquiry items" ON inquiry_items
    FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

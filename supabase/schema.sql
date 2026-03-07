-- ============================================
-- SWING B2B Händlerportal - Datenbank Schema
-- ============================================

-- B2B-Kunden (Händler)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  phone_whatsapp BOOLEAN DEFAULT FALSE,
  address_street VARCHAR(255),
  address_zip VARCHAR(20),
  address_city VARCHAR(100),
  address_country VARCHAR(100) DEFAULT 'Deutschland',
  vat_id VARCHAR(50),
  company_type VARCHAR(30) DEFAULT 'dealer' CHECK (company_type IN ('dealer', 'importer', 'importer_network')),
  sells_paragliders BOOLEAN DEFAULT FALSE,
  sells_miniwings BOOLEAN DEFAULT FALSE,
  sells_parakites BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NULL
);

-- Benutzer-Profile (verknüpft mit Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'buyer' CHECK (role IN ('superadmin', 'admin', 'buyer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produktkategorien
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produkte (Paragleiter-Modelle)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  tech_specs JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  uvp_brutto DECIMAL(10,2),
  en_class VARCHAR(30),
  classification VARCHAR(30),
  use_case VARCHAR(100),
  website_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_coming_soon BOOLEAN NOT NULL DEFAULT false,
  is_preorder BOOLEAN NOT NULL DEFAULT false,
  is_fade_out BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Größenvarianten
CREATE TABLE product_sizes (
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
CREATE TABLE product_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  color_name VARCHAR(100) NOT NULL,
  color_image_url TEXT,
  is_limited BOOLEAN NOT NULL DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farbspezifischer Lagerbestand (manuelle Ueberschreibung)
CREATE TABLE color_size_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name VARCHAR(100) NOT NULL,
  size_label VARCHAR(20) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, color_name, size_label)
);

-- Kundenindividuelle Preise
CREATE TABLE customer_prices (
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
CREATE TABLE price_uploads (
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
CREATE TABLE stock_imports (
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
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  user_id UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'shipped', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status_timestamps JSONB DEFAULT '{}'
);

-- Anfrage-Positionen
CREATE TABLE inquiry_items (
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
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Profiles: Admins can view all
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );

-- Products: All authenticated users can view active products
CREATE POLICY "Authenticated users can view products" ON products
  FOR SELECT TO authenticated USING (is_active = TRUE);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );

-- Product sizes: All authenticated can view
CREATE POLICY "Authenticated users can view sizes" ON product_sizes
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage sizes" ON product_sizes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );

-- Product colors: All authenticated can view
CREATE POLICY "Authenticated users can view colors" ON product_colors
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage colors" ON product_colors
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );

-- Customer prices: Users can only see their company's prices
CREATE POLICY "Users can view own company prices" ON customer_prices
  FOR SELECT USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage prices" ON customer_prices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );

-- Companies: Users can view their own company
CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (
    id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage companies" ON companies
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );

-- Inquiries: Users can manage their own company's inquiries
CREATE POLICY "Users can view own inquiries" ON inquiries
  FOR SELECT USING (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage inquiries" ON inquiries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );

-- Inquiry items: Follow inquiry access
CREATE POLICY "Users can view own inquiry items" ON inquiry_items
  FOR SELECT USING (
    inquiry_id IN (
      SELECT id FROM inquiries WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create inquiry items" ON inquiry_items
  FOR INSERT WITH CHECK (
    inquiry_id IN (
      SELECT id FROM inquiries WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage inquiry items" ON inquiry_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );

-- ============================================
-- Trigger: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
  company_name TEXT := NEW.raw_user_meta_data->>'company_name';
BEGIN
  -- If company_name is provided (self-registration), create a company
  IF company_name IS NOT NULL AND company_name != '' THEN
    INSERT INTO companies (name, contact_email, phone, phone_whatsapp, address_street, address_zip, address_city, address_country, vat_id, company_type, sells_paragliders, sells_miniwings, sells_parakites, is_approved)
    VALUES (
      company_name,
      NEW.email,
      NULLIF(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE((NEW.raw_user_meta_data->>'phone_whatsapp')::BOOLEAN, FALSE),
      NULLIF(NEW.raw_user_meta_data->>'address_street', ''),
      NULLIF(NEW.raw_user_meta_data->>'address_zip', ''),
      NULLIF(NEW.raw_user_meta_data->>'address_city', ''),
      NULLIF(NEW.raw_user_meta_data->>'address_country', ''),
      NULLIF(NEW.raw_user_meta_data->>'vat_id', ''),
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'company_type', ''), 'dealer'),
      COALESCE((NEW.raw_user_meta_data->>'sells_paragliders')::BOOLEAN, FALSE),
      COALESCE((NEW.raw_user_meta_data->>'sells_miniwings')::BOOLEAN, FALSE),
      COALESCE((NEW.raw_user_meta_data->>'sells_parakites')::BOOLEAN, FALSE),
      FALSE
    )
    RETURNING id INTO new_company_id;
  END IF;

  -- Create profile linked to company (if created)
  INSERT INTO profiles (id, email, full_name, company_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    new_company_id,
    'buyer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

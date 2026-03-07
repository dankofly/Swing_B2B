-- Per-color-size stock tracking (manual overrides)
CREATE TABLE IF NOT EXISTS color_size_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name VARCHAR(100) NOT NULL,
  size_label VARCHAR(20) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, color_name, size_label)
);

ALTER TABLE color_size_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view color_size_stock" ON color_size_stock
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage color_size_stock" ON color_size_stock
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );

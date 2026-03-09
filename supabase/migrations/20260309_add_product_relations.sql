CREATE TABLE product_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('similar', 'accessory')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, related_product_id)
);

CREATE INDEX idx_product_relations_product ON product_relations(product_id);
CREATE INDEX idx_product_relations_related ON product_relations(related_product_id);

ALTER TABLE product_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product_relations"
  ON product_relations FOR SELECT USING (true);

CREATE POLICY "Service role can manage product_relations"
  ON product_relations FOR ALL USING (true) WITH CHECK (true);

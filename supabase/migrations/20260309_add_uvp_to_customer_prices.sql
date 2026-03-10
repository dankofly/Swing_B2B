-- Add UVP inkl. MwSt. to customer_prices so each dealer record stores both prices
ALTER TABLE customer_prices
  ADD COLUMN IF NOT EXISTS uvp_incl_vat DECIMAL(10,2);

-- Update schema comment
COMMENT ON COLUMN customer_prices.unit_price IS 'Händler EK netto';
COMMENT ON COLUMN customer_prices.uvp_incl_vat IS 'UVP inkl. MwSt. (informativ)';

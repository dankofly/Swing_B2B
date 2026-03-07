-- ============================================
-- SWING B2B - Supabase Storage Setup
-- ============================================

-- Bucket für Produktbilder
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE);

-- Bucket für Farbdesign-Bilder
INSERT INTO storage.buckets (id, name, public)
VALUES ('color-images', 'color-images', TRUE);

-- Öffentlicher Lesezugriff auf Produktbilder
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Admins können Produktbilder hochladen/löschen
CREATE POLICY "Admins manage product images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );

-- Öffentlicher Lesezugriff auf Farbbilder
CREATE POLICY "Public read color images" ON storage.objects
  FOR SELECT USING (bucket_id = 'color-images');

-- Admins können Farbbilder hochladen/löschen
CREATE POLICY "Admins manage color images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'color-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );

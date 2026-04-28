-- ============================================================
-- SWING B2B Händlerportal — RLS / Policy Hardening
-- ============================================================
-- Purpose:
--   Make Row Level Security and policies an authoritative, repeatable
--   migration. The original schema.sql declared RLS but was not
--   reliably applied in production, and several extension migrations
--   added permissive "service role" policies that allowed any
--   authenticated user to write through the anon key.
--
-- This migration:
--   1. Creates idempotent helper functions
--      (is_admin / is_admin_or_testadmin / user_company_id).
--   2. Enables RLS on every table that holds tenant data.
--   3. Drops every previous policy by name and recreates the intended
--      set, so the migration is fully repeatable
--      (DROP POLICY IF EXISTS is no-op when the policy is absent).
--   4. Restricts buyers to their own company; admins/superadmins manage;
--      testadmin gets read-only.
--   5. Replaces the over-permissive "Service role can manage product_relations"
--      policy that used USING (true) WITH CHECK (true). The service role
--      bypasses RLS entirely, so that policy was effectively granting
--      all-authenticated write access through the anon key.
--   6. Hardens storage policies for product-images / color-images /
--      price-lists.
--
-- Implementation note: optional tables (company_notes, news_ticker,
-- stock_imports) use a `_apply_policies` helper that runs each statement
-- via individual EXECUTE calls — PL/pgSQL EXECUTE only supports a
-- single SQL command per call.
-- ============================================================


-- -----------------------------------------------------------------
-- 0. Helper functions
-- -----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('superadmin', 'admin')
  );
$$;

-- testadmin = read-only admin viewer. Used in policies where reads should
-- include testadmin but writes should not.
CREATE OR REPLACE FUNCTION public.is_admin_or_testadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('superadmin', 'admin', 'testadmin')
  );
$$;

CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;


-- -----------------------------------------------------------------
-- 1. Enable RLS on every tenant-data table
--    Service role (used by createAdminClient on the server) ALWAYS
--    bypasses RLS, so server-side admin actions keep working.
-- -----------------------------------------------------------------

ALTER TABLE public.companies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_prices  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_uploads    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.color_size_stock    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_relations   ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='company_notes') THEN
    EXECUTE 'ALTER TABLE public.company_notes ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='news_ticker') THEN
    EXECUTE 'ALTER TABLE public.news_ticker ENABLE ROW LEVEL SECURITY';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='stock_imports') THEN
    EXECUTE 'ALTER TABLE public.stock_imports ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;


-- -----------------------------------------------------------------
-- 2. profiles
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile"      ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"    ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own"             ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin"           ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_admin"              ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin"           ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin"           ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin"           ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"             ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.is_admin_or_testadmin());

CREATE POLICY "profiles_insert_admin"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 3. companies
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own company"  ON public.companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
DROP POLICY IF EXISTS "companies_select_own"        ON public.companies;
DROP POLICY IF EXISTS "companies_select_admin"      ON public.companies;
DROP POLICY IF EXISTS "companies_all_admin"         ON public.companies;
DROP POLICY IF EXISTS "companies_insert_admin"      ON public.companies;
DROP POLICY IF EXISTS "companies_update_admin"      ON public.companies;
DROP POLICY IF EXISTS "companies_delete_admin"      ON public.companies;
-- Legacy: buyer-self-update of own company. Now handled exclusively
-- via the updateMyProfile server action (createAdminClient bypasses RLS).
DROP POLICY IF EXISTS "companies_update_own"        ON public.companies;

CREATE POLICY "companies_select_own"
  ON public.companies FOR SELECT
  USING (id = public.user_company_id());

CREATE POLICY "companies_select_admin"
  ON public.companies FOR SELECT
  USING (public.is_admin_or_testadmin());

CREATE POLICY "companies_insert_admin"
  ON public.companies FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "companies_update_admin"
  ON public.companies FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "companies_delete_admin"
  ON public.companies FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 4. categories  (catalog data — read-only for all authenticated)
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "categories_select_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_all_admin"            ON public.categories;
DROP POLICY IF EXISTS "categories_insert_admin"         ON public.categories;
DROP POLICY IF EXISTS "categories_update_admin"         ON public.categories;
DROP POLICY IF EXISTS "categories_delete_admin"         ON public.categories;

CREATE POLICY "categories_select_authenticated"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "categories_insert_admin"
  ON public.categories FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin"
  ON public.categories FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_delete_admin"
  ON public.categories FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 5. products
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products"            ON public.products;
DROP POLICY IF EXISTS "products_select_active"                ON public.products;
DROP POLICY IF EXISTS "products_select_admin"                 ON public.products;
DROP POLICY IF EXISTS "products_all_admin"                    ON public.products;
DROP POLICY IF EXISTS "products_insert_admin"                 ON public.products;
DROP POLICY IF EXISTS "products_update_admin"                 ON public.products;
DROP POLICY IF EXISTS "products_delete_admin"                 ON public.products;

-- Buyers see active products only; admins/testadmin see everything.
CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin_or_testadmin());

CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 6. product_sizes
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view sizes" ON public.product_sizes;
DROP POLICY IF EXISTS "Admins can manage sizes"            ON public.product_sizes;
DROP POLICY IF EXISTS "product_sizes_select_authenticated" ON public.product_sizes;
DROP POLICY IF EXISTS "product_sizes_all_admin"            ON public.product_sizes;
DROP POLICY IF EXISTS "product_sizes_insert_admin"         ON public.product_sizes;
DROP POLICY IF EXISTS "product_sizes_update_admin"         ON public.product_sizes;
DROP POLICY IF EXISTS "product_sizes_delete_admin"         ON public.product_sizes;

CREATE POLICY "product_sizes_select_authenticated"
  ON public.product_sizes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "product_sizes_insert_admin"
  ON public.product_sizes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "product_sizes_update_admin"
  ON public.product_sizes FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "product_sizes_delete_admin"
  ON public.product_sizes FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 7. product_colors
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view colors" ON public.product_colors;
DROP POLICY IF EXISTS "Admins can manage colors"            ON public.product_colors;
DROP POLICY IF EXISTS "product_colors_select_authenticated" ON public.product_colors;
DROP POLICY IF EXISTS "product_colors_all_admin"            ON public.product_colors;
DROP POLICY IF EXISTS "product_colors_insert_admin"         ON public.product_colors;
DROP POLICY IF EXISTS "product_colors_update_admin"         ON public.product_colors;
DROP POLICY IF EXISTS "product_colors_delete_admin"         ON public.product_colors;

CREATE POLICY "product_colors_select_authenticated"
  ON public.product_colors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "product_colors_insert_admin"
  ON public.product_colors FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "product_colors_update_admin"
  ON public.product_colors FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "product_colors_delete_admin"
  ON public.product_colors FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 8. customer_prices  (per-dealer pricing — strictly per-tenant)
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own company prices" ON public.customer_prices;
DROP POLICY IF EXISTS "Admins can manage prices"          ON public.customer_prices;
DROP POLICY IF EXISTS "customer_prices_select_own"        ON public.customer_prices;
DROP POLICY IF EXISTS "customer_prices_select_admin"      ON public.customer_prices;
DROP POLICY IF EXISTS "customer_prices_all_admin"         ON public.customer_prices;
DROP POLICY IF EXISTS "customer_prices_insert_admin"      ON public.customer_prices;
DROP POLICY IF EXISTS "customer_prices_update_admin"      ON public.customer_prices;
DROP POLICY IF EXISTS "customer_prices_delete_admin"      ON public.customer_prices;

CREATE POLICY "customer_prices_select_own"
  ON public.customer_prices FOR SELECT
  USING (company_id = public.user_company_id());

CREATE POLICY "customer_prices_select_admin"
  ON public.customer_prices FOR SELECT
  USING (public.is_admin_or_testadmin());

CREATE POLICY "customer_prices_insert_admin"
  ON public.customer_prices FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "customer_prices_update_admin"
  ON public.customer_prices FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "customer_prices_delete_admin"
  ON public.customer_prices FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 9. price_uploads (PDF/CSV uploads)
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "price_uploads_select_own"   ON public.price_uploads;
DROP POLICY IF EXISTS "price_uploads_select_admin" ON public.price_uploads;
DROP POLICY IF EXISTS "price_uploads_all_admin"    ON public.price_uploads;
DROP POLICY IF EXISTS "price_uploads_insert_admin" ON public.price_uploads;
DROP POLICY IF EXISTS "price_uploads_update_admin" ON public.price_uploads;
DROP POLICY IF EXISTS "price_uploads_delete_admin" ON public.price_uploads;

CREATE POLICY "price_uploads_select_own"
  ON public.price_uploads FOR SELECT
  USING (company_id = public.user_company_id());

CREATE POLICY "price_uploads_select_admin"
  ON public.price_uploads FOR SELECT
  USING (public.is_admin_or_testadmin());

CREATE POLICY "price_uploads_insert_admin"
  ON public.price_uploads FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "price_uploads_update_admin"
  ON public.price_uploads FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "price_uploads_delete_admin"
  ON public.price_uploads FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 10. inquiries
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own inquiries"   ON public.inquiries;
DROP POLICY IF EXISTS "Users can create inquiries"     ON public.inquiries;
DROP POLICY IF EXISTS "Admins can manage inquiries"    ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_select_own"           ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_insert_own"           ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_select_admin"         ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_all_admin"            ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_update_admin"         ON public.inquiries;
DROP POLICY IF EXISTS "inquiries_delete_admin"         ON public.inquiries;

CREATE POLICY "inquiries_select_own"
  ON public.inquiries FOR SELECT
  USING (company_id = public.user_company_id());

CREATE POLICY "inquiries_insert_own"
  ON public.inquiries FOR INSERT
  WITH CHECK (company_id = public.user_company_id());

CREATE POLICY "inquiries_select_admin"
  ON public.inquiries FOR SELECT
  USING (public.is_admin_or_testadmin());

CREATE POLICY "inquiries_update_admin"
  ON public.inquiries FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "inquiries_delete_admin"
  ON public.inquiries FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 11. inquiry_items
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own inquiry items"   ON public.inquiry_items;
DROP POLICY IF EXISTS "Users can create inquiry items"     ON public.inquiry_items;
DROP POLICY IF EXISTS "Admins can manage inquiry items"    ON public.inquiry_items;
DROP POLICY IF EXISTS "inquiry_items_select_own"           ON public.inquiry_items;
DROP POLICY IF EXISTS "inquiry_items_insert_own"           ON public.inquiry_items;
DROP POLICY IF EXISTS "inquiry_items_select_admin"         ON public.inquiry_items;
DROP POLICY IF EXISTS "inquiry_items_all_admin"            ON public.inquiry_items;
DROP POLICY IF EXISTS "inquiry_items_update_admin"         ON public.inquiry_items;
DROP POLICY IF EXISTS "inquiry_items_delete_admin"         ON public.inquiry_items;

CREATE POLICY "inquiry_items_select_own"
  ON public.inquiry_items FOR SELECT
  USING (
    inquiry_id IN (
      SELECT id FROM public.inquiries WHERE company_id = public.user_company_id()
    )
  );

CREATE POLICY "inquiry_items_insert_own"
  ON public.inquiry_items FOR INSERT
  WITH CHECK (
    inquiry_id IN (
      SELECT id FROM public.inquiries WHERE company_id = public.user_company_id()
    )
  );

CREATE POLICY "inquiry_items_select_admin"
  ON public.inquiry_items FOR SELECT
  USING (public.is_admin_or_testadmin());

CREATE POLICY "inquiry_items_update_admin"
  ON public.inquiry_items FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "inquiry_items_delete_admin"
  ON public.inquiry_items FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 12. color_size_stock (created by 20260305_color_size_stock.sql)
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view color_size_stock" ON public.color_size_stock;
DROP POLICY IF EXISTS "Authenticated read color_size_stock"           ON public.color_size_stock;
DROP POLICY IF EXISTS "Admins can manage color_size_stock"            ON public.color_size_stock;
DROP POLICY IF EXISTS "Admins manage color_size_stock"                ON public.color_size_stock;
DROP POLICY IF EXISTS "color_size_stock_select_authenticated"         ON public.color_size_stock;
DROP POLICY IF EXISTS "color_size_stock_all_admin"                    ON public.color_size_stock;
DROP POLICY IF EXISTS "color_size_stock_insert_admin"                 ON public.color_size_stock;
DROP POLICY IF EXISTS "color_size_stock_update_admin"                 ON public.color_size_stock;
DROP POLICY IF EXISTS "color_size_stock_delete_admin"                 ON public.color_size_stock;

CREATE POLICY "color_size_stock_select_authenticated"
  ON public.color_size_stock FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "color_size_stock_insert_admin"
  ON public.color_size_stock FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "color_size_stock_update_admin"
  ON public.color_size_stock FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "color_size_stock_delete_admin"
  ON public.color_size_stock FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 13. product_relations
--     CRITICAL: the previous migration created a permissive
--     "Service role can manage product_relations" policy with USING(true)
--     and WITH CHECK(true). The service role bypasses RLS entirely, so
--     that policy was actually granting all-authenticated write access
--     through the anon key. Replace it.
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read product_relations"          ON public.product_relations;
DROP POLICY IF EXISTS "Read product_relations"                     ON public.product_relations;
DROP POLICY IF EXISTS "Service role can manage product_relations"  ON public.product_relations;
DROP POLICY IF EXISTS "Admins manage product_relations"            ON public.product_relations;
DROP POLICY IF EXISTS "product_relations_select_authenticated"     ON public.product_relations;
DROP POLICY IF EXISTS "product_relations_all_admin"                ON public.product_relations;
DROP POLICY IF EXISTS "product_relations_insert_admin"             ON public.product_relations;
DROP POLICY IF EXISTS "product_relations_update_admin"             ON public.product_relations;
DROP POLICY IF EXISTS "product_relations_delete_admin"             ON public.product_relations;

CREATE POLICY "product_relations_select_authenticated"
  ON public.product_relations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "product_relations_insert_admin"
  ON public.product_relations FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "product_relations_update_admin"
  ON public.product_relations FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "product_relations_delete_admin"
  ON public.product_relations FOR DELETE
  USING (public.is_admin());


-- -----------------------------------------------------------------
-- 14. company_notes (optional — created out-of-band in production)
-- -----------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='company_notes') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage company_notes" ON public.company_notes';
    EXECUTE 'DROP POLICY IF EXISTS "company_notes_select_visible"    ON public.company_notes';
    EXECUTE 'DROP POLICY IF EXISTS "company_notes_select_admin"      ON public.company_notes';
    EXECUTE 'DROP POLICY IF EXISTS "company_notes_insert_admin"      ON public.company_notes';
    EXECUTE 'DROP POLICY IF EXISTS "company_notes_update_admin"      ON public.company_notes';
    EXECUTE 'DROP POLICY IF EXISTS "company_notes_delete_admin"      ON public.company_notes';

    EXECUTE $p$
      CREATE POLICY "company_notes_select_visible"
        ON public.company_notes FOR SELECT
        USING (
          visible_to_customer = true
          AND company_id = public.user_company_id()
        )
    $p$;

    EXECUTE $p$
      CREATE POLICY "company_notes_select_admin"
        ON public.company_notes FOR SELECT
        USING (public.is_admin_or_testadmin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "company_notes_insert_admin"
        ON public.company_notes FOR INSERT
        WITH CHECK (public.is_admin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "company_notes_update_admin"
        ON public.company_notes FOR UPDATE
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "company_notes_delete_admin"
        ON public.company_notes FOR DELETE
        USING (public.is_admin())
    $p$;
  END IF;
END $$;


-- -----------------------------------------------------------------
-- 15. news_ticker (optional — public news strip)
--     Active news visible to everyone; admins manage.
-- -----------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='news_ticker') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can read active news" ON public.news_ticker';
    EXECUTE 'DROP POLICY IF EXISTS "news_ticker_select_active" ON public.news_ticker';
    EXECUTE 'DROP POLICY IF EXISTS "news_ticker_select_admin"  ON public.news_ticker';
    EXECUTE 'DROP POLICY IF EXISTS "news_ticker_all_admin"     ON public.news_ticker';
    EXECUTE 'DROP POLICY IF EXISTS "news_ticker_insert_admin"  ON public.news_ticker';
    EXECUTE 'DROP POLICY IF EXISTS "news_ticker_update_admin"  ON public.news_ticker';
    EXECUTE 'DROP POLICY IF EXISTS "news_ticker_delete_admin"  ON public.news_ticker';

    EXECUTE $p$
      CREATE POLICY "news_ticker_select_active"
        ON public.news_ticker FOR SELECT
        TO authenticated
        USING (is_active = true OR public.is_admin_or_testadmin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "news_ticker_insert_admin"
        ON public.news_ticker FOR INSERT
        WITH CHECK (public.is_admin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "news_ticker_update_admin"
        ON public.news_ticker FOR UPDATE
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "news_ticker_delete_admin"
        ON public.news_ticker FOR DELETE
        USING (public.is_admin())
    $p$;
  END IF;
END $$;


-- -----------------------------------------------------------------
-- 15b. invitation_log (admin-only audit trail of customer invitations)
-- -----------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='invitation_log') THEN
    EXECUTE 'ALTER TABLE public.invitation_log ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Admins read invitation_log"   ON public.invitation_log';
    EXECUTE 'DROP POLICY IF EXISTS "Admins insert invitation_log" ON public.invitation_log';
    EXECUTE 'DROP POLICY IF EXISTS "invitation_log_select_admin"  ON public.invitation_log';
    EXECUTE 'DROP POLICY IF EXISTS "invitation_log_insert_admin"  ON public.invitation_log';
    EXECUTE 'DROP POLICY IF EXISTS "invitation_log_update_admin"  ON public.invitation_log';
    EXECUTE 'DROP POLICY IF EXISTS "invitation_log_delete_admin"  ON public.invitation_log';

    EXECUTE $p$
      CREATE POLICY "invitation_log_select_admin"
        ON public.invitation_log FOR SELECT
        USING (public.is_admin_or_testadmin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "invitation_log_insert_admin"
        ON public.invitation_log FOR INSERT
        WITH CHECK (public.is_admin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "invitation_log_update_admin"
        ON public.invitation_log FOR UPDATE
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "invitation_log_delete_admin"
        ON public.invitation_log FOR DELETE
        USING (public.is_admin())
    $p$;
  END IF;
END $$;


-- -----------------------------------------------------------------
-- 16. stock_imports (optional — admin-only)
-- -----------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='stock_imports') THEN
    EXECUTE 'DROP POLICY IF EXISTS "stock_imports_all_admin"    ON public.stock_imports';
    EXECUTE 'DROP POLICY IF EXISTS "stock_imports_select_admin" ON public.stock_imports';
    EXECUTE 'DROP POLICY IF EXISTS "stock_imports_insert_admin" ON public.stock_imports';
    EXECUTE 'DROP POLICY IF EXISTS "stock_imports_update_admin" ON public.stock_imports';
    EXECUTE 'DROP POLICY IF EXISTS "stock_imports_delete_admin" ON public.stock_imports';

    EXECUTE $p$
      CREATE POLICY "stock_imports_select_admin"
        ON public.stock_imports FOR SELECT
        USING (public.is_admin_or_testadmin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "stock_imports_insert_admin"
        ON public.stock_imports FOR INSERT
        WITH CHECK (public.is_admin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "stock_imports_update_admin"
        ON public.stock_imports FOR UPDATE
        USING (public.is_admin())
        WITH CHECK (public.is_admin())
    $p$;

    EXECUTE $p$
      CREATE POLICY "stock_imports_delete_admin"
        ON public.stock_imports FOR DELETE
        USING (public.is_admin())
    $p$;
  END IF;
END $$;


-- -----------------------------------------------------------------
-- 17. Storage policies
--     product-images / color-images: public read, admin-only write.
--     price-lists: NOT public — only the file's owner company and admins
--     can read. Files are uploaded under the path {company_id}/...
-- -----------------------------------------------------------------

-- Drop legacy/duplicate policies we may have created during prototyping.
DROP POLICY IF EXISTS "Public read product images"                  ON storage.objects;
DROP POLICY IF EXISTS "Admins manage product images"                ON storage.objects;
DROP POLICY IF EXISTS "Public read color images"                    ON storage.objects;
DROP POLICY IF EXISTS "Admins manage color images"                  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated read price lists"              ON storage.objects;
DROP POLICY IF EXISTS "Admins manage price lists"                   ON storage.objects;
-- DANGER LEGACY (production): wide-open price-lists policies that
-- allowed any authenticated user to upload/update/delete files
-- regardless of company. Replace with per-tenant policies below.
DROP POLICY IF EXISTS "Authenticated users can upload price lists"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update price lists"  ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete price lists"  ON storage.objects;
DROP POLICY IF EXISTS "storage_product_images_read"                 ON storage.objects;
DROP POLICY IF EXISTS "storage_product_images_admin"                ON storage.objects;
DROP POLICY IF EXISTS "storage_color_images_read"                   ON storage.objects;
DROP POLICY IF EXISTS "storage_color_images_admin"                  ON storage.objects;
DROP POLICY IF EXISTS "storage_price_lists_read_own"                ON storage.objects;
DROP POLICY IF EXISTS "storage_price_lists_read_admin"              ON storage.objects;
DROP POLICY IF EXISTS "storage_price_lists_admin"                   ON storage.objects;

-- product-images
CREATE POLICY "storage_product_images_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "storage_product_images_admin"
  ON storage.objects FOR ALL
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- color-images
CREATE POLICY "storage_color_images_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'color-images');

CREATE POLICY "storage_color_images_admin"
  ON storage.objects FOR ALL
  USING (bucket_id = 'color-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'color-images' AND public.is_admin());

-- price-lists: per-tenant read, admin manage. Path layout: {company_id}/file.pdf
-- Buyers see only their own company's price lists.
CREATE POLICY "storage_price_lists_read_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'price-lists'
    AND (storage.foldername(name))[1] = public.user_company_id()::text
  );

CREATE POLICY "storage_price_lists_read_admin"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'price-lists' AND public.is_admin_or_testadmin());

CREATE POLICY "storage_price_lists_admin"
  ON storage.objects FOR ALL
  USING (bucket_id = 'price-lists' AND public.is_admin())
  WITH CHECK (bucket_id = 'price-lists' AND public.is_admin());


-- ============================================================
-- END OF MIGRATION
-- ============================================================

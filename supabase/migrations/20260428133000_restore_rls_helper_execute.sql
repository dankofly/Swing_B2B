-- ============================================================
-- HOTFIX — restore EXECUTE on RLS helper functions
-- ============================================================
-- The previous migration (20260428104500_revoke_rls_helper_rpc.sql)
-- was based on the incorrect assumption that PostgreSQL evaluates
-- RLS policy expressions with the privileges of the function owner.
-- It does not. Functions referenced in a policy USING / WITH CHECK
-- expression are evaluated with the **invoker's** privileges. The
-- SECURITY DEFINER attribute only changes how the function body
-- runs, not whether the caller is allowed to call it at all.
--
-- Revoking EXECUTE from `authenticated` therefore broke every SELECT
-- policy that references public.is_admin_or_testadmin() or
-- public.user_company_id(), including:
--   - products_select_active
--   - profiles_select
--   - companies_select
--   - customer_prices_select
--   - inquiries_select / inquiry_items_select
--   - company_notes_select / news_ticker_select_active
--   - price_uploads_select / stock_imports_select_admin
--   - invitation_log_select_admin
--
-- Symptom in production: the dealer catalog rendered as empty for
-- all logged-in dealers because the products RLS policy could not
-- evaluate. Admin server-side reads via service_role still worked.
--
-- Fix: re-GRANT EXECUTE to `authenticated`. This re-exposes the
-- helpers as PostgREST RPC endpoints (advisor lint 0029 returns),
-- which is acceptable as a temporary state. The proper long-term
-- mitigation is to relocate these helpers into a non-public schema
-- (e.g. `private`) that PostgREST does not expose, then update the
-- policies to reference the relocated functions. That migration
-- will be authored separately.
-- ============================================================

GRANT EXECUTE ON FUNCTION public.is_admin()              TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_testadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_company_id()       TO authenticated;

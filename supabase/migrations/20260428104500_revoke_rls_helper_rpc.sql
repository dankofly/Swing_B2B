-- ============================================================
-- Lock down RLS helper RPC endpoints
-- ============================================================
-- The helpers public.is_admin / is_admin_or_testadmin / user_company_id
-- are SECURITY DEFINER and intended ONLY for use inside RLS policy
-- expressions (USING / WITH CHECK). PostgreSQL evaluates RLS using the
-- function owner's privileges, so revoking EXECUTE from `authenticated`
-- does NOT affect RLS evaluation — it only removes the unintended
-- /rest/v1/rpc/<name> REST endpoint that would otherwise let any
-- logged-in user introspect their own role through PostgREST.
--
-- Verified before apply: no app code calls these helpers via
-- supabase.rpc(...). They are referenced only inside policy bodies.
--
-- Closes Supabase advisor lint 0029
-- (authenticated_security_definer_function_executable) for all three
-- helpers.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.is_admin()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_testadmin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.user_company_id()       FROM PUBLIC, anon, authenticated;

-- service_role and postgres retain EXECUTE — service_role is used by
-- the server-side admin client (createAdminClient), postgres is the
-- function owner / RLS evaluator. No other roles need EXECUTE.

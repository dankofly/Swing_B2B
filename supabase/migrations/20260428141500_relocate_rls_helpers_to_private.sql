-- ============================================================
-- Long-term fix for advisor lint 0029
-- ============================================================
-- Relocate the three SECURITY DEFINER RLS helper functions out of
-- the `public` schema (which Supabase exposes via PostgREST) into
-- a dedicated `private` schema that PostgREST does not expose.
--
-- Background:
--   * Migration 20260428104500 attempted to silence advisor lint 0029
--     ("authenticated_security_definer_function_executable") by
--     REVOKEing EXECUTE from `authenticated` on the helpers. That
--     broke every SELECT policy referencing them, because RLS
--     evaluates policy expressions with the **invoker's** privileges
--     — not the function owner's.
--   * Migration 20260428133000 reverted the REVOKE so production
--     would render again.
--
-- This migration is the proper fix: PostgREST exposes only the
-- schemas listed in its `db-schemas` config (default: public,
-- graphql_public). By moving the helpers to `private`, they
-- disappear from /rest/v1/rpc/<name> regardless of EXECUTE
-- permissions, while RLS policies that reference the function
-- by OID continue to evaluate normally.
--
-- ALTER FUNCTION ... SET SCHEMA preserves the function's ACL,
-- so the existing GRANT EXECUTE TO authenticated stays intact.
-- ============================================================

CREATE SCHEMA IF NOT EXISTS private AUTHORIZATION postgres;

-- USAGE on the schema is required for any role that needs to
-- resolve / call functions in it. authenticated needs USAGE so
-- RLS can call the helpers; service_role needs it for parity.
GRANT USAGE ON SCHEMA private TO postgres, service_role, authenticated;

-- Move the helpers. Their ACLs (EXECUTE for authenticated, postgres,
-- service_role) are preserved across SET SCHEMA. Policy expressions
-- in pg_policy reference the function OID and continue to resolve.
ALTER FUNCTION public.is_admin()              SET SCHEMA private;
ALTER FUNCTION public.is_admin_or_testadmin() SET SCHEMA private;
ALTER FUNCTION public.user_company_id()       SET SCHEMA private;

-- The function bodies fully qualify their references
-- (public.profiles, auth.uid()), so the relocation does not
-- depend on search_path. The functions also explicitly
-- `SET search_path TO 'public', 'pg_temp'` which remains valid.

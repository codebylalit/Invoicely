-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 0 — Close the admin data leak
-- Migration: 20260822000000_secure_admin_access
--
-- Before this migration:
--   * get_all_profiles() / get_all_invoices() / get_all_clients() /
--     get_all_business_details() were SECURITY DEFINER and GRANTed to `anon`,
--     so any visitor holding the publishable key could dump every user's
--     email address, tier, invoice totals and client list.
--   * delete_user_admin() was GRANTed to `authenticated` with no authorization
--     check at all — any signed-in user could delete any other user.
--   * Admin access was enforced only by a hardcoded email array shipped in the
--     browser bundle (src/App.tsx), which is not a security control.
--   * email_templates / email_automations / email_logs had
--     `USING (true) WITH CHECK (true)` policies, i.e. world readable/writable.
--
-- After this migration: authorization lives in the database, keyed off
-- profiles.is_admin, and `anon` can execute none of it.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. A real admin flag ─────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Seed from the allowlist that used to live in the client bundle.
UPDATE public.profiles p
   SET is_admin = true
  FROM auth.users u
 WHERE u.id = p.user_id
   AND lower(u.email) IN ('lalit.createss@gmail.com', 'heyylalit@gmail.com');

-- Nobody may grant themselves admin: block writes to is_admin from the client.
-- (service_role bypasses RLS and so is unaffected.)
CREATE OR REPLACE FUNCTION public.prevent_is_admin_self_grant()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
     AND current_user NOT IN ('service_role', 'postgres', 'supabase_admin')
  THEN
    RAISE EXCEPTION 'is_admin cannot be changed from the client'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_block_is_admin ON public.profiles;
CREATE TRIGGER trg_profiles_block_is_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_is_admin_self_grant();

-- ── 2. Authorization helpers ─────────────────────────────────────────────────
-- SECURITY DEFINER so it can read profiles without tripping over RLS, and so it
-- is safe to call from inside policies without recursion.
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.profiles p WHERE p.user_id = p_user_id),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

-- Raises unless the *caller's* JWT belongs to an admin. Called at the top of
-- every admin RPC. Note: a service_role key has no `sub` claim, so auth.uid()
-- is NULL and these RPCs are unavailable to it by design — server-side code
-- should query the tables directly rather than go through admin RPCs.
CREATE OR REPLACE FUNCTION public.require_admin()
RETURNS void
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin privileges required' USING ERRCODE = '42501';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.require_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.require_admin() TO authenticated, service_role;

-- ── 3. Gate every admin RPC and drop anon access ─────────────────────────────
CREATE OR REPLACE FUNCTION public.get_all_profiles()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  res jsonb;
BEGIN
  PERFORM public.require_admin();

  SELECT jsonb_agg(t) INTO res
  FROM (
    SELECT
      COALESCE(p.user_id, u.id) AS id,
      u.id                      AS user_id,
      u.email                   AS email,
      COALESCE(
        NULLIF(p.full_name, ''),
        NULLIF(u.raw_user_meta_data->>'full_name', ''),
        NULLIF(u.raw_user_meta_data->>'name', ''),
        split_part(u.email, '@', 1)
      )                         AS full_name,
      COALESCE(p.tier, 'free')  AS tier,
      COALESCE(p.is_admin, false) AS is_admin,
      u.created_at              AS created_at,
      COALESCE(p.updated_at, u.created_at) AS updated_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    ORDER BY u.created_at DESC
  ) t;

  RETURN COALESCE(res, '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_invoices()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  res jsonb;
BEGIN
  PERFORM public.require_admin();

  SELECT jsonb_agg(t) INTO res
  FROM (
    SELECT i.id, i.user_id, i.invoice_number, i.client_name,
           i.total, i.status, i.created_at, i.due_date
    FROM public.invoices i
    ORDER BY i.created_at DESC
  ) t;

  RETURN COALESCE(res, '[]'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_clients()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  res jsonb;
BEGIN
  PERFORM public.require_admin();

  SELECT jsonb_agg(t) INTO res
  FROM (
    SELECT c.id, c.user_id, c.name, c.email, c.created_at
    FROM public.clients c
    ORDER BY c.created_at DESC
  ) t;

  RETURN COALESCE(res, '[]'::jsonb);
END;
$$;

-- Also fixes the column names: business_details has phone_number / region_state
-- / postal_code, not phone / state / zip_code, so this function previously
-- failed at runtime with "column b.state does not exist".
CREATE OR REPLACE FUNCTION public.get_all_business_details()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  res jsonb;
BEGIN
  PERFORM public.require_admin();

  SELECT jsonb_agg(t) INTO res
  FROM (
    SELECT b.id, b.user_id, b.business_name, b.contact_name, b.email,
           b.phone_number AS phone,
           b.address, b.city,
           b.region_state AS state,
           b.country,
           b.postal_code  AS zip_code,
           b.created_at
    FROM public.business_details b
  ) t;

  RETURN COALESCE(res, '[]'::jsonb);
END;
$$;

-- delete_user_admin had no authorization check whatsoever.
CREATE OR REPLACE FUNCTION public.delete_user_admin(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  target_email text;
BEGIN
  PERFORM public.require_admin();

  IF target_user_id = auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'You cannot delete your own account from here');
  END IF;

  IF public.is_admin(target_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot delete another admin');
  END IF;

  SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;
  IF target_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  DELETE FROM public.razorpay_orders  WHERE user_id = target_user_id;
  DELETE FROM public.paypal_orders    WHERE user_id = target_user_id;
  DELETE FROM public.invoices         WHERE user_id = target_user_id;
  DELETE FROM public.clients          WHERE user_id = target_user_id;
  DELETE FROM public.business_details WHERE user_id = target_user_id;
  DELETE FROM public.email_logs       WHERE recipient_email = target_email;
  DELETE FROM public.profiles         WHERE user_id = target_user_id;
  DELETE FROM auth.users              WHERE id = target_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'User deleted successfully');
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE;
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- The whole point of the migration: `anon` gets nothing.
REVOKE ALL ON FUNCTION public.get_all_profiles()         FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_all_invoices()         FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_all_clients()          FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_all_business_details() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_user_admin(uuid)    FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_all_profiles()         TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_invoices()         TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_clients()          TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_business_details() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_admin(uuid)    TO authenticated;

-- ── 4. email_* tables: admin-only from the browser ───────────────────────────
-- Edge functions use the service_role key and bypass RLS, so tightening these
-- does not affect automation delivery.
DROP POLICY IF EXISTS "Admin full access on email_templates"   ON public.email_templates;
DROP POLICY IF EXISTS "Admin full access on email_automations" ON public.email_automations;
DROP POLICY IF EXISTS "Admin full access on email_logs"        ON public.email_logs;

CREATE POLICY "Admins manage email_templates"
  ON public.email_templates FOR ALL
  TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage email_automations"
  ON public.email_automations FOR ALL
  TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins read email_logs"
  ON public.email_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- ── 5. profiles: let a user read their own is_admin flag ─────────────────────
-- The client route guard needs this. Existing owner policies already cover it
-- if they are `auth.uid() = user_id`; this is a belt-and-braces SELECT policy.
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

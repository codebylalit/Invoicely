-- ─────────────────────────────────────────────────────────────────────────────
-- Admin Security Definer RPC Functions (Returning JSONB)
-- Migration: 20260812130000_admin_rpc_functions
-- ─────────────────────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.get_all_profiles() CASCADE;
DROP FUNCTION IF EXISTS public.get_all_invoices() CASCADE;
DROP FUNCTION IF EXISTS public.get_all_clients() CASCADE;
DROP FUNCTION IF EXISTS public.get_all_business_details() CASCADE;

-- ── 1. get_all_profiles ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_all_profiles()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  res jsonb;
BEGIN
  SELECT jsonb_agg(t) INTO res
  FROM (
    SELECT 
      COALESCE(p.user_id, u.id) AS id,
      u.id AS user_id,
      COALESCE(u.email, p.email) AS email,
      COALESCE(
        NULLIF(p.full_name, ''), 
        NULLIF(u.raw_user_meta_data->>'full_name', ''), 
        NULLIF(u.raw_user_meta_data->>'name', ''), 
        split_part(u.email, '@', 1)
      ) AS full_name,
      COALESCE(p.tier, 'free') AS tier,
      u.created_at AS created_at,
      COALESCE(p.updated_at, u.created_at) AS updated_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    ORDER BY u.created_at DESC
  ) t;

  RETURN COALESCE(res, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_profiles() TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_profiles() TO service_role;

-- ── 2. get_all_invoices ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_all_invoices()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  res jsonb;
BEGIN
  SELECT jsonb_agg(t) INTO res
  FROM (
    SELECT 
      i.id,
      i.user_id,
      i.invoice_number,
      i.client_name,
      i.total,
      i.status,
      i.created_at,
      i.due_date
    FROM public.invoices i
    ORDER BY i.created_at DESC
  ) t;

  RETURN COALESCE(res, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_invoices() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_invoices() TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_invoices() TO service_role;

-- ── 3. get_all_clients ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_all_clients()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  res jsonb;
BEGIN
  SELECT jsonb_agg(t) INTO res
  FROM (
    SELECT 
      c.id,
      c.user_id,
      c.name,
      c.email,
      c.created_at
    FROM public.clients c
    ORDER BY c.created_at DESC
  ) t;

  RETURN COALESCE(res, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_clients() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_clients() TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_clients() TO service_role;

-- ── 4. get_all_business_details ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_all_business_details()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  res jsonb;
BEGIN
  SELECT jsonb_agg(t) INTO res
  FROM (
    SELECT 
      b.id,
      b.user_id,
      b.business_name,
      b.contact_name,
      b.email,
      b.phone,
      b.address,
      b.city,
      b.state,
      b.country,
      b.zip_code,
      b.created_at
    FROM public.business_details b
  ) t;

  RETURN COALESCE(res, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_business_details() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_business_details() TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_business_details() TO service_role;

-- ── 5. Admin Delete User RPC Function ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_user_admin(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_email text;
BEGIN
  -- Fetch user email first
  SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;

  -- 1. Delete payment/order history (prevents foreign key constraint errors)
  BEGIN
    DELETE FROM public.razorpay_orders WHERE user_id = target_user_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DELETE FROM public.paypal_orders WHERE user_id = target_user_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- 2. Delete business data
  BEGIN
    DELETE FROM public.invoices WHERE user_id = target_user_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DELETE FROM public.clients WHERE user_id = target_user_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    DELETE FROM public.business_details WHERE user_id = target_user_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- 3. Delete email logs for this user if available
  IF target_email IS NOT NULL THEN
    BEGIN
      DELETE FROM public.email_logs WHERE recipient_email = target_email;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  -- 4. Delete profile record
  BEGIN
    DELETE FROM public.profiles WHERE user_id = target_user_id;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- 5. Finally delete from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'User deleted successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_admin(uuid) TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Admin Security Definer RPC Functions
-- Migration: 20260812130000_admin_rpc_functions
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop old versions first to avoid return-type change errors
DROP FUNCTION IF EXISTS public.get_all_profiles();
DROP FUNCTION IF EXISTS public.get_all_invoices();
DROP FUNCTION IF EXISTS public.get_all_clients();
DROP FUNCTION IF EXISTS public.get_all_business_details();

-- ── 1. get_all_profiles ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_all_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  full_name text,
  tier text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
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
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_profiles() TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_profiles() TO service_role;

-- ── 2. get_all_invoices ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_all_invoices()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  invoice_number text,
  client_name text,
  total numeric,
  status text,
  created_at timestamptz,
  due_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
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
  ORDER BY i.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_invoices() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_invoices() TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_invoices() TO service_role;

-- ── 3. get_all_clients ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_all_clients()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  email text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.name,
    c.email,
    c.created_at
  FROM public.clients c
  ORDER BY c.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_clients() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_clients() TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_clients() TO service_role;

-- ── 4. get_all_business_details ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_all_business_details()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  business_name text,
  contact_name text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.user_id,
    b.business_name,
    b.contact_name,
    b.created_at
  FROM public.business_details b;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_business_details() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_business_details() TO anon;
GRANT EXECUTE ON FUNCTION public.get_all_business_details() TO service_role;

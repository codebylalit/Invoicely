-- ─────────────────────────────────────────────────────────────────────────────
-- Subscription Date Columns
-- Migration: 20260818000000_subscription_dates
-- Adds: subscription_start_date, subscription_renewal_date, subscription_end_date,
--       billing_cycle, razorpay_payment_id to public.profiles
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Add new columns to profiles table ─────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_start_date   timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_renewal_date timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_end_date     timestamptz,
  ADD COLUMN IF NOT EXISTS billing_cycle             text,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id       text,
  ADD COLUMN IF NOT EXISTS subscription_status       text DEFAULT 'inactive';

-- ── 2. Update get_all_profiles RPC to include new columns ────────────────────
DROP FUNCTION IF EXISTS public.get_all_profiles() CASCADE;

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
      COALESCE(p.tier, 'free')                  AS tier,
      COALESCE(p.subscription_status, 'inactive') AS subscription_status,
      p.subscription_start_date,
      p.subscription_renewal_date,
      p.subscription_end_date,
      p.billing_cycle,
      p.razorpay_payment_id,
      u.created_at                               AS created_at,
      COALESCE(p.updated_at, u.created_at)       AS updated_at
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

-- ── 3. Backfill existing Pro users using razorpay_orders ─────────────────────
-- For existing subscribers, compute dates from the most recent paid order.
-- This runs once at migration time.
UPDATE public.profiles p
SET
  subscription_start_date   = ro.paid_at,
  subscription_renewal_date = CASE
    WHEN ro.amount >= 1000 THEN ro.paid_at + INTERVAL '365 days'
    ELSE                        ro.paid_at + INTERVAL '30 days'
  END,
  billing_cycle             = CASE
    WHEN ro.amount >= 1000 THEN 'yearly'
    ELSE                        'monthly'
  END,
  razorpay_payment_id       = ro.payment_id,
  subscription_status       = 'active',
  updated_at                = NOW()
FROM (
  -- Latest paid order per user
  SELECT DISTINCT ON (user_id)
    user_id,
    payment_id,
    amount,
    COALESCE(updated_at, created_at) AS paid_at
  FROM public.razorpay_orders
  WHERE status = 'paid'
  ORDER BY user_id, COALESCE(updated_at, created_at) DESC
) ro
WHERE p.user_id = ro.user_id
  AND p.tier IN ('pro', 'Pro');

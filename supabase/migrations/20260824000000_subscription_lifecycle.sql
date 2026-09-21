-- ─────────────────────────────────────────────────────────────────────────────
-- Subscription Lifecycle & Automatic Expiration Management
-- Migration: 20260824000000_subscription_lifecycle
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Create function to automatically sync and expire overdue subscriptions ─
CREATE OR REPLACE FUNCTION public.sync_subscription_lifecycle()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- A. Subscriptions that were cancelled and have passed their subscription_end_date:
  --    Mark as 'expired' and downgrade tier to 'free'.
  UPDATE public.profiles
  SET
    subscription_status = 'expired',
    tier = 'free',
    updated_at = NOW()
  WHERE is_admin = false
    AND subscription_status = 'cancelled'
    AND subscription_end_date IS NOT NULL
    AND subscription_end_date <= NOW();

  -- B. Subscriptions marked 'active' or 'past_due' whose renewal date has passed:
  --    Mark as 'expired', set subscription_end_date to renewal date, and downgrade tier to 'free'.
  UPDATE public.profiles
  SET
    subscription_status = 'expired',
    subscription_end_date = COALESCE(subscription_end_date, subscription_renewal_date, NOW()),
    tier = 'free',
    updated_at = NOW()
  WHERE is_admin = false
    AND subscription_status IN ('active', 'past_due')
    AND subscription_renewal_date IS NOT NULL
    AND subscription_renewal_date <= NOW();

  -- C. Profiles with tier = 'pro' or 'Pro' that have no active subscription:
  --    If status is 'expired', 'inactive', or empty and user is not admin, reset tier to 'free'.
  UPDATE public.profiles
  SET
    tier = 'free',
    subscription_status = COALESCE(NULLIF(subscription_status, ''), 'inactive'),
    updated_at = NOW()
  WHERE is_admin = false
    AND LOWER(tier) = 'pro'
    AND (
      subscription_status IN ('expired', 'inactive')
      OR subscription_status IS NULL
      OR (subscription_renewal_date IS NULL AND subscription_end_date IS NULL)
      OR (subscription_renewal_date IS NOT NULL AND subscription_renewal_date <= NOW())
      OR (subscription_end_date IS NOT NULL AND subscription_end_date <= NOW())
    );

  -- D. Keep subscribers table in sync
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscribers') THEN
    UPDATE public.subscribers s
    SET
      subscription_tier = 'free',
      updated_at = NOW()
    FROM public.profiles p
    WHERE s.user_id = p.user_id
      AND p.is_admin = false
      AND (p.subscription_status = 'expired' OR p.tier = 'free')
      AND LOWER(s.subscription_tier) = 'pro';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_subscription_lifecycle() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_subscription_lifecycle() TO authenticated, service_role;

-- ── 2. User-specific real-time subscription sync RPC ─────────────────────────
-- Allows an authenticated user to sync and fetch their verified subscription status
CREATE OR REPLACE FUNCTION public.sync_user_subscription(p_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller uuid;
  v_is_admin boolean;
  v_profile record;
  v_now timestamptz := NOW();
  v_status text;
  v_tier text;
BEGIN
  v_caller := auth.uid();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(is_admin, false) INTO v_is_admin FROM public.profiles WHERE user_id = v_caller;

  -- Caller must be target user or admin
  IF v_caller <> p_user_id AND NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;

  -- If user is admin, keep admin/pro
  IF COALESCE(v_profile.is_admin, false) THEN
    RETURN jsonb_build_object(
      'success', true,
      'tier', 'admin',
      'subscription_status', 'active',
      'is_admin', true
    );
  END IF;

  v_status := COALESCE(v_profile.subscription_status, 'inactive');
  v_tier := COALESCE(v_profile.tier, 'free');

  -- Check expiration rules
  IF v_status = 'cancelled' AND v_profile.subscription_end_date IS NOT NULL AND v_profile.subscription_end_date <= v_now THEN
    v_status := 'expired';
    v_tier := 'free';
  ELSIF v_status IN ('active', 'past_due') AND v_profile.subscription_renewal_date IS NOT NULL AND v_profile.subscription_renewal_date <= v_now THEN
    v_status := 'expired';
    v_tier := 'free';
  ELSIF LOWER(v_tier) = 'pro' AND (v_status IN ('expired', 'inactive') OR (v_profile.subscription_renewal_date IS NULL AND v_profile.subscription_end_date IS NULL)) THEN
    v_tier := 'free';
    v_status := 'inactive';
  END IF;

  -- Apply update if changes detected
  IF v_status IS DISTINCT FROM v_profile.subscription_status OR v_tier IS DISTINCT FROM v_profile.tier THEN
    UPDATE public.profiles
    SET
      tier = v_tier,
      subscription_status = v_status,
      subscription_end_date = CASE
        WHEN v_status = 'expired' AND subscription_end_date IS NULL THEN COALESCE(subscription_renewal_date, v_now)
        ELSE subscription_end_date
      END,
      updated_at = v_now
    WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'tier', v_tier,
    'subscription_status', v_status,
    'subscription_start_date', v_profile.subscription_start_date,
    'subscription_renewal_date', v_profile.subscription_renewal_date,
    'subscription_end_date', v_profile.subscription_end_date,
    'billing_cycle', v_profile.billing_cycle,
    'is_admin', v_profile.is_admin
  );
END;
$$;

REVOKE ALL ON FUNCTION public.sync_user_subscription(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_user_subscription(uuid) TO authenticated, service_role;

-- ── 3. Update get_all_profiles to sync lifecycle & return all subscription fields ──
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

  -- First, run lifecycle sync to guarantee all subscription states are accurate
  PERFORM public.sync_subscription_lifecycle();

  SELECT jsonb_agg(t) INTO res
  FROM (
    SELECT
      COALESCE(p.user_id, u.id)                    AS id,
      u.id                                         AS user_id,
      u.email                                      AS email,
      COALESCE(
        NULLIF(p.full_name, ''),
        NULLIF(u.raw_user_meta_data->>'full_name', ''),
        NULLIF(u.raw_user_meta_data->>'name', ''),
        split_part(u.email, '@', 1)
      )                                            AS full_name,
      COALESCE(p.tier, 'free')                     AS tier,
      COALESCE(p.subscription_status, 'inactive')  AS subscription_status,
      p.subscription_start_date,
      p.subscription_renewal_date,
      p.subscription_end_date,
      p.billing_cycle,
      p.razorpay_payment_id,
      p.payment_method,
      COALESCE(p.is_admin, false)                  AS is_admin,
      u.created_at                                 AS created_at,
      COALESCE(p.updated_at, u.created_at)          AS updated_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    ORDER BY u.created_at DESC
  ) t;

  RETURN COALESCE(res, '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.get_all_profiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_all_profiles() TO authenticated, service_role;

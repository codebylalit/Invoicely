-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 0 — Stop losing tax/discount data, and make invoice numbering correct
-- Migration: 20260822000100_invoice_data_integrity
--
-- Three problems fixed here:
--
--  1. invoices.taxes / invoices.discounts were numeric(10,2), but the app builds
--     them as arrays of {id, name, rate, amount}. useInvoiceManager coerced the
--     array to 0 before insert (`ensureNumeric`), so every saved invoice lost
--     its entire tax and discount breakdown. They become jsonb, with numeric
--     tax_total / discount_total kept alongside for querying and reporting.
--
--  2. Invoice numbers were allocated by ordering invoice_number as *text* and
--     adding 1, so "999" sorted above "1001" and numbers collided. Replaced
--     with a per-user counter row and a row-locking RPC.
--
--  3. Settings > Preferences upserts default_currency / invoice_prefix /
--     invoice_start_number / default_tax_* / default_due_days / default_notes
--     onto profiles, but those columns were never created — so saving
--     preferences failed. They are added here.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Preference columns the Settings page already writes ───────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS default_currency      text    NOT NULL DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS invoice_prefix        text    NOT NULL DEFAULT 'INV',
  ADD COLUMN IF NOT EXISTS invoice_start_number  bigint  NOT NULL DEFAULT 1001,
  ADD COLUMN IF NOT EXISTS default_tax_name      text             DEFAULT 'GST',
  ADD COLUMN IF NOT EXISTS default_tax_rate      numeric(6,3)     DEFAULT 18,
  ADD COLUMN IF NOT EXISTS default_due_days      integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS default_notes         text;

-- ── 2. taxes / discounts become jsonb, with numeric totals alongside ─────────
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS tax_total      numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_total numeric(12,2) NOT NULL DEFAULT 0;

DO $$
BEGIN
  -- Only convert if the column is still numeric (makes the migration re-runnable).
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'invoices'
      AND column_name = 'taxes' AND data_type = 'numeric'
  ) THEN
    -- Preserve the single aggregate figure we currently have.
    UPDATE public.invoices SET tax_total = COALESCE(taxes, 0);

    ALTER TABLE public.invoices ALTER COLUMN taxes DROP DEFAULT;
    ALTER TABLE public.invoices
      ALTER COLUMN taxes TYPE jsonb
      USING (
        CASE
          WHEN taxes IS NULL OR taxes = 0 THEN '[]'::jsonb
          ELSE jsonb_build_array(jsonb_build_object(
                 'id', 'tax_0', 'name', 'Tax', 'rate', NULL, 'amount', taxes))
        END
      );
    ALTER TABLE public.invoices ALTER COLUMN taxes SET DEFAULT '[]'::jsonb;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'invoices'
      AND column_name = 'discounts' AND data_type = 'numeric'
  ) THEN
    UPDATE public.invoices SET discount_total = COALESCE(discounts, 0);

    ALTER TABLE public.invoices ALTER COLUMN discounts DROP DEFAULT;
    ALTER TABLE public.invoices
      ALTER COLUMN discounts TYPE jsonb
      USING (
        CASE
          WHEN discounts IS NULL OR discounts = 0 THEN '[]'::jsonb
          ELSE jsonb_build_array(jsonb_build_object(
                 'id', 'disc_0', 'name', 'Discount', 'rate', NULL, 'amount', discounts))
        END
      );
    ALTER TABLE public.invoices ALTER COLUMN discounts SET DEFAULT '[]'::jsonb;
  END IF;
END
$$;

UPDATE public.invoices SET taxes     = '[]'::jsonb WHERE taxes     IS NULL;
UPDATE public.invoices SET discounts = '[]'::jsonb WHERE discounts IS NULL;

-- ── 3. Sequential invoice numbering that actually is sequential ──────────────
CREATE TABLE IF NOT EXISTS public.invoice_counters (
  user_id     uuid PRIMARY KEY,
  prefix      text   NOT NULL DEFAULT 'INV',
  next_number bigint NOT NULL DEFAULT 1001,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own invoice counter" ON public.invoice_counters;
CREATE POLICY "Users read own invoice counter"
  ON public.invoice_counters FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
-- Deliberately no INSERT/UPDATE policy: the counter is only ever advanced by
-- next_invoice_number(), which is SECURITY DEFINER.

-- Seed a counter for every existing user, starting above their highest existing
-- number so no already-issued number can be handed out again.
INSERT INTO public.invoice_counters (user_id, prefix, next_number)
SELECT
  p.user_id,
  COALESCE(NULLIF(p.invoice_prefix, ''), 'INV'),
  GREATEST(
    COALESCE(p.invoice_start_number, 1001),
    COALESCE((
      SELECT MAX(n) + 1
      FROM (
        SELECT NULLIF(regexp_replace(i.invoice_number, '\D', '', 'g'), '')::bigint AS n
        FROM public.invoices i
        WHERE i.user_id = p.user_id
          AND i.invoice_number IS NOT NULL
          AND length(regexp_replace(i.invoice_number, '\D', '', 'g')) BETWEEN 1 AND 18
      ) digits
    ), 1001)
  )
FROM public.profiles p
ON CONFLICT (user_id) DO NOTHING;

-- Allocates and returns the caller's next invoice number, e.g. 'INV-1042'.
-- Takes a row lock, so two concurrent saves cannot receive the same number.
CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_prefix text;
  v_number bigint;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  -- First call for this user: seed from their preferences and existing invoices.
  INSERT INTO public.invoice_counters (user_id, prefix, next_number)
  SELECT
    v_uid,
    COALESCE(NULLIF(p.invoice_prefix, ''), 'INV'),
    GREATEST(
      COALESCE(p.invoice_start_number, 1001),
      COALESCE((
        SELECT MAX(n) + 1
        FROM (
          SELECT NULLIF(regexp_replace(i.invoice_number, '\D', '', 'g'), '')::bigint AS n
          FROM public.invoices i
          WHERE i.user_id = v_uid
            AND i.invoice_number IS NOT NULL
            AND length(regexp_replace(i.invoice_number, '\D', '', 'g')) BETWEEN 1 AND 18
        ) digits
      ), 1001)
    )
  FROM public.profiles p
  WHERE p.user_id = v_uid
  ON CONFLICT (user_id) DO NOTHING;

  -- Users with no profile row yet (trigger not fired) still get a counter.
  INSERT INTO public.invoice_counters (user_id)
  VALUES (v_uid)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.invoice_counters
     SET next_number = next_number + 1,
         updated_at  = now()
   WHERE user_id = v_uid
  RETURNING prefix, next_number - 1 INTO v_prefix, v_number;

  RETURN CASE
           WHEN v_prefix IS NULL OR v_prefix = '' THEN v_number::text
           ELSE v_prefix || '-' || v_number::text
         END;
END;
$$;

REVOKE ALL ON FUNCTION public.next_invoice_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.next_invoice_number() TO authenticated;

-- Keep the counter's prefix in step with the user's saved preference.
CREATE OR REPLACE FUNCTION public.sync_invoice_counter_prefix()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.invoice_counters c
     SET prefix      = COALESCE(NULLIF(NEW.invoice_prefix, ''), 'INV'),
         -- Never move the counter backwards; only honour a higher start number.
         next_number = GREATEST(c.next_number, COALESCE(NEW.invoice_start_number, 1001)),
         updated_at  = now()
   WHERE c.user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_sync_counter ON public.profiles;
CREATE TRIGGER trg_profiles_sync_counter
  AFTER INSERT OR UPDATE OF invoice_prefix, invoice_start_number ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_counter_prefix();

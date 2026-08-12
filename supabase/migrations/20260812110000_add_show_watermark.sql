-- Add show_watermark column to public.invoices table if it doesn't already exist
ALTER TABLE IF EXISTS public.invoices
ADD COLUMN IF NOT EXISTS show_watermark BOOLEAN DEFAULT TRUE;

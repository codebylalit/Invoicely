-- Add page_size column to public.invoices table if it doesn't already exist
ALTER TABLE IF EXISTS public.invoices
ADD COLUMN IF NOT EXISTS page_size VARCHAR(20) DEFAULT 'auto';

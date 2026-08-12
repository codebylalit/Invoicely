alter table if exists public.invoices
add column if not exists template_id integer;
-- Clean restore script for Invoicely
-- Generated from database cluster dump

-- -----------------------------------------------------
-- Recreating Public Schema Tables & Functions
-- -----------------------------------------------------

CREATE EXTENSION IF NOT EXISTS wrappers WITH SCHEMA extensions;

CREATE FUNCTION public.calculate_next_recurrence_date(p_frequency text, p_interval integer, p_current_date date) RETURNS date
    LANGUAGE plpgsql
    AS $$
BEGIN
    CASE p_frequency
        WHEN 'weekly' THEN
            RETURN p_current_date + (p_interval * INTERVAL '1 week');
        WHEN 'monthly' THEN
            RETURN p_current_date + (p_interval * INTERVAL '1 month');
        WHEN 'custom' THEN
            RETURN p_current_date + (p_interval * INTERVAL '1 day');
        ELSE
            RETURN NULL;
    END CASE;
END;
$$;

-- Name: invoicely; Type: FOREIGN DATA WRAPPER; Schema: -; Owner: postgres
--

CREATE FOREIGN DATA WRAPPER invoicely HANDLER extensions.stripe_fdw_handler VALIDATOR extensions.stripe_fdw_validator;

CREATE SERVER invoicely_server FOREIGN DATA WRAPPER invoicely OPTIONS (
    api_key_id 'e7196f7f-f282-4752-8fac-881fd29e11b5',
    api_url 'https://api.stripe.com/v1'
);

DROP TABLE IF EXISTS public.business_details CASCADE;
CREATE TABLE public.business_details (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    contact_name text,
    business_name text,
    email text,
    address text,
    city text,
    postal_code text,
    region_state text,
    country text,
    phone_number text,
    vat_number text,
    logo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

DROP TABLE IF EXISTS public.clients CASCADE;
CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    company text,
    created_at timestamp with time zone DEFAULT now()
);

DROP TABLE IF EXISTS public.customers CASCADE;
CREATE TABLE public.customers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    stripe_customer_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE FOREIGN TABLE public.invoicelyapp (
    id text,
    customer text,
    payment_intent text,
    subscription text,
    attrs jsonb
)
SERVER invoicely_server
OPTIONS (
    object 'checkout/sessions',
    rowid_column 'id',
    schema 'public'
);

DROP TABLE IF EXISTS public.invoices CASCADE;
CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid,
    status text NOT NULL,
    due_date date,
    invoice_number text,
    amount numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    invoice_title text,
    issued_date date,
    subtotal numeric(10,2),
    total numeric(10,2),
    client_name text,
    client_email text,
    details text,
    notes text,
    items jsonb,
    taxes numeric(10,2),
    discounts numeric(10,2),
    payment_methods jsonb,
    template_id integer,
    parent_invoice_id uuid,
    next_recurrence_date date,
    is_recurring boolean DEFAULT false,
    recurrence_frequency text,
    recurrence_interval integer DEFAULT 1,
    recurrence_start_date date,
    recurrence_end_date date,
    CONSTRAINT invoices_recurrence_frequency_check CHECK ((recurrence_frequency = ANY (ARRAY['weekly'::text, 'monthly'::text, 'custom'::text])))
);

DROP TABLE IF EXISTS public.paypal_orders CASCADE;
CREATE TABLE public.paypal_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id text NOT NULL,
    user_id uuid NOT NULL,
    plan text NOT NULL,
    amount numeric(10,2) NOT NULL,
    status text NOT NULL,
    capture_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    user_id uuid NOT NULL,
    bank_transfer_details text,
    payment_method text,
    tier text DEFAULT 'free'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    subscription_id text,
    subscription_status text,
    full_name text,
    payment_link text
);

DROP TABLE IF EXISTS public.razorpay_orders CASCADE;
CREATE TABLE public.razorpay_orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    order_id text NOT NULL,
    user_id uuid NOT NULL,
    plan text NOT NULL,
    amount numeric NOT NULL,
    status text NOT NULL,
    payment_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TABLE IF EXISTS public.subscribers CASCADE;
CREATE TABLE public.subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    subscription_tier text DEFAULT 'free'::text,
    subscription_end timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.business_details
    ADD CONSTRAINT business_details_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.paypal_orders
    ADD CONSTRAINT paypal_orders_order_id_key UNIQUE (order_id);

ALTER TABLE ONLY public.paypal_orders
    ADD CONSTRAINT paypal_orders_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY public.razorpay_orders
    ADD CONSTRAINT razorpay_orders_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);

CREATE INDEX idx_recurring_invoices ON public.invoices USING btree (is_recurring, next_recurrence_date);

CREATE INDEX paypal_orders_order_id_idx ON public.paypal_orders USING btree (order_id);

CREATE INDEX paypal_orders_user_id_idx ON public.paypal_orders USING btree (user_id);

ALTER TABLE ONLY public.business_details
    ADD CONSTRAINT business_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_parent_invoice_id_fkey FOREIGN KEY (parent_invoice_id) REFERENCES public.invoices(id);

ALTER TABLE ONLY public.paypal_orders
    ADD CONSTRAINT paypal_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.razorpay_orders
    ADD CONSTRAINT razorpay_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE POLICY "Service role can perform all operations" ON public.paypal_orders USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text)) WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

CREATE POLICY "Service role can update subscriptions" ON public.subscribers USING (true) WITH CHECK (true);

CREATE POLICY "User can manage own clients" ON public.clients USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "User can manage own invoices" ON public.invoices USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own business details" ON public.business_details FOR INSERT WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can read their own orders" ON public.paypal_orders FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Users can update their own business details" ON public.business_details FOR UPDATE USING ((auth.uid() = user_id));

CREATE POLICY "Users can view and update their own profiles" ON public.profiles USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view own subscription" ON public.subscribers FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Users can view their own business details" ON public.business_details FOR SELECT USING ((auth.uid() = user_id));

ALTER TABLE public.business_details ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.paypal_orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;


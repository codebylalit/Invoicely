-- Create paypal_orders table
CREATE TABLE IF NOT EXISTS paypal_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  plan TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  capture_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE paypal_orders ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own orders
CREATE POLICY "Users can read their own orders"
  ON paypal_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to perform all operations
CREATE POLICY "Service role can perform all operations"
  ON paypal_orders
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS paypal_orders_user_id_idx ON paypal_orders(user_id);
CREATE INDEX IF NOT EXISTS paypal_orders_order_id_idx ON paypal_orders(order_id); 
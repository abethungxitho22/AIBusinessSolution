/*
  # AI Universal Small Business Assistant Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, FK to auth.users)
      - `username` (text, unique)
      - `email` (text)
      - `cellphone` (text)
      - `business_type` (text) - food_vendor, clothing_beauty, furniture, retail, service_provider
      - `business_name` (text)
      - `created_at` (timestamp)
    - `sales_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `product_name` (text)
      - `quantity` (integer)
      - `unit_price` (numeric) - in ZAR
      - `total_price` (numeric) - computed
      - `sale_date` (date)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - RLS enabled on both tables
    - Users can only access their own data
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  cellphone text NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('food_vendor', 'clothing_beauty', 'furniture', 'retail', 'service_provider')),
  business_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS sales_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  total_price numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sales"
  ON sales_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON sales_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales"
  ON sales_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
  ON sales_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS sales_entries_user_id_idx ON sales_entries(user_id);
CREATE INDEX IF NOT EXISTS sales_entries_sale_date_idx ON sales_entries(sale_date);

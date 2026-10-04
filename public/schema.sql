-- =========================================================================
-- SUDIPTA E-SCOOTY ERP - COMPLETE SUPABASE SQL SCHEMA RECOVERY SCRIPT
-- Run this entire script in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)
-- =========================================================================

-- Enable uuid extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. VEHICLES TABLE (Showroom Inventory)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  offer_price NUMERIC DEFAULT 0,
  emi_price NUMERIC DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'In Stock',
  status TEXT NOT NULL DEFAULT 'Available',
  color TEXT DEFAULT '',
  battery TEXT DEFAULT '',
  motor TEXT DEFAULT '',
  range TEXT DEFAULT '',
  top_speed TEXT DEFAULT '',
  image TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  description_eng TEXT DEFAULT '',
  description_ben TEXT DEFAULT '',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PRODUCTS TABLE (Spare Parts & Accessories Inventory)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  title_eng TEXT DEFAULT '',
  title_ben TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  brand TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  offer_price NUMERIC DEFAULT 0,
  purchase_price NUMERIC DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'Active',
  image TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT DEFAULT '',
  description_eng TEXT DEFAULT '',
  description_ben TEXT DEFAULT '',
  delivery_charge NUMERIC DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ORDERS TABLE (Sales, Bookings, Shipments & Invoices)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  customer_email TEXT,
  customer_address TEXT DEFAULT '',
  items JSONB DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending',
  previous_status TEXT,
  payment_method TEXT DEFAULT 'COD',
  shipping_address TEXT DEFAULT '',
  utr_number TEXT DEFAULT '',
  payment_phone TEXT DEFAULT '',
  payment_screenshot TEXT DEFAULT '',
  payment_proof TEXT DEFAULT '',
  expected_delivery_date TEXT DEFAULT '',
  expected_delivery_time TEXT DEFAULT '',
  delivery_partner_name TEXT DEFAULT '',
  delivery_partner_phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  awb_number TEXT DEFAULT '',
  tracking_id TEXT DEFAULT '',
  carrier TEXT DEFAULT '',
  delivery_method TEXT DEFAULT 'Self',
  selected_carrier TEXT DEFAULT 'Delhivery',
  delivery_log_status TEXT DEFAULT 'Pending Assignment',
  shipping_label_url TEXT DEFAULT '',
  weight TEXT DEFAULT '',
  dimensions TEXT DEFAULT '',
  pickup_scheduled BOOLEAN DEFAULT FALSE,
  tracking_checkpoints JSONB DEFAULT '[]'::jsonb,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  address TEXT DEFAULT '',
  status TEXT DEFAULT 'Active',
  photo TEXT DEFAULT '',
  vehicle_details TEXT DEFAULT '',
  service_history JSONB DEFAULT '[]'::jsonb,
  payment_history JSONB DEFAULT '[]'::jsonb,
  emi_records JSONB DEFAULT '[]'::jsonb,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BOOKINGS / JOB CARDS TABLE (Workshop & Service)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  vehicle_model TEXT DEFAULT '',
  vehicle_number TEXT DEFAULT '',
  service_type TEXT DEFAULT 'General Service',
  issue_description TEXT DEFAULT '',
  repair_details TEXT DEFAULT '',
  technician_name TEXT DEFAULT '',
  parts_used JSONB DEFAULT '[]'::jsonb,
  service_charge NUMERIC DEFAULT 0,
  estimated_cost NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'Unpaid',
  status TEXT NOT NULL DEFAULT 'Pending',
  customer_gstin TEXT DEFAULT '',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SETTINGS TABLE (App & ERP Configuration)
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE,
  value JSONB DEFAULT '{}'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial row if not exists so queries don't fail
INSERT INTO public.settings (id, key, value, data)
VALUES ('global_settings', 'global_settings', '{}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 7. APP_SETTINGS TABLE (Alias backup for system config)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INVOICES TABLE (Billing & Tax Receipts)
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  date TEXT DEFAULT '',
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  vehicle_model TEXT DEFAULT '',
  service_charge NUMERIC DEFAULT 0,
  parts JSONB DEFAULT '[]'::jsonb,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  customer_gstin TEXT DEFAULT '',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. EMI RECORDS TABLE (Financing & Installment Tracking)
CREATE TABLE IF NOT EXISTS public.emi_records (
  id TEXT PRIMARY KEY,
  customer_id TEXT DEFAULT '',
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  battery_or_vehicle_name TEXT DEFAULT '',
  total_price NUMERIC DEFAULT 0,
  down_payment NUMERIC DEFAULT 0,
  monthly_emi NUMERIC DEFAULT 0,
  remaining_balance NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  due_amount NUMERIC DEFAULT 0,
  next_due_date TEXT DEFAULT '',
  payment_history JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'Active',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. EXPENSES TABLE (Cashbook & Accounts)
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'General',
  date TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. OFFLINE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.offline_transactions (
  id TEXT PRIMARY KEY,
  date TEXT DEFAULT '',
  customer_name TEXT DEFAULT '',
  description TEXT DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  type TEXT DEFAULT 'income',
  product_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ENQUIRIES TABLE (Lead Management & Test Rides)
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  vehicle_id TEXT DEFAULT '',
  type TEXT DEFAULT 'General Enquiry',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. ANNOUNCEMENTS TABLE (Notice Board & Offers)
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title_eng TEXT DEFAULT '',
  title_ben TEXT DEFAULT '',
  content_eng TEXT DEFAULT '',
  content_ben TEXT DEFAULT '',
  date TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. TESTIMONIALS TABLE (Customer Reviews)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  location TEXT DEFAULT '',
  rating INTEGER DEFAULT 5,
  comment TEXT NOT NULL DEFAULT '',
  text_eng TEXT DEFAULT '',
  text_ben TEXT DEFAULT '',
  role TEXT DEFAULT 'Customer',
  avatar TEXT DEFAULT '',
  date TEXT DEFAULT '',
  vehicle TEXT DEFAULT '',
  is_pending BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. DISABLE ROW LEVEL SECURITY (RLS) FOR SMOOTH DIRECT ACCESS
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.emi_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials DISABLE ROW LEVEL SECURITY;

-- 16. GRANT FULL PERMISSIONS TO ANON, AUTHENTICATED AND SERVICE_ROLE
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- =========================================================================
-- SUDIPTA E-SCOOTY ERP - COMPLETE BULLETPROOF SUPABASE SQL RECOVERY SCRIPT
-- Run this entire script in Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste all -> Click "Run"
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

-- Ensure all columns exist even if vehicles table was previously created with fewer columns
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS model TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS offer_price NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS emi_price NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'In Stock';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS battery TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS motor TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS range TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS top_speed TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS description_eng TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS description_ben TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.vehicles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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

-- Ensure all columns exist even if products table was previously created with fewer columns
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS title_eng TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS title_ben TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS offer_price NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS purchase_price NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS description_eng TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS description_ben TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS delivery_charge NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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

-- Ensure all columns exist for orders
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS order_id TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS customer_address TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS previous_status TEXT;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'COD';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS utr_number TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS payment_phone TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS payment_screenshot TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS payment_proof TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS expected_delivery_date TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS expected_delivery_time TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS delivery_partner_name TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS delivery_partner_phone TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS awb_number TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS tracking_id TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS carrier TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'Self';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS selected_carrier TEXT DEFAULT 'Delhivery';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS delivery_log_status TEXT DEFAULT 'Pending Assignment';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS shipping_label_url TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS weight TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS dimensions TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS pickup_scheduled BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS tracking_checkpoints JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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

ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS photo TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS vehicle_details TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS service_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS payment_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS emi_records JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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

ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS vehicle_model TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS vehicle_number TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'General Service';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS issue_description TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS repair_details TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS technician_name TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS parts_used JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS service_charge NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Unpaid';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS customer_gstin TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. SETTINGS TABLE (App & ERP Configuration)
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE,
  value JSONB DEFAULT '{}'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.settings ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE IF EXISTS public.settings ADD COLUMN IF NOT EXISTS value JSONB DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.settings ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

INSERT INTO public.settings (id, key, value, data)
VALUES ('global_settings', 'global_settings', '{}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 7. APP_SETTINGS TABLE (Alias backup)
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

ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS date TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS customer_phone TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS vehicle_model TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS service_charge NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS parts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS grand_total NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS customer_gstin TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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

ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS customer_id TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS customer_phone TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS battery_or_vehicle_name TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS down_payment NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS monthly_emi NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS remaining_balance NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS due_amount NUMERIC DEFAULT 0;
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS next_due_date TEXT DEFAULT '';
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS payment_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.emi_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

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

-- 15. DISABLE ROW LEVEL SECURITY (RLS) FOR FULL DIRECT ACCESS
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
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 17. CRITICAL: RELOAD POSTGREST SCHEMA CACHE IMMEDIATELY
NOTIFY pgrst, 'reload schema';

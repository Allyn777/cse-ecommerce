-- ============================================================
-- FIGHTING GEARS E-COMMERCE DATABASE SCHEMA
-- Stripe-Ready | Admin/User Authentication | Future-Proof
-- ============================================================

-- DROP ALL EXISTING TABLES (Clean Slate)
-- ============================================================
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- DROP EXISTING FUNCTIONS
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================
-- 1. USER PROFILES (Extends auth.users)
-- ============================================================
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  
  -- Role Management (Admin created manually in Supabase)
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Email Verification
  email_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- ============================================================
-- 2. CATEGORIES (Product Categories)
-- ============================================================
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  icon TEXT, -- emoji or icon class
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. BRANDS (Product Brands)
-- ============================================================
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. PRODUCTS (Main Product Table)
-- ============================================================
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Category & Brand
  category TEXT NOT NULL, -- 'gloves', 'punch-mits', 'mouthguard', etc.
  brand TEXT NOT NULL, -- 'venum', 'everlast', 'twins', etc.
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2), -- For showing discounts
  cost_price DECIMAL(10,2), -- Cost for profit tracking
  
  -- Images
  image TEXT NOT NULL, -- Main image URL
  images JSONB, -- Array of additional images
  
  -- Stock Management
  stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  sku TEXT UNIQUE, -- Stock Keeping Unit
  
  -- Product Details
  sizes JSONB, -- ['10 OZ', '12 OZ', '14 OZ', '16 OZ']
  colors JSONB, -- ['Black', 'Red', 'Blue']
  weight DECIMAL(10,2), -- Product weight for shipping
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'discontinued')),
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Admin tracking
  created_by UUID REFERENCES user_profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. WISHLISTS (User Wishlists)
-- ============================================================
CREATE TABLE wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- 6. CART ITEMS (Shopping Cart)
-- ============================================================
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  selected_size TEXT,
  selected_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, selected_size, selected_color)
);

-- ============================================================
-- 7. ORDERS (Main Orders Table - Stripe Ready)
-- ============================================================
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User & Order Info
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL UNIQUE, -- e.g., 'FG-2024-00001'
  
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'PHP',
  
  -- Order Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Order created, awaiting payment
    'confirmed',    -- Payment confirmed
    'processing',   -- Being prepared
    'shipped',      -- Shipped to customer
    'delivered',    -- Delivered successfully
    'cancelled',    -- Cancelled by user/admin
    'refunded'      -- Payment refunded
  )),
  
  -- Payment Info (Stripe Integration Ready)
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
  )),
  payment_method TEXT, -- 'stripe', 'cod' (Cash on Delivery), 'gcash', etc.
  
  -- Stripe Fields
  stripe_payment_intent_id TEXT, -- Stripe Payment Intent ID
  stripe_customer_id TEXT, -- Stripe Customer ID for saved cards
  stripe_charge_id TEXT, -- Stripe Charge ID
  
  -- Addresses (JSONB for flexibility)
  shipping_address JSONB NOT NULL, -- {name, phone, address, city, province, zip}
  billing_address JSONB, -- Same format as shipping_address
  
  -- Additional Info
  customer_notes TEXT,
  admin_notes TEXT,
  voucher_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- ============================================================
-- 8. ORDER ITEMS (Individual Products in Order)
-- ============================================================
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Product snapshot (in case product is deleted/changed)
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_sku TEXT,
  
  -- Selected options
  selected_size TEXT,
  selected_color TEXT,
  
  -- Pricing & Quantity
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL, -- quantity * unit_price
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. PAYMENT TRANSACTIONS (Stripe Payment Tracking)
-- ============================================================
CREATE TABLE payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Transaction Info
  transaction_id TEXT NOT NULL UNIQUE, -- Stripe Payment Intent ID or other gateway ID
  payment_method TEXT NOT NULL, -- 'stripe', 'cod', 'gcash', etc.
  
  -- Amount
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'PHP',
  
  -- Status
  status TEXT NOT NULL CHECK (status IN (
    'pending',
    'processing',
    'succeeded',
    'failed',
    'cancelled',
    'refunded'
  )),
  
  -- Stripe Specific Fields
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_payment_method_id TEXT, -- For saved payment methods
  
  -- Gateway Response (store full API response for debugging)
  gateway_response JSONB,
  
  -- Error handling
  error_message TEXT,
  error_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. INDEXES (Performance Optimization)
-- ============================================================

-- User Profiles
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- Products
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Payment Transactions
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);

-- Cart Items
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- Wishlists
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- ============================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 12. RLS POLICIES
-- ============================================================

-- USER PROFILES
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update any profile" ON user_profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PRODUCTS (Public Read, Admin Write)
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (status = 'active' OR EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- WISHLISTS
CREATE POLICY "Users can manage their own wishlists" ON wishlists
  FOR ALL USING (auth.uid() = user_id);

-- CART ITEMS
CREATE POLICY "Users can manage their own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- ORDERS
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update any order" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ORDER ITEMS
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create order items for their orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PAYMENT TRANSACTIONS
CREATE POLICY "Users can view their own payment transactions" ON payment_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = payment_transactions.order_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create payment transactions for their orders" ON payment_transactions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = payment_transactions.order_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can view all payment transactions" ON payment_transactions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update payment transactions" ON payment_transactions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- CATEGORIES & BRANDS (Public Read, Admin Write)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Only admins can manage brands" ON brands FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 13. FUNCTIONS & TRIGGERS
-- ============================================================

-- Function: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: Add updated_at to relevant tables
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at 
  BEFORE UPDATE ON cart_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 14. SAMPLE DATA
-- ============================================================

-- Insert Categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Gloves', 'gloves', 'Boxing and MMA gloves', '🥊'),
('Punch Mits', 'punch-mits', 'Training punch mitts', '👊'),
('Mouthguard', 'mouthguard', 'Protective mouthguards', '🦷'),
('Shin Guard', 'shin-guard', 'Martial arts shin protection', '🦵'),
('Punching Bag', 'punching-bag', 'Training punching bags', '🎯')
ON CONFLICT (slug) DO NOTHING;

-- Insert Brands
INSERT INTO brands (name, slug, description) VALUES
('Venum', 'venum', 'Premium combat sports equipment'),
('Everlast', 'everlast', 'Classic boxing and fitness brand'),
('Twins Special', 'twins', 'Thai boxing equipment specialist'),
('Hayabusa', 'hayabusa', 'High-performance martial arts gear'),
('Wesing', 'wesing', 'Professional training equipment')
ON CONFLICT (slug) DO NOTHING;

-- Insert Sample Products
INSERT INTO products (name, slug, category, brand, price, image, description, stock, sizes) VALUES
('Venum Boxing Gloves', 'venum-boxing-gloves', 'gloves', 'venum', 2599.00, '/logos/venum-gloves.png', 
 'Professional boxing gloves for training and competition', 50, '["10 OZ", "12 OZ", "14 OZ", "16 OZ"]'),
 
('Everlast Punch Mits', 'everlast-punch-mits', 'punch-mits', 'everlast', 999.00, '/logos/everlastmits0.png', 
 'High-quality punch mitts for training', 30, '["One Size"]'),
 
('Hayabusa Mouth Guard', 'hayabusa-mouth-guard', 'mouthguard', 'hayabusa', 699.00, '/logos/hayabusam.png', 
 'Custom-fit mouthguard for protection', 40, '["Adult", "Youth"]'),
 
('Twins Shin Guard', 'twins-shin-guard', 'shin-guard', 'twins', 1999.00, '/logos/twinshpd.png', 
 'Protective shin guards for martial arts', 25, '["S", "M", "L", "XL"]'),
 
('Wesing Punching Bag', 'wesing-punching-bag', 'punching-bag', 'wesing', 3500.00, '/logos/wesingbag0.png', 
 'Heavy-duty punching bag for training', 15, '["50kg", "70kg", "100kg"]')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 15. ADMIN SETUP INSTRUCTIONS
-- ============================================================

/*
HOW TO CREATE ADMIN USER:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" (or "Invite User")
3. Enter admin email: admin@fightinggears.com
4. Set a secure password
5. Check "Auto Confirm User" (skip email verification)
6. Click "Create User"

7. After user is created, run this query to set admin role:

UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@fightinggears.com'
);

8. Your admin account is now ready!
   - Login URL: http://localhost:5173/login
   - Admin Dashboard: http://localhost:5173/admin

NOTES:
- Only users with role='admin' can access /admin dashboard
- Regular users signup through the UI (/signup)
- Admins can only be created manually in Supabase
- Login.jsx automatically redirects admins to /admin after login
*/

-- ============================================================
-- ✅ DATABASE SCHEMA COMPLETE!
-- ============================================================
-- Features:
-- ✅ User Authentication (Login/Signup)
-- ✅ Admin/User Role Management
-- ✅ Product Management (CRUD)
-- ✅ Shopping Cart & Wishlists
-- ✅ Order Management
-- ✅ Stripe Payment Integration Ready
-- ✅ Row Level Security (RLS)
-- ✅ Indexes for Performance
-- ✅ Sample Data Included
-- ============================================================
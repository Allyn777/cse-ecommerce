-- Fighting Gears E-commerce - Simple & Flexible Database Schema
-- Focused on Login/Signup, User/Admin Management
-- Easy to expand for future e-commerce features

-- ==============================================
-- 1. USER MANAGEMENT (Core)
-- ==============================================

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- ==============================================
-- 2. BASIC E-COMMERCE TABLES (Expandable)
-- ==============================================

-- Categories table (for products)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands table (for products)
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (basic e-commerce)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  brand_id UUID REFERENCES brands(id),
  price DECIMAL(10,2) NOT NULL,
  image TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. BASIC ORDER MANAGEMENT (Expandable)
-- ==============================================

-- Orders table (with payment support)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  order_number TEXT NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_method TEXT, -- 'stripe', 'paypal', 'cash', etc.
  payment_intent_id TEXT, -- Stripe Payment Intent ID
  payment_reference TEXT, -- External payment reference
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table (basic)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions table (for API payments)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL UNIQUE, -- External payment ID
  payment_method TEXT NOT NULL, -- 'stripe', 'paypal', etc.
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  gateway_response JSONB, -- Store full API response
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 4. BASIC CART (Expandable)
-- ==============================================

-- Shopping cart table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ==============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 6. RLS POLICIES
-- ==============================================

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Brands policies (public read, admin write)
CREATE POLICY "Brands are viewable by everyone" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage brands" ON brands
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Only admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Order items policies
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

-- Cart policies
CREATE POLICY "Users can manage their own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Payment transactions policies
CREATE POLICY "Users can view their own payment transactions" ON payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = payment_transactions.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payment transactions" ON payment_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE id = payment_transactions.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update payment transactions" ON payment_transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==============================================
-- 7. FUNCTIONS & TRIGGERS
-- ==============================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email_verified)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 8. SAMPLE DATA
-- ==============================================

-- Insert categories
INSERT INTO categories (name, slug, description) VALUES
('Gloves', 'gloves', 'Boxing and MMA gloves'),
('Punch Mitts', 'punch-mits', 'Training punch mitts'),
('Mouthguard', 'mouthguard', 'Protective mouthguards'),
('Shin Guards', 'shin-guards', 'Martial arts shin protection'),
('Punching Bags', 'punching-bags', 'Training punching bags');

-- Insert brands
INSERT INTO brands (name, slug, description) VALUES
('Venum', 'venum', 'Premium combat sports equipment'),
('Everlast', 'everlast', 'Classic boxing and fitness brand'),
('Twins Special', 'twins-special', 'Thai boxing equipment specialist'),
('Hayabusa', 'hayabusa', 'High-performance martial arts gear'),
('Wesing', 'wesing', 'Professional training equipment');

-- Insert sample products
INSERT INTO products (name, slug, description, category_id, brand_id, price, image, stock) 
SELECT 
  'Venum Boxing Gloves',
  'venum-boxing-gloves',
  'Professional boxing gloves for training and competition',
  c.id,
  b.id,
  89.99,
  '/logos/venum-gloves.png',
  50
FROM categories c, brands b 
WHERE c.slug = 'gloves' AND b.slug = 'venum';

INSERT INTO products (name, slug, description, category_id, brand_id, price, image, stock) 
SELECT 
  'Everlast Punch Mitts',
  'everlast-punch-mitts',
  'High-quality punch mitts for training',
  c.id,
  b.id,
  45.99,
  '/logos/everlastmits0.png',
  30
FROM categories c, brands b 
WHERE c.slug = 'punch-mits' AND b.slug = 'everlast';

INSERT INTO products (name, slug, description, category_id, brand_id, price, image, stock) 
SELECT 
  'Twins Shin Guards',
  'twins-shin-guards',
  'Protective shin guards for martial arts',
  c.id,
  b.id,
  95.99,
  '/logos/twinshpd.png',
  25
FROM categories c, brands b 
WHERE c.slug = 'shin-guards' AND b.slug = 'twins-special';

INSERT INTO products (name, slug, description, category_id, brand_id, price, image, stock) 
SELECT 
  'Hayabusa Mouthguard',
  'hayabusa-mouthguard',
  'Custom-fit mouthguard for protection',
  c.id,
  b.id,
  34.99,
  '/logos/hayabusam.png',
  40
FROM categories c, brands b 
WHERE c.slug = 'mouthguard' AND b.slug = 'hayabusa';

INSERT INTO products (name, slug, description, category_id, brand_id, price, image, stock) 
SELECT 
  'Wesing Punching Bag',
  'wesing-punching-bag',
  'Heavy-duty punching bag for training',
  c.id,
  b.id,
  149.99,
  '/logos/wesingbag0.png',
  15
FROM categories c, brands b 
WHERE c.slug = 'punching-bags' AND b.slug = 'wesing';

-- ==============================================
-- 9. ADMIN USER SETUP
-- ==============================================

-- Create admin user instructions:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Add User with email: admin@fightinggears.com
-- 3. Set password and auto-confirm
-- 4. Run this query to set admin role:
-- UPDATE user_profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@fightinggears.com');

-- ==============================================
-- COMPLETE! Simple, Flexible, E-commerce Ready!
-- ==============================================

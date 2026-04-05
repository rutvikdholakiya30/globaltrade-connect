-- 1. Create Tables

-- Users Table (Profiles)
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Categories Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Products Table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  specifications JSONB DEFAULT '{}'::jsonb,
  price DECIMAL(12,2),
  images TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Pages Table
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (name IN ('about', 'privacy', 'terms', 'contact')),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile." ON users;
DROP POLICY IF EXISTS "Users can update their own profile." ON users;
DROP POLICY IF EXISTS "Admin users can view all profiles." ON users;
DROP POLICY IF EXISTS "Admin users can update all profiles." ON users;
DROP POLICY IF EXISTS "Categories are viewable by everyone." ON categories;
DROP POLICY IF EXISTS "Only admins can modify categories." ON categories;
DROP POLICY IF EXISTS "Active products are viewable by everyone." ON products;
DROP POLICY IF EXISTS "Only admins can modify products." ON products;
DROP POLICY IF EXISTS "Active pages are viewable by everyone." ON pages;
DROP POLICY IF EXISTS "Only admins can modify pages." ON pages;

-- Create Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Users Policies
CREATE POLICY "Users can view their own profile." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin users can view all profiles." ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin users can update all profiles." ON public.users FOR UPDATE USING (public.is_admin());

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (true);
CREATE POLICY "Only admins can modify categories." ON categories FOR ALL USING (public.is_admin());

-- Products Policies
CREATE POLICY "Active products are viewable by everyone." ON products FOR SELECT USING (status = 'active' OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can modify products." ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Pages Policies
CREATE POLICY "Active pages are viewable by everyone." ON pages FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Only admins can modify pages." ON pages FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Create Functions and Triggers

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Initial Data

INSERT INTO categories (name) VALUES 
('Agriculture'), 
('Machinery'), 
('Chemicals'), 
('Textile');

INSERT INTO pages (name, content, is_active) VALUES 
('about', '<h1>Our Story</h1><p>Welcome to GlobalTradeConnect...</p>', true),
('privacy', '<h1>Privacy Policy</h1><p>Your privacy is important...</p>', true),
('terms', '<h1>Terms & Conditions</h1><p>By using our service...</p>', true),
('contact', '<h1>Contact Us</h1><p>Get in touch with our team...</p>', true);

-- 5. Trigger for New User Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

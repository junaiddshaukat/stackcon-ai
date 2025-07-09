-- ===================================
-- COMPLETE DATABASE RESET SCRIPT
-- Drops all existing tables and creates simplified structure
-- ===================================

-- Disable RLS temporarily for clean reset
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS search_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resource_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resource_ratings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS collection_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS search_queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Resources are publicly readable" ON resources;
DROP POLICY IF EXISTS "Admins can manage resources" ON resources;
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can add their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can view their own search history" ON search_history;
DROP POLICY IF EXISTS "Users can add to their search history" ON search_history;
DROP POLICY IF EXISTS "Users can delete their search history" ON search_history;
DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can manage own searches" ON search_queries;
DROP POLICY IF EXISTS "Users can read own payments" ON payments;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop all existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS resource_ratings CASCADE;
DROP TABLE IF EXISTS collection_items CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS resource_categories CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS search_history CASCADE;
DROP TABLE IF EXISTS search_queries CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any remaining indexes
DROP INDEX IF EXISTS idx_resources_embedding;
DROP INDEX IF EXISTS idx_resources_type;
DROP INDEX IF EXISTS idx_resources_framework;
DROP INDEX IF EXISTS idx_resources_styling;
DROP INDEX IF EXISTS idx_resources_tags;
DROP INDEX IF EXISTS idx_resources_active;
DROP INDEX IF EXISTS idx_resources_category;
DROP INDEX IF EXISTS idx_user_favorites_user_id;
DROP INDEX IF EXISTS idx_user_favorites_resource_id;
DROP INDEX IF EXISTS idx_search_history_user_id;
DROP INDEX IF EXISTS idx_search_history_created_at;
DROP INDEX IF EXISTS idx_search_queries_user;
DROP INDEX IF EXISTS idx_search_queries_created;
DROP INDEX IF EXISTS idx_users_plan;

-- ===================================
-- CREATE NEW SIMPLIFIED TABLES
-- ===================================

-- 1. Users table (simplified - no plan field)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Resources table (simplified - no category_id initially)
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('template', 'component', 'repository', 'ui_library')),
  framework TEXT[] DEFAULT '{}',
  styling TEXT[] DEFAULT '{}',
  repo_url TEXT NOT NULL,
  demo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User favorites
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- 5. Search history
CREATE TABLE search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- CREATE INDEXES FOR PERFORMANCE
-- ===================================

CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_framework ON resources USING GIN(framework);
CREATE INDEX idx_resources_styling ON resources USING GIN(styling);
CREATE INDEX idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX idx_resources_active ON resources(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_resource_id ON user_favorites(resource_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);

-- ===================================
-- ENABLE ROW LEVEL SECURITY
-- ===================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- ===================================
-- CREATE RLS POLICIES
-- ===================================

-- Users policies
CREATE POLICY "Users can read own data" ON users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Resources policies (public read, admin write)
CREATE POLICY "Resources are publicly readable" ON resources 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage resources" ON resources 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are publicly readable" ON categories 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- User favorites policies
CREATE POLICY "Users can view their own favorites" ON user_favorites 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" ON user_favorites 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_favorites 
  FOR DELETE USING (auth.uid() = user_id);

-- Search history policies
CREATE POLICY "Users can view their own search history" ON search_history 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their search history" ON search_history 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their search history" ON search_history 
  FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- CREATE FUNCTIONS AND TRIGGERS
-- ===================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at 
  BEFORE UPDATE ON resources 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- INSERT SAMPLE DATA
-- ===================================

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Dashboard', 'Dashboard templates and components'),
('E-commerce', 'Online store and shopping cart components'),
('Landing Page', 'Marketing and promotional page templates'),
('Admin Panel', 'Administrative interface components'),
('Blog', 'Blog and content management templates'),
('Authentication', 'Login, signup, and user management components');

-- Insert sample resources
INSERT INTO resources (name, description, resource_type, framework, styling, repo_url, demo_url, tags, source) VALUES
(
  'React Dashboard Template',
  'Modern dashboard template with charts, tables, and analytics components built with React and Tailwind CSS',
  'template',
  ARRAY['react', 'nextjs'],
  ARRAY['tailwind'],
  'https://github.com/creativetimofficial/material-dashboard-react',
  'https://demos.creative-tim.com/material-dashboard-react/',
  ARRAY['dashboard', 'analytics', 'charts', 'admin'],
  'admin'
),
(
  'Vue E-commerce Store',
  'Complete e-commerce solution with product catalog, shopping cart, and checkout flow using Vue 3',
  'template',
  ARRAY['vue', 'nuxt'],
  ARRAY['tailwind', 'css'],
  'https://github.com/epicmaxco/vuestic-admin',
  'https://admin.vuestic.dev/',
  ARRAY['ecommerce', 'shopping', 'products', 'cart'],
  'admin'
),
(
  'Headless UI Components',
  'Unstyled, fully accessible UI components designed to integrate beautifully with Tailwind CSS',
  'ui_library',
  ARRAY['react', 'vue'],
  ARRAY['tailwind'],
  'https://github.com/tailwindlabs/headlessui',
  'https://headlessui.dev',
  ARRAY['components', 'accessibility', 'headless', 'ui'],
  'admin'
),
(
  'Material-UI React Components',
  'React components for faster and simpler web development. Build your own design system.',
  'ui_library',
  ARRAY['react'],
  ARRAY['css', 'styled-components'],
  'https://github.com/mui/material-ui',
  'https://mui.com',
  ARRAY['components', 'material', 'design', 'react'],
  'admin'
),
(
  'Next.js Blog Template',
  'A statically generated blog example using Next.js and Markdown',
  'template',
  ARRAY['react', 'nextjs'],
  ARRAY['tailwind'],
  'https://github.com/vercel/next.js/tree/canary/examples/blog-starter',
  'https://next-blog-starter.vercel.app',
  ARRAY['blog', 'markdown', 'static', 'nextjs'],
  'admin'
);

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- Check tables exist
SELECT 'Tables created successfully' AS status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'categories', 'resources', 'user_favorites', 'search_history');

-- Check sample data
SELECT 'Sample data inserted' AS status;
SELECT COUNT(*) as categories_count FROM categories;
SELECT COUNT(*) as resources_count FROM resources; 
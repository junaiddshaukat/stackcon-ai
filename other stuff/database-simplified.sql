-- ===================================
-- Simplified StackCon Templates AI Database Schema
-- Only 5 core tables: users, resources, categories, user_favorites, search_history
-- ===================================

-- Drop existing tables and recreate with simplified schema
DROP TABLE IF EXISTS resource_ratings CASCADE;
DROP TABLE IF EXISTS collection_items CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS resource_categories CASCADE;
DROP TABLE IF EXISTS search_queries CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table for resource classification
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table (simplified)
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('template', 'component', 'repository', 'ui_library')),
  framework TEXT[] DEFAULT '{}',
  styling TEXT[] DEFAULT '{}',
  repo_url TEXT NOT NULL,
  demo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Search history
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- INDEXES for performance
-- ===================================

CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_framework ON resources USING GIN(framework);
CREATE INDEX IF NOT EXISTS idx_resources_styling ON resources USING GIN(styling);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_resource_id ON user_favorites(resource_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- ===================================
-- ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Resources are publicly readable, only admins can modify
CREATE POLICY "Resources are publicly readable" ON resources FOR SELECT USING (true);
CREATE POLICY "Admins can manage resources" ON resources FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Categories are publicly readable, only admins can modify
CREATE POLICY "Categories are publicly readable" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Users can manage their own favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add their own favorites" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- Users can manage their own search history
CREATE POLICY "Users can view their own search history" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their search history" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their search history" ON search_history FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- FUNCTIONS AND TRIGGERS
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
-- SAMPLE DATA
-- ===================================

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Dashboard', 'Dashboard templates and components'),
('E-commerce', 'Online store and shopping cart components'),
('Landing Page', 'Marketing and promotional page templates'),
('Admin Panel', 'Administrative interface components'),
('Blog', 'Blog and content management templates'),
('Authentication', 'Login, signup, and user management components')
ON CONFLICT (name) DO NOTHING;

-- Insert sample resources
INSERT INTO resources (name, description, resource_type, framework, styling, repo_url, demo_url, tags, category_id, source) VALUES
(
  'React Dashboard Template',
  'Modern dashboard template with charts, tables, and analytics components built with React and Tailwind CSS',
  'template',
  ARRAY['react', 'nextjs'],
  ARRAY['tailwind'],
  'https://github.com/example/react-dashboard',
  'https://react-dashboard-demo.vercel.app',
  ARRAY['dashboard', 'analytics', 'charts', 'admin'],
  (SELECT id FROM categories WHERE name = 'Dashboard' LIMIT 1),
  'admin'
),
(
  'Vue E-commerce Store',
  'Complete e-commerce solution with product catalog, shopping cart, and checkout flow using Vue 3',
  'template',
  ARRAY['vue', 'nuxt'],
  ARRAY['tailwind', 'css'],
  'https://github.com/example/vue-ecommerce',
  'https://vue-store-demo.netlify.app',
  ARRAY['ecommerce', 'shopping', 'products', 'cart'],
  (SELECT id FROM categories WHERE name = 'E-commerce' LIMIT 1),
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
  (SELECT id FROM categories WHERE name = 'Authentication' LIMIT 1),
  'admin'
)
ON CONFLICT DO NOTHING; 
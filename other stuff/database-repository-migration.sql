-- ===================================
-- SYSTEMATIC DATABASE MIGRATION: UI Libraries  GitHub Repositories
-- This migration transforms StackCon from a UI library catalog to a repository discovery platform
-- ===================================

-- PHASE 1: ANALYSIS OF CURRENT DATA
-- First, let's understand what we currently have

-- Check current resource distribution
SELECT 
  resource_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM resources 
GROUP BY resource_type 
ORDER BY count DESC;

-- Sample current data structure
SELECT 
  name, 
  resource_type, 
  framework, 
  repo_url,
  CASE 
    WHEN repo_url LIKE '%github.com%' THEN 'GitHub Repository'
    ELSE 'Other/Demo'
  END as url_type
FROM resources 
LIMIT 10;

-- ===================================
-- PHASE 2: CREATE NEW REPOSITORY-FOCUSED TABLES
-- ===================================

-- 1. Create repositories table for GitHub repos
CREATE TABLE IF NOT EXISTS repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- GitHub API Data
  github_id BIGINT UNIQUE NOT NULL,
  github_owner TEXT NOT NULL,
  github_repo TEXT NOT NULL,
  github_full_name TEXT NOT NULL UNIQUE, -- owner/repo format
  
  -- Basic Repository Info
  name TEXT NOT NULL,
  description TEXT,
  repo_url TEXT NOT NULL UNIQUE,
  homepage_url TEXT,
  
  -- GitHub Metrics (Auto-synced from GitHub API)
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  
  -- Repository Details
  primary_language TEXT,
  languages JSONB DEFAULT '{}', -- {JavaScript: 12345, TypeScript: 6789}
  topics TEXT[] DEFAULT '{}', -- GitHub topics
  license TEXT,
  
  -- Timestamps from GitHub
  github_created_at TIMESTAMP WITH TIME ZONE,
  github_updated_at TIMESTAMP WITH TIME ZONE,
  github_pushed_at TIMESTAMP WITH TIME ZONE,
  
  -- Repository Status
  is_fork BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_disabled BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'public',
  
  -- AI-Enhanced Metadata
  use_cases TEXT[] DEFAULT '{}', -- AI-generated use cases
  tech_stack TEXT[] DEFAULT '{}', -- Detected technologies
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  project_type TEXT, -- fullstack-app, frontend-app, tool, library, api, mobile-app
  
  -- Content Analysis
  readme_content TEXT, -- Parsed README
  package_json JSONB, -- package.json data if exists
  
  -- Quality Metrics
  has_readme BOOLEAN DEFAULT FALSE,
  has_license BOOLEAN DEFAULT FALSE,
  has_contributing BOOLEAN DEFAULT FALSE,
  has_wiki BOOLEAN DEFAULT FALSE,
  has_pages BOOLEAN DEFAULT FALSE,
  
  -- StackCon Metadata
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  quality_score NUMERIC DEFAULT 0, -- Auto-calculated quality score
  last_github_sync TIMESTAMP WITH TIME ZONE, -- When we last synced with GitHub
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_github_repo UNIQUE(github_owner, github_repo)
);

-- 2. Create repository categories (replace generic categories)
CREATE TABLE IF NOT EXISTS repository_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  emoji TEXT, -- Visual category representation
  github_topics TEXT[], -- GitHub topics that map to this category
  keywords TEXT[], -- Search keywords for auto-categorization
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Repository-Category mappings (many-to-many)
CREATE TABLE IF NOT EXISTS repository_category_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES repository_categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE, -- Mark one category as primary
  confidence_score NUMERIC DEFAULT 1.0, -- How confident are we in this categorization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(repository_id, category_id)
);

-- 4. User favorites for repositories
CREATE TABLE IF NOT EXISTS repository_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, repository_id)
);

-- 5. GitHub API sync tracking
CREATE TABLE IF NOT EXISTS github_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  github_url TEXT NOT NULL,
  sync_type TEXT CHECK (sync_type IN ('full', 'metadata', 'metrics')),
  status TEXT CHECK (status IN ('success', 'failed', 'partial')),
  api_calls_used INTEGER DEFAULT 1,
  error_message TEXT,
  synced_data JSONB, -- What data was synced
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Repository discovery queue
CREATE TABLE IF NOT EXISTS repository_discovery_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  github_url TEXT NOT NULL UNIQUE,
  source TEXT, -- manual, github_search, trending, user_suggestion, ai_discovery
  priority INTEGER DEFAULT 5, -- 1-10, higher = more important
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}', -- Additional context about discovery
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- ===================================
-- PHASE 3: INDEXES FOR PERFORMANCE
-- ===================================

-- Repository indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_repositories_stars ON repositories(stars DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_updated ON repositories(github_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_language ON repositories(primary_language);
CREATE INDEX IF NOT EXISTS idx_repositories_topics ON repositories USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_repositories_tech_stack ON repositories USING GIN(tech_stack);
CREATE INDEX IF NOT EXISTS idx_repositories_use_cases ON repositories USING GIN(use_cases);
CREATE INDEX IF NOT EXISTS idx_repositories_difficulty ON repositories(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_repositories_type ON repositories(project_type);
CREATE INDEX IF NOT EXISTS idx_repositories_active ON repositories(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_repositories_featured ON repositories(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_repositories_quality ON repositories(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_full_name ON repositories(github_full_name);

-- Other performance indexes
CREATE INDEX IF NOT EXISTS idx_repo_categories_topics ON repository_categories USING GIN(github_topics);
CREATE INDEX IF NOT EXISTS idx_repo_categories_keywords ON repository_categories USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_repo_favorites_user ON repository_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_repo_discovery_status ON repository_discovery_queue(status);
CREATE INDEX IF NOT EXISTS idx_repo_discovery_priority ON repository_discovery_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_github_sync_repo ON github_sync_log(repository_id);

-- ===================================
-- PHASE 4: UTILITY FUNCTIONS
-- ===================================

-- Function to extract GitHub owner/repo from URL
CREATE OR REPLACE FUNCTION extract_github_info(url TEXT)
RETURNS TABLE (
  owner TEXT,
  repo TEXT
) AS -Force
DECLARE
  clean_url TEXT;
  url_parts TEXT[];
BEGIN
  -- Clean the URL
  clean_url := trim(both '/' from url);
  clean_url := replace(clean_url, 'https://github.com/', '');
  clean_url := replace(clean_url, 'http://github.com/', '');
  clean_url := replace(clean_url, 'github.com/', '');
  
  -- Remove .git suffix if present
  clean_url := replace(clean_url, '.git', '');
  
  -- Split by /
  url_parts := string_to_array(clean_url, '/');
  
  IF array_length(url_parts, 1) >= 2 THEN
    owner := url_parts[1];
    repo := url_parts[2];
    RETURN NEXT;
  END IF;
  
  RETURN;
END;
-Force LANGUAGE plpgsql;

-- Function to calculate repository quality score
CREATE OR REPLACE FUNCTION calculate_repository_quality_score(
  stars INTEGER,
  forks INTEGER,
  open_issues INTEGER,
  has_readme BOOLEAN,
  has_license BOOLEAN,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
RETURNS NUMERIC AS -Force
DECLARE
  score NUMERIC := 0;
  days_since_update INTEGER;
  popularity_score NUMERIC;
  quality_score NUMERIC;
  activity_score NUMERIC;
BEGIN
  days_since_update := EXTRACT(EPOCH FROM (NOW() - updated_at)) / 86400;
  
  -- Popularity (40% of score, max 40 points)
  popularity_score := LEAST(40, (stars * 0.1) + (forks * 0.2));
  
  -- Quality indicators (30% of score, max 30 points) 
  quality_score := 0;
  quality_score := quality_score + (CASE WHEN has_readme THEN 15 ELSE 0 END);
  quality_score := quality_score + (CASE WHEN has_license THEN 10 ELSE 0 END);
  quality_score := quality_score + (CASE WHEN open_issues <= 5 THEN 5 ELSE 0 END);
  
  -- Activity (30% of score, max 30 points)
  activity_score := CASE 
    WHEN days_since_update <= 30 THEN 30
    WHEN days_since_update <= 90 THEN 20
    WHEN days_since_update <= 180 THEN 10
    WHEN days_since_update <= 365 THEN 5
    ELSE 0
  END;
  
  score := popularity_score + quality_score + activity_score;
  
  RETURN GREATEST(0, LEAST(100, score)); -- Cap at 100
END;
-Force LANGUAGE plpgsql;

-- Trigger to auto-update quality score
CREATE OR REPLACE FUNCTION update_repository_quality_trigger()
RETURNS TRIGGER AS -Force
BEGIN
  NEW.quality_score := calculate_repository_quality_score(
    NEW.stars,
    NEW.forks,
    NEW.open_issues,
    NEW.has_readme,
    NEW.has_license,
    NEW.github_updated_at,
    NEW.github_created_at
  );
  NEW.updated_at := NOW();
  RETURN NEW;
END;
-Force LANGUAGE plpgsql;

CREATE TRIGGER update_repository_quality
  BEFORE INSERT OR UPDATE ON repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_repository_quality_trigger();

-- ===================================
-- PHASE 5: ROW LEVEL SECURITY
-- ===================================

-- Enable RLS on new tables
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_discovery_queue ENABLE ROW LEVEL SECURITY;

-- Public read access to repositories
CREATE POLICY "Repositories are publicly readable" ON repositories 
  FOR SELECT USING (is_active = TRUE);

-- Admin management policies
CREATE POLICY "Admins can manage repositories" ON repositories 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Categories are publicly readable" ON repository_categories 
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Category mappings are publicly readable" ON repository_category_mappings 
  FOR SELECT USING (true);

-- User favorites policies
CREATE POLICY "Users can manage their repository favorites" ON repository_favorites 
  FOR ALL USING (auth.uid() = user_id);

-- Admin-only policies for management tables
CREATE POLICY "Admins can manage sync log" ON github_sync_log 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage discovery queue" ON repository_discovery_queue 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ===================================
-- PHASE 6: SEED REPOSITORY-FOCUSED CATEGORIES
-- ===================================

-- Insert repository-focused categories
INSERT INTO repository_categories (name, description, emoji, github_topics, keywords, display_order) VALUES
('Full-Stack Applications', 'Complete web applications ready to fork and customize', '', 
 ARRAY['nextjs', 'fullstack', 'web-app', 'saas'], 
 ARRAY['app', 'fullstack', 'saas', 'project', 'complete'], 1),

('Finance & Fintech', 'Personal finance, trading tools, and financial applications', '', 
 ARRAY['finance', 'fintech', 'trading', 'crypto', 'budget'], 
 ARRAY['finance', 'money', 'budget', 'trading', 'fintech', 'crypto'], 2),

('AI & Machine Learning', 'AI-powered applications, chatbots, and ML projects', '', 
 ARRAY['ai', 'machine-learning', 'chatbot', 'llm', 'openai'], 
 ARRAY['ai', 'ml', 'chatbot', 'openai', 'llm', 'gpt'], 3),

('Developer Tools', 'CLI tools, build tools, and developer productivity apps', '', 
 ARRAY['cli', 'developer-tools', 'productivity', 'build-tool'], 
 ARRAY['tool', 'cli', 'utility', 'dev', 'build'], 4),

('E-commerce & Business', 'Online stores, marketplaces, and business applications', '', 
 ARRAY['ecommerce', 'marketplace', 'business', 'shop'], 
 ARRAY['store', 'shop', 'business', 'commerce', 'marketplace'], 5),

('Data & Analytics', 'Dashboards, analytics tools, and data visualization', '', 
 ARRAY['dashboard', 'analytics', 'data-visualization', 'charts'], 
 ARRAY['dashboard', 'chart', 'analytics', 'data', 'visualization'], 6),

('Content & Media', 'CMS, blogs, documentation, and media management', '', 
 ARRAY['cms', 'blog', 'content-management', 'documentation'], 
 ARRAY['blog', 'cms', 'content', 'media', 'docs'], 7),

('Mobile & Cross-Platform', 'React Native, Flutter, and mobile applications', '', 
 ARRAY['react-native', 'flutter', 'mobile', 'ios', 'android'], 
 ARRAY['mobile', 'ios', 'android', 'app', 'react-native'], 8),

('Games & Entertainment', 'Games, interactive apps, and entertainment projects', '', 
 ARRAY['game', 'entertainment', 'interactive', 'canvas'], 
 ARRAY['game', 'fun', 'interactive', 'entertainment', 'gaming'], 9),

('Education & Learning', 'Educational platforms, courses, and learning tools', '', 
 ARRAY['education', 'learning', 'tutorial', 'course'], 
 ARRAY['education', 'learn', 'course', 'tutorial', 'teaching'], 10);

-- ===================================
-- PHASE 7: POPULATE DISCOVERY QUEUE WITH QUALITY REPOSITORIES
-- ===================================

-- Add high-quality repositories to discovery queue
INSERT INTO repository_discovery_queue (github_url, source, priority, metadata) VALUES

-- Finance Apps (High Priority)
('https://github.com/ibelick/zola', 'manual', 9, '{"category": "Developer Tools", "description": "A tool for cloning UI from websites"}'),
('https://github.com/maybe-finance/maybe', 'manual', 10, '{"category": "Finance & Fintech", "description": "Personal finance and wealth management"}'),
('https://github.com/actual-app/actual', 'manual', 9, '{"category": "Finance & Fintech", "description": "Privacy-focused budget tracker"}'),
('https://github.com/firefly-iii/firefly-iii', 'manual', 8, '{"category": "Finance & Fintech", "description": "Personal finances manager"}'),

-- AI Applications
('https://github.com/lobehub/lobe-chat', 'manual', 9, '{"category": "AI & Machine Learning", "description": "Modern AI chat framework"}'),
('https://github.com/mckaywrigley/chatbot-ui', 'manual', 8, '{"category": "AI & Machine Learning", "description": "ChatGPT clone"}'),
('https://github.com/danny-avila/LibreChat', 'manual', 8, '{"category": "AI & Machine Learning", "description": "Enhanced ChatGPT clone"}'),

-- Full-Stack Apps
('https://github.com/calcom/cal.com', 'manual', 9, '{"category": "Full-Stack Applications", "description": "Scheduling infrastructure"}'),
('https://github.com/vercel/nextjs-subscription-payments', 'manual', 8, '{"category": "Full-Stack Applications", "description": "SaaS starter with payments"}'),
('https://github.com/documenso/documenso', 'manual', 8, '{"category": "Full-Stack Applications", "description": "DocuSign alternative"}'),

-- E-commerce
('https://github.com/medusajs/medusa', 'manual', 8, '{"category": "E-commerce & Business", "description": "Shopify alternative"}'),
('https://github.com/vendure-ecommerce/vendure', 'manual', 7, '{"category": "E-commerce & Business", "description": "E-commerce framework"}'),

-- Developer Tools
('https://github.com/trpc/trpc', 'manual', 8, '{"category": "Developer Tools", "description": "End-to-end typesafe APIs"}'),
('https://github.com/withastro/astro', 'manual', 8, '{"category": "Developer Tools", "description": "Modern static site builder"}'),

-- Analytics & Data
('https://github.com/plausible/analytics', 'manual', 8, '{"category": "Data & Analytics", "description": "Privacy-focused analytics"}'),
('https://github.com/PostHog/posthog', 'manual', 8, '{"category": "Data & Analytics", "description": "Product analytics platform"}');

-- ===================================
-- PHASE 8: MIGRATION PLAN SUMMARY
-- ===================================

-- Display migration summary
SELECT 'MIGRATION SUMMARY' as step, 'Repository-focused database created' as description
UNION ALL
SELECT 'NEXT STEPS', '1. Run GitHub API service to populate repositories table'
UNION ALL  
SELECT 'NEXT STEPS', '2. Update frontend to show repository data (stars, forks, etc.)'
UNION ALL
SELECT 'NEXT STEPS', '3. Update AI system to focus on repositories instead of UI libraries'
UNION ALL
SELECT 'NEXT STEPS', '4. Create admin interface for repository management'
UNION ALL
SELECT 'RESOURCES', 'Keep existing resources table for now (backward compatibility)'
UNION ALL
SELECT 'RESOURCES', 'Gradually deprecate UI libraries in favor of repositories';

COMMIT;

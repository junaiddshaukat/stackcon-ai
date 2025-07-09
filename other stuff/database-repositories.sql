-- ===================================
-- GitHub Repository-Focused Database Schema
-- Replaces UI library focus with hackable GitHub repositories
-- ===================================

-- 1. Create new repositories table (replacing resources for repos)
CREATE TABLE IF NOT EXISTS repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- GitHub Data
  github_id BIGINT UNIQUE NOT NULL,
  github_owner TEXT NOT NULL,
  github_repo TEXT NOT NULL,
  github_full_name TEXT NOT NULL UNIQUE, -- owner/repo
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  repo_url TEXT NOT NULL UNIQUE,
  homepage_url TEXT,
  
  -- GitHub Metrics
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  
  -- Repository Details
  primary_language TEXT,
  languages JSONB DEFAULT '{}', -- {language: bytes}
  topics TEXT[] DEFAULT '{}',
  license TEXT,
  
  -- Dates
  github_created_at TIMESTAMP WITH TIME ZONE,
  github_updated_at TIMESTAMP WITH TIME ZONE,
  github_pushed_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_fork BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_disabled BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'public',
  
  -- Enhanced Metadata for AI
  use_cases TEXT[] DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  project_type TEXT, -- 'fullstack-app', 'frontend-app', 'tool', 'library', 'api', 'mobile-app'
  build_tools TEXT[] DEFAULT '{}',
  
  -- Content
  readme_content TEXT,
  package_json JSONB,
  
  -- Quality Metrics
  has_readme BOOLEAN DEFAULT FALSE,
  has_license BOOLEAN DEFAULT FALSE,
  has_contributing BOOLEAN DEFAULT FALSE,
  has_wiki BOOLEAN DEFAULT FALSE,
  has_pages BOOLEAN DEFAULT FALSE,
  
  -- StackCon Metadata
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  quality_score NUMERIC DEFAULT 0,
  last_github_sync TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_github_repo UNIQUE(github_owner, github_repo)
);

-- 2. Create repository categories
CREATE TABLE IF NOT EXISTS repository_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  emoji TEXT,
  github_topics TEXT[], -- GitHub topics that map to this category
  keywords TEXT[], -- Search keywords
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Repository category mappings (many-to-many)
CREATE TABLE IF NOT EXISTS repository_category_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES repository_categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
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

-- 5. Repository discovery and indexing queue
CREATE TABLE IF NOT EXISTS repository_discovery_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  github_url TEXT NOT NULL UNIQUE,
  source TEXT, -- 'manual', 'github_search', 'trending', 'user_suggestion'
  priority INTEGER DEFAULT 5, -- 1-10
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Search history for repositories
CREATE TABLE IF NOT EXISTS repository_search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- INDEXES
-- ===================================

-- Repository indexes
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

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_repo_categories_topics ON repository_categories USING GIN(github_topics);
CREATE INDEX IF NOT EXISTS idx_repo_favorites_user ON repository_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_repo_search_history_user ON repository_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_repo_discovery_status ON repository_discovery_queue(status);

-- ===================================
-- FUNCTIONS
-- ===================================

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
  age_bonus NUMERIC := 0;
BEGIN
  days_since_update := EXTRACT(EPOCH FROM (NOW() - updated_at)) / 86400;
  
  -- Star score (max 40 points)
  score := score + LEAST(40, stars * 0.1);
  
  -- Fork score (max 20 points)
  score := score + LEAST(20, forks * 0.2);
  
  -- Activity score (max 20 points)
  score := score + CASE 
    WHEN days_since_update <= 30 THEN 20
    WHEN days_since_update <= 90 THEN 15
    WHEN days_since_update <= 180 THEN 10
    WHEN days_since_update <= 365 THEN 5
    ELSE 0
  END;
  
  -- Quality indicators (max 15 points)
  score := score + (CASE WHEN has_readme THEN 8 ELSE 0 END);
  score := score + (CASE WHEN has_license THEN 7 ELSE 0 END);
  
  -- Issue management (max 5 points)
  score := score + CASE 
    WHEN open_issues = 0 THEN 5
    WHEN open_issues <= 5 THEN 3
    WHEN open_issues <= 20 THEN 1
    ELSE 0
  END;
  
  RETURN GREATEST(0, score);
END;
-Force LANGUAGE plpgsql;

-- Function to extract GitHub info from URL
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
  
  url_parts := string_to_array(clean_url, '/');
  
  IF array_length(url_parts, 1) >= 2 THEN
    owner := url_parts[1];
    repo := url_parts[2];
    RETURN NEXT;
  END IF;
  
  RETURN;
END;
-Force LANGUAGE plpgsql;

-- ===================================
-- ROW LEVEL SECURITY
-- ===================================

ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_category_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_discovery_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_search_history ENABLE ROW LEVEL SECURITY;

-- Public read access to repositories
CREATE POLICY "Repositories are publicly readable" ON repositories FOR SELECT USING (is_active = TRUE);

-- Admin can manage repositories
CREATE POLICY "Admins can manage repositories" ON repositories FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Public read access to categories
CREATE POLICY "Categories are publicly readable" ON repository_categories FOR SELECT USING (true);
CREATE POLICY "Category mappings are publicly readable" ON repository_category_mappings FOR SELECT USING (true);

-- User favorites
CREATE POLICY "Users can manage their favorites" ON repository_favorites FOR ALL USING (auth.uid() = user_id);

-- Search history
CREATE POLICY "Users can manage their search history" ON repository_search_history FOR ALL USING (auth.uid() = user_id);

-- Admin can manage discovery queue
CREATE POLICY "Admins can manage discovery queue" ON repository_discovery_queue FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- ===================================
-- TRIGGERS
-- ===================================

-- Update quality score trigger
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
-- SEED DATA
-- ===================================

-- Insert repository categories
INSERT INTO repository_categories (name, description, emoji, github_topics, keywords, display_order) VALUES
('Full-Stack Apps', 'Complete applications ready to fork and customize', '', ARRAY['nextjs', 'fullstack', 'web-app'], ARRAY['app', 'fullstack', 'saas', 'project'], 1),
('Finance & Fintech', 'Financial apps, trading tools, and money management', '', ARRAY['finance', 'fintech', 'trading', 'crypto'], ARRAY['finance', 'money', 'budget', 'trading'], 2),
('AI & Machine Learning', 'AI-powered applications and ML projects', '', ARRAY['ai', 'machine-learning', 'chatbot', 'llm'], ARRAY['ai', 'ml', 'chatbot', 'openai'], 3),
('Developer Tools', 'CLI tools, dev utilities, and productivity apps', '', ARRAY['cli', 'developer-tools', 'productivity'], ARRAY['tool', 'cli', 'utility', 'dev'], 4),
('E-commerce & Business', 'Online stores, marketplaces, and business apps', '', ARRAY['ecommerce', 'marketplace', 'business'], ARRAY['store', 'shop', 'business', 'commerce'], 5),
('Data & Analytics', 'Dashboards, analytics, and data visualization', '', ARRAY['dashboard', 'analytics', 'data-visualization'], ARRAY['dashboard', 'chart', 'analytics', 'data'], 6),
('Content & Media', 'CMS, blogs, and media management apps', '', ARRAY['cms', 'blog', 'content-management'], ARRAY['blog', 'cms', 'content', 'media'], 7),
('Mobile & Cross-Platform', 'React Native, Flutter, and mobile apps', '', ARRAY['react-native', 'flutter', 'mobile'], ARRAY['mobile', 'ios', 'android', 'app'], 8),
('Games & Entertainment', 'Games, interactive apps, and entertainment', '', ARRAY['game', 'entertainment', 'interactive'], ARRAY['game', 'fun', 'interactive', 'entertainment'], 9),
('Education & Learning', 'Educational apps and learning platforms', '', ARRAY['education', 'learning', 'tutorial'], ARRAY['education', 'learn', 'course', 'tutorial'], 10);

-- Add some initial repositories to discovery queue
INSERT INTO repository_discovery_queue (github_url, source, priority, metadata) VALUES
('https://github.com/ibelick/zola', 'manual', 9, '{"description": "A tool for cloning UI from websites", "category": "Developer Tools"}'),
('https://github.com/maybe-finance/maybe', 'manual', 9, '{"description": "Personal finance and wealth management app", "category": "Finance & Fintech"}'),
('https://github.com/actual-app/actual', 'manual', 9, '{"description": "Privacy-focused budget tracker", "category": "Finance & Fintech"}'),
('https://github.com/firefly-iii/firefly-iii', 'manual', 8, '{"description": "Personal finances manager", "category": "Finance & Fintech"}'),
('https://github.com/lobehub/lobe-chat', 'manual', 9, '{"description": "Modern AI chat framework", "category": "AI & Machine Learning"}'),
('https://github.com/mckaywrigley/chatbot-ui', 'manual', 8, '{"description": "Chatbot UI for OpenAI models", "category": "AI & Machine Learning"}'),
('https://github.com/shadcn-ui/ui', 'manual', 7, '{"description": "Beautifully designed components", "category": "Developer Tools"}'),
('https://github.com/calcom/cal.com', 'manual', 9, '{"description": "Scheduling infrastructure for everyone", "category": "Full-Stack Apps"}'),
('https://github.com/resend/react-email', 'manual', 8, '{"description": "Build emails using React components", "category": "Developer Tools"}'),
('https://github.com/vercel/nextjs-subscription-payments', 'manual', 8, '{"description": "Clone, deploy, and monetize SaaS", "category": "Full-Stack Apps"}');

COMMIT;

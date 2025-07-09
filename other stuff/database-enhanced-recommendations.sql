-- Enhanced Database Schema for AI-Powered Resource Recommendations
-- This extends the existing resources table with intelligent recommendation capabilities

-- 1. Add enhanced columns to existing resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS use_cases TEXT[];
ALTER TABLE resources ADD COLUMN IF NOT EXISTS problem_domains TEXT[];
ALTER TABLE resources ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE resources ADD COLUMN IF NOT EXISTS implementation_time TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS project_types TEXT[];
ALTER TABLE resources ADD COLUMN IF NOT EXISTS tech_stack_role TEXT CHECK (tech_stack_role IN ('frontend', 'backend', 'database', 'deployment', 'testing', 'ai', 'design', 'tool'));

-- 2. Create resource collections for curated recommendations
CREATE TABLE IF NOT EXISTS resource_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  use_case TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_time TEXT,
  tags TEXT[],
  resource_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create resource relationships for smart suggestions
CREATE TABLE IF NOT EXISTS resource_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_a UUID REFERENCES resources(id) ON DELETE CASCADE,
  resource_b UUID REFERENCES resources(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('works_with', 'alternative_to', 'requires', 'enhances', 'competes_with')),
  strength FLOAT CHECK (strength >= 0.0 AND strength <= 1.0),
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create intent-based recommendation mappings
CREATE TABLE IF NOT EXISTS intent_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_pattern TEXT NOT NULL,
  keywords TEXT[],
  recommended_resources UUID[],
  priority_order INTEGER[],
  context_requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create user recommendation history for learning
CREATE TABLE IF NOT EXISTS recommendation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_query TEXT NOT NULL,
  extracted_intent JSONB,
  recommended_resources UUID[],
  user_feedback JSONB,
  success_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_use_cases ON resources USING GIN(use_cases);
CREATE INDEX IF NOT EXISTS idx_resources_problem_domains ON resources USING GIN(problem_domains);
CREATE INDEX IF NOT EXISTS idx_resources_project_types ON resources USING GIN(project_types);
CREATE INDEX IF NOT EXISTS idx_resources_difficulty ON resources(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_resource_relationships_type ON resource_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_intent_mappings_keywords ON intent_mappings USING GIN(keywords);

-- 7. Update existing resources with enhanced metadata (sample data)
UPDATE resources SET 
  use_cases = ARRAY['ui-cloning', 'web-scraping', 'data-extraction'],
  problem_domains = ARRAY['automation', 'frontend'],
  difficulty_level = 'intermediate',
  implementation_time = '2-4 hours',
  project_types = ARRAY['clone-app', 'scraping-tool', 'automation'],
  tech_stack_role = 'tool'
WHERE name = 'Puppeteer';

UPDATE resources SET 
  use_cases = ARRAY['ui-development', 'rapid-prototyping', 'component-library'],
  problem_domains = ARRAY['frontend', 'design'],
  difficulty_level = 'beginner',
  implementation_time = '30 minutes',
  project_types = ARRAY['web-app', 'dashboard', 'clone-app'],
  tech_stack_role = 'frontend'
WHERE name = 'shadcn/ui';

UPDATE resources SET 
  use_cases = ARRAY['web-development', 'full-stack', 'ssr'],
  problem_domains = ARRAY['frontend', 'backend'],
  difficulty_level = 'intermediate',
  implementation_time = '1-2 hours',
  project_types = ARRAY['web-app', 'dashboard', 'saas', 'clone-app'],
  tech_stack_role = 'frontend'
WHERE name LIKE '%Next.js%' OR name LIKE '%Nextjs%';

UPDATE resources SET 
  use_cases = ARRAY['styling', 'responsive-design', 'ui-development'],
  problem_domains = ARRAY['frontend', 'design'],
  difficulty_level = 'beginner',
  implementation_time = '1 hour',
  project_types = ARRAY['web-app', 'dashboard', 'landing-page', 'clone-app'],
  tech_stack_role = 'design'
WHERE name = 'Tailwind CSS';

-- 8. Insert curated collections for common use cases
INSERT INTO resource_collections (name, description, use_case, difficulty_level, estimated_time, tags, resource_ids) VALUES
(
  'UI Cloning Toolkit',
  'Complete stack for cloning and recreating website interfaces',
  'ui-cloning',
  'intermediate',
  '4-6 hours',
  ARRAY['ui-cloning', 'scraping', 'frontend', 'automation'],
  ARRAY[
    (SELECT id FROM resources WHERE name = 'Puppeteer' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'shadcn/ui' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'Tailwind CSS' LIMIT 1),
    (SELECT id FROM resources WHERE name LIKE '%Next.js%' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'React' LIMIT 1)
  ]
),
(
  'AI Chatbot Starter Pack',
  'Everything needed to build an intelligent chatbot application',
  'ai-chatbot',
  'beginner',
  '2-4 hours',
  ARRAY['ai', 'chatbot', 'llm', 'frontend'],
  ARRAY[
    (SELECT id FROM resources WHERE name = 'OpenAI Node' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'LangChain' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'Vercel AI SDK' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'shadcn/ui' LIMIT 1),
    (SELECT id FROM resources WHERE name LIKE '%Next.js%' LIMIT 1)
  ]
),
(
  'Dashboard Builder Kit',
  'Modern tools for creating data-rich dashboards and admin panels',
  'dashboard-app',
  'intermediate',
  '6-8 hours',
  ARRAY['dashboard', 'charts', 'data-visualization', 'admin'],
  ARRAY[
    (SELECT id FROM resources WHERE name = 'Recharts' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'shadcn/ui' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'Tailwind CSS' LIMIT 1),
    (SELECT id FROM resources WHERE name LIKE '%Next.js%' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'Prisma' LIMIT 1)
  ]
),
(
  'E-commerce Quick Start',
  'Ready-to-use components and tools for building online stores',
  'ecommerce-app',
  'advanced',
  '1-2 weeks',
  ARRAY['ecommerce', 'payments', 'inventory', 'frontend'],
  ARRAY[
    (SELECT id FROM resources WHERE name = 'Next.js Commerce' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'Stripe' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'Supabase' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'Tailwind CSS' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'shadcn/ui' LIMIT 1)
  ]
),
(
  'SaaS MVP Toolkit',
  'Complete toolkit for building SaaS applications with authentication and payments',
  'saas-app',
  'advanced',
  '2-3 weeks',
  ARRAY['saas', 'authentication', 'payments', 'subscriptions'],
  ARRAY[
    (SELECT id FROM resources WHERE name LIKE '%Nextjs Saas%' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'NextAuth.js' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'Stripe' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'Supabase' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'shadcn/ui' LIMIT 1)
  ]
);

-- 9. Insert common intent mappings
INSERT INTO intent_mappings (intent_pattern, keywords, recommended_resources, priority_order, context_requirements) VALUES
(
  'ui-cloning',
  ARRAY['clone', 'ui', 'copy', 'recreate', 'scrape', 'website', 'interface'],
  ARRAY[
    (SELECT id FROM resources WHERE name = 'Puppeteer' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'shadcn/ui' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'Tailwind CSS' LIMIT 1)
  ],
  ARRAY[1, 2, 3],
  '{"requires_scraping": true, "frontend_focused": true}'::jsonb
),
(
  'ai-chatbot',
  ARRAY['chatbot', 'ai', 'chat', 'conversation', 'llm', 'openai', 'gpt'],
  ARRAY[
    (SELECT id FROM resources WHERE name = 'Vercel AI SDK' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'OpenAI Node' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'LangChain' LIMIT 1)
  ],
  ARRAY[1, 2, 3],
  '{"requires_ai": true, "backend_needed": true}'::jsonb
),
(
  'dashboard',
  ARRAY['dashboard', 'admin', 'panel', 'analytics', 'charts', 'data', 'visualization'],
  ARRAY[
    (SELECT id FROM resources WHERE name = 'Recharts' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'shadcn/ui' LIMIT 1),
    (SELECT id FROM resources WHERE name = 'D3.js' LIMIT 1)
  ],
  ARRAY[1, 2, 3],
  '{"data_visualization": true, "admin_interface": true}'::jsonb
);

-- 10. Insert resource relationships for smart suggestions
INSERT INTO resource_relationships (resource_a, resource_b, relationship_type, strength, context) VALUES
(
  (SELECT id FROM resources WHERE name LIKE '%Next.js%' LIMIT 1),
  (SELECT id FROM resources WHERE name = 'Tailwind CSS' LIMIT 1),
  'works_with',
  0.95,
  'Perfect combination for modern web development'
),
(
  (SELECT id FROM resources WHERE name = 'shadcn/ui' LIMIT 1),
  (SELECT id FROM resources WHERE name = 'Tailwind CSS' LIMIT 1),
  'requires',
  1.0,
  'shadcn/ui is built on top of Tailwind CSS'
),
(
  (SELECT id FROM resources WHERE name = 'Puppeteer' LIMIT 1),
  (SELECT id FROM resources WHERE name = 'Playwright' LIMIT 1),
  'alternative_to',
  0.85,
  'Both are excellent for browser automation and scraping'
),
(
  (SELECT id FROM resources WHERE name = 'Vercel AI SDK' LIMIT 1),
  (SELECT id FROM resources WHERE name = 'OpenAI Node' LIMIT 1),
  'works_with',
  0.9,
  'AI SDK provides React hooks for OpenAI integration'
);

-- 11. Create functions for AI-powered recommendations
CREATE OR REPLACE FUNCTION get_recommendations_by_intent(
  user_query TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  resource_id UUID,
  resource_name TEXT,
  resource_description TEXT,
  relevance_score FLOAT,
  reasoning TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.description,
    CASE 
      WHEN position(lower(user_query) in lower(r.name)) > 0 THEN 1.0
      WHEN r.tags && string_to_array(lower(user_query), ' ') THEN 0.8
      WHEN r.use_cases && string_to_array(lower(user_query), ' ') THEN 0.7
      ELSE 0.5
    END as relevance_score,
    CONCAT('Matches your need for: ', array_to_string(r.use_cases, ', ')) as reasoning
  FROM resources r
  WHERE 
    lower(r.name) LIKE '%' || lower(user_query) || '%'
    OR r.tags && string_to_array(lower(user_query), ' ')
    OR r.use_cases && string_to_array(lower(user_query), ' ')
    OR lower(r.description) LIKE '%' || lower(user_query) || '%'
  ORDER BY relevance_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Create function to get curated collections by use case
CREATE OR REPLACE FUNCTION get_collection_by_use_case(
  use_case_query TEXT
)
RETURNS TABLE (
  collection_name TEXT,
  collection_description TEXT,
  difficulty TEXT,
  estimated_time TEXT,
  resource_names TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.name,
    rc.description,
    rc.difficulty_level,
    rc.estimated_time,
    ARRAY(
      SELECT r.name 
      FROM resources r 
      WHERE r.id = ANY(rc.resource_ids)
    ) as resource_names
  FROM resource_collections rc
  WHERE 
    lower(rc.use_case) LIKE '%' || lower(use_case_query) || '%'
    OR rc.tags && string_to_array(lower(use_case_query), ' ')
  ORDER BY rc.name;
END;
$$ LANGUAGE plpgsql;

-- 13. Create view for easy querying
CREATE OR REPLACE VIEW enhanced_resources AS
SELECT 
  r.*,
  COALESCE(
    ARRAY(
      SELECT rr.resource_b::text 
      FROM resource_relationships rr 
      WHERE rr.resource_a = r.id AND rr.relationship_type = 'works_with'
    ), 
    ARRAY[]::text[]
  ) as works_with,
  COALESCE(
    ARRAY(
      SELECT res.name 
      FROM resource_relationships rr 
      JOIN resources res ON res.id = rr.resource_b
      WHERE rr.resource_a = r.id AND rr.relationship_type = 'alternative_to'
    ), 
    ARRAY[]::text[]
  ) as alternatives
FROM resources r;

-- Verification queries
SELECT 'Enhanced schema created successfully' AS status;
SELECT COUNT(*) as total_resources FROM resources;
SELECT COUNT(*) as total_collections FROM resource_collections;
SELECT COUNT(*) as total_relationships FROM resource_relationships; 
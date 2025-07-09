-- Update Existing Resources for AI Search Compatibility
-- This script adds basic metadata to existing resources without changing the schema

-- First, let's add the new columns if they don't exist (safe to run multiple times)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS use_cases TEXT[];
ALTER TABLE resources ADD COLUMN IF NOT EXISTS problem_domains TEXT[];
ALTER TABLE resources ADD COLUMN IF NOT EXISTS difficulty_level TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS implementation_time TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS tech_stack_role TEXT;

-- Update React-related resources
UPDATE resources SET 
  use_cases = ARRAY['ui-development', 'web-app', 'frontend'],
  problem_domains = ARRAY['frontend'],
  difficulty_level = 'intermediate',
  implementation_time = '1-2 hours',
  tech_stack_role = 'frontend'
WHERE name ILIKE '%react%' AND use_cases IS NULL;

-- Update Next.js resources
UPDATE resources SET 
  use_cases = ARRAY['web-app', 'ssr', 'full-stack'],
  problem_domains = ARRAY['frontend', 'backend'],
  difficulty_level = 'intermediate',
  implementation_time = '2-4 hours',
  tech_stack_role = 'frontend'
WHERE name ILIKE '%next%' AND use_cases IS NULL;

-- Update Vue resources
UPDATE resources SET 
  use_cases = ARRAY['ui-development', 'web-app', 'spa'],
  problem_domains = ARRAY['frontend'],
  difficulty_level = 'intermediate',
  implementation_time = '1-2 hours',
  tech_stack_role = 'frontend'
WHERE name ILIKE '%vue%' AND use_cases IS NULL;

-- Update Angular resources
UPDATE resources SET 
  use_cases = ARRAY['enterprise-app', 'spa', 'web-app'],
  problem_domains = ARRAY['frontend'],
  difficulty_level = 'advanced',
  implementation_time = '4-8 hours',
  tech_stack_role = 'frontend'
WHERE name ILIKE '%angular%' AND use_cases IS NULL;

-- Update CSS/Styling resources
UPDATE resources SET 
  use_cases = ARRAY['styling', 'ui-design', 'responsive'],
  problem_domains = ARRAY['design'],
  difficulty_level = 'beginner',
  implementation_time = '30 minutes',
  tech_stack_role = 'design'
WHERE (name ILIKE '%css%' OR name ILIKE '%tailwind%' OR name ILIKE '%bootstrap%' OR name ILIKE '%style%') AND use_cases IS NULL;

-- Update UI component libraries
UPDATE resources SET 
  use_cases = ARRAY['ui-components', 'design-system', 'rapid-prototyping'],
  problem_domains = ARRAY['frontend', 'design'],
  difficulty_level = 'beginner',
  implementation_time = '1 hour',
  tech_stack_role = 'frontend'
WHERE resource_type = 'ui_library' AND use_cases IS NULL;

-- Update database resources
UPDATE resources SET 
  use_cases = ARRAY['data-storage', 'backend', 'api'],
  problem_domains = ARRAY['database', 'backend'],
  difficulty_level = 'intermediate',
  implementation_time = '2-4 hours',
  tech_stack_role = 'database'
WHERE (name ILIKE '%database%' OR name ILIKE '%postgres%' OR name ILIKE '%mongo%' OR name ILIKE '%prisma%' OR name ILIKE '%supabase%') AND use_cases IS NULL;

-- Update AI/ML resources
UPDATE resources SET 
  use_cases = ARRAY['ai-chatbot', 'machine-learning', 'ai-integration'],
  problem_domains = ARRAY['ai'],
  difficulty_level = 'intermediate',
  implementation_time = '2-6 hours',
  tech_stack_role = 'ai'
WHERE (name ILIKE '%ai%' OR name ILIKE '%openai%' OR name ILIKE '%gpt%' OR name ILIKE '%chatbot%' OR name ILIKE '%langchain%') AND use_cases IS NULL;

-- Update testing resources
UPDATE resources SET 
  use_cases = ARRAY['testing', 'quality-assurance', 'automation'],
  problem_domains = ARRAY['tools'],
  difficulty_level = 'intermediate',
  implementation_time = '1-3 hours',
  tech_stack_role = 'tools'
WHERE (name ILIKE '%test%' OR name ILIKE '%jest%' OR name ILIKE '%cypress%' OR name ILIKE '%playwright%') AND use_cases IS NULL;

-- Update deployment/hosting resources
UPDATE resources SET 
  use_cases = ARRAY['deployment', 'hosting', 'devops'],
  problem_domains = ARRAY['deployment'],
  difficulty_level = 'intermediate',
  implementation_time = '1-2 hours',
  tech_stack_role = 'deployment'
WHERE (name ILIKE '%vercel%' OR name ILIKE '%netlify%' OR name ILIKE '%aws%' OR name ILIKE '%docker%' OR name ILIKE '%deploy%') AND use_cases IS NULL;

-- Update animation/motion resources
UPDATE resources SET 
  use_cases = ARRAY['animations', 'ui-effects', 'user-experience'],
  problem_domains = ARRAY['frontend', 'design'],
  difficulty_level = 'intermediate',
  implementation_time = '1-2 hours',
  tech_stack_role = 'frontend'
WHERE (name ILIKE '%motion%' OR name ILIKE '%animation%' OR name ILIKE '%framer%' OR name ILIKE '%lottie%') AND use_cases IS NULL;

-- Update form libraries
UPDATE resources SET 
  use_cases = ARRAY['forms', 'user-input', 'validation'],
  problem_domains = ARRAY['frontend'],
  difficulty_level = 'beginner',
  implementation_time = '1-2 hours',
  tech_stack_role = 'frontend'
WHERE (name ILIKE '%form%' OR name ILIKE '%formik%' OR name ILIKE '%hook form%') AND use_cases IS NULL;

-- Update chart/visualization resources
UPDATE resources SET 
  use_cases = ARRAY['dashboard', 'data-visualization', 'charts'],
  problem_domains = ARRAY['frontend'],
  difficulty_level = 'intermediate',
  implementation_time = '2-4 hours',
  tech_stack_role = 'frontend'
WHERE (name ILIKE '%chart%' OR name ILIKE '%d3%' OR name ILIKE '%recharts%' OR name ILIKE '%visualization%') AND use_cases IS NULL;

-- Update state management
UPDATE resources SET 
  use_cases = ARRAY['state-management', 'data-flow', 'app-architecture'],
  problem_domains = ARRAY['frontend'],
  difficulty_level = 'intermediate',
  implementation_time = '2-3 hours',
  tech_stack_role = 'frontend'
WHERE (name ILIKE '%redux%' OR name ILIKE '%zustand%' OR name ILIKE '%context%' OR name ILIKE '%state%') AND use_cases IS NULL;

-- Update authentication resources
UPDATE resources SET 
  use_cases = ARRAY['authentication', 'user-management', 'security'],
  problem_domains = ARRAY['backend'],
  difficulty_level = 'intermediate',
  implementation_time = '2-4 hours',
  tech_stack_role = 'backend'
WHERE (name ILIKE '%auth%' OR name ILIKE '%login%' OR name ILIKE '%clerk%' OR name ILIKE '%nextauth%') AND use_cases IS NULL;

-- Update API/backend frameworks
UPDATE resources SET 
  use_cases = ARRAY['api-development', 'backend', 'server'],
  problem_domains = ARRAY['backend'],
  difficulty_level = 'intermediate',
  implementation_time = '3-6 hours',
  tech_stack_role = 'backend'
WHERE (name ILIKE '%express%' OR name ILIKE '%fastify%' OR name ILIKE '%nest%' OR name ILIKE '%api%') AND use_cases IS NULL;

-- Update remaining resources with generic values
UPDATE resources SET 
  use_cases = ARRAY['web-development', 'general'],
  problem_domains = ARRAY['tools'],
  difficulty_level = 'intermediate',
  implementation_time = '1-4 hours',
  tech_stack_role = 'tools'
WHERE use_cases IS NULL;

-- Verify the update
SELECT 
  COUNT(*) as total_resources,
  COUNT(use_cases) as resources_with_use_cases,
  COUNT(difficulty_level) as resources_with_difficulty,
  COUNT(tech_stack_role) as resources_with_role
FROM resources;

-- Show sample of updated resources
SELECT name, use_cases, difficulty_level, tech_stack_role 
FROM resources 
WHERE use_cases IS NOT NULL 
LIMIT 10; 
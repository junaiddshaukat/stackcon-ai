-- Simplified Database Update for AI Search
-- Run each section separately in Supabase SQL editor

-- STEP 1: Add columns (run this first)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS use_cases TEXT[];
ALTER TABLE resources ADD COLUMN IF NOT EXISTS problem_domains TEXT[];
ALTER TABLE resources ADD COLUMN IF NOT EXISTS difficulty_level TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS implementation_time TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS tech_stack_role TEXT;

-- STEP 2: Update React resources (run this second)
UPDATE resources SET 
  use_cases = '{ui-development,web-app,frontend}',
  problem_domains = '{frontend}',
  difficulty_level = 'intermediate',
  implementation_time = '1-2 hours',
  tech_stack_role = 'frontend'
WHERE name ILIKE '%react%' AND use_cases IS NULL;

-- STEP 3: Update Next.js resources
UPDATE resources SET 
  use_cases = '{web-app,ssr,full-stack}',
  problem_domains = '{frontend,backend}',
  difficulty_level = 'intermediate',
  implementation_time = '2-4 hours',
  tech_stack_role = 'frontend'
WHERE name ILIKE '%next%' AND use_cases IS NULL;

-- STEP 4: Update UI libraries
UPDATE resources SET 
  use_cases = '{ui-components,design-system}',
  problem_domains = '{frontend,design}',
  difficulty_level = 'beginner',
  implementation_time = '1 hour',
  tech_stack_role = 'frontend'
WHERE resource_type = 'ui_library' AND use_cases IS NULL;

-- STEP 5: Update CSS/Styling
UPDATE resources SET 
  use_cases = '{styling,ui-design,responsive}',
  problem_domains = '{design}',
  difficulty_level = 'beginner',
  implementation_time = '30 minutes',
  tech_stack_role = 'design'
WHERE (name ILIKE '%css%' OR name ILIKE '%tailwind%' OR name ILIKE '%style%') AND use_cases IS NULL;

-- STEP 6: Update AI resources
UPDATE resources SET 
  use_cases = '{ai-chatbot,machine-learning}',
  problem_domains = '{ai}',
  difficulty_level = 'intermediate',
  implementation_time = '2-6 hours',
  tech_stack_role = 'ai'
WHERE (name ILIKE '%ai%' OR name ILIKE '%openai%' OR name ILIKE '%chatbot%') AND use_cases IS NULL;

-- STEP 7: Update charts/dashboard
UPDATE resources SET 
  use_cases = '{dashboard,data-visualization,charts}',
  problem_domains = '{frontend}',
  difficulty_level = 'intermediate',
  implementation_time = '2-4 hours',
  tech_stack_role = 'frontend'
WHERE (name ILIKE '%chart%' OR name ILIKE '%d3%' OR name ILIKE '%visualization%') AND use_cases IS NULL;

-- STEP 8: Update all remaining resources
UPDATE resources SET 
  use_cases = '{web-development}',
  problem_domains = '{tools}',
  difficulty_level = 'intermediate',
  implementation_time = '1-4 hours',
  tech_stack_role = 'tools'
WHERE use_cases IS NULL;

-- STEP 9: Verify (run this last)
SELECT 
  COUNT(*) as total_resources,
  COUNT(use_cases) as resources_with_use_cases
FROM resources; 
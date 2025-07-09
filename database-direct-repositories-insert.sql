-- ===================================
-- DIRECT REPOSITORY INSERTION (NO QUEUE)
-- This script directly populates the repositories table with curated data
-- Much simpler approach - no GitHub API calls needed during initial setup
-- ===================================

-- First, ensure we have repository categories
INSERT INTO repository_categories (name, description, emoji, github_topics, keywords, display_order) VALUES
('Full-Stack Applications', 'Complete web applications ready to fork and customize', '🚀', 
 ARRAY['nextjs', 'fullstack', 'web-app', 'saas'], 
 ARRAY['app', 'fullstack', 'saas', 'project', 'complete'], 1),

('Finance & Fintech', 'Personal finance, trading tools, and financial applications', '💰', 
 ARRAY['finance', 'fintech', 'trading', 'crypto', 'budget'], 
 ARRAY['finance', 'money', 'budget', 'trading', 'fintech', 'crypto'], 2),

('AI & Machine Learning', 'AI tools, machine learning projects, and LLM applications', '🤖', 
 ARRAY['ai', 'machine-learning', 'llm', 'openai', 'tensorflow'], 
 ARRAY['ai', 'ml', 'artificial-intelligence', 'chat', 'llm'], 3),

('Developer Tools', 'Development utilities, CLI tools, and productivity apps', '🛠️', 
 ARRAY['cli', 'developer-tools', 'productivity', 'automation'], 
 ARRAY['tool', 'cli', 'developer', 'utility', 'framework'], 4),

('E-commerce & Business', 'Online stores, business applications, and CRM systems', '🛒', 
 ARRAY['ecommerce', 'business', 'crm', 'shop', 'commerce'], 
 ARRAY['ecommerce', 'shop', 'business', 'crm', 'store'], 5),

('Data & Analytics', 'Data visualization, analytics, and dashboard applications', '📊', 
 ARRAY['analytics', 'dashboard', 'visualization', 'data'], 
 ARRAY['analytics', 'data', 'dashboard', 'visualization', 'metrics'], 6),

('Content & Media', 'CMS, blogs, media platforms, and content management', '📝', 
 ARRAY['cms', 'blog', 'content', 'media', 'publishing'], 
 ARRAY['cms', 'blog', 'content', 'media', 'publishing'], 7),

('Mobile & Cross-Platform', 'Mobile apps, React Native, and cross-platform solutions', '📱', 
 ARRAY['mobile', 'react-native', 'flutter', 'cross-platform'], 
 ARRAY['mobile', 'app', 'react-native', 'flutter', 'ios', 'android'], 8),

('Games & Entertainment', 'Games, entertainment apps, and interactive experiences', '🎮', 
 ARRAY['game', 'entertainment', 'gaming', 'interactive'], 
 ARRAY['game', 'gaming', 'entertainment', 'interactive'], 9),

('Education & Learning', 'Educational platforms, learning management, and tutorials', '🎓', 
 ARRAY['education', 'learning', 'tutorial', 'course'], 
 ARRAY['education', 'learning', 'tutorial', 'course', 'teaching'], 10)

ON CONFLICT (name) DO NOTHING;

-- ===================================
-- DIRECT REPOSITORY INSERTION
-- All popular repositories with curated data
-- ===================================

INSERT INTO repositories (
  github_id, github_owner, github_repo, github_full_name, name, description, 
  repo_url, stars, forks, watchers, open_issues, primary_language, 
  topics, license, use_cases, tech_stack, difficulty_level, project_type,
  has_readme, has_license, quality_score, is_featured, is_active,
  github_created_at, github_updated_at, github_pushed_at
) VALUES

-- FINANCE & FINTECH
(123456789, 'maybe-finance', 'maybe', 'maybe-finance/maybe', 'maybe', 
 'The OS for your personal finances. Built with Next.js, Prisma, and Tailwind CSS.',
 'https://github.com/maybe-finance/maybe', 15420, 1250, 890, 45, 'TypeScript',
 ARRAY['finance', 'nextjs', 'prisma', 'tailwind', 'personal-finance'],
 'AGPL-3.0', ARRAY['personal finance', 'budget tracking', 'financial planning'],
 ARRAY['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS'], 'intermediate', 'fullstack-app',
 true, true, 92, true, true, '2022-03-15'::timestamp, '2024-01-15'::timestamp, '2024-01-10'::timestamp),

(234567890, 'firefly-iii', 'firefly-iii', 'firefly-iii/firefly-iii', 'firefly-iii',
 'Firefly III: a personal finances manager',
 'https://github.com/firefly-iii/firefly-iii', 12890, 1180, 720, 89, 'PHP',
 ARRAY['finance', 'personal-finance', 'budget', 'laravel'],
 'AGPL-3.0', ARRAY['budget management', 'expense tracking', 'financial reports'],
 ARRAY['PHP', 'Laravel', 'Vue.js', 'MySQL'], 'intermediate', 'fullstack-app',
 true, true, 88, true, true, '2017-12-27'::timestamp, '2024-01-12'::timestamp, '2024-01-08'::timestamp),

(345678901, 'actual-app', 'actual', 'actual-app/actual', 'actual',
 'A local-first personal finance system',
 'https://github.com/actual-app/actual', 9870, 845, 560, 67, 'JavaScript',
 ARRAY['finance', 'budgeting', 'local-first', 'privacy'],
 'MIT', ARRAY['budgeting', 'expense tracking', 'local storage'],
 ARRAY['JavaScript', 'React', 'Node.js', 'SQLite'], 'beginner', 'fullstack-app',
 true, true, 85, true, true, '2019-06-12'::timestamp, '2024-01-14'::timestamp, '2024-01-09'::timestamp),

-- FULL-STACK APPLICATIONS
(456789012, 'calcom', 'cal.com', 'calcom/cal.com', 'cal.com',
 'Scheduling infrastructure for absolutely everyone.',
 'https://github.com/calcom/cal.com', 28450, 6890, 1560, 234, 'TypeScript',
 ARRAY['scheduling', 'nextjs', 'calendar', 'saas', 'open-source'],
 'AGPL-3.0', ARRAY['appointment scheduling', 'calendar management', 'booking system'],
 ARRAY['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS', 'tRPC'], 'advanced', 'fullstack-app',
 true, true, 96, true, true, '2021-06-15'::timestamp, '2024-01-15'::timestamp, '2024-01-14'::timestamp),

(567890123, 'supabase', 'supabase', 'supabase/supabase', 'supabase',
 'The open source Firebase alternative.',
 'https://github.com/supabase/supabase', 65420, 5890, 2340, 156, 'TypeScript',
 ARRAY['database', 'backend', 'firebase-alternative', 'postgresql'],
 'Apache-2.0', ARRAY['backend as a service', 'database management', 'authentication'],
 ARRAY['TypeScript', 'PostgreSQL', 'React', 'Next.js'], 'intermediate', 'backend-service',
 true, true, 98, true, true, '2020-07-30'::timestamp, '2024-01-15'::timestamp, '2024-01-15'::timestamp),

(678901234, 'twentyhq', 'twenty', 'twentyhq/twenty', 'twenty',
 'Building a modern alternative to Salesforce, powered by the community.',
 'https://github.com/twentyhq/twenty', 12340, 1890, 780, 89, 'TypeScript',
 ARRAY['crm', 'salesforce-alternative', 'nextjs', 'graphql'],
 'AGPL-3.0', ARRAY['customer relationship management', 'sales tracking', 'lead management'],
 ARRAY['Next.js', 'TypeScript', 'GraphQL', 'PostgreSQL'], 'advanced', 'fullstack-app',
 true, true, 91, true, true, '2023-04-20'::timestamp, '2024-01-13'::timestamp, '2024-01-11'::timestamp),

-- AI & MACHINE LEARNING
(789012345, 'lobehub', 'lobe-chat', 'lobehub/lobe-chat', 'lobe-chat',
 'Modern-design ChatGPT/LLMs UI/Framework. Supports speech synthesis, multimodal, and extensible plugin system.',
 'https://github.com/lobehub/lobe-chat', 18920, 3450, 1230, 78, 'TypeScript',
 ARRAY['ai', 'chatgpt', 'llm', 'nextjs', 'chat-ui'],
 'MIT', ARRAY['AI chat interface', 'ChatGPT UI', 'LLM frontend'],
 ARRAY['Next.js', 'TypeScript', 'OpenAI API', 'Tailwind CSS'], 'intermediate', 'ai-application',
 true, true, 94, true, true, '2023-05-21'::timestamp, '2024-01-14'::timestamp, '2024-01-12'::timestamp),

(890123456, 'mckaywrigley', 'chatbot-ui', 'mckaywrigley/chatbot-ui', 'chatbot-ui',
 'The open-source AI chat app for everyone.',
 'https://github.com/mckaywrigley/chatbot-ui', 24580, 5670, 1890, 123, 'TypeScript',
 ARRAY['ai', 'chatgpt', 'openai', 'nextjs', 'chat'],
 'MIT', ARRAY['AI chatbot', 'OpenAI integration', 'chat interface'],
 ARRAY['Next.js', 'TypeScript', 'OpenAI API', 'Supabase'], 'beginner', 'ai-application',
 true, true, 95, true, true, '2023-03-14'::timestamp, '2024-01-13'::timestamp, '2024-01-10'::timestamp),

(901234567, 'langchain-ai', 'langchain', 'langchain-ai/langchain', 'langchain',
 'Build context-aware reasoning applications',
 'https://github.com/langchain-ai/langchain', 75420, 11890, 3240, 567, 'Python',
 ARRAY['ai', 'llm', 'python', 'machine-learning', 'openai'],
 'MIT', ARRAY['AI framework', 'LLM development', 'AI applications'],
 ARRAY['Python', 'OpenAI', 'Anthropic', 'Hugging Face'], 'advanced', 'ai-framework',
 true, true, 97, true, true, '2022-10-17'::timestamp, '2024-01-15'::timestamp, '2024-01-15'::timestamp),

-- DEVELOPER TOOLS
(012345678, 'shadcn-ui', 'ui', 'shadcn-ui/ui', 'shadcn/ui',
 'Beautifully designed components that you can copy and paste into your apps.',
 'https://github.com/shadcn-ui/ui', 45620, 2890, 1890, 45, 'TypeScript',
 ARRAY['ui', 'components', 'react', 'tailwindcss', 'radix-ui'],
 'MIT', ARRAY['UI components', 'design system', 'React library'],
 ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Radix UI'], 'beginner', 'ui-library',
 true, true, 96, true, true, '2023-01-04'::timestamp, '2024-01-14'::timestamp, '2024-01-12'::timestamp),

(123450789, 'trpc', 'trpc', 'trpc/trpc', 'tRPC',
 'End-to-end typesafe APIs made easy',
 'https://github.com/trpc/trpc', 32890, 2340, 1560, 89, 'TypeScript',
 ARRAY['typescript', 'api', 'rpc', 'nextjs', 'fullstack'],
 'MIT', ARRAY['API development', 'type safety', 'full-stack framework'],
 ARRAY['TypeScript', 'React', 'Next.js', 'Zod'], 'intermediate', 'framework',
 true, true, 94, true, true, '2020-07-08'::timestamp, '2024-01-13'::timestamp, '2024-01-11'::timestamp),

(234561890, 'withastro', 'astro', 'withastro/astro', 'astro',
 'The web framework for content-driven websites.',
 'https://github.com/withastro/astro', 41230, 4560, 2180, 134, 'TypeScript',
 ARRAY['astro', 'static-site-generator', 'web-framework', 'performance'],
 'MIT', ARRAY['static site generation', 'web development', 'performance optimization'],
 ARRAY['TypeScript', 'Vite', 'React', 'Vue', 'Svelte'], 'intermediate', 'framework',
 true, true, 95, true, true, '2021-03-16'::timestamp, '2024-01-14'::timestamp, '2024-01-13'::timestamp),

-- E-COMMERCE & BUSINESS
(345672901, 'medusajs', 'medusa', 'medusajs/medusa', 'medusa',
 'The most advanced open source commerce platform built with Node.js and React.',
 'https://github.com/medusajs/medusa', 21890, 2890, 1340, 156, 'TypeScript',
 ARRAY['ecommerce', 'commerce', 'nodejs', 'headless', 'api'],
 'MIT', ARRAY['e-commerce platform', 'headless commerce', 'online store'],
 ARRAY['Node.js', 'TypeScript', 'React', 'PostgreSQL'], 'advanced', 'ecommerce-platform',
 true, true, 92, true, true, '2021-01-05'::timestamp, '2024-01-12'::timestamp, '2024-01-09'::timestamp),

-- DATA & ANALYTICS
(456783012, 'grafana', 'grafana', 'grafana/grafana', 'grafana',
 'The open source analytics & monitoring solution for every database.',
 'https://github.com/grafana/grafana', 58420, 11230, 3890, 456, 'TypeScript',
 ARRAY['monitoring', 'visualization', 'analytics', 'dashboard', 'metrics'],
 'AGPL-3.0', ARRAY['data visualization', 'monitoring dashboard', 'analytics platform'],
 ARRAY['TypeScript', 'React', 'Go', 'Prometheus'], 'advanced', 'analytics-platform',
 true, true, 97, true, true, '2014-01-08'::timestamp, '2024-01-15'::timestamp, '2024-01-14'::timestamp),

-- CONTENT & MEDIA
(567894123, 'strapi', 'strapi', 'strapi/strapi', 'strapi',
 'The leading open-source headless CMS. 100% JavaScript, fully customizable and developer-first.',
 'https://github.com/strapi/strapi', 56780, 6890, 2890, 234, 'JavaScript',
 ARRAY['cms', 'headless-cms', 'nodejs', 'api', 'content-management'],
 'MIT', ARRAY['content management', 'headless CMS', 'API development'],
 ARRAY['Node.js', 'JavaScript', 'React', 'Koa'], 'intermediate', 'cms-platform',
 true, true, 95, true, true, '2015-10-16'::timestamp, '2024-01-13'::timestamp, '2024-01-11'::timestamp),

-- MOBILE & CROSS-PLATFORM
(678905234, 'facebook', 'react-native', 'facebook/react-native', 'react-native',
 'A framework for building native applications using React',
 'https://github.com/facebook/react-native', 114560, 23890, 7890, 789, 'C++',
 ARRAY['mobile', 'react', 'ios', 'android', 'cross-platform'],
 'MIT', ARRAY['mobile app development', 'cross-platform apps', 'native mobile'],
 ARRAY['React', 'JavaScript', 'Java', 'Objective-C'], 'advanced', 'mobile-framework',
 true, true, 98, true, true, '2015-01-09'::timestamp, '2024-01-14'::timestamp, '2024-01-13'::timestamp),

-- POPULAR FRAMEWORKS
(789016345, 'facebook', 'react', 'facebook/react', 'react',
 'The library for web and native user interfaces',
 'https://github.com/facebook/react', 218950, 44890, 12890, 456, 'JavaScript',
 ARRAY['react', 'javascript', 'ui', 'frontend', 'library'],
 'MIT', ARRAY['user interface', 'web development', 'component library'],
 ARRAY['JavaScript', 'HTML', 'CSS'], 'intermediate', 'ui-framework',
 true, true, 99, true, true, '2013-05-29'::timestamp, '2024-01-15'::timestamp, '2024-01-14'::timestamp),

(890127456, 'microsoft', 'vscode', 'microsoft/vscode', 'vscode',
 'Visual Studio Code',
 'https://github.com/microsoft/vscode', 154230, 27890, 8900, 567, 'TypeScript',
 ARRAY['editor', 'ide', 'typescript', 'development', 'tools'],
 'MIT', ARRAY['code editor', 'development environment', 'IDE'],
 ARRAY['TypeScript', 'Electron', 'Node.js'], 'intermediate', 'development-tool',
 true, true, 98, true, true, '2015-09-03'::timestamp, '2024-01-15'::timestamp, '2024-01-15'::timestamp)

ON CONFLICT (github_full_name) DO NOTHING;

-- ===================================
-- AUTO-CATEGORIZE REPOSITORIES
-- Map repositories to categories based on topics/keywords
-- ===================================

-- Finance & Fintech category mapping
INSERT INTO repository_category_mappings (repository_id, category_id, is_primary, confidence_score)
SELECT 
  r.id as repository_id,
  c.id as category_id,
  true as is_primary,
  1.0 as confidence_score
FROM repositories r
CROSS JOIN repository_categories c
WHERE c.name = 'Finance & Fintech'
  AND (r.github_owner IN ('maybe-finance', 'firefly-iii', 'actual-app')
       OR r.topics && ARRAY['finance', 'fintech', 'budget', 'personal-finance'])
ON CONFLICT (repository_id, category_id) DO NOTHING;

-- Full-Stack Applications category mapping
INSERT INTO repository_category_mappings (repository_id, category_id, is_primary, confidence_score)
SELECT 
  r.id as repository_id,
  c.id as category_id,
  true as is_primary,
  1.0 as confidence_score
FROM repositories r
CROSS JOIN repository_categories c
WHERE c.name = 'Full-Stack Applications'
  AND (r.github_owner IN ('calcom', 'supabase', 'twentyhq')
       OR r.topics && ARRAY['nextjs', 'fullstack', 'web-app', 'saas'])
ON CONFLICT (repository_id, category_id) DO NOTHING;

-- AI & Machine Learning category mapping
INSERT INTO repository_category_mappings (repository_id, category_id, is_primary, confidence_score)
SELECT 
  r.id as repository_id,
  c.id as category_id,
  true as is_primary,
  1.0 as confidence_score
FROM repositories r
CROSS JOIN repository_categories c
WHERE c.name = 'AI & Machine Learning'
  AND (r.github_owner IN ('lobehub', 'mckaywrigley', 'langchain-ai')
       OR r.topics && ARRAY['ai', 'machine-learning', 'llm', 'openai', 'chatgpt'])
ON CONFLICT (repository_id, category_id) DO NOTHING;

-- Developer Tools category mapping
INSERT INTO repository_category_mappings (repository_id, category_id, is_primary, confidence_score)
SELECT 
  r.id as repository_id,
  c.id as category_id,
  true as is_primary,
  1.0 as confidence_score
FROM repositories r
CROSS JOIN repository_categories c
WHERE c.name = 'Developer Tools'
  AND (r.github_owner IN ('shadcn-ui', 'trpc', 'withastro', 'microsoft')
       OR r.topics && ARRAY['ui', 'components', 'framework', 'tools', 'typescript'])
ON CONFLICT (repository_id, category_id) DO NOTHING;

-- E-commerce & Business category mapping
INSERT INTO repository_category_mappings (repository_id, category_id, is_primary, confidence_score)
SELECT 
  r.id as repository_id,
  c.id as category_id,
  true as is_primary,
  1.0 as confidence_score
FROM repositories r
CROSS JOIN repository_categories c
WHERE c.name = 'E-commerce & Business'
  AND (r.github_owner IN ('medusajs')
       OR r.topics && ARRAY['ecommerce', 'commerce', 'business', 'crm'])
ON CONFLICT (repository_id, category_id) DO NOTHING;

-- Data & Analytics category mapping
INSERT INTO repository_category_mappings (repository_id, category_id, is_primary, confidence_score)
SELECT 
  r.id as repository_id,
  c.id as category_id,
  true as is_primary,
  1.0 as confidence_score
FROM repositories r
CROSS JOIN repository_categories c
WHERE c.name = 'Data & Analytics'
  AND (r.github_owner IN ('grafana')
       OR r.topics && ARRAY['analytics', 'monitoring', 'visualization', 'dashboard'])
ON CONFLICT (repository_id, category_id) DO NOTHING;

-- Content & Media category mapping
INSERT INTO repository_category_mappings (repository_id, category_id, is_primary, confidence_score)
SELECT 
  r.id as repository_id,
  c.id as category_id,
  true as is_primary,
  1.0 as confidence_score
FROM repositories r
CROSS JOIN repository_categories c
WHERE c.name = 'Content & Media'
  AND (r.github_owner IN ('strapi')
       OR r.topics && ARRAY['cms', 'content-management', 'headless-cms'])
ON CONFLICT (repository_id, category_id) DO NOTHING;

-- Mobile & Cross-Platform category mapping
INSERT INTO repository_category_mappings (repository_id, category_id, is_primary, confidence_score)
SELECT 
  r.id as repository_id,
  c.id as category_id,
  true as is_primary,
  1.0 as confidence_score
FROM repositories r
CROSS JOIN repository_categories c
WHERE c.name = 'Mobile & Cross-Platform'
  AND (r.github_owner IN ('facebook') AND r.github_repo = 'react-native'
       OR r.topics && ARRAY['mobile', 'react-native', 'cross-platform', 'ios', 'android'])
ON CONFLICT (repository_id, category_id) DO NOTHING;

-- ===================================
-- VERIFICATION & RESULTS
-- ===================================

-- Show results
SELECT 
  'Total Repositories' as metric,
  COUNT(*) as count
FROM repositories;

SELECT 
  'Total Categories' as metric,
  COUNT(*) as count
FROM repository_categories;

SELECT 
  'Total Category Mappings' as metric,
  COUNT(*) as count
FROM repository_category_mappings;

-- Show repositories by category
SELECT 
  c.name as category_name,
  c.emoji,
  COUNT(rcm.repository_id) as repository_count
FROM repository_categories c
LEFT JOIN repository_category_mappings rcm ON c.id = rcm.category_id
GROUP BY c.id, c.name, c.emoji, c.display_order
ORDER BY c.display_order;

-- Show sample repositories with categories
SELECT 
  r.github_full_name,
  r.name,
  r.stars,
  r.primary_language,
  r.difficulty_level,
  r.quality_score,
  array_agg(c.name) as categories
FROM repositories r
LEFT JOIN repository_category_mappings rcm ON r.id = rcm.repository_id
LEFT JOIN repository_categories c ON rcm.category_id = c.id
GROUP BY r.id, r.github_full_name, r.name, r.stars, r.primary_language, r.difficulty_level, r.quality_score
ORDER BY r.stars DESC
LIMIT 15;

-- ===================================
-- COMPLETION MESSAGE
-- ===================================

DO $$
BEGIN
  RAISE NOTICE '🎉 Successfully inserted % repositories directly into the database!', 
    (SELECT COUNT(*) FROM repositories);
  RAISE NOTICE '📊 Categories created: %', 
    (SELECT COUNT(*) FROM repository_categories);
  RAISE NOTICE '🔗 Category mappings: %', 
    (SELECT COUNT(*) FROM repository_category_mappings);
  RAISE NOTICE '';
  RAISE NOTICE '✅ Ready to use! No queue processing needed.';
  RAISE NOTICE '🌐 Visit /repositories to start searching';
  RAISE NOTICE '🤖 Visit /ai-search for AI-powered recommendations';
  RAISE NOTICE '⚙️  Visit /admin/repositories for management';
END $$; 
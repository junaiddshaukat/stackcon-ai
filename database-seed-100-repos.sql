-- ===================================
-- SEED 100+ HIGH-QUALITY REPOSITORIES
-- This script populates the repository_discovery_queue with curated repositories
-- Run this in your Supabase SQL Editor after running the migration
-- ===================================

-- First, ensure we have repository categories
INSERT INTO repository_categories (name, description, emoji, github_topics, display_order) VALUES
('Full-Stack Applications', 'Complete web applications with frontend and backend', '🚀', ARRAY['webapp', 'fullstack', 'nextjs', 'react', 'vue'], 1),
('Finance & Fintech', 'Financial applications, budgeting, and fintech tools', '💰', ARRAY['finance', 'fintech', 'budget', 'trading', 'crypto', 'accounting'], 2),
('AI & Machine Learning', 'AI tools, machine learning projects, and LLM applications', '🤖', ARRAY['ai', 'machine-learning', 'llm', 'openai', 'tensorflow', 'pytorch'], 3),
('Developer Tools', 'Development utilities, CLI tools, and productivity apps', '🛠️', ARRAY['cli', 'developer-tools', 'productivity', 'automation'], 4),
('E-commerce & Business', 'Online stores, business applications, and CRM systems', '🛒', ARRAY['ecommerce', 'business', 'crm', 'shop', 'commerce'], 5),
('Data & Analytics', 'Data visualization, analytics, and dashboard applications', '📊', ARRAY['analytics', 'dashboard', 'visualization', 'data'], 6),
('Content & Media', 'CMS, blogs, media platforms, and content management', '📝', ARRAY['cms', 'blog', 'content', 'media', 'publishing'], 7),
('Mobile & Cross-Platform', 'Mobile apps, React Native, and cross-platform solutions', '📱', ARRAY['mobile', 'react-native', 'flutter', 'cross-platform'], 8),
('Games & Entertainment', 'Games, entertainment apps, and interactive experiences', '🎮', ARRAY['game', 'entertainment', 'gaming', 'interactive'], 9),
('Education & Learning', 'Educational platforms, learning management, and tutorials', '🎓', ARRAY['education', 'learning', 'tutorial', 'course'], 10)
ON CONFLICT (name) DO NOTHING;

-- ===================================
-- POPULATE REPOSITORY DISCOVERY QUEUE
-- ===================================

INSERT INTO repository_discovery_queue (github_url, github_owner, github_repo, source, priority, status) VALUES

-- FINANCE & FINTECH (Priority 1 - High demand)
('https://github.com/maybe-finance/maybe', 'maybe-finance', 'maybe', 'curated', 1, 'pending'),
('https://github.com/firefly-iii/firefly-iii', 'firefly-iii', 'firefly-iii', 'curated', 1, 'pending'),
('https://github.com/actual-app/actual', 'actual-app', 'actual', 'curated', 1, 'pending'),
('https://github.com/GnuCash/gnucash', 'GnuCash', 'gnucash', 'curated', 2, 'pending'),
('https://github.com/scottschiller/ONEBUGS', 'scottschiller', 'ONEBUGS', 'curated', 3, 'pending'),
('https://github.com/budgetbee/budgetbee', 'budgetbee', 'budgetbee', 'curated', 2, 'pending'),
('https://github.com/envelope-zero/backend', 'envelope-zero', 'backend', 'curated', 2, 'pending'),
('https://github.com/franciscop/finances', 'franciscop', 'finances', 'curated', 3, 'pending'),
('https://github.com/inoda/ontrack', 'inoda', 'ontrack', 'curated', 3, 'pending'),
('https://github.com/yfinance/yfinance', 'yfinance', 'yfinance', 'curated', 2, 'pending'),

-- FULL-STACK APPLICATIONS (High Priority)
('https://github.com/calcom/cal.com', 'calcom', 'cal.com', 'curated', 1, 'pending'),
('https://github.com/vercel/nextjs-subscription-payments', 'vercel', 'nextjs-subscription-payments', 'curated', 1, 'pending'),
('https://github.com/supabase/supabase', 'supabase', 'supabase', 'curated', 1, 'pending'),
('https://github.com/appwrite/appwrite', 'appwrite', 'appwrite', 'curated', 1, 'pending'),
('https://github.com/directus/directus', 'directus', 'directus', 'curated', 1, 'pending'),
('https://github.com/nocodb/nocodb', 'nocodb', 'nocodb', 'curated', 1, 'pending'),
('https://github.com/formbricks/formbricks', 'formbricks', 'formbricks', 'curated', 2, 'pending'),
('https://github.com/twentyhq/twenty', 'twentyhq', 'twenty', 'curated', 1, 'pending'),
('https://github.com/makeplane/plane', 'makeplane', 'plane', 'curated', 1, 'pending'),
('https://github.com/novuhq/novu', 'novuhq', 'novu', 'curated', 1, 'pending'),
('https://github.com/triggerdotdev/trigger.dev', 'triggerdotdev', 'trigger.dev', 'curated', 2, 'pending'),
('https://github.com/n8n-io/n8n', 'n8n-io', 'n8n', 'curated', 1, 'pending'),

-- AI & MACHINE LEARNING (High Priority)
('https://github.com/lobehub/lobe-chat', 'lobehub', 'lobe-chat', 'curated', 1, 'pending'),
('https://github.com/mckaywrigley/chatbot-ui', 'mckaywrigley', 'chatbot-ui', 'curated', 1, 'pending'),
('https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web', 'ChatGPTNextWeb', 'ChatGPT-Next-Web', 'curated', 1, 'pending'),
('https://github.com/Yidadaa/ChatGPT-Next-Web', 'Yidadaa', 'ChatGPT-Next-Web', 'curated', 1, 'pending'),
('https://github.com/langchain-ai/langchain', 'langchain-ai', 'langchain', 'curated', 1, 'pending'),
('https://github.com/langgenius/dify', 'langgenius', 'dify', 'curated', 1, 'pending'),
('https://github.com/microsoft/semantic-kernel', 'microsoft', 'semantic-kernel', 'curated', 2, 'pending'),
('https://github.com/openai/openai-python', 'openai', 'openai-python', 'curated', 2, 'pending'),
('https://github.com/anthropics/anthropic-sdk-python', 'anthropics', 'anthropic-sdk-python', 'curated', 2, 'pending'),
('https://github.com/vercel/ai', 'vercel', 'ai', 'curated', 1, 'pending'),

-- DEVELOPER TOOLS (High Priority)
('https://github.com/ibelick/zola', 'ibelick', 'zola', 'curated', 1, 'pending'),
('https://github.com/trpc/trpc', 'trpc', 'trpc', 'curated', 1, 'pending'),
('https://github.com/withastro/astro', 'withastro', 'astro', 'curated', 1, 'pending'),
('https://github.com/t3-oss/create-t3-app', 't3-oss', 'create-t3-app', 'curated', 1, 'pending'),
('https://github.com/shadcn-ui/ui', 'shadcn-ui', 'ui', 'curated', 1, 'pending'),
('https://github.com/nextui-org/nextui', 'nextui-org', 'nextui', 'curated', 1, 'pending'),
('https://github.com/tailwindlabs/tailwindcss', 'tailwindlabs', 'tailwindcss', 'curated', 1, 'pending'),
('https://github.com/prisma/prisma', 'prisma', 'prisma', 'curated', 1, 'pending'),
('https://github.com/drizzle-team/drizzle-orm', 'drizzle-team', 'drizzle-orm', 'curated', 1, 'pending'),
('https://github.com/clerk/clerk-nextjs', 'clerk', 'clerk-nextjs', 'curated', 2, 'pending'),

-- E-COMMERCE & BUSINESS
('https://github.com/medusajs/medusa', 'medusajs', 'medusa', 'curated', 1, 'pending'),
('https://github.com/vendure-ecommerce/vendure', 'vendure-ecommerce', 'vendure', 'curated', 1, 'pending'),
('https://github.com/saleor/saleor', 'saleor', 'saleor', 'curated', 1, 'pending'),
('https://github.com/commercetools/commercetools-frontend', 'commercetools', 'commercetools-frontend', 'curated', 2, 'pending'),
('https://github.com/spree/spree', 'spree', 'spree', 'curated', 2, 'pending'),
('https://github.com/bagisto/bagisto', 'bagisto', 'bagisto', 'curated', 2, 'pending'),
('https://github.com/shopware/platform', 'shopware', 'platform', 'curated', 2, 'pending'),

-- DATA & ANALYTICS
('https://github.com/apache/superset', 'apache', 'superset', 'curated', 1, 'pending'),
('https://github.com/grafana/grafana', 'grafana', 'grafana', 'curated', 1, 'pending'),
('https://github.com/metabase/metabase', 'metabase', 'metabase', 'curated', 1, 'pending'),
('https://github.com/getredash/redash', 'getredash', 'redash', 'curated', 2, 'pending'),
('https://github.com/PostHog/posthog', 'PostHog', 'posthog', 'curated', 1, 'pending'),
('https://github.com/plausible/analytics', 'plausible', 'analytics', 'curated', 1, 'pending'),
('https://github.com/umami-software/umami', 'umami-software', 'umami', 'curated', 1, 'pending'),

-- CONTENT & MEDIA
('https://github.com/strapi/strapi', 'strapi', 'strapi', 'curated', 1, 'pending'),
('https://github.com/sanity-io/sanity', 'sanity-io', 'sanity', 'curated', 1, 'pending'),
('https://github.com/payloadcms/payload', 'payloadcms', 'payload', 'curated', 1, 'pending'),
('https://github.com/keystonejs/keystone', 'keystonejs', 'keystone', 'curated', 2, 'pending'),
('https://github.com/TryGhost/Ghost', 'TryGhost', 'Ghost', 'curated', 1, 'pending'),
('https://github.com/wordpress/wordpress-develop', 'wordpress', 'wordpress-develop', 'curated', 2, 'pending'),

-- MOBILE & CROSS-PLATFORM
('https://github.com/facebook/react-native', 'facebook', 'react-native', 'curated', 1, 'pending'),
('https://github.com/expo/expo', 'expo', 'expo', 'curated', 1, 'pending'),
('https://github.com/flutter/flutter', 'flutter', 'flutter', 'curated', 1, 'pending'),
('https://github.com/ionic-team/ionic-framework', 'ionic-team', 'ionic-framework', 'curated', 1, 'pending'),
('https://github.com/NativeScript/NativeScript', 'NativeScript', 'NativeScript', 'curated', 2, 'pending'),
('https://github.com/microsoft/react-native-windows', 'microsoft', 'react-native-windows', 'curated', 2, 'pending'),

-- GAMES & ENTERTAINMENT
('https://github.com/godotengine/godot', 'godotengine', 'godot', 'curated', 1, 'pending'),
('https://github.com/BabylonJS/Babylon.js', 'BabylonJS', 'Babylon.js', 'curated', 2, 'pending'),
('https://github.com/mrdoob/three.js', 'mrdoob', 'three.js', 'curated', 1, 'pending'),
('https://github.com/pixijs/pixijs', 'pixijs', 'pixijs', 'curated', 2, 'pending'),
('https://github.com/phaserjs/phaser', 'phaserjs', 'phaser', 'curated', 2, 'pending'),

-- EDUCATION & LEARNING
('https://github.com/moodle/moodle', 'moodle', 'moodle', 'curated', 2, 'pending'),
('https://github.com/oppia/oppia', 'oppia', 'oppia', 'curated', 2, 'pending'),
('https://github.com/ankidroid/Anki-Android', 'ankidroid', 'Anki-Android', 'curated', 2, 'pending'),

-- ADDITIONAL HIGH-QUALITY REPOS
('https://github.com/remix-run/remix', 'remix-run', 'remix', 'curated', 1, 'pending'),
('https://github.com/sveltejs/kit', 'sveltejs', 'kit', 'curated', 1, 'pending'),
('https://github.com/nuxt/nuxt', 'nuxt', 'nuxt', 'curated', 1, 'pending'),
('https://github.com/angular/angular', 'angular', 'angular', 'curated', 1, 'pending'),
('https://github.com/vuejs/vue', 'vuejs', 'vue', 'curated', 1, 'pending'),
('https://github.com/facebook/react', 'facebook', 'react', 'curated', 1, 'pending'),
('https://github.com/microsoft/vscode', 'microsoft', 'vscode', 'curated', 1, 'pending'),
('https://github.com/atom/atom', 'atom', 'atom', 'curated', 2, 'pending'),
('https://github.com/neovim/neovim', 'neovim', 'neovim', 'curated', 2, 'pending'),
('https://github.com/microsoft/playwright', 'microsoft', 'playwright', 'curated', 1, 'pending'),
('https://github.com/cypress-io/cypress', 'cypress-io', 'cypress', 'curated', 1, 'pending'),
('https://github.com/storybookjs/storybook', 'storybookjs', 'storybook', 'curated', 1, 'pending'),
('https://github.com/vitejs/vite', 'vitejs', 'vite', 'curated', 1, 'pending'),
('https://github.com/webpack/webpack', 'webpack', 'webpack', 'curated', 2, 'pending'),
('https://github.com/parcel-bundler/parcel', 'parcel-bundler', 'parcel', 'curated', 2, 'pending'),
('https://github.com/esbuild/esbuild', 'evanw', 'esbuild', 'curated', 2, 'pending'),
('https://github.com/facebook/jest', 'facebook', 'jest', 'curated', 2, 'pending'),
('https://github.com/vitest-dev/vitest', 'vitest-dev', 'vitest', 'curated', 2, 'pending'),
('https://github.com/eslint/eslint', 'eslint', 'eslint', 'curated', 2, 'pending'),
('https://github.com/prettier/prettier', 'prettier', 'prettier', 'curated', 2, 'pending'),
('https://github.com/typescript-eslint/typescript-eslint', 'typescript-eslint', 'typescript-eslint', 'curated', 2, 'pending'),
('https://github.com/microsoft/TypeScript', 'microsoft', 'TypeScript', 'curated', 1, 'pending'),
('https://github.com/denoland/deno', 'denoland', 'deno', 'curated', 1, 'pending'),
('https://github.com/nodejs/node', 'nodejs', 'node', 'curated', 1, 'pending'),
('https://github.com/expressjs/express', 'expressjs', 'express', 'curated', 1, 'pending'),
('https://github.com/fastify/fastify', 'fastify', 'fastify', 'curated', 1, 'pending'),
('https://github.com/nestjs/nest', 'nestjs', 'nest', 'curated', 1, 'pending'),
('https://github.com/koajs/koa', 'koajs', 'koa', 'curated', 2, 'pending'),
('https://github.com/hapijs/hapi', 'hapijs', 'hapi', 'curated', 2, 'pending'),
('https://github.com/mongodb/mongo', 'mongodb', 'mongo', 'curated', 1, 'pending'),
('https://github.com/postgres/postgres', 'postgres', 'postgres', 'curated', 1, 'pending'),
('https://github.com/redis/redis', 'redis', 'redis', 'curated', 1, 'pending'),
('https://github.com/elastic/elasticsearch', 'elastic', 'elasticsearch', 'curated', 2, 'pending'),
('https://github.com/docker/docker-ce', 'docker', 'docker-ce', 'curated', 1, 'pending'),
('https://github.com/kubernetes/kubernetes', 'kubernetes', 'kubernetes', 'curated', 1, 'pending'),
('https://github.com/hashicorp/terraform', 'hashicorp', 'terraform', 'curated', 1, 'pending'),
('https://github.com/ansible/ansible', 'ansible', 'ansible', 'curated', 2, 'pending'),
('https://github.com/prometheus/prometheus', 'prometheus', 'prometheus', 'curated', 2, 'pending'),
('https://github.com/traefik/traefik', 'traefik', 'traefik', 'curated', 2, 'pending'),
('https://github.com/nginx/nginx', 'nginx', 'nginx', 'curated', 2, 'pending'),
('https://github.com/apache/httpd', 'apache', 'httpd', 'curated', 3, 'pending'),
('https://github.com/git/git', 'git', 'git', 'curated', 2, 'pending'),
('https://github.com/github/gitignore', 'github', 'gitignore', 'curated', 3, 'pending'),
('https://github.com/torvalds/linux', 'torvalds', 'linux', 'curated', 2, 'pending'),

-- STARTUP & BUSINESS TOOLS
('https://github.com/PostHog/posthog-js', 'PostHog', 'posthog-js', 'curated', 2, 'pending'),
('https://github.com/useplunk/plunk', 'useplunk', 'plunk', 'curated', 3, 'pending'),
('https://github.com/resend/resend-node', 'resend', 'resend-node', 'curated', 2, 'pending'),
('https://github.com/stripe/stripe-node', 'stripe', 'stripe-node', 'curated', 1, 'pending'),
('https://github.com/teambit/bit', 'teambit', 'bit', 'curated', 3, 'pending'),
('https://github.com/microsoft/fluentui', 'microsoft', 'fluentui', 'curated', 2, 'pending'),
('https://github.com/ant-design/ant-design', 'ant-design', 'ant-design', 'curated', 1, 'pending'),
('https://github.com/mui/material-ui', 'mui', 'material-ui', 'curated', 1, 'pending'),
('https://github.com/chakra-ui/chakra-ui', 'chakra-ui', 'chakra-ui', 'curated', 1, 'pending'),
('https://github.com/mantinedev/mantine', 'mantinedev', 'mantine', 'curated', 1, 'pending'),

-- EXTRA TRENDING REPOSITORIES
('https://github.com/microsoft/terminal', 'microsoft', 'terminal', 'curated', 2, 'pending'),
('https://github.com/zed-industries/zed', 'zed-industries', 'zed', 'curated', 1, 'pending'),
('https://github.com/tauri-apps/tauri', 'tauri-apps', 'tauri', 'curated', 1, 'pending'),
('https://github.com/electron/electron', 'electron', 'electron', 'curated', 1, 'pending'),
('https://github.com/rustdesk/rustdesk', 'rustdesk', 'rustdesk', 'curated', 2, 'pending'),
('https://github.com/immich-app/immich', 'immich-app', 'immich', 'curated', 1, 'pending'),
('https://github.com/paperless-ngx/paperless-ngx', 'paperless-ngx', 'paperless-ngx', 'curated', 2, 'pending'),
('https://github.com/jhipster/generator-jhipster', 'jhipster', 'generator-jhipster', 'curated', 2, 'pending')

ON CONFLICT (github_url) DO NOTHING;

-- ===================================
-- VERIFY SEEDING RESULTS
-- ===================================

-- Check total repositories added
SELECT 
  'Total repositories in queue' as metric,
  COUNT(*) as count
FROM repository_discovery_queue;

-- Check status distribution
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM repository_discovery_queue 
GROUP BY status 
ORDER BY count DESC;

-- Check priority distribution
SELECT 
  priority,
  COUNT(*) as count
FROM repository_discovery_queue 
GROUP BY priority 
ORDER BY priority;

-- Show sample of added repositories
SELECT 
  github_owner,
  github_repo,
  priority,
  status,
  created_at
FROM repository_discovery_queue 
ORDER BY priority, github_owner
LIMIT 20;

-- ===================================
-- COMPLETION MESSAGE
-- ===================================

DO -Force
BEGIN
  RAISE NOTICE '🎉 Successfully seeded % repositories into the discovery queue!', 
    (SELECT COUNT(*) FROM repository_discovery_queue);
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Run the repository processing queue via admin interface';
  RAISE NOTICE '2. Visit /admin/repositories and click "Process Queue"';
  RAISE NOTICE '3. Wait for repositories to be fetched from GitHub API';
  RAISE NOTICE '4. Test search functionality at /repositories';
END 
-Force; 
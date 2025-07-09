-- ===================================
-- SEED 100+ HIGH-QUALITY REPOSITORIES (CORRECTED VERSION)
-- This script populates the repository_discovery_queue with curated repositories
-- Matches the actual schema with only: github_url, source, priority, status
-- ===================================

-- First, ensure we have repository categories (if not already created)
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
-- POPULATE REPOSITORY DISCOVERY QUEUE
-- Using correct schema: (github_url, source, priority, status)
-- ===================================

INSERT INTO repository_discovery_queue (github_url, source, priority, status) VALUES

-- FINANCE & FINTECH (Priority 1 - High demand)
('https://github.com/maybe-finance/maybe', 'curated', 1, 'pending'),
('https://github.com/firefly-iii/firefly-iii', 'curated', 1, 'pending'),
('https://github.com/actual-app/actual', 'curated', 1, 'pending'),
('https://github.com/GnuCash/gnucash', 'curated', 2, 'pending'),
('https://github.com/envelope-zero/backend', 'curated', 2, 'pending'),
('https://github.com/franciscop/finances', 'curated', 3, 'pending'),
('https://github.com/inoda/ontrack', 'curated', 3, 'pending'),
('https://github.com/yfinance/yfinance', 'curated', 2, 'pending'),
('https://github.com/budgetbee/budgetbee', 'curated', 2, 'pending'),
('https://github.com/MoneyLover/MoneyLover', 'curated', 3, 'pending'),

-- FULL-STACK APPLICATIONS (High Priority)
('https://github.com/calcom/cal.com', 'curated', 1, 'pending'),
('https://github.com/vercel/nextjs-subscription-payments', 'curated', 1, 'pending'),
('https://github.com/supabase/supabase', 'curated', 1, 'pending'),
('https://github.com/appwrite/appwrite', 'curated', 1, 'pending'),
('https://github.com/directus/directus', 'curated', 1, 'pending'),
('https://github.com/nocodb/nocodb', 'curated', 1, 'pending'),
('https://github.com/formbricks/formbricks', 'curated', 2, 'pending'),
('https://github.com/twentyhq/twenty', 'curated', 1, 'pending'),
('https://github.com/makeplane/plane', 'curated', 1, 'pending'),
('https://github.com/novuhq/novu', 'curated', 1, 'pending'),
('https://github.com/triggerdotdev/trigger.dev', 'curated', 2, 'pending'),
('https://github.com/n8n-io/n8n', 'curated', 1, 'pending'),
('https://github.com/railwayapp/railway', 'curated', 2, 'pending'),
('https://github.com/logto-io/logto', 'curated', 2, 'pending'),

-- AI & MACHINE LEARNING (High Priority)
('https://github.com/lobehub/lobe-chat', 'curated', 1, 'pending'),
('https://github.com/mckaywrigley/chatbot-ui', 'curated', 1, 'pending'),
('https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web', 'curated', 1, 'pending'),
('https://github.com/Yidadaa/ChatGPT-Next-Web', 'curated', 1, 'pending'),
('https://github.com/langchain-ai/langchain', 'curated', 1, 'pending'),
('https://github.com/langgenius/dify', 'curated', 1, 'pending'),
('https://github.com/microsoft/semantic-kernel', 'curated', 2, 'pending'),
('https://github.com/openai/openai-python', 'curated', 2, 'pending'),
('https://github.com/anthropics/anthropic-sdk-python', 'curated', 2, 'pending'),
('https://github.com/vercel/ai', 'curated', 1, 'pending'),
('https://github.com/huggingface/transformers', 'curated', 1, 'pending'),
('https://github.com/microsoft/autogen', 'curated', 2, 'pending'),

-- DEVELOPER TOOLS (High Priority)
('https://github.com/ibelick/zola', 'curated', 1, 'pending'),
('https://github.com/trpc/trpc', 'curated', 1, 'pending'),
('https://github.com/withastro/astro', 'curated', 1, 'pending'),
('https://github.com/t3-oss/create-t3-app', 'curated', 1, 'pending'),
('https://github.com/shadcn-ui/ui', 'curated', 1, 'pending'),
('https://github.com/nextui-org/nextui', 'curated', 1, 'pending'),
('https://github.com/tailwindlabs/tailwindcss', 'curated', 1, 'pending'),
('https://github.com/prisma/prisma', 'curated', 1, 'pending'),
('https://github.com/drizzle-team/drizzle-orm', 'curated', 1, 'pending'),
('https://github.com/clerk/clerk-nextjs', 'curated', 2, 'pending'),
('https://github.com/vitejs/vite', 'curated', 1, 'pending'),
('https://github.com/microsoft/playwright', 'curated', 1, 'pending'),

-- E-COMMERCE & BUSINESS
('https://github.com/medusajs/medusa', 'curated', 1, 'pending'),
('https://github.com/vendure-ecommerce/vendure', 'curated', 1, 'pending'),
('https://github.com/saleor/saleor', 'curated', 1, 'pending'),
('https://github.com/commercetools/commercetools-frontend', 'curated', 2, 'pending'),
('https://github.com/spree/spree', 'curated', 2, 'pending'),
('https://github.com/bagisto/bagisto', 'curated', 2, 'pending'),
('https://github.com/shopware/platform', 'curated', 2, 'pending'),
('https://github.com/woocommerce/woocommerce', 'curated', 1, 'pending'),

-- DATA & ANALYTICS
('https://github.com/apache/superset', 'curated', 1, 'pending'),
('https://github.com/grafana/grafana', 'curated', 1, 'pending'),
('https://github.com/metabase/metabase', 'curated', 1, 'pending'),
('https://github.com/getredash/redash', 'curated', 2, 'pending'),
('https://github.com/PostHog/posthog', 'curated', 1, 'pending'),
('https://github.com/plausible/analytics', 'curated', 1, 'pending'),
('https://github.com/umami-software/umami', 'curated', 1, 'pending'),
('https://github.com/goauthentik/authentik', 'curated', 2, 'pending'),

-- CONTENT & MEDIA
('https://github.com/strapi/strapi', 'curated', 1, 'pending'),
('https://github.com/sanity-io/sanity', 'curated', 1, 'pending'),
('https://github.com/payloadcms/payload', 'curated', 1, 'pending'),
('https://github.com/keystonejs/keystone', 'curated', 2, 'pending'),
('https://github.com/TryGhost/Ghost', 'curated', 1, 'pending'),
('https://github.com/wordpress/wordpress-develop', 'curated', 2, 'pending'),
('https://github.com/netlify/netlify-cms', 'curated', 2, 'pending'),

-- MOBILE & CROSS-PLATFORM
('https://github.com/facebook/react-native', 'curated', 1, 'pending'),
('https://github.com/expo/expo', 'curated', 1, 'pending'),
('https://github.com/flutter/flutter', 'curated', 1, 'pending'),
('https://github.com/ionic-team/ionic-framework', 'curated', 1, 'pending'),
('https://github.com/NativeScript/NativeScript', 'curated', 2, 'pending'),
('https://github.com/microsoft/react-native-windows', 'curated', 2, 'pending'),
('https://github.com/tauri-apps/tauri', 'curated', 1, 'pending'),

-- GAMES & ENTERTAINMENT
('https://github.com/godotengine/godot', 'curated', 1, 'pending'),
('https://github.com/BabylonJS/Babylon.js', 'curated', 2, 'pending'),
('https://github.com/mrdoob/three.js', 'curated', 1, 'pending'),
('https://github.com/pixijs/pixijs', 'curated', 2, 'pending'),
('https://github.com/phaserjs/phaser', 'curated', 2, 'pending'),
('https://github.com/Unity-Technologies/UnityCsReference', 'curated', 2, 'pending'),

-- EDUCATION & LEARNING
('https://github.com/moodle/moodle', 'curated', 2, 'pending'),
('https://github.com/oppia/oppia', 'curated', 2, 'pending'),
('https://github.com/ankidroid/Anki-Android', 'curated', 2, 'pending'),
('https://github.com/freeCodeCamp/freeCodeCamp', 'curated', 1, 'pending'),

-- POPULAR FRAMEWORKS & LIBRARIES
('https://github.com/remix-run/remix', 'curated', 1, 'pending'),
('https://github.com/sveltejs/kit', 'curated', 1, 'pending'),
('https://github.com/nuxt/nuxt', 'curated', 1, 'pending'),
('https://github.com/angular/angular', 'curated', 1, 'pending'),
('https://github.com/vuejs/vue', 'curated', 1, 'pending'),
('https://github.com/facebook/react', 'curated', 1, 'pending'),
('https://github.com/microsoft/vscode', 'curated', 1, 'pending'),
('https://github.com/neovim/neovim', 'curated', 2, 'pending'),
('https://github.com/cypress-io/cypress', 'curated', 1, 'pending'),
('https://github.com/storybookjs/storybook', 'curated', 1, 'pending'),

-- BACKEND & API TOOLS
('https://github.com/microsoft/TypeScript', 'curated', 1, 'pending'),
('https://github.com/denoland/deno', 'curated', 1, 'pending'),
('https://github.com/nodejs/node', 'curated', 1, 'pending'),
('https://github.com/expressjs/express', 'curated', 1, 'pending'),
('https://github.com/fastify/fastify', 'curated', 1, 'pending'),
('https://github.com/nestjs/nest', 'curated', 1, 'pending'),
('https://github.com/koajs/koa', 'curated', 2, 'pending'),
('https://github.com/hapijs/hapi', 'curated', 2, 'pending'),

-- DATABASE & INFRASTRUCTURE
('https://github.com/mongodb/mongo', 'curated', 1, 'pending'),
('https://github.com/postgres/postgres', 'curated', 1, 'pending'),
('https://github.com/redis/redis', 'curated', 1, 'pending'),
('https://github.com/elastic/elasticsearch', 'curated', 2, 'pending'),
('https://github.com/docker/docker-ce', 'curated', 1, 'pending'),
('https://github.com/kubernetes/kubernetes', 'curated', 1, 'pending'),
('https://github.com/hashicorp/terraform', 'curated', 1, 'pending'),

-- UI COMPONENT LIBRARIES
('https://github.com/ant-design/ant-design', 'curated', 1, 'pending'),
('https://github.com/mui/material-ui', 'curated', 1, 'pending'),
('https://github.com/chakra-ui/chakra-ui', 'curated', 1, 'pending'),
('https://github.com/mantinedev/mantine', 'curated', 1, 'pending'),
('https://github.com/microsoft/fluentui', 'curated', 2, 'pending'),

-- TRENDING & INNOVATIVE PROJECTS
('https://github.com/microsoft/terminal', 'curated', 2, 'pending'),
('https://github.com/zed-industries/zed', 'curated', 1, 'pending'),
('https://github.com/electron/electron', 'curated', 1, 'pending'),
('https://github.com/rustdesk/rustdesk', 'curated', 2, 'pending'),
('https://github.com/immich-app/immich', 'curated', 1, 'pending'),
('https://github.com/paperless-ngx/paperless-ngx', 'curated', 2, 'pending'),
('https://github.com/jhipster/generator-jhipster', 'curated', 2, 'pending'),

-- STARTUP & BUSINESS TOOLS
('https://github.com/stripe/stripe-node', 'curated', 1, 'pending'),
('https://github.com/resend/resend-node', 'curated', 2, 'pending'),
('https://github.com/teambit/bit', 'curated', 3, 'pending'),

-- ADDITIONAL POPULAR REPOSITORIES
('https://github.com/webpack/webpack', 'curated', 2, 'pending'),
('https://github.com/parcel-bundler/parcel', 'curated', 2, 'pending'),
('https://github.com/evanw/esbuild', 'curated', 2, 'pending'),
('https://github.com/facebook/jest', 'curated', 2, 'pending'),
('https://github.com/vitest-dev/vitest', 'curated', 2, 'pending'),
('https://github.com/eslint/eslint', 'curated', 2, 'pending'),
('https://github.com/prettier/prettier', 'curated', 2, 'pending'),
('https://github.com/typescript-eslint/typescript-eslint', 'curated', 2, 'pending'),
('https://github.com/ansible/ansible', 'curated', 2, 'pending'),
('https://github.com/prometheus/prometheus', 'curated', 2, 'pending'),
('https://github.com/traefik/traefik', 'curated', 2, 'pending'),
('https://github.com/nginx/nginx', 'curated', 2, 'pending'),
('https://github.com/git/git', 'curated', 2, 'pending'),
('https://github.com/github/gitignore', 'curated', 3, 'pending'),
('https://github.com/torvalds/linux', 'curated', 2, 'pending')

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

-- Show sample of added repositories with extracted owner/repo info
SELECT 
  github_url,
  (extract_github_info(github_url)).owner as github_owner,
  (extract_github_info(github_url)).repo as github_repo,
  priority,
  status,
  created_at
FROM repository_discovery_queue 
ORDER BY priority, github_url
LIMIT 20;

-- ===================================
-- COMPLETION MESSAGE
-- ===================================

DO $$
BEGIN
  RAISE NOTICE '🎉 Successfully seeded % repositories into the discovery queue!', 
    (SELECT COUNT(*) FROM repository_discovery_queue);
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Set up your environment variables (.env.local)';
  RAISE NOTICE '2. Run your development server: npm run dev';
  RAISE NOTICE '3. Visit /admin/repositories and click "Process Queue"';
  RAISE NOTICE '4. Wait for repositories to be fetched from GitHub API';
  RAISE NOTICE '5. Test search functionality at /repositories';
END $$; 
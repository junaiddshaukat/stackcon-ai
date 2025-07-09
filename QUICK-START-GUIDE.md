# 🚀 Quick Start Guide

## Step 1: Set Up Environment Variables

1. Create a `.env.local` file in your project root:

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Optional but recommended - GitHub (for higher rate limits)
GITHUB_TOKEN=your_github_personal_access_token

# Required for AI features
OPENAI_API_KEY=your_openai_api_key_here

# Optional - for other auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Step 2: Verify Database Migration

Make sure you've run the repository migration in your Supabase dashboard:
- Go to your Supabase project
- Navigate to SQL Editor
- Run the migration script from `database-repository-migration.sql`

## Step 3: Seed Sample Repositories

Run the seeding script to add sample repositories:

```bash
npx tsx scripts/seed-repositories.ts
```

This will add 5 popular repositories to your discovery queue.

## Step 4: Process the Queue

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit the admin page: `http://localhost:3000/admin/repositories`

3. Click **"Process Queue"** to fetch repository data from GitHub

## Step 5: Test the System

1. **Repository Search**: Visit `http://localhost:3000/repositories`
2. **AI Search**: Visit `http://localhost:3000/ai-search`
3. Try searching for:
   - "finance app"
   - "dashboard template"
   - "chat application"

## Troubleshooting

### Error: "<!DOCTYPE" is not valid JSON
This means the API is returning HTML instead of JSON. Check:
1. Environment variables are set correctly
2. Database migration has been run
3. Supabase connection is working

### No repositories found
This means you need to:
1. Run the seed script: `npx tsx scripts/seed-repositories.ts`
2. Process the queue via admin panel
3. Wait for repositories to be fetched from GitHub

### GitHub API rate limits
1. Add `GITHUB_TOKEN` to your `.env.local`
2. Create a personal access token at: https://github.com/settings/tokens
3. No special permissions needed for public repositories

## Adding More Repositories

### Via Admin Interface
1. Go to `/admin/repositories`
2. Use "Add Single Repository" or "Bulk Add"
3. Paste GitHub URLs
4. Click "Process Queue"

### Via API
```javascript
fetch('/api/repositories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    githubUrl: 'https://github.com/owner/repo'
  })
})
```

## Sample Repositories to Try

Finance & Business:
- https://github.com/maybe-finance/maybe
- https://github.com/firefly-iii/firefly-iii
- https://github.com/actual-app/actual

Developer Tools:
- https://github.com/ibelick/zola
- https://github.com/trpc/trpc
- https://github.com/withastro/astro

Full-Stack Apps:
- https://github.com/calcom/cal.com
- https://github.com/vercel/nextjs-subscription-payments
- https://github.com/lobehub/lobe-chat

## Next Steps

1. **Customize Categories**: Add your own repository categories in Supabase
2. **Bulk Import**: Use the admin interface to add more repositories
3. **AI Tuning**: Adjust the AI prompts in `src/lib/ai-repository.ts`
4. **UI Customization**: Modify the search interfaces to fit your needs

## Need Help?

1. Check the browser console for detailed error messages
2. Check your Supabase logs for database errors
3. Verify all environment variables are set correctly
4. Make sure the database migration completed successfully 
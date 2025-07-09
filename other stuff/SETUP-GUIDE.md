# 🚀 Setup Guide - AI-Powered UI Resource Recommender

## 📋 Prerequisites
- ✅ Environment variables configured in `.env.local`
- ✅ Supabase project created
- ✅ OpenAI API key
- ✅ Gemini API key

## 🗄️ Step 1: Database Setup

### 1.1 Run the Database Schema
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the entire content from `database-setup.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the schema

### 1.2 Verify Tables Created
Check that these tables were created in **Table Editor**:
- `users`
- `resources`
- `search_queries`
- `payments`
- `categories`
- `resource_categories`
- `user_favorites`

## 🔐 Step 2: Authentication Setup

### 2.1 Configure Email Authentication
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure your **Site URL**: `http://localhost:3000` (for development)
4. Add **Redirect URLs**: `http://localhost:3000/auth/callback`

### 2.2 Enable OAuth Providers (Optional)
**For Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add to Supabase: **Authentication** → **Settings** → **Auth Providers** → **Google**

**For GitHub:**
1. Go to GitHub **Settings** → **Developer settings** → **OAuth Apps**
2. Create new OAuth app
3. Add to Supabase: **Authentication** → **Settings** → **Auth Providers** → **GitHub**

## 🧪 Step 3: Test the Application

### 3.1 Start Development Server
```bash
npm run dev
```

### 3.2 Test Database Connection
1. Open http://localhost:3000
2. Try searching for "dashboard"
3. Check if sample resources appear

### 3.3 Test Search API
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "dashboard with charts"}'
```

## 🎯 Step 4: Add More Sample Data

### 4.1 Using Admin Dashboard
1. Navigate to http://localhost:3000/admin
2. Click "Add Resource"
3. Fill in resource details

### 4.2 Using SQL (Bulk Insert)
```sql
INSERT INTO public.resources (name, description, tags, resource_type, source, repo_url, framework, styling, stars) VALUES
('Tailwind UI', 'Beautiful UI components built with Tailwind CSS', 
 ARRAY['components', 'tailwind', 'ui-kit'], 'ui_library', 'tailwindui', 
 'https://tailwindui.com', ARRAY['react', 'vue'], ARRAY['tailwind'], 15000),

('Headless UI', 'Unstyled, fully accessible UI components',
 ARRAY['components', 'headless', 'accessibility'], 'ui_library', 'headlessui',
 'https://github.com/tailwindlabs/headlessui', ARRAY['react', 'vue'], ARRAY['css'], 12000);
```

## 🤖 Step 5: Test AI Features

### 5.1 Verify OpenAI Integration
1. Search for "e-commerce store"
2. Check if tags are extracted correctly
3. Verify semantic matching works

### 5.2 Test Gemini Fallback
1. Temporarily comment out OpenAI key in `.env.local`
2. Test search functionality
3. Should fallback to Gemini automatically

## 🔧 Step 6: Environment Variables Check

Ensure your `.env.local` has all required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Gemini
GOOGLE_AI_API_KEY=your-gemini-key

# Lemon Squeezy (for later)
LEMON_SQUEEZY_API_KEY=your-ls-key
LEMON_SQUEEZY_WEBHOOK_SECRET=your-webhook-secret
LEMON_SQUEEZY_STORE_ID=your-store-id

# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## ✅ Step 7: Verification Checklist

- [ ] Database schema created successfully
- [ ] Sample data inserted and visible
- [ ] Search API returns results
- [ ] AI embeddings working (OpenAI/Gemini)
- [ ] Authentication pages accessible
- [ ] Admin dashboard loads
- [ ] No console errors in browser
- [ ] Environment variables configured

## 🚨 Troubleshooting

### Database Issues
- **pgvector extension error**: Ensure vector extension is enabled in Supabase
- **RLS policy errors**: Check if policies are properly created
- **Foreign key errors**: Verify all tables are created in correct order

### API Issues
- **OpenAI errors**: Check API key and billing
- **Gemini errors**: Verify Google AI API key
- **Search returns empty**: Check if sample data exists and has embeddings

### Authentication Issues
- **Redirect errors**: Verify Site URL and Redirect URLs in Supabase
- **OAuth not working**: Check provider credentials and configuration

## 🎉 Next Steps After Setup

1. **Add Real Data**: Import resources from shadcn, OriginUI, etc.
2. **Generate Embeddings**: Run embedding generation for existing resources
3. **Test User Flows**: Create accounts, search, favorite resources
4. **Set Up Payments**: Configure Lemon Squeezy integration
5. **Deploy**: Push to Vercel for production

## 📞 Need Help?

- Check Supabase logs in Dashboard → **Logs**
- Monitor API responses in Network tab
- Check console errors in browser developer tools
- Verify environment variables are loaded correctly 
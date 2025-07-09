# 📊 Simplified Database Structure

## Overview
The StackCon Templates AI app now uses a streamlined database with only **5 core tables** for maximum simplicity and performance.

## 🗄️ Database Tables

### 1. **users** (Supabase Auth Extension)
Extends Supabase's built-in auth.users table with app-specific data.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key, references auth.users(id) |
| email | TEXT | User email address |
| role | TEXT | 'user' or 'admin' |
| plan | TEXT | 'free' or 'pro' |
| created_at | TIMESTAMP | User registration date |
| updated_at | TIMESTAMP | Last profile update |

### 2. **categories**
Simple categorization for resources.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Category name (unique) |
| description | TEXT | Category description |
| created_at | TIMESTAMP | Creation date |

**Sample Categories:**
- Dashboard
- E-commerce
- Landing Page
- Admin Panel
- Blog
- Authentication

### 3. **resources**
Core table storing all UI templates, components, and libraries.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Resource name |
| description | TEXT | Resource description |
| resource_type | TEXT | 'template', 'component', 'repository', 'ui_library' |
| framework | TEXT[] | Array of frameworks (react, vue, angular, etc.) |
| styling | TEXT[] | Array of styling methods (tailwind, css, etc.) |
| repo_url | TEXT | GitHub/repository URL |
| demo_url | TEXT | Live demo URL (optional) |
| tags | TEXT[] | Array of searchable tags |
| category_id | UUID | References categories(id) |
| is_active | BOOLEAN | Whether resource is visible in search |
| source | TEXT | 'admin' or 'user' |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

### 4. **user_favorites**
Junction table for user-saved resources.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users(id) |
| resource_id | UUID | References resources(id) |
| created_at | TIMESTAMP | When favorited |

**Constraints:** Unique(user_id, resource_id)

### 5. **search_history**
Tracks user search queries for analytics and UX.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users(id) |
| query | TEXT | Search query text |
| filters | JSONB | Applied filters (type, framework, etc.) |
| results_count | INTEGER | Number of results returned |
| created_at | TIMESTAMP | Search timestamp |

## 🔒 Security (RLS Policies)

### **users**
- Users can read/update their own data only

### **resources**
- Public read access for search
- Admin-only write access

### **categories**
- Public read access
- Admin-only write access

### **user_favorites**
- Users can only access their own favorites

### **search_history**
- Users can only access their own search history

## 📈 Performance Indexes

- **resources**: type, framework (GIN), styling (GIN), tags (GIN), is_active, category_id
- **user_favorites**: user_id, resource_id
- **search_history**: user_id, created_at (DESC)

## 🚀 Setup Instructions

1. **Run the simplified schema:**
   ```sql
   -- In Supabase SQL Editor
   -- Copy and paste contents of database-simplified.sql
   ```

2. **Verify tables created:**
   - Check Table Editor in Supabase Dashboard
   - Should see 5 tables: users, categories, resources, user_favorites, search_history

3. **Test the setup:**
   - Resources should be searchable
   - Users can favorite resources
   - Search history should be tracked for logged-in users

## 🔄 Removed Complexity

**Removed tables:**
- ❌ collections
- ❌ collection_items
- ❌ resource_ratings
- ❌ resource_categories (many-to-many)
- ❌ search_queries (renamed to search_history)
- ❌ payments

**Removed fields from resources:**
- ❌ screenshot_url
- ❌ embedding (vector search)
- ❌ downloads_count
- ❌ stars_count
- ❌ complexity fields

## 💡 Benefits of Simplified Structure

1. **Faster queries** - Fewer joins, simpler relationships
2. **Easier maintenance** - Less complex schema to manage
3. **Better performance** - Focused indexes on core functionality
4. **Simpler codebase** - Less API endpoints and logic
5. **Faster development** - Core features work reliably

This simplified structure focuses on the essential features: search, favorites, and user management, while maintaining room for future growth. 
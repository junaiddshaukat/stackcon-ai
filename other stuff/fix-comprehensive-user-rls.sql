-- ===================================
-- FIX: Comprehensive RLS Policies for `users` Table
-- This script fixes the missing INSERT policy and ensures all
-- necessary permissions are correctly configured for the public.users table.
-- ===================================

-- 1. Ensure RLS is enabled on the users table.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing RLS policies on the `users` table to ensure a clean slate.
-- It's safe to run these even if the policies don't exist.
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
-- Also dropping old policy names for good measure
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;

-- 3. Create a policy to allow users to READ their own profile.
-- This is required for the app to load the user's state.
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- 4. Create a policy to allow users to INSERT their own profile.
-- This is the missing piece that fixes the "stuck loading" issue for new users.
CREATE POLICY "Users can insert their own data"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- 5. Create a policy to allow users to UPDATE their own profile.
-- This is needed for any future profile editing features.
CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ===================================
-- VERIFICATION
-- After running this, log out and log back in (or sign up as a new user).
-- The loading issue should be gone, and the admin page and header should display correctly.
-- =================================== 
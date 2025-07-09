-- ===================================
-- FIX: Users RLS Policy
-- This script ensures users can read their own profile data,
-- which is critical for the app to function after login.
-- ===================================

-- 1. Drop the existing SELECT policy on the `users` table (if it exists)
-- It's safe to run this even if the policy doesn't exist.
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;


-- 2. Create the correct SELECT policy
-- This policy allows a user to select (read) their own row from the `users` table.
-- The `auth.uid()` function returns the ID of the currently authenticated user.
CREATE POLICY "Users can view their own data" 
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- ===================================
-- VERIFICATION
-- After running this, the loading issue should be resolved.
-- To confirm, you can check the policies on your `users` table
-- in the Supabase Dashboard under "Authentication" -> "Policies".
-- =================================== 
-- Step 1: Drop existing RLS policies that cause recursion
-- Run this first in Supabase SQL Editor

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Global admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Global admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can view profiles in their company" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can manage profiles in their company" ON user_profiles;
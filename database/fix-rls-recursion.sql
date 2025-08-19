-- Fix infinite recursion in user_profiles RLS policies
-- Run this in Supabase SQL Editor

-- First, drop all existing RLS policies on user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Global admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Global admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can view profiles in their company" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can manage profiles in their company" ON user_profiles;

-- Create simplified RLS policies that don't cause recursion
-- These policies use auth.uid() directly instead of referencing user_profiles

-- Allow users to view their own profile using auth.uid()
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

-- Allow users to update their own profile (excluding role and company changes)
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() 
        AND role = (SELECT role FROM user_profiles WHERE id = auth.uid())
        AND company_id = (SELECT company_id FROM user_profiles WHERE id = auth.uid())
    );

-- Allow global admins to view all profiles
-- We'll use a function to check if user is global admin
CREATE OR REPLACE FUNCTION is_global_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Use a direct query without RLS to avoid recursion
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_id AND role = 'global_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Global admins can view all profiles" ON user_profiles
    FOR SELECT USING (is_global_admin(auth.uid()));

-- Allow global admins to manage all profiles
CREATE POLICY "Global admins can manage all profiles" ON user_profiles
    FOR ALL USING (is_global_admin(auth.uid()))
    WITH CHECK (is_global_admin(auth.uid()));

-- Company admin policies using a similar approach
CREATE OR REPLACE FUNCTION get_user_company_id(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    company_id INTEGER;
BEGIN
    -- Use a direct query without RLS to avoid recursion
    SELECT user_profiles.company_id INTO company_id
    FROM user_profiles 
    WHERE id = user_id;
    
    RETURN company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_company_admin_for_company(user_id UUID, target_company_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    -- Use a direct query without RLS to avoid recursion
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_id 
        AND role = 'company_admin' 
        AND company_id = target_company_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow company admins to view profiles in their company
CREATE POLICY "Company admins can view company profiles" ON user_profiles
    FOR SELECT USING (
        is_company_admin_for_company(auth.uid(), company_id)
        OR is_global_admin(auth.uid())
    );

-- Allow company admins to manage profiles in their company (excluding role changes)
CREATE POLICY "Company admins can manage company profiles" ON user_profiles
    FOR UPDATE USING (
        is_company_admin_for_company(auth.uid(), company_id)
        OR is_global_admin(auth.uid())
    )
    WITH CHECK (
        (is_company_admin_for_company(auth.uid(), company_id) OR is_global_admin(auth.uid()))
        AND (
            -- Company admins can't change roles to global_admin
            role != 'global_admin' OR is_global_admin(auth.uid())
        )
    );

-- Allow inserting new profiles (for registration/invitation)
CREATE POLICY "Allow profile creation" ON user_profiles
    FOR INSERT WITH CHECK (
        -- Users can create their own profile
        id = auth.uid()
        -- Or global admins can create any profile
        OR is_global_admin(auth.uid())
        -- Or company admins can create profiles for their company
        OR (
            is_company_admin_for_company(auth.uid(), company_id) 
            AND role != 'global_admin'
        )
    );

-- Verify the policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';
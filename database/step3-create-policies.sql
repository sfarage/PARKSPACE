-- Step 3: Create new RLS policies without recursion
-- Run this third in Supabase SQL Editor

-- Allow users to view their own profile using auth.uid()
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

-- Allow global admins to view all profiles
CREATE POLICY "Global admins can view all profiles" ON user_profiles
    FOR SELECT USING (is_global_admin(auth.uid()));

-- Allow global admins to manage all profiles
CREATE POLICY "Global admins can manage all profiles" ON user_profiles
    FOR ALL USING (is_global_admin(auth.uid()))
    WITH CHECK (is_global_admin(auth.uid()));

-- Allow company admins to view profiles in their company
CREATE POLICY "Company admins can view company profiles" ON user_profiles
    FOR SELECT USING (
        is_company_admin_for_company(auth.uid(), company_id)
        OR is_global_admin(auth.uid())
    );

-- Allow profile creation
CREATE POLICY "Allow profile creation" ON user_profiles
    FOR INSERT WITH CHECK (
        -- Users can create their own profile
        id = auth.uid()
        -- Or global admins can create any profile
        OR is_global_admin(auth.uid())
    );
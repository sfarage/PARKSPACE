-- Step 2: Create helper functions to avoid recursion
-- Run this second in Supabase SQL Editor

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
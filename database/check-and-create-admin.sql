-- Check if admin profile exists and create if needed
-- Copy and paste this into Supabase SQL Editor

-- First, let's see what users exist in auth.users
SELECT 'Auth Users:' as info;
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@test.com';

-- Check what profiles exist
SELECT 'User Profiles:' as info;
SELECT id, email, name, role FROM user_profiles WHERE email = 'admin@test.com';

-- Check if there's a mismatch between auth.users and user_profiles
SELECT 'Missing Profiles:' as info;
SELECT u.id, u.email, 'MISSING PROFILE' as status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'admin@test.com' AND p.id IS NULL;

-- Create the missing admin profile if needed
INSERT INTO user_profiles (id, name, email, role, status, created_at, updated_at)
SELECT 
    u.id,
    'Global Admin',
    u.email,
    'global_admin',
    'active',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'admin@test.com'
AND NOT EXISTS (SELECT 1 FROM user_profiles p WHERE p.id = u.id);
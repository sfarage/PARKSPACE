-- Fix admin user profile
-- Run this in Supabase SQL Editor

-- First, let's see what users exist
SELECT id, email FROM auth.users WHERE email = 'admin@test.com';

-- Check if profile exists
SELECT * FROM user_profiles WHERE email = 'admin@test.com';

-- Create the profile for the admin user
INSERT INTO user_profiles (
    id, 
    name, 
    email, 
    role, 
    status,
    created_at,
    updated_at
)
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
AND NOT EXISTS (
    SELECT 1 FROM user_profiles p WHERE p.id = u.id
);

-- Verify the profile was created
SELECT up.*, u.email as auth_email 
FROM user_profiles up
JOIN auth.users u ON u.id = up.id
WHERE u.email = 'admin@test.com';
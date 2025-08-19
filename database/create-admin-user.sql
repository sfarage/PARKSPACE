-- Create admin user (run this in Supabase SQL Editor)

-- First, let's check if the user already exists
DO $$
DECLARE
    user_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@test.com') INTO user_exists;
    
    IF NOT user_exists THEN
        -- Insert into auth.users without ON CONFLICT
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_sent_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@test.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Global Admin"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO user_id;
        
        RAISE NOTICE 'Created user with ID: %', user_id;
    ELSE
        -- Get existing user ID
        SELECT id FROM auth.users WHERE email = 'admin@test.com' INTO user_id;
        RAISE NOTICE 'User already exists with ID: %', user_id;
    END IF;

    -- Create or update user profile
    INSERT INTO user_profiles (id, name, email, role, status)
    VALUES (user_id, 'Global Admin', 'admin@test.com', 'global_admin', 'active')
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        status = EXCLUDED.status;
        
    RAISE NOTICE 'User profile created/updated successfully';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;
# Fixed Database Setup Instructions

## 🔧 Step-by-Step Setup

### **Step 1: Run the Schema**
In your Supabase SQL Editor, run these files **in order**:

1. **First:** Copy and paste `schema-fixed.sql` → Click **Run**
2. **Second:** Copy and paste `rls-policies.sql` → Click **Run**  
3. **Third:** Copy and paste `functions-triggers.sql` → Click **Run**
4. **Fourth:** Copy and paste `sample-data.sql` → Click **Run**

### **Why the Split?**
I've broken the schema into separate files to avoid the column reference errors:

- **`schema-fixed.sql`** - Creates all tables with basic structure
- **`rls-policies.sql`** - Adds Row Level Security policies
- **`functions-triggers.sql`** - Adds functions and triggers
- **`sample-data.sql`** - Inserts sample data

### **Step 2: Create Your Admin User**

After running all the schema files, create your first admin user:

```sql
-- Run this in SQL Editor to create admin user
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Insert into auth.users (this simulates signup)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
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
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Global Admin"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO user_id;

    -- Insert into user_profiles
    INSERT INTO user_profiles (id, name, email, role, status)
    VALUES (user_id, 'Global Admin', 'admin@test.com', 'global_admin', 'active');
    
    RAISE NOTICE 'Admin user created with ID: %', user_id;
END $$;
```

### **Step 3: Verify Setup**

Check that everything is working:

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check sample data
SELECT * FROM companies;
SELECT * FROM spaces LIMIT 5;
SELECT name, email, role FROM user_profiles;
```

### **Step 4: Test Authentication**

1. Go to **Authentication** → **Settings** in Supabase
2. **Enable Email/Password** authentication
3. **Disable email confirmation** (for testing)
4. Try logging in with: `admin@test.com` / `admin123`

### **🚨 If You Still Get Errors:**

**Option 1: Manual Table Creation**
If you still get errors, try creating tables one by one in the Supabase Table Editor instead of SQL.

**Option 2: Simple Schema**
I can create a simplified version without complex constraints.

**Option 3: Migration Approach**
Use Supabase migrations instead of direct SQL.

Let me know if you encounter any issues with these separated files!
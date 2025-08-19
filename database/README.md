# Database Setup Instructions

## 🗄️ Setting up your Supabase Database

### Step 1: Run the Schema
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Copy and paste the contents of `schema.sql`
4. Click **Run** to execute the schema

### Step 2: Add Sample Data
1. In the same **SQL Editor**
2. Copy and paste the contents of `sample-data.sql` 
3. Click **Run** to populate with sample data

### Step 3: Configure Authentication
1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. **Enable Email/Password authentication**
3. **Disable email confirmations** for testing (optional)
4. **Set up custom email templates** if needed

### Step 4: Create Admin User
You'll need to create your first admin user. You can either:

**Option A: Through Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. **Add user** manually
3. Set email as `admin@test.com` and password as `admin123`
4. After creation, go to **Database** → **user_profiles** table
5. **Insert** a new row with:
   - `id`: (copy the user ID from auth.users)
   - `name`: 'Global Admin'
   - `email`: 'admin@test.com'
   - `role`: 'global_admin'
   - `status`: 'active'

**Option B: Through SQL**
```sql
-- First create the auth user (run in SQL Editor)
SELECT auth.create_user(
  email := 'admin@test.com',
  password := 'admin123',
  email_confirm := true
);

-- Then get the user ID and create profile
INSERT INTO user_profiles (id, name, email, role, status)
SELECT 
  id,
  'Global Admin',
  'admin@test.com',
  'global_admin',
  'active'
FROM auth.users 
WHERE email = 'admin@test.com';
```

### Step 5: Verify Setup
1. **Check Tables**: Ensure all tables are created in **Database** → **Tables**
2. **Check Policies**: Verify RLS policies in **Database** → **Policies**
3. **Test Authentication**: Try logging in with your admin credentials

### 📋 Tables Created
- `companies` - Company information
- `user_profiles` - Extended user data (linked to auth.users)
- `spaces` - Parking spaces
- `vehicles` - User vehicles
- `events` - Parking events
- `event_pools` - Spaces pooled for events
- `email_notifications` - Email queue system

### 🔒 Security Features
- **Row Level Security (RLS)** enabled on all tables
- **Role-based access policies**:
  - Global admins: Full access to everything
  - Company admins: Access to their company data
  - Members: Access to their own data and company events
- **Automatic user profile creation** on signup
- **UUID-based user identification**

### 🚀 Next Steps
After running these scripts, you'll need to:
1. Update your React app to use Supabase Auth instead of demo login
2. Replace demo data with real Supabase queries
3. Set up the notification system with the email_notifications table

### 🔧 Troubleshooting
- If you get permission errors, ensure RLS policies are correct
- If triggers fail, check that the functions are created properly
- For auth issues, verify email/password is enabled in Auth settings
-- Row Level Security (RLS) Policies
-- Run this AFTER schema-fixed.sql

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Global admins can manage all companies" ON companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'global_admin'
    )
  );

CREATE POLICY "Company users can view their company" ON companies
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('company_admin', 'member')
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Global admins can manage all users" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'global_admin'
    )
  );

CREATE POLICY "Company admins can view their company users" ON user_profiles
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'company_admin'
    )
  );

CREATE POLICY "Company admins can update their company users" ON user_profiles
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'company_admin'
    )
  );

-- RLS Policies for spaces
CREATE POLICY "Global admins can manage all spaces" ON spaces
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'global_admin'
    )
  );

CREATE POLICY "Company users can view available spaces" ON spaces
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    ) OR company_id IS NULL
  );

-- RLS Policies for vehicles
CREATE POLICY "Users can manage their own vehicles" ON vehicles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Global admins can view all vehicles" ON vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'global_admin'
    )
  );

CREATE POLICY "Company admins can view company vehicles" ON vehicles
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid() AND role = 'company_admin'
    )
  );

-- RLS Policies for events
CREATE POLICY "Global admins can manage all events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'global_admin'
    )
  );

CREATE POLICY "All authenticated users can view events" ON events
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for event_pools
CREATE POLICY "Global admins can manage all event pools" ON event_pools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'global_admin'
    )
  );

CREATE POLICY "Company users can view their company event pools" ON event_pools
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- RLS Policies for email_notifications (admin only)
CREATE POLICY "Only global admins can manage notifications" ON email_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'global_admin'
    )
  );
-- Database Functions and Triggers
-- Run this AFTER rls-policies.sql

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at automatically
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON spaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_notifications_updated_at BEFORE UPDATE ON email_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update company counts when users/spaces change
CREATE OR REPLACE FUNCTION update_company_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user count for affected companies
  IF TG_TABLE_NAME = 'user_profiles' THEN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      UPDATE companies SET user_count = (
        SELECT COUNT(*) FROM user_profiles WHERE company_id = NEW.company_id
      ) WHERE id = NEW.company_id;
    END IF;
    
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
      UPDATE companies SET user_count = (
        SELECT COUNT(*) FROM user_profiles WHERE company_id = OLD.company_id
      ) WHERE id = OLD.company_id;
    END IF;
  END IF;
  
  -- Update space count for affected companies
  IF TG_TABLE_NAME = 'spaces' THEN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      UPDATE companies SET space_count = (
        SELECT COUNT(*) FROM spaces WHERE company_id = NEW.company_id
      ) WHERE id = NEW.company_id;
    END IF;
    
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
      UPDATE companies SET space_count = (
        SELECT COUNT(*) FROM spaces WHERE company_id = OLD.company_id
      ) WHERE id = OLD.company_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to automatically update company counts
CREATE TRIGGER update_company_user_count
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_company_counts();

CREATE TRIGGER update_company_space_count
  AFTER INSERT OR UPDATE OR DELETE ON spaces
  FOR EACH ROW EXECUTE FUNCTION update_company_counts();
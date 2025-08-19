-- Sample data for ParkSpace database
-- Run this AFTER the schema.sql file

-- Insert sample companies
INSERT INTO companies (name, user_count, space_count) VALUES
  ('TechCorp Ltd', 0, 0),
  ('Design Studios', 0, 0),
  ('Marketing Agency', 0, 0)
ON CONFLICT (name) DO NOTHING;

-- Insert sample parking spaces
INSERT INTO spaces (code, block, number, company_id, assigned_at, status) VALUES
  -- TechCorp spaces
  ('A01', 'A', '01', 1, '2024-03-01', 'available'),
  ('A02', 'A', '02', 1, '2024-03-01', 'available'),
  ('A03', 'A', '03', 1, '2024-03-01', 'available'),
  ('A04', 'A', '04', 1, '2024-03-01', 'available'),
  ('A05', 'A', '05', 1, '2024-03-01', 'available'),
  ('A06', 'A', '06', 1, '2024-03-01', 'available'),
  
  -- Design Studios spaces
  ('B01', 'B', '01', 2, '2024-03-05', 'available'),
  ('B02', 'B', '02', 2, '2024-03-05', 'available'),
  
  -- Unassigned spaces
  ('B03', 'B', '03', NULL, NULL, 'available'),
  ('B04', 'B', '04', NULL, NULL, 'available'),
  
  -- Marketing Agency space
  ('C01', 'C', '01', 3, '2024-03-12', 'available'),
  ('C02', 'C', '02', NULL, NULL, 'available')
ON CONFLICT (code) DO NOTHING;

-- Insert sample events
INSERT INTO events (name, description, start_date, end_date, status) VALUES
  ('Q1 Conference 2024', 'Annual company conference with guest speakers', '2024-04-15', '2024-04-17', 'active'),
  ('Summer Team Building', 'Team building activities and workshops', '2024-06-20', '2024-06-21', 'active')
ON CONFLICT DO NOTHING;

-- Update company space counts
UPDATE companies SET space_count = (
  SELECT COUNT(*) FROM spaces WHERE spaces.company_id = companies.id
);

-- Note: User profiles and vehicles will be created when users sign up
-- through the authentication system or are manually created by admins
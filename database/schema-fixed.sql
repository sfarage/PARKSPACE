-- ParkSpace Database Schema - Fixed Version
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS email_notifications CASCADE;
DROP TABLE IF EXISTS event_pools CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS spaces CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Companies table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_count INTEGER DEFAULT 0,
  space_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  last_active_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints after table creation
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('global_admin', 'company_admin', 'member'));

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_status_check 
  CHECK (status IN ('active', 'pending', 'suspended'));

-- Spaces table
CREATE TABLE spaces (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  block VARCHAR(5) NOT NULL,
  number VARCHAR(5) NOT NULL,
  company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraint after table creation
ALTER TABLE spaces ADD CONSTRAINT spaces_status_check 
  CHECK (status IN ('available', 'occupied', 'reserved'));

-- Vehicles table
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  plate VARCHAR(20) NOT NULL UNIQUE,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraint after table creation
ALTER TABLE events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('draft', 'active', 'completed', 'cancelled'));

-- Event pools table (spaces pooled for events)
CREATE TABLE event_pools (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  space_id INTEGER REFERENCES spaces(id) ON DELETE CASCADE,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  pooled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pooled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, space_id) -- Prevent duplicate space pooling for same event
);

-- Email notifications table
CREATE TABLE email_notifications (
  id SERIAL PRIMARY KEY,
  recipient_email VARCHAR(255) NOT NULL,
  notification_type VARCHAR(100) NOT NULL,
  email_content JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints after table creation
ALTER TABLE email_notifications ADD CONSTRAINT email_notifications_type_check 
  CHECK (notification_type IN ('welcome', 'event_created', 'event_reminder'));

ALTER TABLE email_notifications ADD CONSTRAINT email_notifications_status_check 
  CHECK (status IN ('pending', 'sent', 'failed'));

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_company_id ON user_profiles(company_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_spaces_company_id ON spaces(company_id);
CREATE INDEX idx_spaces_status ON spaces(status);
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_vehicles_company_id ON vehicles(company_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_event_pools_event_id ON event_pools(event_id);
CREATE INDEX idx_event_pools_company_id ON event_pools(company_id);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);
CREATE INDEX idx_email_notifications_scheduled ON email_notifications(scheduled_for);
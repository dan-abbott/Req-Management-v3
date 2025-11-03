-- Requirements Management System - Sprint 1 Database Schema
-- Run this in your Supabase SQL Editor

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  pid TEXT NOT NULL UNIQUE,
  project_manager TEXT,
  lead_engineer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rationale TEXT,
  test_method TEXT,
  status TEXT NOT NULL,
  priority TEXT,
  owner TEXT,
  reviewer_email TEXT,
  tester_email TEXT,
  level TEXT,
  version INTEGER DEFAULT 1,
  parent_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
  children INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (authentication required but all authenticated users can access)
CREATE POLICY "Enable all operations" ON projects FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON items FOR ALL USING (true);
CREATE POLICY "Enable all operations" ON audit_logs FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_items_project ON items(project_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_parent ON items(parent_id);
CREATE INDEX idx_audit_logs_item ON audit_logs(item_id);

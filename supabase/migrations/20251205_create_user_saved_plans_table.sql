-- Migration: Create user_saved_plans table
-- Description: Allows users to save/bookmark plans for quick access and offline download
-- Author: Kinetic Team
-- Date: 2025-12-05

-- Create the user_saved_plans table
CREATE TABLE IF NOT EXISTS user_saved_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_downloaded BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, plan_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_saved_plans_user_id ON user_saved_plans(user_id);
CREATE INDEX idx_user_saved_plans_plan_id ON user_saved_plans(plan_id);
CREATE INDEX idx_user_saved_plans_saved_at ON user_saved_plans(saved_at DESC);

-- Enable Row Level Security
ALTER TABLE user_saved_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own saved plans
CREATE POLICY "Users can view their own saved plans"
  ON user_saved_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own saved plans
CREATE POLICY "Users can insert their own saved plans"
  ON user_saved_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own saved plans
CREATE POLICY "Users can delete their own saved plans"
  ON user_saved_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own saved plans (for is_downloaded flag)
CREATE POLICY "Users can update their own saved plans"
  ON user_saved_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE user_saved_plans IS 'Stores plans saved/bookmarked by users for quick access and offline download';
COMMENT ON COLUMN user_saved_plans.is_downloaded IS 'Flag to track if plan has been downloaded for offline use';

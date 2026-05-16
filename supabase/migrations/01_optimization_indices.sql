-- Optimization Indices for Kinetic App
-- This migration adds database indices to improve query performance
-- and reduce database load for common queries.

-- Index for exercises table
-- Speeds up filtering by category
CREATE INDEX IF NOT EXISTS idx_exercises_category 
ON exercises(category);

-- Index for exercises table
-- Speeds up filtering by body_zone (array column)
CREATE INDEX IF NOT EXISTS idx_exercises_body_zone 
ON exercises USING GIN(body_zone);

-- Index for workout_logs table
-- Speeds up queries filtering by user_id and sorting by created_at
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date 
ON workout_logs(user_id, created_at DESC);

-- Index for goals table
-- Speeds up queries filtering by user_id and status
CREATE INDEX IF NOT EXISTS idx_goals_user_status 
ON goals(user_id, status);

-- Index for body_metrics table
-- Speeds up queries filtering by user_id and sorting by recorded_at
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date 
ON body_metrics(user_id, recorded_at DESC);

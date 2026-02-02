-- Migration: Add saved_recipes table for users to save/favorite recipes
-- Run this in Supabase SQL Editor

-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  recipe_title TEXT NOT NULL,
  recipe_data JSONB,
  is_from_database BOOLEAN DEFAULT true,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_title)
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user ON saved_recipes(user_id);

-- Create index for recipe lookups
CREATE INDEX IF NOT EXISTS idx_saved_recipes_recipe ON saved_recipes(recipe_id);

-- Add comment
COMMENT ON TABLE saved_recipes IS 'Stores user-saved/favorited recipes';
COMMENT ON COLUMN saved_recipes.recipe_id IS 'References recipes table for DB recipes, NULL for AI-generated';
COMMENT ON COLUMN saved_recipes.recipe_title IS 'Recipe title - used as unique identifier per user';
COMMENT ON COLUMN saved_recipes.recipe_data IS 'Full recipe JSON for AI-generated recipes';
COMMENT ON COLUMN saved_recipes.is_from_database IS 'true if from recipes table, false if AI-generated';

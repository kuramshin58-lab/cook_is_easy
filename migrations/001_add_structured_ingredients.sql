-- Migration: Add structured ingredients and improved schema
-- Description: Add JSONB structured_ingredients column, nutrition fields, and constraints
-- Author: Database Schema Improvement Plan
-- Date: 2026-01-26

-- Step 1: Add new columns with defaults
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS structured_ingredients JSONB,
  ADD COLUMN IF NOT EXISTS protein INTEGER CHECK (protein >= 0),
  ADD COLUMN IF NOT EXISTS fats INTEGER CHECK (fats >= 0),
  ADD COLUMN IF NOT EXISTS carbs INTEGER CHECK (carbs >= 0),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Normalize difficulty values before adding constraints
UPDATE recipes
SET difficulty = LOWER(difficulty)
WHERE difficulty IS NOT NULL;

UPDATE recipes
SET difficulty = 'medium'
WHERE difficulty IN ('intermediate', 'normal');

UPDATE recipes
SET difficulty = 'hard'
WHERE difficulty IN ('difficult', 'advanced', 'expert');

-- Step 3: Add constraints to existing columns
ALTER TABLE recipes
  ADD CONSTRAINT recipes_difficulty_check
    CHECK (difficulty IN ('easy', 'medium', 'hard') OR difficulty IS NULL);

ALTER TABLE recipes
  ADD CONSTRAINT recipes_prep_time_check
    CHECK (prep_time >= 0 OR prep_time IS NULL);

ALTER TABLE recipes
  ADD CONSTRAINT recipes_cook_time_check
    CHECK (cook_time >= 0 OR cook_time IS NULL);

ALTER TABLE recipes
  ADD CONSTRAINT recipes_servings_check
    CHECK (servings > 0 OR servings IS NULL);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_structured_ingredients
  ON recipes USING GIN (structured_ingredients);

CREATE INDEX IF NOT EXISTS idx_recipes_title
  ON recipes USING GIN (to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_recipes_difficulty
  ON recipes(difficulty) WHERE difficulty IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recipes_cook_time
  ON recipes(cook_time) WHERE cook_time IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recipes_prep_time
  ON recipes(prep_time) WHERE prep_time IS NOT NULL;

-- Step 5: Add trigger for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Step 6: Add comment explaining the JSONB structure
COMMENT ON COLUMN recipes.structured_ingredients IS
'JSONB array of structured ingredients with format:
[{
  "name": "normalized ingredient name",
  "display_name": "Display Name",
  "amount": "quantity",
  "unit": "measurement unit",
  "category": "key|important|flavor|base",
  "is_required": true|false,
  "substitutes": ["alternative1", "alternative2"],
  "notes": "additional information"
}]';

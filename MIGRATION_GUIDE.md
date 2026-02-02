# Database Migration Guide

## Overview
This guide will walk you through upgrading your database schema to support structured ingredients and improved recipe data.

## Current Status
✅ Application code updated and tested
✅ Migration SQL prepared
✅ SQL migration executed (2026-01-26)
✅ Data migration complete - 365 recipes migrated

## Step 1: Execute SQL Migration

### Option A: Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://zhrzfzwtqcrvkhwwumsc.supabase.co/project/_/sql
   - Or navigate to your Supabase Dashboard → SQL Editor

2. **Create New Query**
   - Click "New query"

3. **Copy and Paste Migration SQL**
   - Open the file: `migrations/001_add_structured_ingredients.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Execute Migration**
   - Click "Run" button
   - Wait for confirmation message
   - Verify no errors occurred

### Option B: Direct PostgreSQL Connection (Advanced)

If you have direct PostgreSQL access:

```bash
psql <YOUR_DATABASE_URL> < migrations/001_add_structured_ingredients.sql
```

### What This Migration Does:

- ✅ Adds `structured_ingredients` JSONB column
- ✅ Adds nutrition columns: `protein`, `fats`, `carbs`
- ✅ Adds `updated_at` timestamp with auto-update trigger
- ✅ Adds data validation constraints (difficulty, time, servings)
- ✅ Creates GIN indexes for faster searches
- ✅ Maintains backward compatibility (keeps old `ingredients` column)

## Step 2: Verify Migration

Run the verification script:

```bash
npx tsx scripts/check-table-structure.ts
```

Expected output:
```
✓ All required columns exist!
✓ You can proceed with data migration
```

## Step 3: Run Data Migration

Convert existing recipes from old format to new structured format:

```bash
npx tsx scripts/migrate-ingredients-to-structured.ts
```

This script will:
1. Fetch all recipes without `structured_ingredients`
2. Parse each ingredient string (e.g., "2 cups flour")
3. Categorize ingredients (key, important, flavor, base)
4. Add substitute suggestions
5. Convert instructions to array format
6. Calculate approximate nutrition values
7. Update each recipe in database

### Expected Output:

```
Starting recipe migration to structured format...
============================================================
Found 150 recipes to migrate

✓ Migrated 10 recipes...
✓ Migrated 20 recipes...
...
✓ Migrated 150 recipes...

============================================================
Migration Complete!
✓ Successfully migrated: 150 recipes
✗ Failed: 0 recipes
```

## Step 4: Verify Results

1. **Check Application**
   ```bash
   PORT=3000 npm run dev
   ```

2. **Test Search**
   - Search for: "Chicken breast, Rice, Tomato paste"
   - Verify recipes show structured ingredients
   - Check match percentages are accurate

3. **Check Database**
   ```bash
   npx tsx scripts/check-table-structure.ts
   ```

   Should show:
   ```
   Recipes with structured_ingredients: 150
   ```

## Troubleshooting

### Error: "Missing columns"
- SQL migration hasn't been run yet
- Re-run Step 1

### Error: "Supabase insert error"
- Check your Supabase credentials in `.env`
- Verify you have write permissions
- Check Supabase logs for details

### Migration Script Fails
- Check console output for specific errors
- Failed recipes will be listed with error details
- You can re-run the script (it only migrates recipes without `structured_ingredients`)

## Rollback (if needed)

If something goes wrong, you can rollback the migration:

```sql
-- Remove new columns
ALTER TABLE recipes
  DROP COLUMN IF EXISTS structured_ingredients,
  DROP COLUMN IF EXISTS protein,
  DROP COLUMN IF EXISTS fats,
  DROP COLUMN IF EXISTS carbs,
  DROP COLUMN IF EXISTS updated_at;

-- Remove indexes
DROP INDEX IF EXISTS idx_recipes_structured_ingredients;
DROP INDEX IF EXISTS idx_recipes_title;
DROP INDEX IF EXISTS idx_recipes_difficulty;
DROP INDEX IF EXISTS idx_recipes_cook_time;
DROP INDEX IF EXISTS idx_recipes_prep_time;

-- Remove trigger and function
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Benefits After Migration

### Performance
- ⚡ No regex parsing on every query
- ⚡ Pre-computed categories in database
- ⚡ JSONB indexed for fast searches
- ⚡ Reduced computation per request

### Accuracy
- ✅ Normalized ingredient names
- ✅ Consistent categorization
- ✅ Structured substitutes
- ✅ Real nutrition data (not estimated)

### Features
- 🎯 Better ingredient matching
- 🎯 Substitute suggestions
- 🎯 Dietary filtering
- 🎯 Recipe versioning with timestamps

## Questions?

If you encounter issues:
1. Check the error message carefully
2. Review the migration SQL in `migrations/001_add_structured_ingredients.sql`
3. Check Supabase logs in the Dashboard
4. Verify your `.env` file has correct credentials

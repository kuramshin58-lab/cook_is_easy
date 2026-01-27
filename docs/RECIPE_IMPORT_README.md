# Recipe Import System - Complete Guide

## Overview

This system provides tools for importing recipes into the database in an **optimized structured format** that's perfectly aligned with the search algorithm.

## 📁 Files Created

### Documentation
- **docs/CSV_FORMAT_GUIDE.md** - Complete format specification for parsing agent
- **docs/INGREDIENT_CATEGORIES.md** - Ingredient categorization reference
- **docs/RECIPE_IMPORT_README.md** - This file
- **templates/recipe_template.csv** - Example recipes in correct format

### Scripts
- **scripts/convert-legacy-csv.ts** - Convert old CSV files to new format
- **scripts/validate-csv.ts** - Validate CSV before import
- **scripts/import-structured-recipes.ts** - Import CSV to database

---

## 🚀 Quick Start

### Option 1: Import New Recipes (Scraped in New Format)

If you have recipes already in the new optimized format:

```bash
# 1. Validate the CSV
npx tsx scripts/validate-csv.ts data/new_recipes.csv

# 2. Import to database
npx tsx scripts/import-structured-recipes.ts data/new_recipes.csv
```

### Option 2: Convert Existing CSV Files

If you have old CSV files (pasta_recipes.csv, chicken_recipes.csv, etc.):

```bash
# 1. Convert old format to new format
npx tsx scripts/convert-legacy-csv.ts data/pasta_recipes.csv data/pasta_recipes_new.csv

# 2. Validate converted CSV
npx tsx scripts/validate-csv.ts data/pasta_recipes_new.csv

# 3. Import to database
npx tsx scripts/import-structured-recipes.ts data/pasta_recipes_new.csv
```

---

## 📖 Detailed Workflows

### Workflow 1: For Claude Parsing Agent

**Step 1**: Read the format guide
```
docs/CSV_FORMAT_GUIDE.md
docs/INGREDIENT_CATEGORIES.md
```

**Step 2**: Use the template as reference
```
templates/recipe_template.csv
```

**Step 3**: Parse recipes in new format and export CSV

**Step 4**: Validate
```bash
npx tsx scripts/validate-csv.ts your_recipes.csv
```

**Step 5**: Import
```bash
npx tsx scripts/import-structured-recipes.ts your_recipes.csv
```

---

### Workflow 2: Converting Existing Data

You have existing CSV files (pasta_recipes.csv, chicken_recipes.csv, etc.)

**Step 1**: Find your CSV files
```bash
ls *.csv
# Example output:
# pasta_recipes_1769088996005.csv
# chicken_breast_recipes_1769119816083.csv
# potato_recipes_1769112172573.csv
```

**Step 2**: Convert each file
```bash
# Convert pasta recipes
npx tsx scripts/convert-legacy-csv.ts \
  pasta_recipes_1769088996005.csv \
  pasta_recipes_optimized.csv

# Convert chicken recipes
npx tsx scripts/convert-legacy-csv.ts \
  chicken_breast_recipes_1769119816083.csv \
  chicken_recipes_optimized.csv
```

**Expected output:**
```
============================================================
LEGACY CSV CONVERTER
============================================================

Input:  pasta_recipes_1769088996005.csv
Output: pasta_recipes_optimized.csv

📖 Reading legacy CSV file...
✓ Found 45 recipes

🔄 Converting recipes...

  ✓ Converted 10 recipes...
  ✓ Converted 20 recipes...
  ✓ Converted 30 recipes...
  ✓ Converted 40 recipes...

✓ Successfully converted: 43 recipes
⚠️  Skipped: 2 recipes

💾 Writing optimized CSV file...
✓ Output saved to: pasta_recipes_optimized.csv

============================================================
CONVERSION COMPLETE!
============================================================

✅ 43 recipes converted successfully!

Next steps:
1. Review the output file: pasta_recipes_optimized.csv
2. Validate it: npx tsx scripts/validate-csv.ts pasta_recipes_optimized.csv
3. Import to database: npx tsx scripts/import-structured-recipes.ts pasta_recipes_optimized.csv
```

**Step 3**: Validate converted files
```bash
npx tsx scripts/validate-csv.ts pasta_recipes_optimized.csv
```

**Expected output:**
```
============================================================
CSV VALIDATION REPORT
============================================================

File: pasta_recipes_optimized.csv

✓ Found 43 recipes

🔍 Validating recipes...

📊 VALIDATION RESULTS

Total recipes: 43
Errors: 0
Warnings: 2

⚠️  WARNINGS:

  Row 5, field "ingredients":
  → Recipe has many ingredients (>20), might be too complex
  → Value: 22

  Row 12, field "calories":
  → calories is outside typical range (100-1500)
  → Value: 1600

============================================================
✅ VALIDATION PASSED
============================================================

This CSV is ready for import!
Run: npx tsx scripts/import-structured-recipes.ts pasta_recipes_optimized.csv
```

**Step 4**: Import to database
```bash
npx tsx scripts/import-structured-recipes.ts pasta_recipes_optimized.csv
```

**Expected output:**
```
============================================================
IMPORT STRUCTURED RECIPES
============================================================

File: pasta_recipes_optimized.csv

📖 Reading CSV file...
✓ Found 43 recipes

⚠️  This will import 43 recipes to your Supabase database.
   Make sure you have run the validation script first!

🚀 Starting import...

  ✓ Imported 10 recipes...
  ✓ Imported 20 recipes...
  ✓ Imported 30 recipes...
  ✓ Imported 40 recipes...

============================================================
IMPORT COMPLETE!
============================================================

✅ Successfully imported: 43 recipes
❌ Failed: 0 recipes

🎉 Recipes are now live in the database!
   They are ready for search immediately with structured ingredients.

Next steps:
1. Test search: PORT=3000 npm run dev
2. Search for ingredients from imported recipes
3. Verify match scores are accurate
```

---

## 🔍 Script Details

### convert-legacy-csv.ts

**Purpose**: Convert old CSV format to new optimized format

**Usage**:
```bash
npx tsx scripts/convert-legacy-csv.ts <input.csv> <output.csv>
```

**What it does**:
- Reads old CSV with various column names (flexible parsing)
- Parses ingredients from strings like "2 cups flour"
- Auto-categorizes ingredients (key, important, flavor, base)
- Adds substitute suggestions
- Normalizes difficulty values
- Converts instructions to array format
- Calculates nutrition macros
- Outputs optimized CSV ready for validation

**Error Handling**:
- Skips recipes without title or ingredients
- Warns about recipes without key ingredients
- Reports conversion statistics

---

### validate-csv.ts

**Purpose**: Validate CSV format before importing

**Usage**:
```bash
npx tsx scripts/validate-csv.ts <file.csv>
```

**What it checks**:
- **Required fields**: All fields present and non-empty
- **Difficulty**: Must be 'easy', 'medium', or 'hard' (lowercase)
- **Times**: Must be positive integers
- **Servings**: Must be positive integer
- **Ingredients JSON**: Valid JSON, correct structure, proper categories
- **Instructions JSON**: Valid JSON array of strings
- **Nutrition**: Non-negative integers, reasonable ranges
- **URL**: Valid URL format
- **At least ONE key ingredient**: Critical for search algorithm

**Exit codes**:
- `0` - Validation passed
- `1` - Validation failed (has errors)

---

### import-structured-recipes.ts

**Purpose**: Import validated CSV directly to Supabase

**Usage**:
```bash
npx tsx scripts/import-structured-recipes.ts <file.csv>
```

**What it does**:
- Reads optimized CSV
- Parses JSON fields (ingredients, instructions)
- Converts to database format
- Inserts into `recipes` table with:
  - `structured_ingredients` (JSONB) - ready for search!
  - `ingredients` (TEXT[]) - legacy format for backward compatibility
  - `instructions` (TEXT[]) - array of steps
  - All nutrition fields populated
- Reports success/failure for each recipe

**Database fields populated**:
```typescript
{
  title: string,
  description: string,
  difficulty: 'easy' | 'medium' | 'hard',
  prep_time: number,
  cook_time: number,
  servings: number,
  structured_ingredients: JSONB, // ⭐ Optimized format!
  ingredients: string[], // Legacy
  instructions: string[], // Array format
  calories: number,
  protein: number,
  fats: number,
  carbs: number,
  tags: string[],
  source_url: string
}
```

---

## 🎯 Benefits of New Format

### Before (Old Format)
```csv
Title,Description,Ingredients,...
"Pasta Carbonara","Delicious pasta","400g spaghetti, 150g bacon, 4 eggs",...
```

**Problems**:
- ❌ Ingredients as plain strings
- ❌ Regex parsing on every query
- ❌ No categories stored
- ❌ No substitutes
- ❌ Manual post-processing needed

### After (New Format)
```csv
title,description,ingredients,...
"Pasta Carbonara","Delicious pasta","[{""name"":""spaghetti"",""amount"":""400"",""unit"":""g"",""category"":""key"",""substitutes"":[""linguine"",""fettuccine""]}]",...
```

**Benefits**:
- ✅ Structured ingredients (JSONB)
- ✅ Pre-categorized (key, important, flavor, base)
- ✅ Substitutes included
- ✅ Direct import, no post-processing
- ✅ Ready for search immediately!
- ✅ Faster queries (no regex)
- ✅ Better match accuracy

---

## 🧪 Testing

### Test with Template Recipes

```bash
# 1. Copy template
cp templates/recipe_template.csv test_recipes.csv

# 2. Validate
npx tsx scripts/validate-csv.ts test_recipes.csv
# Should pass ✅

# 3. Import
npx tsx scripts/import-structured-recipes.ts test_recipes.csv
# Should import 3 recipes: Carbonara, Chicken Tikka Masala, Chickpea Bowl

# 4. Test search
PORT=3000 npm run dev
# Search for "spaghetti, eggs, bacon" → should find Carbonara
# Search for "chicken, rice, tomato" → should find Chicken Tikka Masala
# Search for "chickpeas, quinoa" → should find Chickpea Bowl
```

### Test with Existing Data

```bash
# 1. Find an existing CSV file
ls *.csv
# Example: pasta_recipes_1769088996005.csv

# 2. Convert
npx tsx scripts/convert-legacy-csv.ts \
  pasta_recipes_1769088996005.csv \
  test_pasta.csv

# 3. Validate
npx tsx scripts/validate-csv.ts test_pasta.csv

# 4. Import a few recipes (edit CSV to keep only 5 recipes for testing)
npx tsx scripts/import-structured-recipes.ts test_pasta.csv

# 5. Test search
PORT=3000 npm run dev
# Search for ingredients from imported recipes
```

---

## 🐛 Troubleshooting

### Issue: "File not found"
```bash
# Check file path
ls -la data/
pwd
```

### Issue: "Invalid JSON in ingredients field"
- Check CSV for unescaped quotes
- Correct: `"[{""name"":""chicken""}]"`
- Wrong: `"[{"name":"chicken"}]"`

### Issue: "No KEY ingredients"
- Every recipe MUST have at least one ingredient with `category: "key"`
- Main proteins and starches should be KEY
- See `docs/INGREDIENT_CATEGORIES.md` for guidance

### Issue: "Validation failed"
- Read error messages carefully
- Fix issues in CSV
- Re-run validation
- Common fixes:
  - Difficulty must be lowercase: `easy` not `Easy`
  - Times must be integers: `15` not `"15 min"`
  - Servings must be positive: `4` not `"4 servings"`

### Issue: "Import failed - Supabase error"
- Check `.env` file has correct credentials
- Verify database migration was run
- Check Supabase logs in dashboard

---

## 📝 Summary

### Quick Command Reference

```bash
# Convert old CSV to new format
npx tsx scripts/convert-legacy-csv.ts old.csv new.csv

# Validate CSV
npx tsx scripts/validate-csv.ts new.csv

# Import to database
npx tsx scripts/import-structured-recipes.ts new.csv

# Test search
PORT=3000 npm run dev
```

### File Locations

- **Documentation**: `docs/`
- **Templates**: `templates/`
- **Scripts**: `scripts/`
- **Your data**: Store CSVs in project root or `data/` folder

---

## 🎉 You're Ready!

The system is complete and ready to use. You can now:

1. ✅ Convert existing CSV files to optimized format
2. ✅ Validate CSV files before import
3. ✅ Import recipes directly with structured ingredients
4. ✅ Share format guide with Claude parsing agent
5. ✅ Get better search results immediately!

**Next step**: Convert your existing CSV files and test the search! 🚀

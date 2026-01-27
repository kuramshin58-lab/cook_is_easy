/**
 * Import Structured Recipes from Optimized CSV
 *
 * This script imports recipes from the new optimized CSV format directly into the database.
 * Recipes are imported with structured_ingredients already populated, ready for search immediately!
 *
 * Usage: npx tsx scripts/import-structured-recipes.ts <file.csv>
 * Example: npx tsx scripts/import-structured-recipes.ts data/pasta_recipes_new.csv
 */

import 'dotenv/config';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { supabase } from '../server/supabase';

interface OptimizedRecipe {
  title: string;
  description: string;
  difficulty: string;
  prep_time: string;
  cook_time: string;
  servings: string;
  ingredients: string; // JSON string
  instructions: string; // JSON string
  calories: string;
  protein: string;
  fats: string;
  carbs: string;
  tags: string;
  source_url: string;
}

interface ImportError {
  recipe: string;
  error: string;
}

/**
 * Import recipes from CSV to Supabase
 */
async function importRecipes(filePath: string) {
  console.log('='.repeat(70));
  console.log('IMPORT STRUCTURED RECIPES');
  console.log('='.repeat(70));
  console.log(`\nFile: ${filePath}\n`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`);
    process.exit(1);
  }

  // Read and parse CSV
  console.log('📖 Reading CSV file...');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  let recipes: OptimizedRecipe[];
  try {
    recipes = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (error) {
    console.error('❌ Error parsing CSV:', error);
    process.exit(1);
  }

  console.log(`✓ Found ${recipes.length} recipes\n`);

  // Confirm import
  console.log(`⚠️  This will import ${recipes.length} recipes to your Supabase database.`);
  console.log('   Make sure you have run the validation script first!\n');

  // Import recipes
  console.log('🚀 Starting import...\n');

  let successCount = 0;
  let errorCount = 0;
  const errors: ImportError[] = [];

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];

    try {
      // Parse JSON fields
      const structuredIngredients = JSON.parse(recipe.ingredients);
      const instructionSteps = JSON.parse(recipe.instructions);

      // Parse numeric fields
      const prep_time = parseInt(recipe.prep_time, 10);
      const cook_time = parseInt(recipe.cook_time, 10);
      const servings = parseInt(recipe.servings, 10);
      const calories = parseInt(recipe.calories, 10);
      const protein = parseInt(recipe.protein, 10);
      const fats = parseInt(recipe.fats, 10);
      const carbs = parseInt(recipe.carbs, 10);

      // Convert tags to array
      const tagsArray = recipe.tags
        ? recipe.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];

      // Prepare database record
      const dbRecord = {
        title: recipe.title,
        description: recipe.description,
        difficulty: recipe.difficulty.toLowerCase(),
        prep_time,
        cook_time,
        servings,
        structured_ingredients: structuredIngredients,
        ingredients: structuredIngredients.map((ing: any) =>
          `${ing.amount} ${ing.unit} ${ing.name}`.trim()
        ), // Legacy format for backward compatibility
        instructions: instructionSteps, // Array format
        calories,
        protein,
        fats,
        carbs,
        tags: tagsArray,
        source_url: recipe.source_url,
      };

      // Insert into database
      const { error } = await supabase
        .from('recipes')
        .insert(dbRecord);

      if (error) {
        console.error(`❌ Error importing "${recipe.title}":`, error.message);
        errorCount++;
        errors.push({
          recipe: recipe.title,
          error: error.message,
        });
      } else {
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`  ✓ Imported ${successCount} recipes...`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing "${recipe.title}":`, error);
      errorCount++;
      errors.push({
        recipe: recipe.title,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('IMPORT COMPLETE!');
  console.log('='.repeat(70));
  console.log(`\n✅ Successfully imported: ${successCount} recipes`);
  console.log(`❌ Failed: ${errorCount} recipes\n`);

  if (errors.length > 0) {
    console.log('Failed recipes:\n');
    errors.forEach(({ recipe, error }) => {
      console.log(`  - ${recipe}: ${error}`);
    });
    console.log();
  }

  if (successCount > 0) {
    console.log('🎉 Recipes are now live in the database!');
    console.log('   They are ready for search immediately with structured ingredients.\n');
    console.log('Next steps:');
    console.log('1. Test search: PORT=3000 npm run dev');
    console.log('2. Search for ingredients from imported recipes');
    console.log('3. Verify match scores are accurate\n');
  }
}

// CLI execution
const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('Usage: npx tsx scripts/import-structured-recipes.ts <file.csv>');
  console.log('\nExample:');
  console.log('  npx tsx scripts/import-structured-recipes.ts data/pasta_recipes_new.csv');
  console.log('\n⚠️  Important: Run validation first!');
  console.log('  npx tsx scripts/validate-csv.ts data/pasta_recipes_new.csv\n');
  process.exit(1);
}

const [filePath] = args;

importRecipes(filePath)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });

export { importRecipes };

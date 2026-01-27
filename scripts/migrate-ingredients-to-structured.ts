/**
 * Migration Script: Convert Legacy Ingredients to Structured Format
 *
 * This script migrates existing recipes from the old TEXT[] ingredient format
 * to the new JSONB structured_ingredients format.
 *
 * Usage: npx tsx scripts/migrate-ingredients-to-structured.ts
 */

import 'dotenv/config';
import { supabase } from '../server/supabase';
import { categorizeIngredient } from '../server/weightedScoring';
import { SUBSTITUTION_MAP } from '../shared/substitutionMap';

interface OldRecipe {
  id: string;
  ingredients: string[];
  instructions: string;
  calories?: number;
}

interface StructuredIngredient {
  name: string;
  display_name: string;
  amount: string;
  unit: string;
  category: 'key' | 'important' | 'flavor' | 'base';
  is_required: boolean;
  substitutes: string[];
  notes: string;
}

/**
 * Parse a raw ingredient string into structured format
 * Handles various formats: "2 cups flour", "1 1/2 tbsp oil", "salt to taste"
 */
function parseIngredient(raw: string): StructuredIngredient {
  const patterns = [
    // "2 cups flour" or "1 1/2 cups flour"
    /^([\d.,\/\s]+)\s*(cups?|tbsp|tsp|tablespoons?|teaspoons?|g|grams?|kg|ml|l|oz|lbs?|pounds?|pieces?|cloves?)\s+(.+)$/i,
    // "2-3 tablespoons oil"
    /^([\d\-]+)\s*(cups?|tbsp|tsp|tablespoons?|teaspoons?|g|grams?|kg|ml|l|oz)\s+(.+)$/i,
    // "handful of cilantro"
    /^(handful|pinch|dash|sprinkle)\s+of\s+(.+)$/i,
    // "salt to taste"
    /^(.+)\s+to\s+taste$/i,
  ];

  let amount = '';
  let unit = '';
  let name = raw.trim();
  let notes = '';

  // Try each pattern
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) {
      if (pattern.source.includes('to\\s+taste')) {
        name = match[1].trim();
        unit = 'to taste';
      } else if (pattern.source.includes('handful|pinch')) {
        amount = match[1];
        unit = '';
        name = match[2].trim();
      } else {
        amount = match[1].trim();
        unit = match[2].trim().toLowerCase();
        name = match[3].trim();
      }
      break;
    }
  }

  // Extract notes from name (e.g., "chicken breast, boneless")
  const notesMatch = name.match(/^(.+?),\s*(.+)$/);
  if (notesMatch) {
    name = notesMatch[1].trim();
    notes = notesMatch[2].trim();
  }

  // Normalize name
  const normalizedName = name.toLowerCase().trim();
  const category = categorizeIngredient(normalizedName);

  // Get substitutes from map
  const substitutes = SUBSTITUTION_MAP[normalizedName] || [];

  // Base ingredients are optional, others are required
  const isRequired = category !== 'base';

  return {
    name: normalizedName,
    display_name: name,
    amount,
    unit: unit || '',
    category,
    is_required: isRequired,
    substitutes: substitutes.slice(0, 5), // Limit to 5
    notes,
  };
}

/**
 * Parse instructions from single TEXT field to array of steps
 */
function parseInstructions(rawInstructions: string): string[] {
  // Try splitting by numbered steps first (1. Step one 2. Step two)
  let steps = rawInstructions.split(/(?:\d+\.\s+)/).filter(s => s.trim().length > 0);

  // If that didn't work, try splitting by periods
  if (steps.length <= 1 && rawInstructions.length > 50) {
    steps = rawInstructions.split(/\.\s+/).filter(s => s.trim().length > 10);
  }

  // Clean up steps
  return steps.map(s => s.trim().replace(/\.$/, ''));
}

/**
 * Calculate approximate nutrition macros from total calories
 * Using general distribution: 15% protein, 30% fat, 55% carbs
 */
function calculateNutrition(calories: number) {
  return {
    protein: Math.round(calories * 0.15 / 4),  // Protein: 4 cal/g
    fats: Math.round(calories * 0.30 / 9),     // Fat: 9 cal/g
    carbs: Math.round(calories * 0.55 / 4),    // Carbs: 4 cal/g
  };
}

/**
 * Main migration function
 * Fetches unmigrated recipes and converts them to new format
 */
async function migrateRecipes() {
  console.log('Starting recipe migration to structured format...');
  console.log('='.repeat(60));

  // Fetch recipes that haven't been migrated yet
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, ingredients, instructions, calories')
    .is('structured_ingredients', null)
    .limit(1000);

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  if (!recipes || recipes.length === 0) {
    console.log('No recipes found to migrate. All recipes are up to date!');
    return;
  }

  console.log(`Found ${recipes.length} recipes to migrate\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors: { id: string; error: string }[] = [];

  for (const recipe of recipes as OldRecipe[]) {
    try {
      // Parse ingredients to structured format
      const structuredIngredients = recipe.ingredients.map(parseIngredient);

      // Parse instructions to array
      const instructionSteps = parseInstructions(recipe.instructions);

      // Calculate nutrition if calories available
      const nutrition = recipe.calories
        ? calculateNutrition(recipe.calories)
        : { protein: 0, fats: 0, carbs: 0 };

      // Update recipe in database
      const { error: updateError } = await supabase
        .from('recipes')
        .update({
          structured_ingredients: structuredIngredients,
          instructions: instructionSteps,
          protein: nutrition.protein,
          fats: nutrition.fats,
          carbs: nutrition.carbs,
        })
        .eq('id', recipe.id);

      if (updateError) {
        console.error(`❌ Error updating recipe ${recipe.id}:`, updateError);
        errorCount++;
        errors.push({ id: recipe.id, error: updateError.message });
      } else {
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`✓ Migrated ${successCount} recipes...`);
        }
      }
    } catch (err) {
      console.error(`❌ Error processing recipe ${recipe.id}:`, err);
      errorCount++;
      errors.push({
        id: recipe.id,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Migration Complete!');
  console.log(`✓ Successfully migrated: ${successCount} recipes`);
  console.log(`✗ Failed: ${errorCount} recipes`);

  if (errors.length > 0) {
    console.log('\nFailed Recipe IDs:');
    errors.forEach(({ id, error }) => {
      console.log(`  - ${id}: ${error}`);
    });
  }
}

// Execute migration
migrateRecipes()
  .then(() => {
    console.log('\n✓ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration script failed:', error);
    process.exit(1);
  });

export { migrateRecipes, parseIngredient, parseInstructions };
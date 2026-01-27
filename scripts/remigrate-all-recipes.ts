/**
 * Re-migrate All Recipes with Improved Parsing
 *
 * This script re-processes all recipes to:
 * 1. Fix ingredient parsing (separate quantity from name)
 * 2. Add substitutes from SUBSTITUTION_MAP
 * 3. Convert instructions from JSON string to array
 * 4. Improve categorization
 */

import 'dotenv/config';
import { supabase } from '../server/supabase';
import { categorizeIngredient } from '../server/weightedScoring';
import { SUBSTITUTION_MAP } from '../shared/substitutionMap';

interface Recipe {
  id: string;
  title: string;
  structured_ingredients: any[];
  instructions: any;
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
 * Enhanced ingredient parsing that correctly separates quantity from name
 */
function parseIngredientImproved(rawIngredient: any): StructuredIngredient {
  let name = rawIngredient.name || rawIngredient.display_name || '';
  let amount = rawIngredient.amount || '';
  let unit = rawIngredient.unit || '';
  let notes = rawIngredient.notes || '';

  // If amount is empty and name contains a number, try to extract it
  if (!amount && name) {
    const patterns = [
      // "2 chicken breasts" or "500 g chicken"
      /^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(g|grams?|kg|ml|l|oz|lb|lbs?|pounds?|cup|cups|tbsp|tsp|tablespoons?|teaspoons?|pieces?|cloves?)?\s+(.+)$/i,
      // "1-2 cups flour"
      /^([\d\-]+)\s*(cups?|tbsp|tsp|g|kg|ml|l)\s+(.+)$/i,
    ];

    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match) {
        amount = match[1].trim();
        unit = match[2] ? match[2].trim().toLowerCase() : '';
        name = match[3].trim();
        break;
      }
    }
  }

  // Normalize ingredient name
  const normalizedName = name.toLowerCase().trim()
    .replace(/^(fresh|dried|frozen|canned|raw|cooked)\s+/i, '') // Remove adjectives
    .replace(/\s+(fresh|dried|frozen|canned)$/i, ''); // Remove trailing adjectives

  // Get category
  const category = categorizeIngredient(normalizedName);

  // Get substitutes from map
  const substitutes = SUBSTITUTION_MAP[normalizedName] || [];

  // Determine if required
  const isRequired = category !== 'base';

  // Normalize unit
  const normalizedUnit = unit.toLowerCase()
    .replace(/^(tablespoon|tablespoons)$/i, 'tbsp')
    .replace(/^(teaspoon|teaspoons)$/i, 'tsp')
    .replace(/^(gram|grams)$/i, 'g')
    .replace(/^(pound|pounds)$/i, 'lb')
    .replace(/^(piece)$/i, 'pieces');

  return {
    name: normalizedName,
    display_name: name.charAt(0).toUpperCase() + name.slice(1), // Title case
    amount: amount.toString(),
    unit: normalizedUnit,
    category,
    is_required: isRequired,
    substitutes: substitutes.slice(0, 5), // Max 5
    notes: notes || '',
  };
}

/**
 * Parse instructions - handles both string and array formats
 */
function parseInstructions(instructions: any): string[] {
  // If it's already an array, return it
  if (Array.isArray(instructions)) {
    return instructions.filter(s => s && s.trim().length > 0);
  }

  // If it's a string that looks like JSON array
  if (typeof instructions === 'string') {
    try {
      const parsed = JSON.parse(instructions);
      if (Array.isArray(parsed)) {
        return parsed.filter(s => s && s.trim().length > 0);
      }
    } catch (e) {
      // Not JSON, try splitting by numbered steps
    }

    // Try splitting by numbered steps
    let steps = instructions
      .split(/(?:\d+\.\s+)/)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim().replace(/\.$/, ''));

    if (steps.length <= 1 && instructions.length > 50) {
      steps = instructions
        .split(/\.\s+/)
        .filter(s => s.trim().length > 10)
        .map(s => s.trim());
    }

    return steps.filter(s => s.length > 0);
  }

  return [];
}

async function remigrate() {
  console.log('='.repeat(70));
  console.log('RE-MIGRATE ALL RECIPES - IMPROVED VERSION');
  console.log('='.repeat(70));
  console.log();

  // Fetch all recipes
  console.log('📖 Fetching all recipes from database...');
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, title, structured_ingredients, instructions');

  if (error) {
    console.error('❌ Error fetching recipes:', error);
    process.exit(1);
  }

  if (!recipes || recipes.length === 0) {
    console.log('No recipes found.');
    return;
  }

  console.log(`✓ Found ${recipes.length} recipes\n`);
  console.log('🔄 Processing recipes...\n');

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ recipe: string; error: string }> = [];

  for (const recipe of recipes as Recipe[]) {
    try {
      // Process ingredients with improved parsing
      const improvedIngredients = recipe.structured_ingredients.map(parseIngredientImproved);

      // Process instructions
      const instructionSteps = parseInstructions(recipe.instructions);

      // Update recipe
      const { error: updateError } = await supabase
        .from('recipes')
        .update({
          structured_ingredients: improvedIngredients,
          instructions: instructionSteps,
        })
        .eq('id', recipe.id);

      if (updateError) {
        console.error(`❌ Error updating "${recipe.title}":`, updateError.message);
        errorCount++;
        errors.push({
          recipe: recipe.title,
          error: updateError.message,
        });
      } else {
        successCount++;
        if (successCount % 25 === 0) {
          console.log(`  ✓ Processed ${successCount} recipes...`);
        }
      }
    } catch (err) {
      console.error(`❌ Error processing "${recipe.title}":`, err);
      errorCount++;
      errors.push({
        recipe: recipe.title,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('MIGRATION COMPLETE!');
  console.log('='.repeat(70));
  console.log(`\n✅ Successfully processed: ${successCount} recipes`);
  console.log(`❌ Failed: ${errorCount} recipes\n`);

  if (errors.length > 0) {
    console.log('Failed recipes:\n');
    errors.forEach(({ recipe, error }) => {
      console.log(`  - ${recipe}: ${error}`);
    });
    console.log();
  }

  if (successCount > 0) {
    console.log('🎉 All recipes have been re-processed with improved parsing!');
    console.log();
    console.log('Improvements:');
    console.log('  ✓ Ingredient names properly separated from quantities');
    console.log('  ✓ Substitutes added from SUBSTITUTION_MAP');
    console.log('  ✓ Instructions converted to proper arrays');
    console.log('  ✓ Categories recalculated');
    console.log();
    console.log('Next steps:');
    console.log('1. Test search: PORT=3000 npm run dev');
    console.log('2. Verify ingredient matching is improved');
    console.log('3. Check that substitutes appear in results\n');
  }
}

// Run migration
remigrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });

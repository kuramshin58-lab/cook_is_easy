/**
 * Convert Legacy CSV Format to New Optimized Format
 *
 * This script converts existing CSV files (pasta_recipes.csv, chicken_recipes.csv, etc.)
 * from the old format to the new optimized format with structured ingredients.
 *
 * Usage: npx tsx scripts/convert-legacy-csv.ts <input-file.csv> <output-file.csv>
 * Example: npx tsx scripts/convert-legacy-csv.ts data/pasta_recipes.csv data/pasta_recipes_new.csv
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { categorizeIngredient } from '../server/weightedScoring';
import { SUBSTITUTION_MAP } from '../shared/substitutionMap';

interface LegacyRecipe {
  title?: string;
  'Recipe Name'?: string;
  description?: string;
  Description?: string;
  difficulty?: string;
  Difficulty?: string;
  'prep_time'?: string;
  'Prep Time'?: string;
  'cook_time'?: string;
  'Cook Time'?: string;
  'Cooking Time'?: string;
  servings?: string;
  Servings?: string;
  ingredients?: string;
  Ingredients?: string;
  instructions?: string;
  Instructions?: string;
  Steps?: string;
  calories?: string;
  Cal?: string;
  tags?: string;
  Tags?: string;
  source_url?: string;
  URL?: string;
}

interface StructuredIngredient {
  name: string;
  amount: string;
  unit: string;
  category: 'key' | 'important' | 'flavor' | 'base';
  substitutes: string[];
  notes: string;
}

interface OptimizedRecipe {
  title: string;
  description: string;
  difficulty: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: string; // JSON string
  instructions: string; // JSON string
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  tags: string;
  source_url: string;
}

/**
 * Normalize difficulty values
 */
function normalizeDifficulty(difficulty: string): string {
  const normalized = difficulty.toLowerCase().replace(/[^a-z]/g, '');

  if (normalized.includes('easy') || normalized.includes('beginner') || normalized.includes('simple')) {
    return 'easy';
  }
  if (normalized.includes('medium') || normalized.includes('intermediate') || normalized.includes('normal')) {
    return 'medium';
  }
  if (normalized.includes('hard') || normalized.includes('difficult') || normalized.includes('advanced') || normalized.includes('expert')) {
    return 'hard';
  }

  // Default to easy if unclear
  return 'easy';
}

/**
 * Parse time string to minutes
 */
function parseTime(timeStr: string): number {
  if (!timeStr) return 0;

  // Extract numbers
  const numbers = timeStr.match(/\d+/g);
  if (!numbers) return 0;

  const value = parseInt(numbers[0], 10);

  // Check if hours
  if (timeStr.toLowerCase().includes('hour') || timeStr.toLowerCase().includes('hr')) {
    return value * 60;
  }

  // Default to minutes
  return value;
}

/**
 * Parse servings string to number
 */
function parseServings(servingsStr: string): number {
  if (!servingsStr) return 4;

  const numbers = servingsStr.match(/\d+/g);
  if (!numbers) return 4;

  return parseInt(numbers[0], 10);
}

/**
 * Parse raw ingredient string into structured format
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

  return {
    name: normalizedName,
    amount,
    unit: unit || '',
    category,
    substitutes: substitutes.slice(0, 5),
    notes,
  };
}

/**
 * Parse instructions from single TEXT field to array of steps
 */
function parseInstructions(rawInstructions: string): string[] {
  if (!rawInstructions) return [];

  // Try splitting by numbered steps first (1. Step one 2. Step two)
  let steps = rawInstructions.split(/(?:\d+\.\s+)/).filter(s => s.trim().length > 0);

  // If that didn't work, try splitting by periods
  if (steps.length <= 1 && rawInstructions.length > 50) {
    steps = rawInstructions.split(/\.\s+/).filter(s => s.trim().length > 10);
  }

  // Clean up steps
  return steps.map(s => s.trim().replace(/\.$/, '')).filter(s => s.length > 0);
}

/**
 * Calculate approximate nutrition macros from total calories
 */
function calculateNutrition(calories: number) {
  return {
    protein: Math.round(calories * 0.15 / 4),  // Protein: 4 cal/g
    fats: Math.round(calories * 0.30 / 9),     // Fat: 9 cal/g
    carbs: Math.round(calories * 0.55 / 4),    // Carbs: 4 cal/g
  };
}

/**
 * Get field value with flexible key matching
 */
function getField(recipe: LegacyRecipe, ...possibleKeys: string[]): string {
  for (const key of possibleKeys) {
    if (recipe[key as keyof LegacyRecipe]) {
      return recipe[key as keyof LegacyRecipe] as string;
    }
  }
  return '';
}

/**
 * Convert legacy recipe to optimized format
 */
function convertRecipe(legacyRecipe: LegacyRecipe): OptimizedRecipe | null {
  try {
    // Extract title
    const title = getField(legacyRecipe, 'title', 'Recipe Name', 'Title');
    if (!title) {
      console.warn('⚠️  Skipping recipe: No title found');
      return null;
    }

    // Extract description
    const description = getField(legacyRecipe, 'description', 'Description') ||
                       `Delicious ${title} recipe.`;

    // Normalize difficulty
    const difficultyRaw = getField(legacyRecipe, 'difficulty', 'Difficulty') || 'easy';
    const difficulty = normalizeDifficulty(difficultyRaw);

    // Parse times
    const prepTimeRaw = getField(legacyRecipe, 'prep_time', 'Prep Time', 'prepTime');
    const cookTimeRaw = getField(legacyRecipe, 'cook_time', 'Cook Time', 'Cooking Time', 'cookTime');
    const prep_time = parseTime(prepTimeRaw) || 15;
    const cook_time = parseTime(cookTimeRaw) || 20;

    // Parse servings
    const servingsRaw = getField(legacyRecipe, 'servings', 'Servings');
    const servings = parseServings(servingsRaw) || 4;

    // Parse ingredients
    const ingredientsRaw = getField(legacyRecipe, 'ingredients', 'Ingredients');
    if (!ingredientsRaw) {
      console.warn(`⚠️  Skipping recipe "${title}": No ingredients found`);
      return null;
    }

    const ingredientsList = ingredientsRaw.split(/,(?![^(]*\))/).map(i => i.trim());
    const structuredIngredients = ingredientsList.map(parseIngredient);

    // Check if at least one key ingredient exists
    const hasKeyIngredient = structuredIngredients.some(ing => ing.category === 'key');
    if (!hasKeyIngredient) {
      console.warn(`⚠️  Warning: Recipe "${title}" has no KEY ingredients. Adding first ingredient as key.`);
      if (structuredIngredients.length > 0) {
        structuredIngredients[0].category = 'key';
      }
    }

    // Parse instructions
    const instructionsRaw = getField(legacyRecipe, 'instructions', 'Instructions', 'Steps');
    const instructionSteps = parseInstructions(instructionsRaw);
    if (instructionSteps.length === 0) {
      console.warn(`⚠️  Skipping recipe "${title}": No instructions found`);
      return null;
    }

    // Parse calories
    const caloriesRaw = getField(legacyRecipe, 'calories', 'Cal');
    const calories = parseInt(caloriesRaw, 10) || 400;

    // Calculate nutrition
    const nutrition = calculateNutrition(calories);

    // Parse tags
    const tagsRaw = getField(legacyRecipe, 'tags', 'Tags') || '';
    const tags = tagsRaw
      .toLowerCase()
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .join(',');

    // Source URL
    const source_url = getField(legacyRecipe, 'source_url', 'URL') || 'https://example.com/recipe';

    // Convert to JSON strings
    const ingredientsJson = JSON.stringify(structuredIngredients);
    const instructionsJson = JSON.stringify(instructionSteps);

    return {
      title,
      description: description.slice(0, 500), // Max 500 chars
      difficulty,
      prep_time,
      cook_time,
      servings,
      ingredients: ingredientsJson,
      instructions: instructionsJson,
      calories,
      protein: nutrition.protein,
      fats: nutrition.fats,
      carbs: nutrition.carbs,
      tags,
      source_url,
    };
  } catch (error) {
    console.error(`❌ Error converting recipe:`, error);
    return null;
  }
}

/**
 * Main conversion function
 */
async function convertCSV(inputFile: string, outputFile: string) {
  console.log('='.repeat(70));
  console.log('LEGACY CSV CONVERTER');
  console.log('='.repeat(70));
  console.log(`\nInput:  ${inputFile}`);
  console.log(`Output: ${outputFile}\n`);

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: Input file not found: ${inputFile}`);
    process.exit(1);
  }

  // Read and parse input CSV
  console.log('📖 Reading legacy CSV file...');
  const fileContent = fs.readFileSync(inputFile, 'utf-8');

  let legacyRecipes: LegacyRecipe[];
  try {
    legacyRecipes = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (error) {
    console.error('❌ Error parsing CSV:', error);
    process.exit(1);
  }

  console.log(`✓ Found ${legacyRecipes.length} recipes\n`);

  // Convert recipes
  console.log('🔄 Converting recipes...\n');
  const convertedRecipes: OptimizedRecipe[] = [];
  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < legacyRecipes.length; i++) {
    const legacy = legacyRecipes[i];
    const converted = convertRecipe(legacy);

    if (converted) {
      convertedRecipes.push(converted);
      successCount++;
      if (successCount % 10 === 0) {
        console.log(`  ✓ Converted ${successCount} recipes...`);
      }
    } else {
      skipCount++;
    }
  }

  console.log(`\n✓ Successfully converted: ${successCount} recipes`);
  console.log(`⚠️  Skipped: ${skipCount} recipes\n`);

  if (convertedRecipes.length === 0) {
    console.error('❌ No recipes to export. Exiting.');
    process.exit(1);
  }

  // Write output CSV
  console.log('💾 Writing optimized CSV file...');

  const outputCSV = stringify(convertedRecipes, {
    header: true,
    columns: [
      'title',
      'description',
      'difficulty',
      'prep_time',
      'cook_time',
      'servings',
      'ingredients',
      'instructions',
      'calories',
      'protein',
      'fats',
      'carbs',
      'tags',
      'source_url',
    ],
  });

  fs.writeFileSync(outputFile, outputCSV, 'utf-8');
  console.log(`✓ Output saved to: ${outputFile}\n`);

  console.log('='.repeat(70));
  console.log('CONVERSION COMPLETE!');
  console.log('='.repeat(70));
  console.log(`\n✅ ${successCount} recipes converted successfully!`);
  console.log(`\nNext steps:`);
  console.log(`1. Review the output file: ${outputFile}`);
  console.log(`2. Validate it: npx tsx scripts/validate-csv.ts ${outputFile}`);
  console.log(`3. Import to database: npx tsx scripts/import-structured-recipes.ts ${outputFile}\n`);
}

// CLI execution
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: npx tsx scripts/convert-legacy-csv.ts <input-file.csv> <output-file.csv>');
  console.log('\nExample:');
  console.log('  npx tsx scripts/convert-legacy-csv.ts data/pasta_recipes.csv data/pasta_recipes_new.csv');
  process.exit(1);
}

const [inputFile, outputFile] = args;

convertCSV(inputFile, outputFile)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Conversion failed:', error);
    process.exit(1);
  });

export { convertRecipe, parseIngredient, parseInstructions };

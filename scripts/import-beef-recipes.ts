import 'dotenv/config';
import { supabase } from '../server/supabase';
import fs from 'fs';
import path from 'path';

interface CSVRow {
  'Recipe Name': string;
  URL: string;
  Difficulty: string;
  'Prep Time': string;
  'Cook Time': string;
  Servings: string;
  'Rating Count': string;
  Cal: string;
  Description: string;
  Ingredients: string;
  Instructions: string;
  Nutrition: string;
  Tags: string;
}

// Helper to parse time strings like "30 min" to number
function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d+)\s*min/);
  return match ? parseInt(match[1], 10) : 0;
}

// Helper to parse nutrition string
function parseNutrition(nutritionStr: string) {
  const calMatch = nutritionStr.match(/Cal\s+(\d+)/);
  const fatMatch = nutritionStr.match(/Fat\s+(\d+)/);
  const proteinMatch = nutritionStr.match(/Protein\s+(\d+)/);
  const carbMatch = nutritionStr.match(/Carb\s+(\d+)/);

  return {
    calories: calMatch ? parseInt(calMatch[1], 10) : 0,
    fats: fatMatch ? parseInt(fatMatch[1], 10) : 0,
    protein: proteinMatch ? parseInt(proteinMatch[1], 10) : 0,
    carbs: carbMatch ? parseInt(carbMatch[1], 10) : 0,
  };
}

// Categorize ingredients
function categorizeIngredient(name: string): 'key' | 'important' | 'flavor' | 'base' {
  const lowerName = name.toLowerCase();

  // Key ingredients (main proteins, starches)
  const keyIngredients = [
    'beef', 'steak', 'brisket', 'short ribs', 'ground beef', 'veal',
    'pasta', 'spaghetti', 'noodles', 'rice', 'gnocchi', 'lasagna', 'tagliatelle',
    'potatoes', 'bread'
  ];

  // Important ingredients
  const importantIngredients = [
    'cheese', 'cream', 'milk', 'egg', 'butter', 'yogurt', 'sour cream',
    'mushroom', 'tomato', 'onion', 'carrot', 'pepper', 'broccoli',
    'beans', 'peas', 'cabbage', 'spinach', 'zucchini',
    'wine', 'stock', 'broth', 'sauce'
  ];

  // Flavor ingredients
  const flavorIngredients = [
    'garlic', 'ginger', 'basil', 'oregano', 'thyme', 'rosemary', 'parsley', 'cilantro',
    'cumin', 'paprika', 'chili', 'curry', 'cinnamon', 'nutmeg',
    'lemon', 'lime', 'vinegar', 'mustard', 'horseradish'
  ];

  // Base ingredients
  const baseIngredients = [
    'salt', 'pepper', 'oil', 'olive oil', 'vegetable oil',
    'sugar', 'flour', 'water', 'cornstarch'
  ];

  // Check categories
  if (keyIngredients.some(k => lowerName.includes(k))) return 'key';
  if (baseIngredients.some(b => lowerName.includes(b))) return 'base';
  if (flavorIngredients.some(f => lowerName.includes(f))) return 'flavor';
  if (importantIngredients.some(i => lowerName.includes(i))) return 'important';

  // Default to important
  return 'important';
}

// Parse ingredient string
function parseIngredient(ingStr: string) {
  ingStr = ingStr.trim();

  // Try to extract amount and name
  const match = ingStr.match(/^([\d.\/\s½¼¾]+(?:g|ml|tbsp|tsp|kg|l|cup|cloves?|slices?|sprigs?|leaves?|pcs?|pieces?)?)\s+(.+)$/i);

  if (match) {
    const amount = match[1].trim();
    const name = match[2].trim();
    return {
      name,
      amount,
      category: categorizeIngredient(name),
      substitutes: []
    };
  }

  // If no amount found, just use the whole string as name
  return {
    name: ingStr,
    amount: '',
    category: categorizeIngredient(ingStr),
    substitutes: []
  };
}

// Parse CSV line manually (handle quoted fields with commas)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result.map(field => field.trim());
}

async function importBeefRecipes() {
  console.log('Importing beef recipes...\n');

  // Read CSV file
  const csvPath = path.join(process.cwd(), 'beef_recipes.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  // Parse header
  const headerFields = parseCSVLine(lines[0]);
  console.log('CSV Headers:', headerFields);

  const recipes = [];
  let successCount = 0;
  let errorCount = 0;

  // Parse each recipe
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      const fields = parseCSVLine(line);

      const row: CSVRow = {
        'Recipe Name': fields[0] || '',
        'URL': fields[1] || '',
        'Difficulty': fields[2] || '',
        'Prep Time': fields[3] || '',
        'Cook Time': fields[4] || '',
        'Rest Time': fields[5] || '',
        'Servings': fields[6] || '',
        'Rating Count': fields[7] || '',
        'Saves': fields[8] || '',
        'Cal': fields[9] || '',
        'Description': fields[10] || '',
        'Ingredients': fields[11] || '',
        'Instructions': fields[12] || '',
        'Nutrition': fields[13] || '',
        'Tags': fields[14] || ''
      };

      // Skip if no recipe name
      if (!row['Recipe Name']) continue;

      // Parse ingredients
      const ingredientsArray = row.Ingredients.split(',').map(ing => ing.trim()).filter(ing => ing);
      const structured_ingredients = ingredientsArray.map(parseIngredient);

      // Parse instructions
      const instructions = row.Instructions
        .split('. ')
        .map(step => step.trim())
        .filter(step => step.length > 10)
        .map(step => step.endsWith('.') ? step : step + '.');

      // Parse nutrition
      const nutrition = parseNutrition(row.Nutrition);

      // Parse tags
      const tags = row.Tags ? row.Tags.split(',').map(t => t.trim()).filter(t => t) : [];

      // Clean difficulty - remove emojis and extract text (database uses lowercase!)
      let difficulty = 'medium';
      const difficultyText = row.Difficulty.replace(/[^\w\s]/g, '').trim().toLowerCase();
      if (difficultyText.includes('easy')) difficulty = 'easy';
      else if (difficultyText.includes('hard')) difficulty = 'hard';
      else if (difficultyText.includes('medium')) difficulty = 'medium';

      const recipe = {
        title: row['Recipe Name'],
        description: row.Description || `A delicious beef recipe from Kitchen Stories.`,
        structured_ingredients,
        instructions,
        difficulty,
        prep_time: parseTime(row['Prep Time']),
        cook_time: parseTime(row['Cook Time']),
        servings: parseInt(row.Servings, 10) || 4,
        calories: nutrition.calories,
        protein: nutrition.protein,
        fats: nutrition.fats,
        carbs: nutrition.carbs,
        tags,
        source_url: row.URL,
        ingredients: ingredientsArray, // Legacy format
      };

      recipes.push(recipe);
      console.log(`✓ Parsed: ${recipe.title}`);

    } catch (error) {
      console.error(`✗ Error parsing line ${i}:`, error);
      errorCount++;
    }
  }

  console.log(`\n--- Parsed ${recipes.length} recipes ---\n`);

  // Insert into database
  for (const recipe of recipes) {
    try {
      const { error } = await supabase
        .from('recipes')
        .insert(recipe);

      if (error) {
        console.error(`✗ Failed to insert "${recipe.title}":`, error.message);
        errorCount++;
      } else {
        console.log(`✓ Inserted: ${recipe.title}`);
        successCount++;
      }
    } catch (error) {
      console.error(`✗ Error inserting "${recipe.title}":`, error);
      errorCount++;
    }
  }

  console.log(`\n=== IMPORT COMPLETE ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total: ${recipes.length}`);
}

importBeefRecipes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

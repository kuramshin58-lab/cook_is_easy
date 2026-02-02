import 'dotenv/config';
import { supabase } from '../server/supabase';
import fs from 'fs';
import path from 'path';

// Parse CSV line manually (handle quoted fields with commas and escaped quotes)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

async function importKitchenStoriesRecipes() {
  console.log('🍳 Importing Kitchen Stories recipes...\n');

  // Read CSV file
  const csvPath = path.join(process.cwd(), 'kitchen_stories_main_recipes.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  // Parse header
  const headerFields = parseCSVLine(lines[0]);
  console.log('📋 CSV Headers:', headerFields);
  console.log(`📊 Total lines: ${lines.length - 1}\n`);

  const recipes = [];
  let parseErrors = 0;

  // Parse each recipe
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      const fields = parseCSVLine(line);

      if (fields.length !== 14) {
        console.error(`✗ Line ${i + 1}: Expected 14 fields, got ${fields.length}`);
        parseErrors++;
        continue;
      }

      const [
        title,
        description,
        difficulty,
        prep_time,
        cook_time,
        servings,
        ingredients,
        instructions,
        calories,
        protein,
        fats,
        carbs,
        tags,
        source_url
      ] = fields;

      // Parse JSON fields
      let structured_ingredients;
      let instructionsArray;

      try {
        structured_ingredients = JSON.parse(ingredients);
      } catch (e) {
        console.error(`✗ Line ${i + 1}: Invalid ingredients JSON for "${title}"`);
        parseErrors++;
        continue;
      }

      try {
        instructionsArray = JSON.parse(instructions);
      } catch (e) {
        console.error(`✗ Line ${i + 1}: Invalid instructions JSON for "${title}"`);
        parseErrors++;
        continue;
      }

      // Parse tags
      const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];

      // Create legacy ingredients array (names only)
      const ingredientsArray = structured_ingredients.map((ing: any) => ing.name);

      const recipe = {
        title,
        description,
        difficulty: difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
        prep_time: parseInt(prep_time, 10),
        cook_time: parseInt(cook_time, 10),
        servings: parseInt(servings, 10),
        structured_ingredients,
        instructions: instructionsArray,
        calories: parseInt(calories, 10),
        protein: parseInt(protein, 10),
        fats: parseInt(fats, 10),
        carbs: parseInt(carbs, 10),
        tags: tagsArray,
        source_url,
        ingredients: ingredientsArray, // Legacy format for compatibility
      };

      recipes.push(recipe);
      console.log(`✓ Parsed: ${recipe.title}`);

    } catch (error) {
      console.error(`✗ Error parsing line ${i + 1}:`, error);
      parseErrors++;
    }
  }

  console.log(`\n--- Parsed ${recipes.length} recipes (${parseErrors} errors) ---\n`);

  if (recipes.length === 0) {
    console.log('❌ No recipes to import. Exiting.');
    return;
  }

  // Insert into database
  let successCount = 0;
  let errorCount = 0;

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

  console.log(`\n=== 🎉 IMPORT COMPLETE ===`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total processed: ${recipes.length}`);
}

importKitchenStoriesRecipes()
  .then(() => {
    console.log('\n✅ Import script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

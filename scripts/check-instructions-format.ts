import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkInstructionsFormat() {
  console.log('Checking instructions format in database...\n');

  // Get a few recipes to check the format
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, title, instructions')
    .limit(5);

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  if (!recipes || recipes.length === 0) {
    console.log('No recipes found in database');
    return;
  }

  recipes.forEach((recipe, index) => {
    console.log(`\n--- Recipe ${index + 1}: ${recipe.title} ---`);
    console.log('Instructions type:', typeof recipe.instructions);
    console.log('Is array:', Array.isArray(recipe.instructions));

    if (Array.isArray(recipe.instructions)) {
      console.log('Array length:', recipe.instructions.length);
      console.log('First element:', recipe.instructions[0]?.substring(0, 100));
    } else {
      console.log('Value:', recipe.instructions?.toString().substring(0, 200));
    }
  });
}

checkInstructionsFormat().catch(console.error);

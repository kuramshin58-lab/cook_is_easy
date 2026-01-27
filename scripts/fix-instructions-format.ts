import 'dotenv/config';
import { supabase } from '../server/supabase';

async function fixInstructionsFormat() {
  console.log('Fixing instructions format...\n');

  // Get all recipes
  const { data: recipes, error: fetchError } = await supabase
    .from('recipes')
    .select('id, title, instructions');

  if (fetchError) {
    console.error('Error fetching recipes:', fetchError);
    return;
  }

  if (!recipes || recipes.length === 0) {
    console.log('No recipes found');
    return;
  }

  console.log(`Found ${recipes.length} recipes\n`);

  let fixedCount = 0;
  let errorCount = 0;
  let alreadyFixedCount = 0;

  for (const recipe of recipes) {
    // Check if instructions is already an array
    if (Array.isArray(recipe.instructions)) {
      alreadyFixedCount++;
      continue;
    }

    // Check if instructions is a JSON string
    if (typeof recipe.instructions === 'string') {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(recipe.instructions);

        if (Array.isArray(parsed)) {
          // Update the recipe with parsed array
          const { error: updateError } = await supabase
            .from('recipes')
            .update({ instructions: parsed })
            .eq('id', recipe.id);

          if (updateError) {
            console.error(`Error updating recipe ${recipe.id}:`, updateError);
            errorCount++;
          } else {
            console.log(`✓ Fixed: ${recipe.title}`);
            fixedCount++;
          }
        } else {
          console.log(`⚠ Skipped ${recipe.title}: parsed value is not an array`);
          errorCount++;
        }
      } catch (parseError) {
        console.log(`⚠ Skipped ${recipe.title}: not valid JSON`);
        errorCount++;
      }
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Total recipes: ${recipes.length}`);
  console.log(`Fixed: ${fixedCount}`);
  console.log(`Already correct: ${alreadyFixedCount}`);
  console.log(`Errors/Skipped: ${errorCount}`);
}

fixInstructionsFormat()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

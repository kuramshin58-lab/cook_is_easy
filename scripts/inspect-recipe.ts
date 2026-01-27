import 'dotenv/config';
import { supabase } from '../server/supabase';

async function inspectRecipe() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  if (data && data.length > 0) {
    const recipe = data[0];
    console.log('='.repeat(70));
    console.log('SAMPLE RECIPE STRUCTURE');
    console.log('='.repeat(70));
    console.log();
    console.log('Title:', recipe.title);
    console.log('Difficulty:', recipe.difficulty);
    console.log('Prep time:', recipe.prep_time, 'min');
    console.log('Cook time:', recipe.cook_time, 'min');
    console.log('Servings:', recipe.servings);
    console.log();
    console.log('Structured Ingredients (first 2):');
    if (recipe.structured_ingredients && Array.isArray(recipe.structured_ingredients)) {
      recipe.structured_ingredients.slice(0, 2).forEach((ing: any, idx: number) => {
        console.log(`  ${idx + 1}.`, JSON.stringify(ing, null, 2));
      });
      console.log(`  ... (${recipe.structured_ingredients.length} total)`);
    }
    console.log();
    console.log('Instructions (first 2):');
    if (recipe.instructions && Array.isArray(recipe.instructions)) {
      recipe.instructions.slice(0, 2).forEach((step: string, idx: number) => {
        console.log(`  ${idx + 1}. ${step}`);
      });
      console.log(`  ... (${recipe.instructions.length} total)`);
    }
    console.log();
    console.log('Nutrition:');
    console.log('  Calories:', recipe.calories);
    console.log('  Protein:', recipe.protein, 'g');
    console.log('  Fats:', recipe.fats, 'g');
    console.log('  Carbs:', recipe.carbs, 'g');
    console.log();
    console.log('='.repeat(70));
  }
}

inspectRecipe()
  .then(() => process.exit(0))
  .catch(console.error);

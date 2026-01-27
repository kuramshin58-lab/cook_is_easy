import 'dotenv/config';
import { supabase } from '../server/supabase';

async function checkMainIngredients() {
  console.log('Checking main ingredients in database...\n');

  // Get all recipes
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, title, structured_ingredients, ingredients')
    .limit(1000);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!recipes || recipes.length === 0) {
    console.log('No recipes found');
    return;
  }

  console.log(`Total recipes in DB: ${recipes.length}\n`);

  // Count by main ingredients
  const ingredientCounts: Record<string, number> = {};

  recipes.forEach(recipe => {
    const ingredients = recipe.structured_ingredients ||
      recipe.ingredients.map((ing: string) => ({ name: ing }));

    ingredients.forEach((ing: any) => {
      const name = (ing.name || ing).toLowerCase();

      // Check for main proteins and staples
      if (name.includes('chicken')) {
        ingredientCounts['chicken'] = (ingredientCounts['chicken'] || 0) + 1;
      }
      if (name.includes('beef')) {
        ingredientCounts['beef'] = (ingredientCounts['beef'] || 0) + 1;
      }
      if (name.includes('pork')) {
        ingredientCounts['pork'] = (ingredientCounts['pork'] || 0) + 1;
      }
      if (name.includes('fish') || name.includes('salmon') || name.includes('tuna')) {
        ingredientCounts['fish'] = (ingredientCounts['fish'] || 0) + 1;
      }
      if (name.includes('pasta') || name.includes('spaghetti') || name.includes('penne') || name.includes('fettuccine')) {
        ingredientCounts['pasta'] = (ingredientCounts['pasta'] || 0) + 1;
      }
      if (name.includes('rice')) {
        ingredientCounts['rice'] = (ingredientCounts['rice'] || 0) + 1;
      }
      if (name.includes('potato')) {
        ingredientCounts['potato'] = (ingredientCounts['potato'] || 0) + 1;
      }
      if (name.includes('tomato')) {
        ingredientCounts['tomato'] = (ingredientCounts['tomato'] || 0) + 1;
      }
    });
  });

  console.log('=== MAIN INGREDIENTS COUNT ===\n');

  const sorted = Object.entries(ingredientCounts)
    .sort(([, a], [, b]) => b - a);

  sorted.forEach(([ingredient, count]) => {
    const percentage = ((count / recipes.length) * 100).toFixed(1);
    console.log(`${ingredient.padEnd(15)} ${count.toString().padStart(3)} recipes (${percentage}%)`);
  });

  // Check for specific recipes
  console.log('\n=== SAMPLE RECIPES BY INGREDIENT ===\n');

  const searchIngredients = ['chicken', 'beef', 'pasta', 'potato'];

  for (const searchIng of searchIngredients) {
    const found = recipes.filter(r => {
      const ingredients = r.structured_ingredients ||
        r.ingredients.map((ing: string) => ({ name: ing }));

      return ingredients.some((ing: any) => {
        const name = (ing.name || ing).toLowerCase();
        return name.includes(searchIng);
      });
    });

    console.log(`\n${searchIng.toUpperCase()} (${found.length} recipes):`);
    found.slice(0, 3).forEach(r => {
      console.log(`  - ${r.title}`);
    });
  }
}

checkMainIngredients().then(() => process.exit(0)).catch(console.error);

import 'dotenv/config';
import { supabase } from '../server/supabase';

async function testBasicRecipesSearch() {
  console.log('🔍 Testing basic recipe search functionality...\n');

  const testSearches = [
    { ingredients: ['chicken', 'rice'], description: 'Chicken & Rice (should find rice bowls)' },
    { ingredients: ['pasta', 'garlic', 'butter'], description: 'Pasta with garlic butter (should find simple pasta)' },
    { ingredients: ['eggs', 'cheese'], description: 'Eggs & Cheese (should find breakfast items)' },
    { ingredients: ['tomato', 'mozzarella', 'basil'], description: 'Caprese ingredients' },
    { ingredients: ['bread', 'cheese'], description: 'Bread & Cheese (should find grilled cheese)' }
  ];

  for (const search of testSearches) {
    console.log(`\n🔎 Search: ${search.description}`);
    console.log(`   Ingredients: ${search.ingredients.join(', ')}`);

    // Get all recipes
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('id, title, structured_ingredients');

    if (error) {
      console.error('❌ Error fetching recipes:', error);
      continue;
    }

    // Filter recipes that match ingredients
    const matchingRecipes = recipes.filter((recipe: any) => {
      const recipeIngredients = recipe.structured_ingredients.map((ing: any) => ing.name.toLowerCase());
      return search.ingredients.some(searchIng =>
        recipeIngredients.some((recipeIng: string) => recipeIng.includes(searchIng.toLowerCase()))
      );
    });

    console.log(`   ✅ Found ${matchingRecipes.length} matching recipes:`);
    matchingRecipes.slice(0, 5).forEach((recipe: any) => {
      console.log(`      • ${recipe.title}`);
    });
    if (matchingRecipes.length > 5) {
      console.log(`      ... and ${matchingRecipes.length - 5} more`);
    }
  }

  // Test simple searches
  console.log('\n\n📊 Recipe Count by Category:\n');

  const categories = [
    { name: 'Pasta recipes', filter: 'pasta' },
    { name: 'Chicken recipes', filter: 'chicken' },
    { name: 'Rice recipes', filter: 'rice' },
    { name: 'Egg recipes', filter: 'eggs' },
    { name: 'Breakfast recipes', filter: 'breakfast' },
    { name: 'Soup recipes', filter: 'soup' }
  ];

  for (const category of categories) {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('id, title, structured_ingredients, tags');

    if (error) continue;

    const matchingRecipes = recipes.filter((recipe: any) => {
      // Check if ingredient name or tags contain the filter
      const hasIngredient = recipe.structured_ingredients.some((ing: any) =>
        ing.name.toLowerCase().includes(category.filter.toLowerCase())
      );
      const hasTag = recipe.tags && recipe.tags.some((tag: string) =>
        tag.toLowerCase().includes(category.filter.toLowerCase())
      );
      const hasTitle = recipe.title.toLowerCase().includes(category.filter.toLowerCase());

      return hasIngredient || hasTag || hasTitle;
    });

    console.log(`   ${category.name}: ${matchingRecipes.length} found`);
  }

  // Check average times for basic vs complex recipes
  console.log('\n\n⏱️  Average Cooking Times:\n');

  const { data: allRecipes } = await supabase
    .from('recipes')
    .select('prep_time, cook_time, source_url');

  if (allRecipes) {
    const basicRecipes = allRecipes.filter((r: any) => r.source_url?.includes('example.com'));
    const kitchenStories = allRecipes.filter((r: any) => r.source_url?.includes('kitchenstories.com'));

    const avgBasicPrepTime = Math.round(basicRecipes.reduce((sum: number, r: any) => sum + r.prep_time, 0) / basicRecipes.length);
    const avgBasicCookTime = Math.round(basicRecipes.reduce((sum: number, r: any) => sum + r.cook_time, 0) / basicRecipes.length);
    const avgBasicTotalTime = avgBasicPrepTime + avgBasicCookTime;

    const avgKSPrepTime = Math.round(kitchenStories.reduce((sum: number, r: any) => sum + r.prep_time, 0) / kitchenStories.length);
    const avgKSCookTime = Math.round(kitchenStories.reduce((sum: number, r: any) => sum + r.cook_time, 0) / kitchenStories.length);
    const avgKSTotalTime = avgKSPrepTime + avgKSCookTime;

    console.log(`   Basic Recipes (${basicRecipes.length} recipes):`);
    console.log(`      Prep: ${avgBasicPrepTime} min | Cook: ${avgBasicCookTime} min | Total: ${avgBasicTotalTime} min`);

    console.log(`\n   Kitchen Stories (${kitchenStories.length} recipes):`);
    console.log(`      Prep: ${avgKSPrepTime} min | Cook: ${avgKSCookTime} min | Total: ${avgKSTotalTime} min`);

    console.log(`\n   ⚡ Basic recipes are ${Math.round(((avgKSTotalTime - avgBasicTotalTime) / avgKSTotalTime) * 100)}% faster on average!`);
  }
}

testBasicRecipesSearch()
  .then(() => {
    console.log('\n\n✅ Search test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

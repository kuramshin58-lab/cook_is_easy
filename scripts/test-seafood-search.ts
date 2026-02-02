import 'dotenv/config';
import { supabase } from '../server/supabase';

async function testSeafoodSearch() {
  console.log('🔍 Testing seafood search functionality...\n');

  const testIngredients = [
    { name: 'shrimp', emoji: '🦐' },
    { name: 'salmon', emoji: '🐟' },
    { name: 'tuna', emoji: '🐟' },
    { name: 'lobster', emoji: '🦞' },
    { name: 'clams', emoji: '🦪' },
    { name: 'mussels', emoji: '🦪' }
  ];

  for (const ingredient of testIngredients) {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('id, title, structured_ingredients, tags')
      .like('source_url', '%kitchenstories.com%');

    if (error) {
      console.error(`❌ Error fetching recipes:`, error);
      continue;
    }

    const matchingRecipes = recipes.filter((recipe: any) => {
      return recipe.structured_ingredients.some((ing: any) =>
        ing.name.toLowerCase().includes(ingredient.name)
      );
    });

    console.log(`${ingredient.emoji} ${ingredient.name.toUpperCase()}: ${matchingRecipes.length} recipes`);
    matchingRecipes.slice(0, 3).forEach((recipe: any) => {
      console.log(`  - ${recipe.title}`);
    });
    if (matchingRecipes.length > 3) {
      console.log(`  ... and ${matchingRecipes.length - 3} more`);
    }
    console.log('');
  }

  // Get total count by tags
  console.log('📊 Recipes by cuisine/type tags:\n');

  const tags = ['seafood', 'fish', 'asian', 'italian', 'french', 'japanese', 'thai', 'chinese'];

  for (const tag of tags) {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('id')
      .like('source_url', '%kitchenstories.com%')
      .contains('tags', [tag]);

    if (!error && recipes) {
      console.log(`🏷️  ${tag}: ${recipes.length} recipes`);
    }
  }

  // Test full text search
  console.log('\n🔍 Test search query: "salmon rice bowl"\n');

  const { data: searchResults, error: searchError } = await supabase
    .from('recipes')
    .select('id, title, tags')
    .like('source_url', '%kitchenstories.com%')
    .or('title.ilike.%salmon%,title.ilike.%rice%,title.ilike.%bowl%');

  if (searchResults && !searchError) {
    console.log(`Found ${searchResults.length} matching recipes:`);
    searchResults.forEach((recipe: any) => {
      console.log(`  - ${recipe.title}`);
    });
  }
}

testSeafoodSearch()
  .then(() => {
    console.log('\n✅ Search test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

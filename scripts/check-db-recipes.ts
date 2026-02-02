import 'dotenv/config';
import { supabase } from '../server/supabase';

async function checkRecipes() {
  console.log('🔍 Checking Kitchen Stories recipes in database...\n');

  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error getting total count:', countError);
    return;
  }

  console.log(`📊 Total recipes in database: ${totalCount}\n`);

  // Get Kitchen Stories recipes (by source_url)
  const { data: ksRecipes, error } = await supabase
    .from('recipes')
    .select('id, title, difficulty, prep_time, cook_time, tags, source_url')
    .like('source_url', '%kitchenstories.com%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching recipes:', error);
    return;
  }

  console.log(`🍳 Kitchen Stories recipes found: ${ksRecipes.length}\n`);

  ksRecipes.forEach((recipe, idx) => {
    console.log(`${idx + 1}. ${recipe.title}`);
    console.log(`   ⏱️  ${recipe.difficulty} | ${recipe.prep_time + recipe.cook_time} min total`);
    console.log(`   🏷️  ${recipe.tags.join(', ')}`);
    console.log(`   🆔 ID: ${recipe.id}\n`);
  });

  // Test search with a key ingredient
  console.log('🔍 Testing search with "pumpkin"...\n');

  const { data: searchResults, error: searchError } = await supabase
    .from('recipes')
    .select('id, title, structured_ingredients')
    .like('source_url', '%kitchenstories.com%');

  if (searchError) {
    console.error('❌ Search error:', searchError);
    return;
  }

  const pumpkinRecipes = searchResults.filter((recipe: any) => {
    return recipe.structured_ingredients.some((ing: any) =>
      ing.name.toLowerCase().includes('pumpkin')
    );
  });

  console.log(`Found ${pumpkinRecipes.length} recipes with pumpkin:`);
  pumpkinRecipes.forEach((recipe: any) => {
    console.log(`  - ${recipe.title}`);
  });
}

checkRecipes()
  .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

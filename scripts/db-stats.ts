import 'dotenv/config';
import { supabase } from '../server/supabase';

async function getDatabaseStats() {
  console.log('📊 Database Statistics Report\n');
  console.log('='.repeat(50) + '\n');

  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error getting total count:', countError);
    return;
  }

  console.log(`📈 Total Recipes: ${totalCount}\n`);

  // Get Kitchen Stories count
  const { count: ksCount } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
    .like('source_url', '%kitchenstories.com%');

  console.log(`🍳 Kitchen Stories: ${ksCount}`);

  // Get difficulty distribution
  const difficulties = ['easy', 'medium', 'hard'];
  console.log('\n⭐ By Difficulty:');

  for (const diff of difficulties) {
    const { count } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('difficulty', diff);

    console.log(`   ${diff.padEnd(8)}: ${count} recipes`);
  }

  // Get top tags
  const { data: allRecipes } = await supabase
    .from('recipes')
    .select('tags');

  if (allRecipes) {
    const tagCounts = new Map<string, number>();

    allRecipes.forEach((recipe: any) => {
      if (recipe.tags && Array.isArray(recipe.tags)) {
        recipe.tags.forEach((tag: string) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    console.log('\n🏷️  Top 15 Tags:');
    topTags.forEach(([tag, count], idx) => {
      console.log(`   ${(idx + 1).toString().padStart(2)}. ${tag.padEnd(20)}: ${count} recipes`);
    });
  }

  // Get key ingredients distribution
  const { data: recipesWithIngredients } = await supabase
    .from('recipes')
    .select('structured_ingredients');

  if (recipesWithIngredients) {
    const keyIngredients = new Map<string, number>();

    recipesWithIngredients.forEach((recipe: any) => {
      if (recipe.structured_ingredients && Array.isArray(recipe.structured_ingredients)) {
        recipe.structured_ingredients.forEach((ing: any) => {
          if (ing.category === 'key') {
            const name = ing.name.toLowerCase();
            keyIngredients.set(name, (keyIngredients.get(name) || 0) + 1);
          }
        });
      }
    });

    const topKeyIngredients = Array.from(keyIngredients.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    console.log('\n🔑 Top 15 Key Ingredients:');
    topKeyIngredients.forEach(([ingredient, count], idx) => {
      console.log(`   ${(idx + 1).toString().padStart(2)}. ${ingredient.padEnd(30)}: ${count} recipes`);
    });
  }

  // Average nutrition
  const { data: nutritionData } = await supabase
    .from('recipes')
    .select('calories, protein, fats, carbs');

  if (nutritionData && nutritionData.length > 0) {
    const avgCalories = Math.round(nutritionData.reduce((sum: number, r: any) => sum + (r.calories || 0), 0) / nutritionData.length);
    const avgProtein = Math.round(nutritionData.reduce((sum: number, r: any) => sum + (r.protein || 0), 0) / nutritionData.length);
    const avgFats = Math.round(nutritionData.reduce((sum: number, r: any) => sum + (r.fats || 0), 0) / nutritionData.length);
    const avgCarbs = Math.round(nutritionData.reduce((sum: number, r: any) => sum + (r.carbs || 0), 0) / nutritionData.length);

    console.log('\n🍽️  Average Nutrition (per recipe):');
    console.log(`   Calories: ${avgCalories} kcal`);
    console.log(`   Protein:  ${avgProtein}g`);
    console.log(`   Fats:     ${avgFats}g`);
    console.log(`   Carbs:    ${avgCarbs}g`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Statistics report complete\n');
}

getDatabaseStats()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

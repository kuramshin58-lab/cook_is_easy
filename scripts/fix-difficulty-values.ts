/**
 * Fix difficulty values before migration
 * Normalizes all difficulty values to lowercase: 'easy', 'medium', 'hard'
 */

import 'dotenv/config';
import { supabase } from '../server/supabase';

async function fixDifficultyValues() {
  console.log('='.repeat(60));
  console.log('FIX DIFFICULTY VALUES');
  console.log('='.repeat(60));

  // Step 1: Check current values
  console.log('\n📊 Checking current difficulty values...\n');

  const { data: recipes, error: fetchError } = await supabase
    .from('recipes')
    .select('id, difficulty');

  if (fetchError) {
    console.error('❌ Error fetching recipes:', fetchError);
    return;
  }

  if (!recipes || recipes.length === 0) {
    console.log('No recipes found in database');
    return;
  }

  // Count unique difficulty values
  const difficultyCounts = new Map<string, number>();
  recipes.forEach(recipe => {
    const diff = recipe.difficulty || 'null';
    difficultyCounts.set(diff, (difficultyCounts.get(diff) || 0) + 1);
  });

  console.log('Current difficulty values:');
  Array.from(difficultyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([value, count]) => {
      console.log(`  ${value}: ${count} recipes`);
    });

  // Step 2: Map values to correct format
  console.log('\n🔄 Normalizing difficulty values...\n');

  const mapping: Record<string, string> = {
    'Easy': 'easy',
    'EASY': 'easy',
    'Medium': 'medium',
    'MEDIUM': 'medium',
    'Intermediate': 'medium',
    'intermediate': 'medium',
    'Hard': 'hard',
    'HARD': 'hard',
    'Difficult': 'hard',
    'difficult': 'hard',
    'Advanced': 'hard',
    'advanced': 'hard'
  };

  let updateCount = 0;
  let errorCount = 0;

  for (const recipe of recipes) {
    const currentDiff = recipe.difficulty;
    const normalizedDiff = mapping[currentDiff] || currentDiff?.toLowerCase();

    // Skip if already correct or null
    if (currentDiff === normalizedDiff || !currentDiff) {
      continue;
    }

    // Update recipe
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ difficulty: normalizedDiff })
      .eq('id', recipe.id);

    if (updateError) {
      console.error(`❌ Error updating recipe ${recipe.id}:`, updateError);
      errorCount++;
    } else {
      updateCount++;
      if (updateCount % 10 === 0) {
        console.log(`✓ Updated ${updateCount} recipes...`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('NORMALIZATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✓ Successfully updated: ${updateCount} recipes`);
  console.log(`✗ Failed: ${errorCount} recipes`);

  if (updateCount > 0) {
    console.log('\n✅ You can now run the SQL migration in Supabase!');
  } else {
    console.log('\n✅ All difficulty values are already normalized!');
  }
  console.log('');
}

fixDifficultyValues()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });

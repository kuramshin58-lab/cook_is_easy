import 'dotenv/config';
import { supabase } from '../server/supabase';

async function checkTags() {
  const { data, error } = await supabase
    .from('recipes')
    .select('title, tags')
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample recipes with tags:\n');
  data?.forEach(recipe => {
    console.log(`${recipe.title}`);
    console.log(`  Tags: ${JSON.stringify(recipe.tags)}\n`);
  });

  // Check for salad recipes specifically
  console.log('\n--- Salad recipes ---\n');
  const { data: salads } = await supabase
    .from('recipes')
    .select('title, tags')
    .ilike('title', '%salad%')
    .limit(5);

  salads?.forEach(recipe => {
    console.log(`${recipe.title}`);
    console.log(`  Tags: ${JSON.stringify(recipe.tags)}\n`);
  });
}

checkTags().then(() => process.exit(0)).catch(console.error);

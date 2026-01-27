import 'dotenv/config';
import { supabase } from '../server/supabase';

async function checkDifficulty() {
  const { data, error } = await supabase
    .from('recipes')
    .select('title, difficulty')
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample recipes with difficulty:\n');
  data?.forEach(recipe => {
    console.log(`${recipe.title} → difficulty: "${recipe.difficulty}"`);
  });
}

checkDifficulty().then(() => process.exit(0)).catch(console.error);

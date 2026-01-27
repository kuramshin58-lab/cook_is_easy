import 'dotenv/config';
import { supabase } from '../server/supabase';

async function checkColumnType() {
  console.log('Checking column types...\n');

  // Query to get column information
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns
      WHERE table_name = 'recipes'
      AND column_name IN ('instructions', 'structured_ingredients', 'ingredients', 'tags');
    `
  });

  if (error) {
    console.error('Error (RPC might not exist):', error.message);
    console.log('\nTrying alternative approach...\n');

    // Alternative: just fetch and inspect the data
    const { data: recipe, error: fetchError } = await supabase
      .from('recipes')
      .select('id, title, instructions')
      .limit(1)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return;
    }

    console.log('Recipe:', recipe.title);
    console.log('Instructions:', recipe.instructions);
    console.log('Type:', typeof recipe.instructions);
    console.log('Is Array:', Array.isArray(recipe.instructions));

    if (typeof recipe.instructions === 'string') {
      console.log('\n⚠ Instructions is a STRING, not an array');
      console.log('First 100 chars:', recipe.instructions.substring(0, 100));

      // Try to parse
      try {
        const parsed = JSON.parse(recipe.instructions);
        console.log('\nCan be parsed as JSON:', true);
        console.log('Parsed is array:', Array.isArray(parsed));
        if (Array.isArray(parsed)) {
          console.log('Parsed length:', parsed.length);
          console.log('First element:', parsed[0]);
        }
      } catch (e) {
        console.log('\nCannot parse as JSON');
      }
    }

    return;
  }

  console.log('Column information:');
  console.log(data);
}

checkColumnType()
  .then(() => process.exit(0))
  .catch(console.error);

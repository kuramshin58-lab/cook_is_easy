/**
 * Check current table structure to see if migration is needed
 */

import 'dotenv/config';
import { supabase } from '../server/supabase';

async function checkTableStructure() {
  console.log('Checking recipes table structure...\n');

  // Query a single recipe to see what columns exist
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error querying recipes:', error);
    return;
  }

  if (!data) {
    console.log('No recipes found in database');
    return;
  }

  const columns = Object.keys(data);

  console.log('Current columns in recipes table:');
  console.log(columns.sort().join(', '));
  console.log('');

  // Check for new columns
  const requiredColumns = [
    'structured_ingredients',
    'protein',
    'fats',
    'carbs',
    'created_at',
    'updated_at'
  ];

  const missingColumns = requiredColumns.filter(col => !columns.includes(col));

  if (missingColumns.length === 0) {
    console.log('✓ All required columns exist!');
    console.log('✓ You can proceed with data migration using:');
    console.log('  npx tsx scripts/migrate-ingredients-to-structured.ts\n');
  } else {
    console.log('⚠️  Missing columns:', missingColumns.join(', '));
    console.log('\n⚠️  You need to run the SQL migration first!');
    console.log('Run: npx tsx scripts/run-migration.ts');
    console.log('Then copy the SQL and execute it in Supabase SQL Editor.\n');
  }

  // Check if any recipes already have structured_ingredients
  if (columns.includes('structured_ingredients')) {
    const { count } = await supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .not('structured_ingredients', 'is', null);

    console.log(`\nRecipes with structured_ingredients: ${count || 0}`);
  }
}

checkTableStructure().catch(console.error);

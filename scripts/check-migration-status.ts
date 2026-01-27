/**
 * Check Migration Status
 * Shows how many recipes have structured_ingredients vs need migration
 */

import 'dotenv/config';
import { supabase } from '../server/supabase';

async function checkStatus() {
  console.log('='.repeat(70));
  console.log('MIGRATION STATUS CHECK');
  console.log('='.repeat(70));
  console.log();

  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error getting total count:', totalError);
    process.exit(1);
  }

  console.log(`📊 Total recipes in database: ${totalCount}`);
  console.log();

  // Get count with structured_ingredients
  const { count: migratedCount, error: migratedError } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
    .not('structured_ingredients', 'is', null);

  if (migratedError) {
    console.error('Error getting migrated count:', migratedError);
    process.exit(1);
  }

  console.log(`✅ Recipes with structured_ingredients: ${migratedCount}`);
  console.log();

  // Get count without structured_ingredients
  const { count: needMigrationCount, error: needMigrationError } = await supabase
    .from('recipes')
    .select('*', { count: 'exact', head: true })
    .is('structured_ingredients', null);

  if (needMigrationError) {
    console.error('Error getting unmigrated count:', needMigrationError);
    process.exit(1);
  }

  console.log(`⏳ Recipes needing migration: ${needMigrationCount}`);
  console.log();

  // Get sample of unmigrated recipes
  if (needMigrationCount && needMigrationCount > 0) {
    const { data: samples, error: sampleError } = await supabase
      .from('recipes')
      .select('id, title')
      .is('structured_ingredients', null)
      .limit(10);

    if (!sampleError && samples) {
      console.log('Sample recipes needing migration:');
      samples.forEach((recipe, i) => {
        console.log(`  ${i + 1}. ${recipe.title}`);
      });
      console.log();
    }
  }

  console.log('='.repeat(70));

  if (needMigrationCount === 0) {
    console.log('✅ ALL RECIPES MIGRATED!');
    console.log('='.repeat(70));
    console.log();
    console.log('All recipes have structured_ingredients.');
    console.log('No migration needed!');
  } else {
    console.log('⚠️  MIGRATION NEEDED');
    console.log('='.repeat(70));
    console.log();
    console.log(`${needMigrationCount} recipes need migration.`);
    console.log();
    console.log('Run migration:');
    console.log('  npx tsx scripts/migrate-ingredients-to-structured.ts');
  }
  console.log();
}

checkStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

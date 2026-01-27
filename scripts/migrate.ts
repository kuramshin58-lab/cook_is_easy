/**
 * Interactive Migration Helper
 * Guides you through the database migration process
 */

import 'dotenv/config';
import { supabase } from '../server/supabase';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function checkTableStructure(): Promise<boolean> {
  console.log('🔍 Checking current database structure...\n');

  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Error querying database:', error);
    return false;
  }

  const columns = Object.keys(data);
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
    console.log('✅ All required columns exist!');
    return true;
  }

  console.log('⚠️  Missing columns:', missingColumns.join(', '));
  console.log('');
  return false;
}

async function displayMigrationSQL() {
  const migrationPath = path.join(process.cwd(), 'migrations', '001_add_structured_ingredients.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('\n' + '='.repeat(70));
  console.log('📋 MIGRATION SQL (Copy this to Supabase SQL Editor)');
  console.log('='.repeat(70));
  console.log(sql);
  console.log('='.repeat(70) + '\n');
}

async function runDataMigration() {
  console.log('\n🚀 Starting data migration...\n');

  // Import and run the migration script
  const { migrateRecipes } = await import('./migrate-ingredients-to-structured');
  await migrateRecipes();

  console.log('\n✅ Data migration completed!\n');
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          DATABASE MIGRATION: Structured Ingredients           ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Step 1: Check current state
  const hasAllColumns = await checkTableStructure();

  if (!hasAllColumns) {
    console.log('📝 You need to run the SQL migration first!\n');
    console.log('Steps:');
    console.log('1. Open Supabase SQL Editor:');
    console.log('   https://zhrzfzwtqcrvkhwwumsc.supabase.co/project/_/sql\n');

    const answer = await question('Do you want to see the migration SQL? (yes/no): ');

    if (answer.toLowerCase().startsWith('y')) {
      displayMigrationSQL();

      console.log('📋 Instructions:');
      console.log('1. Copy the SQL above');
      console.log('2. Open Supabase SQL Editor');
      console.log('3. Paste and click "Run"');
      console.log('4. Come back here and run this script again\n');
    }

    console.log('After running the SQL migration, restart this script:');
    console.log('  npx tsx scripts/migrate.ts\n');
    rl.close();
    return;
  }

  // Step 2: Check if data migration is needed
  console.log('\n🔍 Checking migration status...\n');

  const { data: unmigrated, error } = await supabase
    .from('recipes')
    .select('id', { count: 'exact', head: true })
    .is('structured_ingredients', null);

  const unmigratedCount = unmigrated?.length || 0;

  if (unmigratedCount === 0) {
    console.log('✅ All recipes are already migrated!');
    console.log('✅ No action needed.\n');
    rl.close();
    return;
  }

  console.log(`📊 Found ${unmigratedCount} recipes that need migration\n`);

  const answer = await question('Do you want to migrate them now? (yes/no): ');

  if (answer.toLowerCase().startsWith('y')) {
    await runDataMigration();

    // Verify migration
    const { data: stillUnmigrated } = await supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .is('structured_ingredients', null);

    const remainingCount = stillUnmigrated?.length || 0;

    if (remainingCount === 0) {
      console.log('✅ All recipes successfully migrated!');
      console.log('🎉 Migration complete!\n');
    } else {
      console.log(`⚠️  ${remainingCount} recipes still need migration`);
      console.log('Check the console output above for errors\n');
    }
  } else {
    console.log('\nMigration cancelled. Run this script again when ready:\n');
    console.log('  npx tsx scripts/migrate.ts\n');
  }

  rl.close();
}

main().catch((error) => {
  console.error('\n❌ Error:', error);
  rl.close();
  process.exit(1);
});

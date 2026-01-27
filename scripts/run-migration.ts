/**
 * Script to execute SQL migration via Supabase
 * This will add structured_ingredients column and related schema improvements
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('='.repeat(60));
  console.log('DATABASE MIGRATION: Add Structured Ingredients');
  console.log('='.repeat(60));

  console.log('\nReading migration file...');
  const migrationPath = path.join(process.cwd(), 'migrations', '001_add_structured_ingredients.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('✓ Migration file loaded\n');

  // Note: Supabase client cannot execute DDL commands directly
  // We need to use the Supabase SQL Editor or psql

  console.log('⚠️  IMPORTANT: SQL DDL commands cannot be executed via supabase-js client.');
  console.log('You need to run this migration in one of the following ways:\n');

  console.log('Option 1: Supabase Dashboard SQL Editor');
  console.log(`  1. Go to: ${supabaseUrl}/project/_/sql`);
  console.log('  2. Paste the SQL below');
  console.log('  3. Click "Run"\n');

  console.log('Option 2: Direct PostgreSQL connection (if available)');
  console.log('  psql <DATABASE_URL> < migrations/001_add_structured_ingredients.sql\n');

  console.log('='.repeat(60));
  console.log('MIGRATION SQL:');
  console.log('='.repeat(60));
  console.log(sql);
  console.log('='.repeat(60));

  console.log('\n✓ After running the SQL migration, execute the data migration:');
  console.log('  npx tsx scripts/migrate-ingredients-to-structured.ts\n');
}

runMigration().catch(console.error);

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function changeInstructionsToArray() {
  console.log('Changing instructions column type to TEXT[]...\n');

  // Step 1: Create a new column with TEXT[] type
  console.log('Step 1: Creating new column instructions_array...');
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE recipes ADD COLUMN IF NOT EXISTS instructions_array TEXT[];`
  });

  if (createError) {
    console.log('Cannot use RPC. You need to run this SQL manually in Supabase Dashboard:');
    console.log('\n--- SQL to run manually ---');
    console.log(`
-- Step 1: Add new column
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS instructions_array TEXT[];

-- Step 2: Copy data, parsing JSON strings
UPDATE recipes
SET instructions_array =
  CASE
    WHEN instructions::text LIKE '[%' THEN
      -- It's a JSON array, parse it
      (SELECT array_agg(value::text)
       FROM json_array_elements_text(instructions::json))
    ELSE
      -- It's already text, split by newlines or keep as is
      ARRAY[instructions::text]
  END;

-- Step 3: Drop old column
ALTER TABLE recipes DROP COLUMN instructions;

-- Step 4: Rename new column
ALTER TABLE recipes RENAME COLUMN instructions_array TO instructions;
    `);
    console.log('\n--- End of SQL ---\n');
    console.log('After running this SQL in Supabase, your instructions will be proper TEXT[] arrays.');
    return;
  }

  console.log('✓ New column created');

  // Continue with other steps if RPC worked
  console.log('\nStep 2: Copying and parsing data...');
  // ... (rest of the migration)
}

changeInstructionsToArray()
  .then(() => process.exit(0))
  .catch(console.error);

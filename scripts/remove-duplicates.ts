import 'dotenv/config';
import { supabase } from '../server/supabase';

async function removeDuplicates() {
  console.log('🗑️  Removing duplicate recipes from database...\n');

  // Get all recipes from Kitchen Stories
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, title, source_url, created_at')
    .like('source_url', '%kitchenstories.com%')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching recipes:', error);
    return;
  }

  console.log(`📊 Total Kitchen Stories recipes: ${recipes.length}\n`);

  // Find duplicates by title
  const titleMap = new Map<string, any[]>();

  recipes.forEach(recipe => {
    const normalizedTitle = recipe.title.toLowerCase().trim();
    if (!titleMap.has(normalizedTitle)) {
      titleMap.set(normalizedTitle, []);
    }
    titleMap.get(normalizedTitle)!.push(recipe);
  });

  // Collect IDs to delete (keep oldest, delete newer)
  const idsToDelete: string[] = [];

  titleMap.forEach((recs, title) => {
    if (recs.length > 1) {
      // Keep the first one (oldest), delete the rest
      const toDelete = recs.slice(1);
      toDelete.forEach(recipe => {
        idsToDelete.push(recipe.id);
      });
    }
  });

  console.log(`🔴 Found ${idsToDelete.length} duplicate entries to remove\n`);

  if (idsToDelete.length === 0) {
    console.log('✅ No duplicates found. Database is clean!');
    return;
  }

  // Delete duplicates in batches
  const batchSize = 10;
  let deletedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batch = idsToDelete.slice(i, i + batchSize);

    console.log(`Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(idsToDelete.length / batchSize)}...`);

    for (const id of batch) {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`  ✗ Failed to delete ${id}:`, error.message);
        errorCount++;
      } else {
        console.log(`  ✓ Deleted recipe ID: ${id}`);
        deletedCount++;
      }
    }
  }

  console.log(`\n=== 🎉 CLEANUP COMPLETE ===`);
  console.log(`✅ Successfully deleted: ${deletedCount}`);
  console.log(`❌ Failed to delete: ${errorCount}`);
  console.log(`📊 Total recipes before: ${recipes.length}`);
  console.log(`📊 Total recipes after: ${recipes.length - deletedCount}`);
  console.log(`🎯 Unique recipes: ${titleMap.size}`);
}

removeDuplicates()
  .then(() => {
    console.log('\n✅ Cleanup script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

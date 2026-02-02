import 'dotenv/config';
import { supabase } from '../server/supabase';

async function findDuplicates() {
  console.log('🔍 Searching for duplicate recipes in database...\n');

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

  // Filter only duplicates
  const duplicatesByTitle = Array.from(titleMap.entries())
    .filter(([_, recs]) => recs.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  console.log(`🔴 Found ${duplicatesByTitle.length} duplicate recipe titles:\n`);

  let totalDuplicates = 0;

  duplicatesByTitle.forEach(([title, recs]) => {
    console.log(`📋 "${recs[0].title}" (${recs.length} copies)`);
    recs.forEach((recipe, idx) => {
      const date = new Date(recipe.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const marker = idx === 0 ? '  ✅ KEEP' : '  ❌ DELETE';
      console.log(`${marker} - ID: ${recipe.id} | Added: ${date}`);
    });
    console.log('');
    totalDuplicates += recs.length - 1;
  });

  console.log(`\n📊 Summary:`);
  console.log(`Total recipes: ${recipes.length}`);
  console.log(`Unique titles: ${titleMap.size}`);
  console.log(`Duplicate entries to remove: ${totalDuplicates}`);
  console.log(`After cleanup: ${recipes.length - totalDuplicates} recipes\n`);

  // Check for URL duplicates as well
  const urlMap = new Map<string, any[]>();

  recipes.forEach(recipe => {
    if (recipe.source_url) {
      if (!urlMap.has(recipe.source_url)) {
        urlMap.set(recipe.source_url, []);
      }
      urlMap.get(recipe.source_url)!.push(recipe);
    }
  });

  const duplicatesByUrl = Array.from(urlMap.entries())
    .filter(([_, recs]) => recs.length > 1);

  if (duplicatesByUrl.length > 0) {
    console.log(`🔗 Found ${duplicatesByUrl.length} duplicate source URLs (same as title duplicates)\n`);
  }

  // Generate delete IDs
  const idsToDelete: string[] = [];

  duplicatesByTitle.forEach(([_, recs]) => {
    // Keep the first one (oldest), delete the rest
    recs.slice(1).forEach(recipe => {
      idsToDelete.push(recipe.id);
    });
  });

  console.log(`\n🗑️  IDs to delete (${idsToDelete.length} total):`);
  console.log(idsToDelete.join(', '));

  return { idsToDelete, totalDuplicates };
}

findDuplicates()
  .then((result) => {
    if (result && result.totalDuplicates > 0) {
      console.log('\n⚠️  Run the cleanup script to remove duplicates');
    } else {
      console.log('\n✅ No duplicates found!');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function analyzeFormat() {
  const { data, error } = await supabase
    .from('recipes')
    .select('title, structured_ingredients')
    .not('structured_ingredients', 'is', null);

  if (error) {
    console.error('Error:', error);
    return;
  }

  let totalIngredients = 0;
  let badNameFormat = 0;  // количество в name
  let emptyAmount = 0;
  let goodFormat = 0;

  const badExamples: string[] = [];

  for (const recipe of data || []) {
    const ingredients = recipe.structured_ingredients || [];
    for (const ing of ingredients) {
      totalIngredients++;

      // Проверяем, есть ли число в начале name
      const hasNumberInName = /^\d+/.test(ing.name);
      const hasEmptyAmount = !ing.amount || ing.amount === '';

      if (hasNumberInName) {
        badNameFormat++;
        if (badExamples.length < 10) {
          badExamples.push(`"${ing.name}" (amount="${ing.amount}")`);
        }
      } else if (hasEmptyAmount) {
        emptyAmount++;
      } else {
        goodFormat++;
      }
    }
  }

  console.log('=== АНАЛИЗ ФОРМАТА ИНГРЕДИЕНТОВ ===\n');
  console.log(`Всего рецептов: ${data?.length}`);
  console.log(`Всего ингредиентов: ${totalIngredients}`);
  console.log('');
  console.log(`✅ Правильный формат: ${goodFormat} (${(goodFormat/totalIngredients*100).toFixed(1)}%)`);
  console.log(`❌ Количество в name: ${badNameFormat} (${(badNameFormat/totalIngredients*100).toFixed(1)}%)`);
  console.log(`⚠️  Пустой amount: ${emptyAmount} (${(emptyAmount/totalIngredients*100).toFixed(1)}%)`);
  console.log('');
  console.log('Примеры проблемных записей:');
  badExamples.forEach(ex => console.log('  - ' + ex));
}

analyzeFormat();

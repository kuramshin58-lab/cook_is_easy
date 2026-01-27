import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface StructuredIngredient {
  name: string;
  amount: string;
  unit: string;
  category: string;
  substitutes: string[];
  notes?: string;
  is_required?: boolean;
  display_name?: string;
}

// Паттерн для извлечения количества из начала строки
// Примеры: "1 onion", "2 chicken breasts", "3 scallions", "1/2 cup sugar"
const QUANTITY_PATTERN = /^(\d+(?:\/\d+)?(?:\.\d+)?)\s+(.+)$/;

// Единицы измерения, которые могут следовать за количеством
const UNITS = [
  // Объём
  'g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'cups', 'oz', 'lb', 'lbs',
  // Штуки/контейнеры
  'can', 'cans', 'jar', 'jars', 'slice', 'slices', 'piece', 'pieces',
  'clove', 'cloves', 'bunch', 'bunches', 'sprig', 'sprigs', 'head', 'heads',
  'stalk', 'stalks', 'strip', 'strips', 'fillet', 'fillets', 'breast', 'breasts',
  'thigh', 'thighs', 'leg', 'legs', 'sheet', 'sheets', 'pack', 'packs',
  'handful', 'pinch', 'dash'
];

// Паттерн для количества с единицей измерения
const UNITS_REGEX = new RegExp(
  `^(\\d+(?:\\/\\d+)?(?:\\.\\d+)?)\\s+(${UNITS.join('|')})\\s+(.+)$`,
  'i'
);

function fixIngredientName(ingredient: StructuredIngredient): StructuredIngredient {
  const name = ingredient.name.trim();

  // Если amount уже заполнен - не трогаем
  if (ingredient.amount && ingredient.amount.trim() !== '') {
    return ingredient;
  }

  // Проверяем, есть ли количество с единицей в name
  // Например: "1 can crushed tomatoes" -> amount="1", unit="can", name="crushed tomatoes"
  const withUnitMatch = name.match(UNITS_REGEX);
  if (withUnitMatch) {
    return {
      ...ingredient,
      amount: withUnitMatch[1],
      unit: withUnitMatch[2].toLowerCase(),
      name: withUnitMatch[3].trim(),
      display_name: withUnitMatch[3].trim()
    };
  }

  // Проверяем, есть ли просто количество в начале name
  const match = name.match(QUANTITY_PATTERN);
  if (match) {
    let cleanName = match[2].trim();

    // Убираем множественное число если количество > 1
    // "chicken breasts" -> "chicken breast"
    // "scallions" -> "scallion"
    // НО не трогаем слова которые не меняются: "spinach", "rice", etc.
    const quantity = parseFloat(match[1].includes('/')
      ? eval(match[1]) // Для дробей типа "1/2"
      : match[1]);

    if (quantity === 1 || quantity < 1) {
      // Для количества 1 или меньше, возможно нужно убрать 's' в конце
      // но это может сломать некоторые слова, поэтому пока оставляем
    }

    return {
      ...ingredient,
      amount: match[1],
      name: cleanName,
      display_name: cleanName
    };
  }

  return ingredient;
}

async function fixAllRecipes() {
  console.log('Загружаю все рецепты из базы...\n');

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, title, structured_ingredients')
    .not('structured_ingredients', 'is', null);

  if (error) {
    console.error('Ошибка загрузки:', error);
    return;
  }

  console.log(`Найдено ${recipes?.length} рецептов\n`);

  let totalFixed = 0;
  let recipesUpdated = 0;

  for (const recipe of recipes || []) {
    const ingredients: StructuredIngredient[] = recipe.structured_ingredients || [];
    let hasChanges = false;

    const fixedIngredients = ingredients.map(ing => {
      const fixed = fixIngredientName(ing);
      if (fixed.name !== ing.name || fixed.amount !== ing.amount) {
        hasChanges = true;
        totalFixed++;
        console.log(`  [${recipe.title}] "${ing.name}" -> name="${fixed.name}" amount="${fixed.amount}"`);
      }
      return fixed;
    });

    if (hasChanges) {
      recipesUpdated++;

      const { error: updateError } = await supabase
        .from('recipes')
        .update({ structured_ingredients: fixedIngredients })
        .eq('id', recipe.id);

      if (updateError) {
        console.error(`  Ошибка обновления ${recipe.title}:`, updateError);
      }
    }
  }

  console.log('\n=== РЕЗУЛЬТАТ ===');
  console.log(`Исправлено ингредиентов: ${totalFixed}`);
  console.log(`Обновлено рецептов: ${recipesUpdated}`);
}

// Сначала покажем превью изменений без сохранения
async function previewChanges() {
  console.log('=== ПРЕВЬЮ ИЗМЕНЕНИЙ (без сохранения) ===\n');

  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, title, structured_ingredients')
    .not('structured_ingredients', 'is', null);

  if (error) {
    console.error('Ошибка загрузки:', error);
    return;
  }

  let totalWillFix = 0;
  const examples: string[] = [];

  for (const recipe of recipes || []) {
    const ingredients: StructuredIngredient[] = recipe.structured_ingredients || [];

    for (const ing of ingredients) {
      const fixed = fixIngredientName(ing);
      if (fixed.name !== ing.name || fixed.amount !== ing.amount) {
        totalWillFix++;
        if (examples.length < 20) {
          examples.push(`"${ing.name}" -> name="${fixed.name}" amount="${fixed.amount}"`);
        }
      }
    }
  }

  console.log(`Будет исправлено: ${totalWillFix} ингредиентов\n`);
  console.log('Примеры изменений:');
  examples.forEach(ex => console.log('  ' + ex));

  return totalWillFix;
}

// Запуск
const args = process.argv.slice(2);

if (args.includes('--fix')) {
  fixAllRecipes();
} else {
  previewChanges().then(count => {
    if (count && count > 0) {
      console.log('\n\nДля применения изменений запустите:');
      console.log('  npx tsx scripts/fix-ingredient-format.ts --fix');
    }
  });
}

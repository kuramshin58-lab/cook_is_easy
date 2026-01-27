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

// Маппинг Unicode дробей в десятичные значения
const UNICODE_FRACTIONS: Record<string, string> = {
  '½': '0.5',
  '⅓': '0.33',
  '⅔': '0.67',
  '¼': '0.25',
  '¾': '0.75',
  '⅕': '0.2',
  '⅖': '0.4',
  '⅗': '0.6',
  '⅘': '0.8',
  '⅙': '0.17',
  '⅚': '0.83',
  '⅛': '0.125',
  '⅜': '0.375',
  '⅝': '0.625',
  '⅞': '0.875'
};

// Конвертировать Unicode дроби в числа
function convertUnicodeFraction(str: string): string {
  let result = str;
  for (const [unicode, decimal] of Object.entries(UNICODE_FRACTIONS)) {
    // "1½" -> "1.5", "½" -> "0.5"
    const withWholeNumber = new RegExp(`(\\d+)${unicode}`, 'g');
    result = result.replace(withWholeNumber, (_, whole) => {
      return String(parseFloat(whole) + parseFloat(decimal));
    });

    // Standalone fraction
    result = result.replace(new RegExp(`^${unicode}$`), decimal);
    result = result.replace(new RegExp(`^${unicode}\\s`, 'g'), `${decimal} `);
  }
  return result;
}

// Единицы измерения
const UNITS = [
  'g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'cups', 'oz', 'lb', 'lbs',
  'can', 'cans', 'jar', 'jars', 'slice', 'slices', 'piece', 'pieces',
  'clove', 'cloves', 'bunch', 'bunches', 'sprig', 'sprigs', 'head', 'heads',
  'stalk', 'stalks', 'strip', 'strips', 'fillet', 'fillets', 'breast', 'breasts',
  'thigh', 'thighs', 'leg', 'legs', 'sheet', 'sheets', 'pack', 'packs',
  'handful', 'pinch', 'dash'
];

// Паттерн для количества с единицей измерения (после конвертации дробей)
const UNITS_REGEX = new RegExp(
  `^([\\d.]+(?:-[\\d.]+)?)\\s+(${UNITS.join('|')})\\s+(.+)$`,
  'i'
);

// Паттерн для простого количества
const QUANTITY_PATTERN = /^([\d.]+(?:-[\d.]+)?)\s+(.+)$/;

function fixIngredientName(ingredient: StructuredIngredient): StructuredIngredient {
  let name = ingredient.name.trim();

  // Если amount уже заполнен - не трогаем
  if (ingredient.amount && ingredient.amount.trim() !== '') {
    return ingredient;
  }

  // Конвертируем Unicode дроби
  name = convertUnicodeFraction(name);

  // Проверяем, есть ли количество с единицей в name
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
    return {
      ...ingredient,
      amount: match[1],
      name: match[2].trim(),
      display_name: match[2].trim()
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
        console.log(`  [${recipe.title}] "${ing.name}" -> name="${fixed.name}" amount="${fixed.amount}" unit="${fixed.unit || ''}"`);
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

// Превью изменений
async function previewChanges() {
  console.log('=== ПРЕВЬЮ ИЗМЕНЕНИЙ (Unicode дроби) ===\n');

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
          examples.push(`"${ing.name}" -> name="${fixed.name}" amount="${fixed.amount}" unit="${fixed.unit || ''}"`);
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
      console.log('  npx tsx scripts/fix-unicode-fractions.ts --fix');
    }
  });
}

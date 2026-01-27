import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function analyzeRecipes() {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('title, tags, structured_ingredients');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== АНАЛИЗ РЕЦЕПТОВ ===\n');
  console.log('Всего рецептов:', recipes?.length);

  // Анализ по ключевым словам в названиях
  const categories: Record<string, number> = {};
  const keywordMap: Record<string, string> = {
    'pasta': 'Паста',
    'spaghetti': 'Паста',
    'penne': 'Паста',
    'rigatoni': 'Паста',
    'lasagna': 'Паста',
    'noodle': 'Лапша',
    'ramen': 'Лапша',
    'chicken': 'Курица',
    'beef': 'Говядина',
    'pork': 'Свинина',
    'lamb': 'Баранина',
    'fish': 'Рыба',
    'shrimp': 'Морепродукты',
    'salmon': 'Рыба',
    'potato': 'Картофель',
    'rice': 'Рис',
    'soup': 'Супы',
    'salad': 'Салаты',
    'curry': 'Карри',
    'stir-fry': 'Стир-фрай',
    'steak': 'Стейки',
    'burger': 'Бургеры',
    'pizza': 'Пицца',
    'sandwich': 'Сэндвичи',
    'taco': 'Мексиканская',
    'burrito': 'Мексиканская',
    'quesadilla': 'Мексиканская',
    'fajita': 'Мексиканская',
    'thai': 'Тайская',
    'pad thai': 'Тайская',
    'indian': 'Индийская',
    'tikka': 'Индийская',
    'masala': 'Индийская',
    'breakfast': 'Завтраки',
    'egg': 'Яйца',
    'omelette': 'Завтраки',
    'pancake': 'Завтраки',
    'dessert': 'Десерты',
    'cake': 'Десерты',
    'cookie': 'Десерты',
    'pie': 'Пироги',
    'bread': 'Выпечка',
    'gratin': 'Запеканки',
    'casserole': 'Запеканки',
    'roast': 'Жаркое',
    'gnocchi': 'Ньокки',
    'teriyaki': 'Японская',
    'korean': 'Корейская',
    'chinese': 'Китайская'
  };

  const recipeCategories: Record<string, string[]> = {};

  for (const recipe of recipes || []) {
    const titleLower = recipe.title.toLowerCase();
    const matchedCategories: string[] = [];

    for (const [keyword, category] of Object.entries(keywordMap)) {
      if (titleLower.includes(keyword)) {
        matchedCategories.push(category);
        categories[category] = (categories[category] || 0) + 1;
      }
    }

    if (matchedCategories.length === 0) {
      categories['Другое'] = (categories['Другое'] || 0) + 1;
    }
  }

  // Сортировка по количеству
  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1]);

  console.log('\n=== КАТЕГОРИИ РЕЦЕПТОВ (по названиям) ===\n');
  for (const [cat, count] of sortedCategories) {
    const bar = '█'.repeat(Math.min(count, 40));
    console.log(`${cat.padEnd(18)} ${count.toString().padStart(3)} ${bar}`);
  }

  // Анализ ключевых ингредиентов
  const keyIngredients: Record<string, number> = {};
  const importantIngredients: Record<string, number> = {};

  for (const recipe of recipes || []) {
    const ingredients = recipe.structured_ingredients || [];
    for (const ing of ingredients) {
      const name = ing.name.toLowerCase().trim();
      if (ing.category === 'key') {
        keyIngredients[name] = (keyIngredients[name] || 0) + 1;
      } else if (ing.category === 'important') {
        importantIngredients[name] = (importantIngredients[name] || 0) + 1;
      }
    }
  }

  const sortedKeyIngredients = Object.entries(keyIngredients)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  console.log('\n=== ТОП-15 КЛЮЧЕВЫХ ИНГРЕДИЕНТОВ (category: key) ===\n');
  for (const [ing, count] of sortedKeyIngredients) {
    const bar = '█'.repeat(Math.min(count, 40));
    console.log(`${ing.padEnd(25)} ${count.toString().padStart(3)} ${bar}`);
  }

  const sortedImportantIngredients = Object.entries(importantIngredients)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  console.log('\n=== ТОП-15 ВАЖНЫХ ИНГРЕДИЕНТОВ (category: important) ===\n');
  for (const [ing, count] of sortedImportantIngredients) {
    const bar = '█'.repeat(Math.min(count, 40));
    console.log(`${ing.padEnd(25)} ${count.toString().padStart(3)} ${bar}`);
  }

  // Анализ тегов
  const allTags: Record<string, number> = {};
  for (const recipe of recipes || []) {
    const tags = recipe.tags || [];
    for (const tag of tags) {
      allTags[tag] = (allTags[tag] || 0) + 1;
    }
  }

  const sortedTags = Object.entries(allTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  if (sortedTags.length > 0) {
    console.log('\n=== ТОП-15 ТЕГОВ ===\n');
    for (const [tag, count] of sortedTags) {
      console.log(`${tag.padEnd(20)} ${count.toString().padStart(3)}`);
    }
  }

  // Рекомендации
  console.log('\n=== РЕКОМЕНДАЦИИ ПО ДОБАВЛЕНИЮ ===\n');

  const missingCategories = [
    { name: 'Рыба/Морепродукты', current: (categories['Рыба'] || 0) + (categories['Морепродукты'] || 0), target: 20 },
    { name: 'Говядина', current: categories['Говядина'] || 0, target: 15 },
    { name: 'Свинина', current: categories['Свинина'] || 0, target: 10 },
    { name: 'Супы', current: categories['Супы'] || 0, target: 15 },
    { name: 'Салаты', current: categories['Салаты'] || 0, target: 15 },
    { name: 'Завтраки', current: categories['Завтраки'] || 0, target: 15 },
    { name: 'Вегетарианское', current: categories['Вегетарианское'] || 0, target: 20 },
    { name: 'Рис', current: categories['Рис'] || 0, target: 15 },
    { name: 'Десерты', current: categories['Десерты'] || 0, target: 10 },
    { name: 'Выпечка/Хлеб', current: categories['Выпечка'] || 0, target: 10 },
    { name: 'Бургеры/Сэндвичи', current: (categories['Бургеры'] || 0) + (categories['Сэндвичи'] || 0), target: 10 },
    { name: 'Пицца', current: categories['Пицца'] || 0, target: 5 },
  ];

  for (const cat of missingCategories) {
    const needed = Math.max(0, cat.target - cat.current);
    if (needed > 0) {
      console.log(`❌ ${cat.name}: есть ${cat.current}, нужно ещё ~${needed}`);
    } else {
      console.log(`✅ ${cat.name}: достаточно (${cat.current})`);
    }
  }
}

analyzeRecipes();

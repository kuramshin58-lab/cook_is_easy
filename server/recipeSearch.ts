import { supabase } from "./supabase";
import type { Recipe, RecipeRequest } from "@shared/schema";

interface DbRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  difficulty: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  instructions: string;
  calories: number;
  tags: string[];
  source_url: string;
}

// Словарь перевода русских ингредиентов на английские ключевые слова
const ingredientTranslations: Record<string, string[]> = {
  // Паста и макароны
  'макароны': ['pasta', 'penne', 'spaghetti', 'macaroni', 'noodle', 'fettuccine', 'linguine', 'rigatoni'],
  'паста': ['pasta', 'penne', 'spaghetti', 'noodle', 'fettuccine', 'linguine'],
  'спагетти': ['spaghetti', 'pasta'],
  'пенне': ['penne', 'pasta'],
  'лапша': ['noodle', 'pasta'],
  
  // Мясо
  'курица': ['chicken', 'poultry'],
  'куриная грудка': ['chicken breast', 'chicken'],
  'куриное филе': ['chicken breast', 'chicken'],
  'говядина': ['beef', 'steak'],
  'свинина': ['pork', 'bacon'],
  'бекон': ['bacon', 'pork'],
  'фарш': ['ground', 'mince', 'beef', 'meat'],
  
  // Овощи
  'картошка': ['potato', 'potatoes'],
  'картофель': ['potato', 'potatoes'],
  'помидоры': ['tomato', 'tomatoes', 'cherry tomatoes'],
  'томаты': ['tomato', 'tomatoes'],
  'лук': ['onion', 'onions'],
  'чеснок': ['garlic'],
  'морковь': ['carrot', 'carrots'],
  'перец': ['pepper', 'bell pepper'],
  'болгарский перец': ['bell pepper', 'pepper'],
  'брокколи': ['broccoli'],
  'шпинат': ['spinach'],
  'тыква': ['pumpkin', 'squash', 'butternut'],
  'баклажан': ['eggplant', 'aubergine'],
  'кабачок': ['zucchini', 'courgette'],
  'огурец': ['cucumber'],
  'капуста': ['cabbage'],
  'грибы': ['mushroom', 'mushrooms', 'porcini'],
  
  // Молочные продукты
  'сливки': ['cream', 'heavy cream'],
  'молоко': ['milk'],
  'сыр': ['cheese'],
  'пармезан': ['parmesan', 'cheese'],
  'моцарелла': ['mozzarella', 'cheese'],
  'фета': ['feta', 'cheese'],
  'сметана': ['sour cream'],
  'йогурт': ['yogurt'],
  'масло сливочное': ['butter'],
  
  // Другое
  'яйца': ['egg', 'eggs'],
  'яйцо': ['egg', 'eggs'],
  'рис': ['rice', 'basmati'],
  'мука': ['flour'],
  'хлеб': ['bread'],
  'оливковое масло': ['olive oil'],
  'лимон': ['lemon'],
  'чили': ['chili', 'chilli'],
  'базилик': ['basil'],
  'орегано': ['oregano'],
  'петрушка': ['parsley'],
  'кинза': ['cilantro', 'coriander'],
  'имбирь': ['ginger'],
  'соевый соус': ['soy sauce'],
};

function translateIngredient(ingredient: string): string[] {
  const lower = ingredient.toLowerCase().trim();
  
  // Проверяем полное совпадение
  if (ingredientTranslations[lower]) {
    return ingredientTranslations[lower];
  }
  
  // Проверяем частичное совпадение
  for (const [russian, english] of Object.entries(ingredientTranslations)) {
    if (lower.includes(russian) || russian.includes(lower)) {
      return english;
    }
  }
  
  return [];
}

function normalizeIngredient(ingredient: string): string[] {
  const baseTokens = ingredient
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  // Добавляем переводы на английский
  const translations = translateIngredient(ingredient);
  
  return [...baseTokens, ...translations];
}

function calculateMatchScore(recipeIngredients: string[], userIngredients: string[]): number {
  const userTokens = new Set(
    userIngredients.flatMap(ing => normalizeIngredient(ing))
  );
  
  let matchedCount = 0;
  
  for (const recipeIng of recipeIngredients) {
    const recipeTokens = normalizeIngredient(recipeIng);
    const hasMatch = recipeTokens.some(token => {
      for (const userToken of Array.from(userTokens)) {
        if (token.includes(userToken) || userToken.includes(token)) {
          return true;
        }
      }
      return false;
    });
    
    if (hasMatch) {
      matchedCount++;
    }
  }
  
  return recipeIngredients.length > 0 
    ? matchedCount / recipeIngredients.length 
    : 0;
}

function mapDifficultyToSkillLevel(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'Новичок';
    case 'medium': return 'Средний';
    case 'hard': return 'Мишлен';
    default: return 'Средний';
  }
}

function mapSkillLevelToDifficulties(skillLevel: string | undefined): string[] {
  if (!skillLevel) return [];
  switch (skillLevel) {
    case 'Новичок': return ['Easy', 'easy', 'Легко', 'Простой'];
    case 'Средний': return ['Medium', 'medium', 'Средний', 'Средне'];
    case 'Мишлен': return ['Hard', 'hard', 'Сложный', 'Сложно', 'Medium'];
    default: return [];
  }
}

function convertDbRecipeToRecipe(dbRecipe: DbRecipe, matchScore: number, userIngredients: string[]): Recipe {
  const userTokens = new Set(
    userIngredients.flatMap(ing => normalizeIngredient(ing))
  );
  
  const ingredients = dbRecipe.ingredients.map(ing => {
    const ingTokens = normalizeIngredient(ing);
    const isAvailable = ingTokens.some(token => {
      for (const userToken of Array.from(userTokens)) {
        if (token.includes(userToken) || userToken.includes(token)) {
          return true;
        }
      }
      return false;
    });
    
    const parts = ing.match(/^([\d.,\s]+(?:g|г|ml|мл|tbsp|ст\.?л\.?|tsp|ч\.?л\.?|cloves?|шт\.?|pieces?|bunch|пучок)?)\s*(.+)$/i);
    if (parts && parts[2]) {
      return { name: parts[2].trim(), amount: parts[1].trim(), available: isAvailable };
    }
    return { name: ing, amount: "", available: isAvailable };
  });
  
  let steps = dbRecipe.instructions
    .split(/(?:\d+\.\s+)/)
    .filter(step => step.trim().length > 0)
    .map(step => step.trim().replace(/\.$/, ''));
  
  if (steps.length <= 1 && dbRecipe.instructions.length > 50) {
    steps = dbRecipe.instructions
      .split(/\.\s+/)
      .filter(step => step.trim().length > 10)
      .map(step => step.trim());
  }

  return {
    title: dbRecipe.title,
    shortDescription: dbRecipe.description.slice(0, 60) + (dbRecipe.description.length > 60 ? '...' : ''),
    description: dbRecipe.description,
    cookingTime: `${dbRecipe.prep_time + dbRecipe.cook_time} мин`,
    calories: dbRecipe.calories,
    protein: Math.round(dbRecipe.calories * 0.15 / 4),
    fats: Math.round(dbRecipe.calories * 0.30 / 9),
    carbs: Math.round(dbRecipe.calories * 0.55 / 4),
    ingredients,
    steps: steps.length > 0 ? steps : [dbRecipe.instructions],
    tips: `Рецепт из базы данных. Совпадение ингредиентов: ${Math.round(matchScore * 100)}%`,
    matchPercentage: Math.round(matchScore * 100),
    isFromDatabase: true
  };
}

export async function searchRecipesInDatabase(
  request: RecipeRequest,
  minResults: number = 5
): Promise<{ recipes: Recipe[]; foundEnough: boolean }> {
  const { ingredients, cookingTime, skillLevel } = request;
  
  const query = supabase
    .from('recipes')
    .select('*')
    .limit(200);
  
  const maxTime = parseInt(cookingTime.replace(/\D/g, ''), 10) || 60;
  const allowedDifficulties = mapSkillLevelToDifficulties(skillLevel);
  
  const { data: recipes, error } = await query;
  
  if (error) {
    console.error('Error searching recipes:', error);
    return { recipes: [], foundEnough: false };
  }
  
  if (!recipes || recipes.length === 0) {
    return { recipes: [], foundEnough: false };
  }
  
  const allIngredients = [
    ...ingredients,
    ...(request.userPreferences?.baseIngredients || [])
  ];
  
  const scoredRecipes = recipes
    .map((recipe: DbRecipe) => ({
      recipe,
      score: calculateMatchScore(recipe.ingredients, allIngredients),
      totalTime: recipe.prep_time + recipe.cook_time,
      matchesDifficulty: allowedDifficulties.length === 0 || 
        allowedDifficulties.some(d => recipe.difficulty.toLowerCase().includes(d.toLowerCase()))
    }))
    .filter(item => item.score > 0.2 && item.totalTime <= maxTime && item.matchesDifficulty)
    .sort((a, b) => b.score - a.score);
  
  const topRecipes = scoredRecipes
    .slice(0, minResults)
    .map(item => convertDbRecipeToRecipe(item.recipe, item.score, allIngredients));
  
  return {
    recipes: topRecipes,
    foundEnough: topRecipes.length >= minResults
  };
}

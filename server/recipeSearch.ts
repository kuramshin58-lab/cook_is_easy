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

function normalizeIngredient(ingredient: string): string[] {
  return ingredient
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
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

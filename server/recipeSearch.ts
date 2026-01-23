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

const specialIngredients = [
  'pumpkin', 'squash', 'butternut',
  'cream', 'heavy cream',
  'mushroom', 'mushrooms',
  'spinach',
  'eggplant', 'aubergine',
  'zucchini', 'courgette'
];

function calculateMatchScore(recipeIngredients: string[], userIngredients: string[]): number {
  const userTokens = new Set(
    userIngredients.flatMap(ing => normalizeIngredient(ing))
  );
  
  const userSpecialTokens = new Set(
    Array.from(userTokens).filter(token => 
      specialIngredients.some(special => token.includes(special) || special.includes(token))
    )
  );
  
  let matchedCount = 0;
  let specialMatches = 0;
  
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
      
      const isSpecialMatch = recipeTokens.some(token =>
        Array.from(userSpecialTokens).some(special => 
          token.includes(special) || special.includes(token)
        )
      );
      if (isSpecialMatch) {
        specialMatches++;
      }
    }
  }
  
  const baseScore = recipeIngredients.length > 0 
    ? matchedCount / recipeIngredients.length 
    : 0;
  
  const specialBoost = specialMatches > 0 ? 0.3 : 0;
  
  return Math.min(1, baseScore + specialBoost);
}

function mapSkillLevelToDifficulties(skillLevel: string | undefined): string[] {
  if (!skillLevel) return [];
  switch (skillLevel) {
    case 'Beginner': return ['Easy', 'easy'];
    case 'Intermediate': return ['Easy', 'easy', 'Medium', 'medium'];
    case 'Expert': return ['Easy', 'easy', 'Medium', 'medium', 'Hard', 'hard'];
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
    
    const parts = ing.match(/^([\d.,\s]+(?:g|ml|tbsp|tsp|cloves?|pieces?|bunch)?)\s*(.+)$/i);
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
    cookingTime: `${dbRecipe.prep_time + dbRecipe.cook_time} min`,
    calories: dbRecipe.calories,
    protein: Math.round(dbRecipe.calories * 0.15 / 4),
    fats: Math.round(dbRecipe.calories * 0.30 / 9),
    carbs: Math.round(dbRecipe.calories * 0.55 / 4),
    ingredients,
    steps: steps.length > 0 ? steps : [dbRecipe.instructions],
    tips: `Recipe from database. Ingredient match: ${Math.round(matchScore * 100)}%`,
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
  
  console.log('=== SEARCH DEBUG ===');
  console.log('User ingredients:', allIngredients);
  console.log('User tokens:', allIngredients.flatMap(ing => normalizeIngredient(ing)));
  console.log('Max time:', maxTime, 'Difficulty:', allowedDifficulties);
  
  const scoredRecipes = recipes
    .map((recipe: DbRecipe) => {
      const score = calculateMatchScore(recipe.ingredients, allIngredients);
      const totalTime = recipe.prep_time + recipe.cook_time;
      const matchesDifficulty = allowedDifficulties.length === 0 || 
        allowedDifficulties.some(d => recipe.difficulty.toLowerCase().includes(d.toLowerCase()));
      
      if (recipe.ingredients.some(i => i.toLowerCase().includes('pumpkin') || i.toLowerCase().includes('squash'))) {
        console.log(`PUMPKIN: "${recipe.title}" score=${score.toFixed(2)} time=${totalTime} diff=${recipe.difficulty} matchDiff=${matchesDifficulty}`);
      }
      
      return { recipe, score, totalTime, matchesDifficulty };
    })
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

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

interface MatchResult {
  totalScore: number;
  mainIngredientsMatched: number;
  mainIngredientsTotal: number;
  hasMainIngredientMatch: boolean;
}

function calculateMatchScore(
  recipeIngredients: string[], 
  mainIngredients: string[],
  baseIngredients: string[]
): MatchResult {
  const mainTokens = new Set(
    mainIngredients.flatMap(ing => normalizeIngredient(ing))
  );
  
  const baseTokens = new Set(
    baseIngredients.flatMap(ing => normalizeIngredient(ing))
  );
  
  const allTokens = new Set([...Array.from(mainTokens), ...Array.from(baseTokens)]);
  
  const specialTokens = new Set(
    Array.from(mainTokens).filter(token => 
      specialIngredients.some(special => token.includes(special) || special.includes(token))
    )
  );
  
  let matchedCount = 0;
  let mainMatchCount = 0;
  let specialMatches = 0;
  
  for (const recipeIng of recipeIngredients) {
    const recipeTokens = normalizeIngredient(recipeIng);
    
    const matchesMain = recipeTokens.some(token => {
      for (const mainToken of Array.from(mainTokens)) {
        if (token.includes(mainToken) || mainToken.includes(token)) {
          return true;
        }
      }
      return false;
    });
    
    const matchesAny = matchesMain || recipeTokens.some(token => {
      for (const baseToken of Array.from(baseTokens)) {
        if (token.includes(baseToken) || baseToken.includes(token)) {
          return true;
        }
      }
      return false;
    });
    
    if (matchesAny) {
      matchedCount++;
      if (matchesMain) {
        mainMatchCount++;
      }
      
      const isSpecialMatch = recipeTokens.some(token =>
        Array.from(specialTokens).some(special => 
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
  
  const mainIngredientBonus = mainMatchCount > 0 ? (mainMatchCount / mainIngredients.length) * 0.5 : 0;
  
  const specialBoost = specialMatches > 0 ? 0.2 : 0;
  
  const totalScore = Math.min(1, baseScore * 0.4 + mainIngredientBonus + specialBoost);
  
  return {
    totalScore,
    mainIngredientsMatched: mainMatchCount,
    mainIngredientsTotal: mainIngredients.length,
    hasMainIngredientMatch: mainMatchCount > 0
  };
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
  
  const mainIngredients = ingredients;
  const baseIngredients = request.userPreferences?.baseIngredients || [];
  const allIngredients = [...mainIngredients, ...baseIngredients];
  
  console.log('=== SEARCH DEBUG ===');
  console.log('Main ingredients (search):', mainIngredients);
  console.log('Base ingredients (profile):', baseIngredients);
  console.log('Max time:', maxTime, 'Difficulty:', allowedDifficulties);
  
  const scoredRecipes = recipes
    .map((recipe: DbRecipe) => {
      const matchResult = calculateMatchScore(recipe.ingredients, mainIngredients, baseIngredients);
      const totalTime = recipe.prep_time + recipe.cook_time;
      const matchesDifficulty = allowedDifficulties.length === 0 || 
        allowedDifficulties.some(d => recipe.difficulty.toLowerCase().includes(d.toLowerCase()));
      
      return { 
        recipe, 
        score: matchResult.totalScore, 
        hasMainMatch: matchResult.hasMainIngredientMatch,
        mainMatched: matchResult.mainIngredientsMatched,
        totalTime, 
        matchesDifficulty 
      };
    })
    .filter(item => 
      item.hasMainMatch &&
      item.score > 0.15 && 
      item.totalTime <= maxTime && 
      item.matchesDifficulty
    )
    .sort((a, b) => {
      if (b.mainMatched !== a.mainMatched) {
        return b.mainMatched - a.mainMatched;
      }
      return b.score - a.score;
    });
  
  console.log(`Found ${scoredRecipes.length} recipes matching main ingredients`);
  if (scoredRecipes.length > 0) {
    console.log('Top 3:', scoredRecipes.slice(0, 3).map(r => 
      `${r.recipe.title} (main=${r.mainMatched}, score=${r.score.toFixed(2)})`
    ));
  }
  
  const topRecipes = scoredRecipes
    .slice(0, minResults)
    .map(item => convertDbRecipeToRecipe(item.recipe, item.score, allIngredients));
  
  return {
    recipes: topRecipes,
    foundEnough: topRecipes.length >= minResults
  };
}

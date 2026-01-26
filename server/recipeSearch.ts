import { supabase } from "./supabase";
import type { Recipe, RecipeRequest, StructuredIngredient } from "@shared/schema";
import { calculateWeightedScore, filterByScore, sortByScore, toStructuredIngredient, categorizeIngredient } from "./weightedScoring";
import { SUBSTITUTION_MAP } from "@shared/substitutionMap";

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

function mapSkillLevelToDifficulties(skillLevel: string | undefined): string[] {
  if (!skillLevel) return [];
  switch (skillLevel) {
    case 'Beginner': return ['Easy', 'easy'];
    case 'Intermediate': return ['Easy', 'easy', 'Medium', 'medium'];
    case 'Expert': return ['Easy', 'easy', 'Medium', 'medium', 'Hard', 'hard'];
    default: return [];
  }
}

function parseDbIngredient(ing: string): { name: string; amount: string } {
  const parts = ing.match(/^([\d.,\s]+(?:g|ml|tbsp|tsp|cloves?|pieces?|bunch)?)\s*(.+)$/i);
  if (parts && parts[2]) {
    return { name: parts[2].trim(), amount: parts[1].trim() };
  }
  return { name: ing, amount: "" };
}

interface ScoredDbRecipe {
  dbRecipe: DbRecipe;
  scoreResult: ReturnType<typeof calculateWeightedScore>;
  structuredIngredients: StructuredIngredient[];
  totalTime: number;
}

function buildRecipeFromScored(
  dbRecipe: DbRecipe,
  scoreResult: ReturnType<typeof calculateWeightedScore>,
  structuredIngredients: StructuredIngredient[]
): Recipe {
  // Update ingredients with match info from scoreResult
  const ingredientsWithMatches = scoreResult.matches.map(m => ({
    ...m.ingredient,
    available: m.matchType !== 'none',
    matchType: m.matchType,
    matchedWith: m.matchedWith
  }));
  
  // Parse steps
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
    ingredients: ingredientsWithMatches,
    steps: steps.length > 0 ? steps : [dbRecipe.instructions],
    tips: `Recipe from database. Match: ${scoreResult.score}% (${scoreResult.matchDetails.exactMatches} exact, ${scoreResult.matchDetails.substituteMatches} substitute)`,
    matchPercentage: scoreResult.score,
    isFromDatabase: true,
    matchDetails: scoreResult.matchDetails
  };
}

interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  missingCount: number;
  matches: ReturnType<typeof calculateWeightedScore>['matches'];
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
  
  console.log('=== WEIGHTED SEARCH DEBUG ===');
  console.log('Main ingredients (search):', mainIngredients);
  console.log('Base ingredients (profile):', baseIngredients);
  console.log('Max time:', maxTime, 'Difficulty:', allowedDifficulties);
  
  // Score all recipes with weighted algorithm (single calculation)
  const scoredRecipes: ScoredRecipe[] = recipes
    .map((dbRecipe: DbRecipe) => {
      const totalTime = dbRecipe.prep_time + dbRecipe.cook_time;
      const matchesDifficulty = allowedDifficulties.length === 0 || 
        allowedDifficulties.some(d => dbRecipe.difficulty.toLowerCase().includes(d.toLowerCase()));
      
      // Skip if doesn't match time/difficulty filters
      if (totalTime > maxTime || !matchesDifficulty) {
        return null;
      }
      
      // Convert db ingredients to structured ingredients (once)
      const structuredIngredients: StructuredIngredient[] = dbRecipe.ingredients.map(ing => {
        const { name, amount } = parseDbIngredient(ing);
        const category = categorizeIngredient(name);
        const normalizedName = name.toLowerCase().trim();
        const substitutes = SUBSTITUTION_MAP[normalizedName] || [];
        
        return { name, amount, category, substitutes };
      });
      
      // Calculate weighted score (single calculation)
      const scoreResult = calculateWeightedScore(structuredIngredients, mainIngredients, baseIngredients);
      
      // Build complete recipe with score info
      const recipe = buildRecipeFromScored(dbRecipe, scoreResult, structuredIngredients);
      
      return {
        recipe,
        score: scoreResult.score,
        missingCount: scoreResult.missingCount,
        matches: scoreResult.matches
      };
    })
    .filter((item): item is ScoredRecipe => item !== null);
  
  // Filter by score threshold and key ingredient requirement
  const filteredRecipes = filterByScore(scoredRecipes);
  
  // Sort by score and missing count
  const sortedRecipes = sortByScore(filteredRecipes);
  
  console.log(`Found ${sortedRecipes.length} recipes after weighted filtering`);
  if (sortedRecipes.length > 0) {
    console.log('Top 3:', sortedRecipes.slice(0, 3).map(r => 
      `${r.recipe.title} (score=${r.score}%, missing=${r.missingCount})`
    ));
  }
  
  const topRecipes = sortedRecipes.slice(0, minResults).map(item => item.recipe);
  
  return {
    recipes: topRecipes,
    foundEnough: topRecipes.length >= minResults
  };
}

import { supabase } from "./supabase";
import type { Recipe, RecipeRequest, StructuredIngredient } from "@shared/schema";
import { calculateWeightedScore, filterByScore, sortByScore, toStructuredIngredient, categorizeIngredient } from "./weightedScoring";
import { SUBSTITUTION_MAP } from "@shared/substitutionMap";

interface DbRecipe {
  id: string;
  title: string;
  description: string;

  // New structured ingredients field (JSONB)
  structured_ingredients?: StructuredIngredient[];

  // Legacy ingredients field (TEXT[]) - kept for backward compatibility
  ingredients: string[];

  difficulty: string;
  prep_time: number;
  cook_time: number;
  servings: number;

  // Instructions can be either TEXT (legacy) or TEXT[] (new)
  instructions: string | string[];

  calories: number;

  // New nutrition fields
  protein?: number;
  fats?: number;
  carbs?: number;

  tags: string[];
  source_url: string;

  // New metadata fields
  created_at?: string;
  updated_at?: string;
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

// Map UI meal type to database tags
function mapMealTypeToTags(mealType: string | undefined): string[] {
  if (!mealType) return [];
  switch (mealType) {
    case 'Breakfast': return ['breakfast'];
    case 'Main Course': return ['main'];
    case 'Snack': return ['side', 'snack'];
    case 'Salad': return ['salad'];
    default: return [];
  }
}

// Map UI food type to database tags
function mapFoodTypeToTags(foodType: string | undefined): string[] {
  if (!foodType) return [];
  switch (foodType) {
    case 'Healthy': return ['healthy', 'low carb', 'gluten free', 'dairy free', 'lactose free'];
    case 'Comfort': return ['comfort food'];
    case 'Regular': return []; // Regular means no specific filter
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
  
  // Use structured instructions if available, otherwise parse legacy TEXT format
  let steps: string[] = [];

  if (Array.isArray(dbRecipe.instructions)) {
    // New format: instructions is already an array
    steps = dbRecipe.instructions;
  } else if (typeof dbRecipe.instructions === 'string') {
    // Check if it's a JSON array string
    if (dbRecipe.instructions.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(dbRecipe.instructions);
        if (Array.isArray(parsed)) {
          steps = parsed;
        }
      } catch (e) {
        // If JSON parsing fails, fall through to legacy parsing
        console.warn('Failed to parse instructions as JSON:', e);
      }
    }

    // If not parsed as JSON or parsing failed, use legacy format
    if (steps.length === 0) {
      steps = dbRecipe.instructions
        .split(/(?:\d+\.\s+)/)
        .filter(step => step.trim().length > 0)
        .map(step => step.trim().replace(/\.$/, ''));

      if (steps.length <= 1 && dbRecipe.instructions.length > 50) {
        steps = dbRecipe.instructions
          .split(/\.\s+/)
          .filter(step => step.trim().length > 10)
          .map(step => step.trim());
      }
    }
  }

  return {
    title: dbRecipe.title,
    shortDescription: dbRecipe.description.slice(0, 60) + (dbRecipe.description.length > 60 ? '...' : ''),
    description: dbRecipe.description,
    cookingTime: `${dbRecipe.prep_time + dbRecipe.cook_time} min`,
    calories: dbRecipe.calories,
    // Use real nutrition data from DB if available, otherwise estimate from calories
    protein: dbRecipe.protein || Math.round(dbRecipe.calories * 0.15 / 4),
    fats: dbRecipe.fats || Math.round(dbRecipe.calories * 0.30 / 9),
    carbs: dbRecipe.carbs || Math.round(dbRecipe.calories * 0.55 / 4),
    ingredients: ingredientsWithMatches,
    steps: steps.length > 0 ? steps : [typeof dbRecipe.instructions === 'string' ? dbRecipe.instructions : dbRecipe.instructions.join(' ')],
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

// Ensure diversity: limit recipes with the same key ingredient
function ensureDiversity(recipes: ScoredRecipe[], maxSameKey: number = 2): ScoredRecipe[] {
  const keyIngredientCounts = new Map<string, number>();
  const diverse: ScoredRecipe[] = [];

  for (const recipe of recipes) {
    // Get key ingredients from this recipe
    const keyIngs = recipe.matches
      .filter(m => m.ingredient.category === 'key')
      .map(m => normalizeIngredient(m.ingredient.name)[0] || m.ingredient.name.toLowerCase());

    // Check if we can add this recipe (not too many with same key ingredient)
    const canAdd = keyIngs.length === 0 || keyIngs.every(key => {
      const count = keyIngredientCounts.get(key) || 0;
      return count < maxSameKey;
    });

    if (canAdd) {
      diverse.push(recipe);
      // Update counts
      keyIngs.forEach(key => {
        keyIngredientCounts.set(key, (keyIngredientCounts.get(key) || 0) + 1);
      });

      // Stop when we have enough (take extra for buffer)
      if (diverse.length >= 15) break;
    }
  }

  return diverse;
}

export async function searchRecipesInDatabase(
  request: RecipeRequest,
  minResults: number = 5
): Promise<{ recipes: Recipe[]; foundEnough: boolean }> {
  const { ingredients, cookingTime, skillLevel, mealType, foodType } = request;
  
  const query = supabase
    .from('recipes')
    .select('*')
    .limit(200);
  
  const maxTime = parseInt(cookingTime.replace(/\D/g, ''), 10) || 60;
  const allowedDifficulties = mapSkillLevelToDifficulties(skillLevel);
  const requiredMealTypeTags = mapMealTypeToTags(mealType);
  const requiredFoodTypeTags = mapFoodTypeToTags(foodType);

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
  console.log('Meal type filter:', mealType, '→', requiredMealTypeTags);
  console.log('Food type filter:', foodType, '→', requiredFoodTypeTags);
  
  // Score all recipes with weighted algorithm (single calculation)
  const scoredRecipes: ScoredRecipe[] = recipes
    .map((dbRecipe: DbRecipe) => {
      const totalTime = dbRecipe.prep_time + dbRecipe.cook_time;
      const matchesDifficulty = allowedDifficulties.length === 0 ||
        allowedDifficulties.some(d => dbRecipe.difficulty.toLowerCase().includes(d.toLowerCase()));

      // Check meal type filter (e.g., "salad", "main", "breakfast")
      const matchesMealType = requiredMealTypeTags.length === 0 ||
        requiredMealTypeTags.some(tag => dbRecipe.tags.includes(tag));

      // Check food type filter (e.g., "healthy", "comfort food")
      const matchesFoodType = requiredFoodTypeTags.length === 0 ||
        requiredFoodTypeTags.some(tag => dbRecipe.tags.includes(tag));

      // Skip if doesn't match time/difficulty/mealType/foodType filters
      if (totalTime > maxTime || !matchesDifficulty || !matchesMealType || !matchesFoodType) {
        return null;
      }
      
      // Use structured ingredients from DB if available, otherwise parse legacy format
      const structuredIngredients: StructuredIngredient[] =
        dbRecipe.structured_ingredients ||
        // Fallback: Parse legacy TEXT[] ingredients
        dbRecipe.ingredients.map(ing => {
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

  // Apply diversity filter (max 2 recipes with the same key ingredient)
  const diverseRecipes = ensureDiversity(sortedRecipes, 2);

  console.log(`Found ${sortedRecipes.length} recipes after filtering (${diverseRecipes.length} after diversity)`);
  if (diverseRecipes.length > 0) {
    console.log('Top 3:', diverseRecipes.slice(0, 3).map(r =>
      `${r.recipe.title} (score=${r.score}%, missing=${r.missingCount})`
    ));
  }

  const topRecipes = diverseRecipes.slice(0, minResults).map(item => item.recipe);
  
  return {
    recipes: topRecipes,
    foundEnough: topRecipes.length >= minResults
  };
}

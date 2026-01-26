import type { StructuredIngredient, MatchResult, MatchDetails, MatchType, IngredientCategory } from "@shared/schema";
import { 
  INGREDIENT_WEIGHTS, 
  MATCH_MULTIPLIERS, 
  MIN_SCORE_THRESHOLD,
  REQUIRE_KEY_INGREDIENT,
  ALL_KEYS_BONUS,
  SUBSTITUTION_MAP,
  CATEGORY_RULES
} from "@shared/substitutionMap";

export interface WeightedScoreResult {
  score: number;
  matches: MatchResult[];
  missingCount: number;
  matchDetails: MatchDetails;
}

// Normalize ingredient name for comparison
function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-яё\s]/gi, '')
    .replace(/\s+/g, ' ');
}

// Check if there's an exact match
function hasExactMatch(ingredientName: string, userIngredients: string[]): boolean {
  const normalizedName = normalizeIngredient(ingredientName);
  const tokens = normalizedName.split(' ').filter(t => t.length > 2);
  
  return userIngredients.some(userIng => {
    const normalizedUser = normalizeIngredient(userIng);
    const userTokens = normalizedUser.split(' ');
    
    // Check if ingredient name contains user ingredient or vice versa
    if (normalizedName.includes(normalizedUser) || normalizedUser.includes(normalizedName)) {
      return true;
    }
    
    // Check token overlap for multi-word ingredients
    return tokens.some(token => 
      userTokens.some(ut => ut.includes(token) || token.includes(ut))
    );
  });
}

// Find a substitute match from the substitutes list
function findSubstituteMatch(ingredientName: string, substitutes: string[], userIngredients: string[]): string | null {
  // First check the ingredient's own substitutes list
  for (const sub of substitutes) {
    if (hasExactMatch(sub, userIngredients)) {
      return sub;
    }
  }
  
  // Also check the global substitution map
  const normalizedName = normalizeIngredient(ingredientName);
  const globalSubs = SUBSTITUTION_MAP[normalizedName] || [];
  
  for (const sub of globalSubs) {
    if (hasExactMatch(sub, userIngredients)) {
      return sub;
    }
  }
  
  return null;
}

// Auto-categorize ingredient based on name
export function categorizeIngredient(name: string): IngredientCategory {
  const normalizedName = normalizeIngredient(name);
  
  // Check each category's rules
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of keywords) {
      if (normalizedName.includes(keyword.toLowerCase()) || 
          keyword.toLowerCase().includes(normalizedName)) {
        return category as IngredientCategory;
      }
    }
  }
  
  // Default to important if no match
  return "important";
}

// Convert simple ingredient to structured ingredient
export function toStructuredIngredient(name: string, amount: string): StructuredIngredient {
  const category = categorizeIngredient(name);
  const normalizedName = normalizeIngredient(name);
  const substitutes = SUBSTITUTION_MAP[normalizedName] || [];
  
  return {
    name,
    amount,
    category,
    substitutes
  };
}

// Calculate weighted score for a recipe
export function calculateWeightedScore(
  recipeIngredients: StructuredIngredient[],
  userIngredients: string[],
  userBaseIngredients: string[] = []
): WeightedScoreResult {
  let totalWeight = 0;
  let earnedPoints = 0;
  let missingCount = 0;
  let exactMatches = 0;
  let substituteMatches = 0;
  const matches: MatchResult[] = [];
  const missingIngredients: { name: string; possibleSubstitutes: string[] }[] = [];
  
  // Combine user ingredients with base ingredients
  const allUserIngredients = [
    ...userIngredients.map(i => normalizeIngredient(i)),
    ...userBaseIngredients.map(i => normalizeIngredient(i))
  ];
  
  for (const ingredient of recipeIngredients) {
    const weight = INGREDIENT_WEIGHTS[ingredient.category];
    
    // Base ingredients are always assumed to be available
    if (ingredient.category === 'base') {
      matches.push({
        ingredient: { ...ingredient, available: true, matchType: 'exact' },
        matchType: 'exact',
        matchedWith: null
      });
      continue;
    }
    
    totalWeight += weight;
    
    // 1. Check for exact match
    if (hasExactMatch(ingredient.name, allUserIngredients)) {
      earnedPoints += weight * MATCH_MULTIPLIERS.exact;
      exactMatches++;
      matches.push({
        ingredient: { ...ingredient, available: true, matchType: 'exact' },
        matchType: 'exact',
        matchedWith: null
      });
    }
    // 2. Check for substitute match
    else {
      const substituteMatch = findSubstituteMatch(
        ingredient.name, 
        ingredient.substitutes || [], 
        allUserIngredients
      );
      
      if (substituteMatch) {
        earnedPoints += weight * MATCH_MULTIPLIERS.substitute;
        substituteMatches++;
        matches.push({
          ingredient: { ...ingredient, available: true, matchType: 'substitute', matchedWith: substituteMatch },
          matchType: 'substitute',
          matchedWith: substituteMatch
        });
      } else {
        // 3. No match found
        missingCount++;
        const normalizedName = normalizeIngredient(ingredient.name);
        const possibleSubs = [
          ...(ingredient.substitutes || []),
          ...(SUBSTITUTION_MAP[normalizedName] || [])
        ].slice(0, 5);
        
        missingIngredients.push({
          name: ingredient.name,
          possibleSubstitutes: possibleSubs
        });
        
        matches.push({
          ingredient: { ...ingredient, available: false, matchType: 'none' },
          matchType: 'none',
          matchedWith: null
        });
      }
    }
  }
  
  // Calculate base score
  let score = totalWeight > 0 ? (earnedPoints / totalWeight) * 100 : 0;
  
  // Apply bonus for having all key ingredients
  const keyIngredients = matches.filter(m => m.ingredient.category === 'key');
  const allKeyMatched = keyIngredients.every(m => m.matchType !== 'none');
  
  if (allKeyMatched && keyIngredients.length > 0) {
    score = Math.min(100, score + ALL_KEYS_BONUS);
  }
  
  return {
    score: Math.round(score * 10) / 10,
    matches,
    missingCount,
    matchDetails: {
      exactMatches,
      substituteMatches,
      missingIngredients
    }
  };
}

// Filter recipes by score threshold and key ingredient requirement
export function filterByScore<T extends { score: number; matches: MatchResult[] }>(
  recipes: T[]
): T[] {
  return recipes.filter(recipe => {
    // Check minimum score
    if (recipe.score < MIN_SCORE_THRESHOLD) return false;
    
    // Check for at least one key ingredient
    if (REQUIRE_KEY_INGREDIENT) {
      const hasKeyMatch = recipe.matches.some(
        m => m.ingredient.category === 'key' && m.matchType !== 'none'
      );
      if (!hasKeyMatch) return false;
    }
    
    return true;
  });
}

// Sort recipes by score and missing count
export function sortByScore<T extends { score: number; missingCount: number }>(
  recipes: T[]
): T[] {
  return [...recipes].sort((a, b) => {
    // Primary: by score (descending)
    if (Math.abs(a.score - b.score) > 5) {
      return b.score - a.score;
    }
    // Secondary: by missing count (ascending)
    return a.missingCount - b.missingCount;
  });
}

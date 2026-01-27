import type { StructuredIngredient, MatchResult, MatchDetails, MatchType, IngredientCategory } from "@shared/schema";
import {
  INGREDIENT_WEIGHTS,
  MATCH_MULTIPLIERS,
  MIN_SCORE_THRESHOLD,
  REQUIRE_KEY_INGREDIENT,
  ALL_KEYS_BONUS,
  BASE_INGREDIENT_WEIGHT,
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
    const userTokens = normalizedUser.split(' ').filter(t => t.length > 2);

    // Exact string match (full ingredient name)
    if (normalizedName === normalizedUser) {
      return true;
    }

    // One ingredient fully contains the other (e.g., "olive oil" vs "extra virgin olive oil")
    if (normalizedName.includes(normalizedUser) || normalizedUser.includes(normalizedName)) {
      // But make sure it's not just sharing one common word like "tomato"
      const shorterTokens = tokens.length <= userTokens.length ? tokens : userTokens;
      const longerString = tokens.length <= userTokens.length ? normalizedUser : normalizedName;

      // All tokens from shorter ingredient must be in longer ingredient
      const allTokensPresent = shorterTokens.every(token => longerString.includes(token));
      if (allTokensPresent) {
        return true;
      }
    }

    // For single-token ingredients, require exact match
    if (tokens.length === 1 || userTokens.length === 1) {
      return tokens.length === 1 && userTokens.length === 1 && tokens[0] === userTokens[0];
    }

    // For multi-token ingredients, require at least 2 matching tokens
    const matchingTokens = tokens.filter(token =>
      userTokens.some(ut => ut === token || ut.includes(token) || token.includes(ut))
    );

    return matchingTokens.length >= 2;
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
  let globalSubs = SUBSTITUTION_MAP[normalizedName] || [];

  // If no exact match, try partial matches (e.g., "tomato puree passata" → "tomato puree")
  if (globalSubs.length === 0) {
    const words = normalizedName.split(' ');

    // Try progressively shorter versions (from right to left)
    for (let i = words.length - 1; i >= 1; i--) {
      const partial = words.slice(0, i).join(' ');
      globalSubs = SUBSTITUTION_MAP[partial] || [];
      if (globalSubs.length > 0) {
        break;
      }
    }
  }

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

  // Separate main and base ingredients (DO NOT combine them!)
  const mainIngNormalized = userIngredients.map(i => normalizeIngredient(i));
  const baseIngNormalized = userBaseIngredients.map(i => normalizeIngredient(i));

  for (const ingredient of recipeIngredients) {
    const weight = INGREDIENT_WEIGHTS[ingredient.category];

    // Base category ingredients are always assumed to be available
    if (ingredient.category === 'base') {
      matches.push({
        ingredient: { ...ingredient, available: true, matchType: 'exact' },
        matchType: 'exact',
        matchedWith: null,
        matchSource: null
      });
      continue;
    }

    totalWeight += weight;

    let matched = false;
    let matchSource: 'main' | 'base' | null = null;
    let matchType: 'exact' | 'substitute' | 'none' = 'none';
    let matchedWith: string | null = null;
    let pointsEarned = 0;

    // 1. Check for exact match in MAIN ingredients (priority!)
    if (hasExactMatch(ingredient.name, mainIngNormalized)) {
      pointsEarned = weight * MATCH_MULTIPLIERS.exact * 1.0;  // Full weight
      matchSource = 'main';
      matchType = 'exact';
      matched = true;
      exactMatches++;
    }
    // 2. Check for substitute match in MAIN ingredients
    else {
      const substituteMatch = findSubstituteMatch(
        ingredient.name,
        ingredient.substitutes || [],
        mainIngNormalized
      );

      if (substituteMatch) {
        pointsEarned = weight * MATCH_MULTIPLIERS.substitute * 1.0;  // Full weight
        matchSource = 'main';
        matchType = 'substitute';
        matchedWith = substituteMatch;
        matched = true;
        substituteMatches++;
      }
    }

    // 3. If not found in main, check BASE ingredients (reduced weight!)
    if (!matched) {
      if (hasExactMatch(ingredient.name, baseIngNormalized)) {
        pointsEarned = weight * MATCH_MULTIPLIERS.exact * BASE_INGREDIENT_WEIGHT;  // 30% weight
        matchSource = 'base';
        matchType = 'exact';
        matched = true;
        exactMatches++;
      }
      // 4. Check for substitute match in BASE ingredients
      else {
        const substituteMatch = findSubstituteMatch(
          ingredient.name,
          ingredient.substitutes || [],
          baseIngNormalized
        );

        if (substituteMatch) {
          pointsEarned = weight * MATCH_MULTIPLIERS.substitute * BASE_INGREDIENT_WEIGHT;  // 21% weight
          matchSource = 'base';
          matchType = 'substitute';
          matchedWith = substituteMatch;
          matched = true;
          substituteMatches++;
        }
      }
    }

    // Add earned points
    earnedPoints += pointsEarned;

    // Build match result
    if (matched) {
      matches.push({
        ingredient: {
          ...ingredient,
          available: true,
          matchType,
          matchedWith
        },
        matchType,
        matchedWith,
        matchSource
      });
    } else {
      // No match found
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
        matchedWith: null,
        matchSource: null
      });
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
    // Check 1: Minimum score threshold
    if (recipe.score < MIN_SCORE_THRESHOLD) return false;

    // Check 2: At least one key ingredient must match
    if (REQUIRE_KEY_INGREDIENT) {
      const hasKeyMatch = recipe.matches.some(
        m => m.ingredient.category === 'key' && m.matchType !== 'none'
      );
      if (!hasKeyMatch) return false;
    }

    // Check 3 (CRITICAL): At least one KEY or IMPORTANT ingredient must match from MAIN ingredients
    // This prevents recipes with only base ingredients from appearing
    const hasMainIngredientMatch = recipe.matches.some(m =>
      (m.ingredient.category === 'key' || m.ingredient.category === 'important') &&
      m.matchType !== 'none' &&
      m.matchSource === 'main'
    );

    if (!hasMainIngredientMatch) return false;

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

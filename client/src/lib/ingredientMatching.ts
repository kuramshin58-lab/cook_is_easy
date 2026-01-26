import type { StructuredIngredient, MatchType, IngredientCategory, MatchDetails } from "@shared/schema";

export function normalizeIngredient(name: string): string {
  return name.toLowerCase().trim();
}

export function getTokens(str: string): Set<string> {
  return new Set(
    str.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter(t => t.length > 1)
  );
}

export function tokensMatch(str1: string, str2: string): boolean {
  const tokens1 = getTokens(str1);
  const tokens2 = getTokens(str2);
  
  if (tokens1.size === 0 || tokens2.size === 0) return false;
  
  const [smaller, larger] = tokens1.size <= tokens2.size ? [tokens1, tokens2] : [tokens2, tokens1];
  
  const matchCount = Array.from(smaller).filter(token => larger.has(token)).length;
  
  return matchCount >= Math.min(smaller.size, 1) && matchCount >= smaller.size * 0.5;
}

export function isIngredientAvailable(ingredientName: string, userIngredients: string[]): boolean {
  const normalizedIngredient = normalizeIngredient(ingredientName);
  const normalizedUserIngredients = userIngredients.map(normalizeIngredient);
  
  return normalizedUserIngredients.some(userIng => 
    normalizedIngredient.includes(userIng) || 
    userIng.includes(normalizedIngredient) ||
    tokensMatch(normalizedIngredient, userIng)
  );
}

export function countMatchingIngredients(
  ingredients: Array<{ name: string }>, 
  userIngredients: string[]
): number {
  return ingredients.filter(ingredient => 
    isIngredientAvailable(ingredient.name, userIngredients)
  ).length;
}

export function calculateMatchPercentage(
  ingredients: Array<{ name: string }>,
  userIngredients: string[]
): { matchingCount: number; totalCount: number; percentage: number } {
  const totalCount = ingredients.length;
  const matchingCount = countMatchingIngredients(ingredients, userIngredients);
  const percentage = totalCount > 0 ? Math.round((matchingCount / totalCount) * 100) : 0;
  
  return { matchingCount, totalCount, percentage };
}

// Get display info for match type (uses icon names for lucide-react, not unicode symbols)
export function getMatchTypeDisplay(matchType: MatchType | undefined): {
  iconType: 'check' | 'refresh' | 'similar' | 'x';
  color: string;
  bgColor: string;
  label: string;
} {
  switch (matchType) {
    case 'exact':
      return {
        iconType: 'check',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        label: 'You have it'
      };
    case 'substitute':
      return {
        iconType: 'refresh',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        label: 'Substitute available'
      };
    case 'partial':
      return {
        iconType: 'similar',
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        label: 'Similar ingredient'
      };
    case 'none':
    default:
      return {
        iconType: 'x',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        label: 'Need to buy'
      };
  }
}

// Get display info for ingredient category
export function getCategoryDisplay(category: IngredientCategory | undefined): {
  label: string;
  badge: string;
} {
  switch (category) {
    case 'key':
      return { label: 'Key', badge: 'bg-primary/10 text-primary' };
    case 'important':
      return { label: 'Important', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
    case 'flavor':
      return { label: 'Flavor', badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' };
    case 'base':
      return { label: 'Base', badge: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
    default:
      return { label: '', badge: '' };
  }
}

// Count match types for summary
export function countMatchTypes(ingredients: StructuredIngredient[]): {
  exact: number;
  substitute: number;
  missing: number;
  total: number;
} {
  let exact = 0;
  let substitute = 0;
  let missing = 0;
  
  for (const ing of ingredients) {
    if (ing.category === 'base') continue; // Skip base ingredients in counts
    
    if (ing.matchType === 'exact') exact++;
    else if (ing.matchType === 'substitute') substitute++;
    else if (ing.matchType === 'none' || !ing.matchType) missing++;
  }
  
  return {
    exact,
    substitute,
    missing,
    total: exact + substitute + missing
  };
}

// Format match details for display
export function formatMatchSummary(matchDetails?: MatchDetails): string {
  if (!matchDetails) return '';
  
  const parts: string[] = [];
  if (matchDetails.exactMatches > 0) {
    parts.push(`${matchDetails.exactMatches} exact`);
  }
  if (matchDetails.substituteMatches > 0) {
    parts.push(`${matchDetails.substituteMatches} substitute`);
  }
  if (matchDetails.missingIngredients.length > 0) {
    parts.push(`${matchDetails.missingIngredients.length} missing`);
  }
  
  return parts.join(', ');
}

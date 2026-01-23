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

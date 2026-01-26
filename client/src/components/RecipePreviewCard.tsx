import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, RefreshCw, ShoppingCart } from "lucide-react";
import type { Recipe } from "@shared/schema";
import { countMatchTypes, calculateMatchPercentage } from "@/lib/ingredientMatching";

interface RecipePreviewCardProps {
  recipe: Recipe;
  index: number;
  userIngredients: string[];
  onClick: () => void;
}

export function RecipePreviewCard({ recipe, index, userIngredients, onClick }: RecipePreviewCardProps) {
  // Check if recipe has server-provided match info
  const hasMatchInfo = recipe.ingredients.some(ing => ing.matchType !== undefined);
  
  let matchPercentage: number;
  let matchCounts: { exact: number; substitute: number; missing: number; total: number };
  
  if (hasMatchInfo) {
    // Use server-provided data
    matchPercentage = recipe.matchPercentage ?? 0;
    matchCounts = countMatchTypes(recipe.ingredients);
  } else {
    // Fallback: compute client-side for AI-generated recipes
    const calculated = calculateMatchPercentage(recipe.ingredients, userIngredients);
    matchPercentage = calculated.percentage;
    matchCounts = {
      exact: calculated.matchingCount,
      substitute: 0,
      missing: calculated.totalCount - calculated.matchingCount,
      total: calculated.totalCount
    };
  }
  
  const hasSubstitutes = matchCounts.substitute > 0;
  const hasMissing = matchCounts.missing > 0;

  return (
    <Card 
      className="cursor-pointer hover-elevate active-elevate-2 transition-all border-0 shadow-md overflow-hidden"
      onClick={onClick}
      data-testid={`card-recipe-preview-${index}`}
    >
      <div className="h-2 bg-gradient-to-r from-primary/60 to-primary" style={{ width: `${matchPercentage}%` }} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-base leading-tight" data-testid={`text-recipe-title-${index}`}>
            {recipe.title}
          </h3>
          <Badge variant="secondary" className="shrink-0 gap-1 text-xs" data-testid={`badge-time-${index}`}>
            <Clock className="h-3 w-3" />
            {recipe.cookingTime}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid={`text-recipe-description-${index}`}>
          {recipe.shortDescription}
        </p>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Exact matches */}
          {matchCounts.exact > 0 && (
            <div 
              className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full text-xs font-medium" 
              data-testid={`badge-exact-matches-${index}`}
            >
              <Check className="h-3 w-3" />
              <span>{matchCounts.exact}</span>
            </div>
          )}
          
          {/* Substitute matches */}
          {hasSubstitutes && (
            <div 
              className="flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2.5 py-1 rounded-full text-xs font-medium"
              data-testid={`badge-substitute-matches-${index}`}
            >
              <RefreshCw className="h-3 w-3" />
              <span>{matchCounts.substitute}</span>
            </div>
          )}
          
          {/* Missing ingredients */}
          {hasMissing && (
            <div 
              className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-full text-xs font-medium"
              data-testid={`badge-missing-count-${index}`}
            >
              <ShoppingCart className="h-3 w-3" />
              <span>+{matchCounts.missing}</span>
            </div>
          )}
          
          {/* Match percentage */}
          <div className="ml-auto text-xs font-medium" data-testid={`text-match-percentage-${index}`}>
            <span className={matchPercentage >= 70 ? "text-primary" : matchPercentage >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}>
              {matchPercentage}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

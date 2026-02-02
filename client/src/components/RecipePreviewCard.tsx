import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, RefreshCw, ShoppingCart } from "lucide-react";
import type { Recipe } from "@shared/schema";
import { countMatchTypes, calculateMatchPercentage } from "@/lib/ingredientMatching";
import { SaveHeartButton } from "./SaveHeartButton";

const recipeEmojis = ["🍝", "🥗", "🍲", "🥘", "🍜", "🍳", "🥪", "🍕", "🌮", "🍛"];

interface RecipePreviewCardProps {
  recipe: Recipe;
  index: number;
  userIngredients: string[];
  onClick: () => void;
}

export function RecipePreviewCard({ recipe, index, userIngredients, onClick }: RecipePreviewCardProps) {
  const emoji = recipeEmojis[index % recipeEmojis.length];

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
      className="cursor-pointer hover:shadow-lg transition-all border-0 shadow-md overflow-hidden bg-card/80 backdrop-blur-sm group"
      onClick={onClick}
      data-testid={`card-recipe-preview-${index}`}
    >
      {/* Match percentage bar */}
      <div className="h-1.5 bg-muted/50">
        <div
          className="h-full bg-gradient-to-r from-primary/70 to-primary transition-all"
          style={{ width: `${matchPercentage}%` }}
        />
      </div>

      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Recipe emoji with save button */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-2xl">{emoji}</span>
            </div>
            <SaveHeartButton
              recipe={{ title: recipe.title }}
              recipeData={recipe}
              isFromDatabase={recipe.isFromDatabase ?? false}
              size="sm"
              className="absolute -top-1 -right-1 shadow-sm"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-base leading-tight line-clamp-1" data-testid={`text-recipe-title-${index}`}>
                {recipe.title}
              </h3>
              <Badge variant="secondary" className="shrink-0 gap-1 text-xs rounded-full px-2.5" data-testid={`badge-time-${index}`}>
                <Clock className="h-3 w-3" />
                {recipe.cookingTime}
              </Badge>
            </div>

            <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-recipe-description-${index}`}>
              {recipe.shortDescription}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Exact matches */}
              {matchCounts.exact > 0 && (
                <div
                  className="flex items-center gap-1.5 bg-secondary/50 text-secondary-foreground px-2.5 py-1 rounded-full text-xs font-medium"
                  data-testid={`badge-exact-matches-${index}`}
                >
                  <Check className="h-3 w-3" />
                  <span>{matchCounts.exact} have</span>
                </div>
              )}

              {/* Substitute matches */}
              {hasSubstitutes && (
                <div
                  className="flex items-center gap-1.5 bg-accent/50 text-accent-foreground px-2.5 py-1 rounded-full text-xs font-medium"
                  data-testid={`badge-substitute-matches-${index}`}
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>{matchCounts.substitute} swap</span>
                </div>
              )}

              {/* Missing ingredients */}
              {hasMissing && (
                <div
                  className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium"
                  data-testid={`badge-missing-count-${index}`}
                >
                  <ShoppingCart className="h-3 w-3" />
                  <span>+{matchCounts.missing}</span>
                </div>
              )}

              {/* Match percentage */}
              <div className="ml-auto flex items-center gap-1.5" data-testid={`text-match-percentage-${index}`}>
                <span
                  className={`text-sm font-semibold ${
                    matchPercentage >= 70
                      ? "text-primary"
                      : matchPercentage >= 50
                      ? "text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {matchPercentage}%
                </span>
                <span className="text-xs text-muted-foreground">match</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

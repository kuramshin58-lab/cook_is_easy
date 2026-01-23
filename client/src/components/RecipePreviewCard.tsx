import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, ShoppingCart } from "lucide-react";
import type { Recipe } from "@shared/schema";
import { calculateMatchPercentage } from "@/lib/ingredientMatching";

interface RecipePreviewCardProps {
  recipe: Recipe;
  index: number;
  userIngredients: string[];
  onClick: () => void;
}

export function RecipePreviewCard({ recipe, index, userIngredients, onClick }: RecipePreviewCardProps) {
  const totalIngredients = recipe.ingredients.length;
  
  const backendMatchPercentage = recipe.matchPercentage;
  
  let matchingCount: number;
  let matchPercentage: number;
  
  if (backendMatchPercentage !== undefined) {
    matchPercentage = backendMatchPercentage;
    matchingCount = Math.round(totalIngredients * backendMatchPercentage / 100);
  } else {
    const calculated = calculateMatchPercentage(recipe.ingredients, userIngredients);
    matchingCount = calculated.matchingCount;
    matchPercentage = calculated.percentage;
  }
  
  const missingCount = totalIngredients - matchingCount;

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
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium" data-testid={`text-matching-count-${index}`}>
            <Check className="h-3 w-3" />
            <span>{matchingCount}/{totalIngredients}</span>
          </div>
          
          {missingCount > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs" data-testid={`text-missing-count-${index}`}>
              <ShoppingCart className="h-3 w-3" />
              <span>+{missingCount}</span>
            </div>
          )}
          
          <div className="ml-auto text-xs font-medium" data-testid={`text-match-percentage-${index}`}>
            <span className={matchPercentage >= 70 ? "text-primary" : "text-muted-foreground"}>
              {matchPercentage}% match
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

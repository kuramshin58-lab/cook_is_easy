import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, Check, ShoppingCart } from "lucide-react";
import type { Recipe } from "@shared/schema";

interface RecipePreviewCardProps {
  recipe: Recipe;
  index: number;
  userIngredients: string[];
  onClick: () => void;
}

function normalizeIngredient(name: string): string {
  return name.toLowerCase().trim();
}

function countMatchingIngredients(recipe: Recipe, userIngredients: string[]): number {
  const normalizedUserIngredients = userIngredients.map(normalizeIngredient);
  
  return recipe.ingredients.filter(ingredient => {
    const ingredientName = normalizeIngredient(ingredient.name);
    return normalizedUserIngredients.some(userIng => 
      ingredientName.includes(userIng) || userIng.includes(ingredientName)
    );
  }).length;
}

export function RecipePreviewCard({ recipe, index, userIngredients, onClick }: RecipePreviewCardProps) {
  const totalIngredients = recipe.ingredients.length;
  const matchingCount = countMatchingIngredients(recipe, userIngredients);
  const missingCount = totalIngredients - matchingCount;
  const matchPercentage = Math.round((matchingCount / totalIngredients) * 100);

  return (
    <Card 
      className="cursor-pointer hover-elevate active-elevate-2 transition-all"
      onClick={onClick}
      data-testid={`card-recipe-preview-${index}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-lg leading-tight">{recipe.title}</h3>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Clock className="h-3 w-3" />
            {recipe.cookingTime}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4">{recipe.shortDescription}</p>
        
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-primary">
              <Check className="h-4 w-4" />
              <span>{matchingCount} из {totalIngredients}</span>
            </div>
            
            {missingCount > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                <span>+{missingCount} докупить</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <ChefHat className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{matchPercentage}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

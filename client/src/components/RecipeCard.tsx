import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, Lightbulb } from "lucide-react";
import type { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
}

export function RecipeCard({ recipe, index }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden" data-testid={`card-recipe-${index}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-xl leading-tight">{recipe.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <Clock className="h-3 w-3" />
            {recipe.cookingTime}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mt-1">{recipe.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Ингредиенты</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recipe.ingredients.map((ingredient, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-2">Приготовление</h4>
          <ol className="space-y-2">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {recipe.tips && (
          <div className="bg-accent/50 rounded-md p-3 flex gap-2">
            <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm">{recipe.tips}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

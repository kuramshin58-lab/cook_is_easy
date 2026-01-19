import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, ChefHat, Lightbulb, Check, X } from "lucide-react";
import type { Recipe } from "@shared/schema";

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  userIngredients: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function normalizeIngredient(name: string): string {
  return name.toLowerCase().trim();
}

function isIngredientAvailable(ingredientName: string, userIngredients: string[]): boolean {
  const normalizedIngredient = normalizeIngredient(ingredientName);
  const normalizedUserIngredients = userIngredients.map(normalizeIngredient);
  
  return normalizedUserIngredients.some(userIng => 
    normalizedIngredient.includes(userIng) || userIng.includes(normalizedIngredient)
  );
}

export function RecipeDetailModal({ recipe, userIngredients, open, onOpenChange }: RecipeDetailModalProps) {
  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0" data-testid="modal-recipe-detail">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-start justify-between gap-3 pr-8">
                <DialogTitle className="text-xl leading-tight">{recipe.title}</DialogTitle>
                <Badge variant="secondary" className="shrink-0 gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.cookingTime}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-2">{recipe.description}</p>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ChefHat className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Ингредиенты</h4>
                </div>
                <div className="grid gap-2">
                  {recipe.ingredients.map((ingredient, i) => {
                    const hasIngredient = isIngredientAvailable(ingredient.name, userIngredients);
                    return (
                      <div 
                        key={i} 
                        className={`flex items-center gap-3 p-2 rounded-md ${
                          hasIngredient ? 'bg-primary/5' : 'bg-muted/50'
                        }`}
                        data-testid={`ingredient-${i}`}
                      >
                        {hasIngredient ? (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="flex-1">{ingredient.name}</span>
                        <span className="text-muted-foreground text-sm">{ingredient.amount}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Приготовление</h4>
                <ol className="space-y-3">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm" data-testid={`step-${i}`}>
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
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

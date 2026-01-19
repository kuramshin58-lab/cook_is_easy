import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Lightbulb, Check, X, Flame } from "lucide-react";
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

  const availableCount = recipe.ingredients.filter(i => isIngredientAvailable(i.name, userIngredients)).length;
  const totalCount = recipe.ingredients.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0" data-testid="modal-recipe-detail">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 pb-4">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold leading-tight mb-2" data-testid="text-modal-title">
                  {recipe.title}
                </DialogTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="gap-1" data-testid="badge-modal-time">
                    <Clock className="h-3 w-3" />
                    {recipe.cookingTime}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {availableCount}/{totalCount} ингредиентов
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            <p className="text-muted-foreground text-sm" data-testid="text-modal-description">
              {recipe.description}
            </p>

            {recipe.calories && (
              <div className="grid grid-cols-4 gap-2">
                <Card className="border-0 bg-orange-50 dark:bg-orange-950/30">
                  <CardContent className="p-3 text-center">
                    <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                    <div className="text-lg font-bold">{recipe.calories}</div>
                    <div className="text-xs text-muted-foreground">ккал</div>
                  </CardContent>
                </Card>
                {recipe.protein && (
                  <Card className="border-0 bg-red-50 dark:bg-red-950/30">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-red-600">{recipe.protein}г</div>
                      <div className="text-xs text-muted-foreground">белки</div>
                    </CardContent>
                  </Card>
                )}
                {recipe.fats && (
                  <Card className="border-0 bg-yellow-50 dark:bg-yellow-950/30">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-yellow-600">{recipe.fats}г</div>
                      <div className="text-xs text-muted-foreground">жиры</div>
                    </CardContent>
                  </Card>
                )}
                {recipe.carbs && (
                  <Card className="border-0 bg-blue-50 dark:bg-blue-950/30">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-blue-600">{recipe.carbs}г</div>
                      <div className="text-xs text-muted-foreground">углеводы</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-3">Ингредиенты</h4>
              <div className="space-y-2">
                {recipe.ingredients.map((ingredient, i) => {
                  const hasIngredient = isIngredientAvailable(ingredient.name, userIngredients);
                  return (
                    <div 
                      key={i} 
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        hasIngredient ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                      }`}
                      data-testid={`ingredient-${i}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        hasIngredient ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        {hasIngredient ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <span className="flex-1 text-sm">{ingredient.name}</span>
                      <span className="text-muted-foreground text-sm">{ingredient.amount}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Приготовление</h4>
              <ol className="space-y-4">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3" data-testid={`step-${i}`}>
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="text-sm pt-1 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {recipe.tips && (
              <Card className="border-0 bg-accent/50">
                <CardContent className="p-4 flex gap-3">
                  <Lightbulb className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm">{recipe.tips}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

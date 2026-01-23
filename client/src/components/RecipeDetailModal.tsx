import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Lightbulb, Check, X, Flame, Wand2, ArrowRight, Loader2 } from "lucide-react";
import type { Recipe } from "@shared/schema";
import { isIngredientAvailable, countMatchingIngredients } from "@/lib/ingredientMatching";
import { apiRequest } from "@/lib/queryClient";

interface Substitution {
  original: string;
  replacement: string;
}

interface AdaptedRecipe extends Recipe {
  substitutions: Substitution[];
}

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  userIngredients: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeDetailModal({ recipe, userIngredients, open, onOpenChange }: RecipeDetailModalProps) {
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptedRecipe, setAdaptedRecipe] = useState<AdaptedRecipe | null>(null);
  const [adaptError, setAdaptError] = useState<string | null>(null);

  if (!recipe) return null;

  const displayRecipe = adaptedRecipe || recipe;
  const availableCount = countMatchingIngredients(displayRecipe.ingredients, userIngredients);
  const totalCount = displayRecipe.ingredients.length;
  const matchPercent = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0;
  const showAdaptButton = !adaptedRecipe && matchPercent < 100;

  const handleAdapt = async () => {
    setIsAdapting(true);
    setAdaptError(null);
    
    try {
      const response = await apiRequest("POST", "/api/recipes/adapt", {
        recipe,
        userIngredients
      });
      
      const data = await response.json();
      setAdaptedRecipe(data.recipe);
    } catch (error) {
      console.error("Failed to adapt recipe:", error);
      setAdaptError("Failed to adapt recipe. Please try again.");
    } finally {
      setIsAdapting(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setAdaptedRecipe(null);
      setAdaptError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0" data-testid="modal-recipe-detail">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 pb-4">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold leading-tight mb-2" data-testid="text-modal-title">
                  {displayRecipe.title}
                  {adaptedRecipe && (
                    <Badge variant="secondary" className="ml-2 text-xs">Adapted</Badge>
                  )}
                </DialogTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="gap-1" data-testid="badge-modal-time">
                    <Clock className="h-3 w-3" />
                    {displayRecipe.cookingTime}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {availableCount}/{totalCount} ingredients
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {showAdaptButton && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Missing some ingredients?</p>
                      <p className="text-xs text-muted-foreground">
                        AI can adapt this recipe to use what you have
                      </p>
                    </div>
                    <Button 
                      onClick={handleAdapt} 
                      disabled={isAdapting}
                      size="sm"
                      data-testid="button-adapt-recipe"
                    >
                      {isAdapting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adapting...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Adapt recipe
                        </>
                      )}
                    </Button>
                  </div>
                  {adaptError && (
                    <p className="text-sm text-destructive mt-2">{adaptError}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {adaptedRecipe && adaptedRecipe.substitutions.length > 0 && (
              <Card className="border-green-500/30 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Wand2 className="h-4 w-4 text-green-600" />
                    Substitutions made
                  </h4>
                  <div className="space-y-2">
                    {adaptedRecipe.substitutions.map((sub, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-2 text-sm"
                        data-testid={`substitution-${i}`}
                      >
                        <span className="text-muted-foreground line-through">{sub.original}</span>
                        <ArrowRight className="h-3 w-3 text-green-600" />
                        <span className="font-medium text-green-700 dark:text-green-400">{sub.replacement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <p className="text-muted-foreground text-sm" data-testid="text-modal-description">
              {displayRecipe.description}
            </p>

            {displayRecipe.calories && (
              <div className="grid grid-cols-4 gap-2">
                <Card className="border-0 bg-orange-50 dark:bg-orange-950/30">
                  <CardContent className="p-3 text-center">
                    <Flame className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                    <div className="text-lg font-bold">{displayRecipe.calories}</div>
                    <div className="text-xs text-muted-foreground">cal</div>
                  </CardContent>
                </Card>
                {displayRecipe.protein && (
                  <Card className="border-0 bg-red-50 dark:bg-red-950/30">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-red-600">{displayRecipe.protein}g</div>
                      <div className="text-xs text-muted-foreground">protein</div>
                    </CardContent>
                  </Card>
                )}
                {displayRecipe.fats && (
                  <Card className="border-0 bg-yellow-50 dark:bg-yellow-950/30">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-yellow-600">{displayRecipe.fats}g</div>
                      <div className="text-xs text-muted-foreground">fats</div>
                    </CardContent>
                  </Card>
                )}
                {displayRecipe.carbs && (
                  <Card className="border-0 bg-blue-50 dark:bg-blue-950/30">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-blue-600">{displayRecipe.carbs}g</div>
                      <div className="text-xs text-muted-foreground">carbs</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-3">Ingredients</h4>
              <div className="space-y-2">
                {displayRecipe.ingredients.map((ingredient, i) => {
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
              <h4 className="font-semibold mb-3">Instructions</h4>
              <ol className="space-y-4">
                {displayRecipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3" data-testid={`step-${i}`}>
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="text-sm pt-1 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {displayRecipe.tips && (
              <Card className="border-0 bg-accent/50">
                <CardContent className="p-4 flex gap-3">
                  <Lightbulb className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm">{displayRecipe.tips}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

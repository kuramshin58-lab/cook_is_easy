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
import { Clock, Lightbulb, Check, X, RefreshCw, Flame, Wand2, ArrowRight, Loader2, ShoppingCart, Minus, Users, Timer } from "lucide-react";
import type { Recipe, StructuredIngredient, MatchType } from "@shared/schema";
import { getMatchTypeDisplay, getCategoryDisplay, countMatchTypes, isIngredientAvailable, calculateMatchPercentage } from "@/lib/ingredientMatching";
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

const recipeEmojis = ["🍝", "🥗", "🍲", "🥘", "🍜", "🍳", "🥪", "🍕", "🌮", "🍛"];

export function RecipeDetailModal({ recipe, userIngredients, open, onOpenChange }: RecipeDetailModalProps) {
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptedRecipe, setAdaptedRecipe] = useState<AdaptedRecipe | null>(null);
  const [adaptError, setAdaptError] = useState<string | null>(null);

  if (!recipe) return null;

  const displayRecipe = adaptedRecipe || recipe;
  const emoji = recipeEmojis[Math.floor(Math.random() * recipeEmojis.length)];

  // For AI-generated recipes that may not have matchType info, compute client-side
  const hasMatchInfo = displayRecipe.ingredients.some(ing => ing.matchType !== undefined);

  let matchPercentage: number;
  let matchCounts: ReturnType<typeof countMatchTypes>;

  if (hasMatchInfo) {
    // Use server-provided match info
    matchPercentage = displayRecipe.matchPercentage ?? 0;
    matchCounts = countMatchTypes(displayRecipe.ingredients);
  } else {
    // Fallback: compute client-side for AI-generated recipes
    const calculated = calculateMatchPercentage(displayRecipe.ingredients, userIngredients);
    matchPercentage = calculated.percentage;
    matchCounts = {
      exact: calculated.matchingCount,
      substitute: 0,
      missing: calculated.totalCount - calculated.matchingCount,
      total: calculated.totalCount
    };
  }

  const showAdaptButton = !adaptedRecipe && matchPercentage < 100;

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
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden" data-testid="modal-recipe-detail">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 p-6 pb-5">
          <DialogHeader>
            <div className="flex items-start gap-4">
              {/* Recipe emoji */}
              <div className="w-14 h-14 rounded-2xl bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-md shrink-0">
                <span className="text-3xl">{emoji}</span>
              </div>

              <div className="flex-1 min-w-0">
                <DialogTitle className="font-serif text-xl font-bold leading-tight mb-2" data-testid="text-modal-title">
                  {displayRecipe.title}
                  {adaptedRecipe && (
                    <Badge variant="secondary" className="ml-2 text-xs rounded-full">Adapted</Badge>
                  )}
                </DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1 rounded-full" data-testid="badge-modal-time">
                    <Clock className="h-3 w-3" />
                    {displayRecipe.cookingTime}
                  </Badge>

                  {/* Match summary badges */}
                  {matchCounts.exact > 0 && (
                    <Badge className="gap-1 bg-secondary/60 text-secondary-foreground border-0 rounded-full">
                      <Check className="h-3 w-3" />
                      {matchCounts.exact}
                    </Badge>
                  )}
                  {matchCounts.substitute > 0 && (
                    <Badge className="gap-1 bg-accent/60 text-accent-foreground border-0 rounded-full">
                      <RefreshCw className="h-3 w-3" />
                      {matchCounts.substitute}
                    </Badge>
                  )}
                  {matchCounts.missing > 0 && (
                    <Badge className="gap-1 bg-primary/20 text-primary border-0 rounded-full">
                      <ShoppingCart className="h-3 w-3" />
                      +{matchCounts.missing}
                    </Badge>
                  )}

                  <span className={`text-sm font-semibold ${matchPercentage >= 70 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {matchPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* Adapt recipe card */}
            {showAdaptButton && (
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-xl">✨</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Missing some ingredients?</p>
                        <p className="text-xs text-muted-foreground">
                          AI can adapt this recipe to use what you have
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleAdapt}
                      disabled={isAdapting}
                      size="sm"
                      className="rounded-full"
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
                          Adapt
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

            {/* Substitutions made */}
            {adaptedRecipe && adaptedRecipe.substitutions.length > 0 && (
              <Card className="border-secondary/30 bg-secondary/10">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <span className="text-lg">🔄</span>
                    Substitutions made
                  </h4>
                  <div className="space-y-2">
                    {adaptedRecipe.substitutions.map((sub, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm p-2 rounded-lg bg-card/50"
                        data-testid={`substitution-${i}`}
                      >
                        <span className="text-muted-foreground line-through">{sub.original}</span>
                        <ArrowRight className="h-3 w-3 text-primary" />
                        <span className="font-medium text-primary">{sub.replacement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed" data-testid="text-modal-description">
              {displayRecipe.description}
            </p>

            {/* Nutrition info */}
            {displayRecipe.calories && (
              <div className="grid grid-cols-4 gap-2">
                <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="p-3 text-center">
                    <Flame className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <div className="text-lg font-bold">{displayRecipe.calories}</div>
                    <div className="text-xs text-muted-foreground">cal</div>
                  </CardContent>
                </Card>
                {displayRecipe.protein && (
                  <Card className="border-0 bg-gradient-to-br from-secondary/20 to-secondary/5">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-secondary-foreground">{displayRecipe.protein}g</div>
                      <div className="text-xs text-muted-foreground">protein</div>
                    </CardContent>
                  </Card>
                )}
                {displayRecipe.fats && (
                  <Card className="border-0 bg-gradient-to-br from-accent/20 to-accent/5">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold text-accent-foreground">{displayRecipe.fats}g</div>
                      <div className="text-xs text-muted-foreground">fats</div>
                    </CardContent>
                  </Card>
                )}
                {displayRecipe.carbs && (
                  <Card className="border-0 bg-gradient-to-br from-muted to-muted/50">
                    <CardContent className="p-3 text-center">
                      <div className="text-lg font-bold">{displayRecipe.carbs}g</div>
                      <div className="text-xs text-muted-foreground">carbs</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Ingredients */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-lg">🥕</span>
                Ingredients
              </h4>
              <div className="space-y-2">
                {displayRecipe.ingredients.map((ingredient, i) => {
                  // Determine match type: use server-provided or compute client-side
                  const effectiveMatchType: MatchType = ingredient.matchType ??
                    (isIngredientAvailable(ingredient.name, userIngredients) ? 'exact' : 'none');

                  const matchDisplay = getMatchTypeDisplay(effectiveMatchType);
                  const categoryDisplay = getCategoryDisplay(ingredient.category);
                  const isBase = ingredient.category === 'base';

                  // Render icon based on match type
                  const renderIcon = () => {
                    switch (effectiveMatchType) {
                      case 'exact':
                        return <Check className={`h-3.5 w-3.5 text-secondary-foreground`} />;
                      case 'substitute':
                        return <RefreshCw className={`h-3.5 w-3.5 text-accent-foreground`} />;
                      case 'partial':
                        return <Minus className={`h-3.5 w-3.5 text-muted-foreground`} />;
                      case 'none':
                      default:
                        return <X className={`h-3.5 w-3.5 text-primary`} />;
                    }
                  };

                  const getBgColor = () => {
                    switch (effectiveMatchType) {
                      case 'exact':
                        return 'bg-secondary/30';
                      case 'substitute':
                        return 'bg-accent/30';
                      case 'partial':
                        return 'bg-muted/50';
                      case 'none':
                      default:
                        return 'bg-primary/5';
                    }
                  };

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl ${getBgColor()} hover:shadow-sm transition-all`}
                      data-testid={`ingredient-${i}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        effectiveMatchType === 'exact' ? 'bg-secondary/50' :
                        effectiveMatchType === 'substitute' ? 'bg-accent/50' :
                        effectiveMatchType === 'partial' ? 'bg-muted' :
                        'bg-primary/10'
                      }`}>
                        {renderIcon()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${effectiveMatchType === 'none' ? 'text-muted-foreground' : ''}`}>
                            {ingredient.name}
                          </span>
                          {!isBase && categoryDisplay.label && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-full">
                              {categoryDisplay.label}
                            </Badge>
                          )}
                        </div>
                        {effectiveMatchType === 'substitute' && ingredient.matchedWith && (
                          <div className="flex items-center gap-1 text-xs text-accent-foreground mt-0.5">
                            <ArrowRight className="h-2.5 w-2.5" />
                            <span>Using: {ingredient.matchedWith}</span>
                          </div>
                        )}
                        {effectiveMatchType === 'none' && ingredient.substitutes && ingredient.substitutes.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Try: {ingredient.substitutes.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>

                      <span className="text-muted-foreground text-sm shrink-0">{ingredient.amount}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-lg">👨‍🍳</span>
                Instructions
              </h4>
              <ol className="space-y-4">
                {displayRecipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors" data-testid={`step-${i}`}>
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-sm font-semibold shadow-sm">
                      {i + 1}
                    </span>
                    <span className="text-sm pt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            {displayRecipe.tips && (
              <Card className="border-0 bg-gradient-to-br from-accent/30 to-secondary/20">
                <CardContent className="p-4 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center shrink-0">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Pro tip</p>
                    <p className="text-sm text-muted-foreground">{displayRecipe.tips}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

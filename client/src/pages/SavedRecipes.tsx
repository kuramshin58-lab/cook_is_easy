import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Clock, Users, Timer, Loader2, Heart, BookOpen } from "lucide-react";
import { SaveHeartButton } from "@/components/SaveHeartButton";
import { useState } from "react";
import type { Recipe, SavedRecipeRow } from "@shared/schema";

const recipeEmojis = ["🍝", "🥗", "🍲", "🥘", "🍜", "🍳", "🥪", "🍕", "🌮", "🍛"];

interface DbRecipe {
  id: string;
  title: string;
  description: string;
  structured_ingredients?: Array<{
    name: string;
    amount: string;
    category: string;
    substitutes?: string[];
  }>;
  ingredients: string[];
  difficulty: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  instructions: string | string[];
  calories: number;
  protein?: number;
  fats?: number;
  carbs?: number;
  tags: string[];
}

interface EnrichedSavedRecipe extends SavedRecipeRow {
  db_recipe?: DbRecipe;
}

function SavedRecipeCard({
  saved,
  index,
  onClick
}: {
  saved: EnrichedSavedRecipe;
  index: number;
  onClick: () => void;
}) {
  const emoji = recipeEmojis[index % recipeEmojis.length];

  // Get recipe details from either db_recipe or recipe_data
  const recipe = saved.db_recipe || saved.recipe_data;
  const totalTime = saved.db_recipe
    ? (saved.db_recipe.prep_time || 0) + (saved.db_recipe.cook_time || 0)
    : null;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all border-0 shadow-md bg-card/80 backdrop-blur-sm group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl mb-3 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
          <span className="text-5xl">{emoji}</span>
          <SaveHeartButton
            recipe={{ title: saved.recipe_title, id: saved.recipe_id || undefined }}
            recipeData={saved.recipe_data as Recipe | undefined}
            isFromDatabase={saved.is_from_database}
            size="sm"
            className="absolute top-2 right-2 shadow-sm"
          />
        </div>
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
          {saved.recipe_title}
        </h3>
        {recipe && (
          <>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {saved.db_recipe?.description || (saved.recipe_data as Recipe)?.shortDescription || ''}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
              {totalTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" />
                  <span>{totalTime} min</span>
                </div>
              )}
              {saved.db_recipe?.servings && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-primary" />
                  <span>{saved.db_recipe.servings}</span>
                </div>
              )}
            </div>
          </>
        )}
        <div className="flex flex-wrap gap-1">
          <Badge
            variant="outline"
            className={`text-xs px-2 py-0 ${
              saved.is_from_database
                ? 'border-primary/50 text-primary'
                : 'border-accent/50 text-accent-foreground'
            }`}
          >
            {saved.is_from_database ? 'Database' : 'AI Generated'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function RecipeDetailModal({
  saved,
  open,
  onOpenChange
}: {
  saved: EnrichedSavedRecipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!saved) return null;

  const recipe = saved.db_recipe || saved.recipe_data;
  if (!recipe) return null;

  // Parse ingredients
  const ingredientsList = saved.db_recipe?.structured_ingredients
    ? saved.db_recipe.structured_ingredients.map(ing => `${ing.amount} ${ing.name}`.trim())
    : (saved.recipe_data as Recipe)?.ingredients?.map(ing => `${ing.amount} ${ing.name}`) || [];

  // Parse instructions
  const stepsList = saved.db_recipe
    ? (Array.isArray(saved.db_recipe.instructions)
        ? saved.db_recipe.instructions
        : saved.db_recipe.instructions?.split(/\d+\.\s/).filter(Boolean) || [])
    : (saved.recipe_data as Recipe)?.steps || [];

  const totalTime = saved.db_recipe
    ? (saved.db_recipe.prep_time || 0) + (saved.db_recipe.cook_time || 0)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <DialogTitle className="font-serif text-2xl flex-1">{saved.recipe_title}</DialogTitle>
          <SaveHeartButton
            recipe={{ title: saved.recipe_title, id: saved.recipe_id || undefined }}
            recipeData={saved.recipe_data as Recipe | undefined}
            isFromDatabase={saved.is_from_database}
            size="md"
            className="shadow-sm shrink-0"
          />
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {saved.db_recipe?.description || (saved.recipe_data as Recipe)?.description}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={`rounded-full px-3 ${
                saved.is_from_database
                  ? 'border-primary/50 text-primary'
                  : 'border-accent/50 text-accent-foreground'
              }`}
            >
              {saved.is_from_database ? 'From Database' : 'AI Generated'}
            </Badge>
            {saved.db_recipe?.difficulty && (
              <Badge variant="outline" className="rounded-full px-3">{saved.db_recipe.difficulty}</Badge>
            )}
            {saved.db_recipe?.tags?.map((tag, i) => (
              <Badge key={i} variant="secondary" className="rounded-full px-3">{tag}</Badge>
            ))}
          </div>

          {saved.db_recipe && (
            <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Timer className="h-5 w-5 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground">Prep</div>
                <div className="font-semibold text-sm">{saved.db_recipe.prep_time} min</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground">Cook</div>
                <div className="font-semibold text-sm">{saved.db_recipe.cook_time} min</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground">Servings</div>
                <div className="font-semibold text-sm">{saved.db_recipe.servings}</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">🔥</span>
                </div>
                <div className="text-xs text-muted-foreground">Calories</div>
                <div className="font-semibold text-sm">{saved.db_recipe.calories || '—'}</div>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">🥕</span>
              Ingredients ({ingredientsList.length})
            </h4>
            <ul className="space-y-2">
              {ingredientsList.map((ingredient, i) => (
                <li key={i} className="text-sm flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary" />
                  {typeof ingredient === 'string' ? ingredient.trim() : ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">👨‍🍳</span>
              Instructions ({stepsList.length} steps)
            </h4>
            <ol className="space-y-4">
              {stepsList.map((step, i) => (
                <li key={i} className="flex gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center text-xs font-semibold shadow-sm">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-relaxed">{typeof step === 'string' ? step.trim() : step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SavedRecipes() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data, isLoading, error } = useSavedRecipes(user?.id);
  const [selectedRecipe, setSelectedRecipe] = useState<EnrichedSavedRecipe | null>(null);

  const savedRecipes = (data?.recipes || []) as EnrichedSavedRecipe[];

  if (!user) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-4">Please login to see your saved recipes</p>
          <Button onClick={() => setLocation("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8 relative">
        <header className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 gap-2 rounded-full"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-primary/20 mb-4 shadow-lg">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold">
              Saved Recipes
            </h1>
            <p className="text-muted-foreground mt-2">
              {savedRecipes.length} {savedRecipes.length === 1 ? 'recipe' : 'recipes'} saved
            </p>
          </div>
        </header>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-4">
              <span className="text-4xl">😕</span>
            </div>
            <p className="text-muted-foreground">Failed to load saved recipes. Please try again.</p>
          </div>
        )}

        {/* Recipe grid */}
        {!isLoading && !error && (
          <>
            {savedRecipes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {savedRecipes.map((saved, index) => (
                  <SavedRecipeCard
                    key={saved.id}
                    saved={saved}
                    index={index}
                    onClick={() => setSelectedRecipe(saved)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No saved recipes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start saving recipes by clicking the heart icon on any recipe
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setLocation("/")}>
                    Find Recipes
                  </Button>
                  <Button onClick={() => setLocation("/ready-recipes")}>
                    Browse Collection
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <RecipeDetailModal
          saved={selectedRecipe}
          open={selectedRecipe !== null}
          onOpenChange={(open) => !open && setSelectedRecipe(null)}
        />

        {/* Bottom decorative element */}
        <div className="flex justify-center gap-2 mt-12 text-2xl opacity-40">
          <span>❤️</span>
          <span>🍝</span>
          <span>❤️</span>
          <span>🥗</span>
          <span>❤️</span>
        </div>
      </div>
    </div>
  );
}
